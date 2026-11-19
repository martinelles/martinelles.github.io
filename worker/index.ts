/**
 * Worker do Cloudflare: `/api/*` vai para a API de progresso no D1; o resto (o app) sai dos assets.
 * Os tipos do D1 estão reduzidos ao que se usa aqui, para não trazer `@cloudflare/workers-types`
 * ao `svelte-check` do app.
 */
import { tratarLembrete, type BancoLembretes, type InscricaoGravada } from './lembrete';
import { tratarApi, type Banco, type Gravado } from './progresso';
import { CARGO_DA_ESPECIALIDADE, agoraEmSaoPaulo, lerEspecialidade, lerExtras, lerMarcas, lembreteDoDia } from './agenda';
import { montarEnvio } from './push';
import { CHAVE_EXTRAS, CHAVE_MISSOES } from '../src/lib/conta/regras';
import type { Cargo, PlanoMissoes } from '../src/lib/missoes/tipos';

interface D1Resultado<T> {
	results: T[];
	meta: { changes: number };
}
interface D1Preparado {
	bind(...valores: unknown[]): D1Preparado;
	all<T>(): Promise<D1Resultado<T>>;
	first<T>(): Promise<T | null>;
	run(): Promise<D1Resultado<unknown>>;
}
interface D1 {
	prepare(sql: string): D1Preparado;
	exec(sql: string): Promise<unknown>;
}
interface Env {
	DB: D1;
	ASSETS: { fetch(req: Request): Promise<Response> };
	/** Chave pública VAPID (base64url), em `vars` no wrangler.jsonc; sem ela, o lembrete responde 503. */
	VAPID_PUBLICA?: string;
	/** Chave privada VAPID em JWK, segredo do Worker (fase 4 do plano das notificações). */
	VAPID_PRIVADA?: string;
	/** `sub` do JWT VAPID. */
	VAPID_ASSUNTO?: string;
}

interface ControladorAgendado {
	scheduledTime: number;
}

interface Contexto {
	waitUntil(promessa: Promise<unknown>): void;
}

/** O que o cron usa: injetável para o teste (planos/2026-10-17-notificacoes-de-estudo.md, fase 2). */
export interface DependenciasCron {
	inscritosDaHora(hora: number, data: string): Promise<InscricaoGravada[]>;
	marcarEnvio(endpoint: string, data: string): Promise<void>;
	apagarInscricao(endpoint: string): Promise<void>;
	/** As chaves de progresso da conta: `{ chave: valor }`. */
	progresso(usuario: string): Promise<Record<string, string>>;
	/** O plano do cargo, lido dos assets (`/conteudo/missoes-<cargo>.json`). */
	plano(cargo: Cargo): Promise<PlanoMissoes | null>;
	enviar(inscricao: InscricaoGravada, lembrete: { titulo: string; corpo: string; url: string }): Promise<number>;
}

/**
 * O cron da hora: para cada inscrição da hora, monta o lembrete do dia da conta (nulo com o dia
 * cumprido, fora da janela ou sem plano) e envia. Enviado (201) ou sem lembrete, marca o
 * `ultimo_envio` para não repetir no dia; inscrição morta (404/410) sai do banco.
 */
export async function cronDoDia(d: DependenciasCron, data: string, hora: number): Promise<void> {
	const inscritos = await d.inscritosDaHora(hora, data);
	const porUsuario = new Map<string, InscricaoGravada[]>();
	for (const i of inscritos) porUsuario.set(i.usuario, [...(porUsuario.get(i.usuario) ?? []), i]);
	for (const [usuario, lista] of porUsuario) {
		const registro = await d.progresso(usuario);
		const cargo = CARGO_DA_ESPECIALIDADE[lerEspecialidade(registro['painel-concurso:preferencias:v2'] ?? null)];
		let lembrete: Awaited<ReturnType<typeof lembreteDoDia>> = null;
		if (cargo) {
			const plano = await d.plano(cargo);
			if (plano)
				lembrete = lembreteDoDia(
					plano,
					lerMarcas(registro[CHAVE_MISSOES] ?? null),
					lerExtras(registro[CHAVE_EXTRAS] ?? null),
					cargo,
					data
				);
		}
		for (const inscricao of lista) {
			if (!lembrete) {
				await d.marcarEnvio(inscricao.endpoint, data);
				continue;
			}
			const status = await d.enviar(inscricao, lembrete);
			if (status === 201 || status === 202) await d.marcarEnvio(inscricao.endpoint, data);
			else if (status === 404 || status === 410) await d.apagarInscricao(inscricao.endpoint);
			// Outro código: só o log; a hora já passou, não há reenvio no mesmo dia.
		}
	}
}

/**
 * A tabela nasce na primeira requisição de cada isolate, em vez de migração aplicada à mão:
 * o deploy pelo painel do Cloudflare não roda `wrangler d1 migrations apply`.
 */
const ESQUEMA =
	'CREATE TABLE IF NOT EXISTS progresso (usuario TEXT NOT NULL, chave TEXT NOT NULL, valor TEXT NOT NULL, atualizado_em INTEGER NOT NULL, PRIMARY KEY (usuario, chave))';
/** Inscrições de push do lembrete de estudo (planos/2026-10-17-notificacoes-de-estudo.md). */
const ESQUEMA_LEMBRETES =
	'CREATE TABLE IF NOT EXISTS lembretes (endpoint TEXT PRIMARY KEY, usuario TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL, hora INTEGER NOT NULL, ultimo_envio TEXT)';
let esquemaPronto: Promise<unknown> | null = null;

/** Um `exec` por tabela: o D1 separa comandos por linha, e cada esquema é uma linha só. */
const pronto = (db: D1) =>
	(esquemaPronto ??= db
		.exec(ESQUEMA)
		.then(() => db.exec(ESQUEMA_LEMBRETES))
		.catch((e) => ((esquemaPronto = null), Promise.reject(e))));

function bancoD1(db: D1): Banco {
	const atual = (usuario: string, chave: string) =>
		db
			.prepare('SELECT valor, atualizado_em AS atualizadoEm FROM progresso WHERE usuario = ?1 AND chave = ?2')
			.bind(usuario, chave)
			.first<Gravado>();
	return {
		async ler(usuario) {
			await pronto(db);
			const { results } = await db
				.prepare('SELECT chave, valor, atualizado_em AS atualizadoEm FROM progresso WHERE usuario = ?1')
				.bind(usuario)
				.all<Gravado & { chave: string }>();
			return Object.fromEntries(results.map(({ chave, valor, atualizadoEm }) => [chave, { valor, atualizadoEm }]));
		},
		async gravar(usuario, chave, novo) {
			await pronto(db);
			const { meta } = await db
				.prepare(
					`INSERT INTO progresso (usuario, chave, valor, atualizado_em) VALUES (?1, ?2, ?3, ?4)
					 ON CONFLICT (usuario, chave) DO UPDATE SET valor = excluded.valor, atualizado_em = excluded.atualizado_em
					 WHERE excluded.atualizado_em > progresso.atualizado_em`
				)
				.bind(usuario, chave, novo.valor, novo.atualizadoEm)
				.run();
			return { gravado: meta.changes > 0, atual: (await atual(usuario, chave)) ?? novo };
		}
	};
}

function lembretesD1(db: D1): BancoLembretes {
	return {
		async gravar(i) {
			await pronto(db);
			// Mesmo aparelho, outra conta ou outra hora: a linha é do endpoint. O `ultimo_envio` fica,
			// para trocar a hora depois do envio não render um segundo lembrete no mesmo dia.
			await db
				.prepare(
					`INSERT INTO lembretes (endpoint, usuario, p256dh, auth, hora) VALUES (?1, ?2, ?3, ?4, ?5)
					 ON CONFLICT (endpoint) DO UPDATE SET usuario = excluded.usuario, p256dh = excluded.p256dh, auth = excluded.auth, hora = excluded.hora`
				)
				.bind(i.endpoint, i.usuario, i.p256dh, i.auth, i.hora)
				.run();
		},
		async apagar(endpoint, usuario) {
			await pronto(db);
			const q = usuario
				? db.prepare('DELETE FROM lembretes WHERE endpoint = ?1 AND usuario = ?2').bind(endpoint, usuario)
				: db.prepare('DELETE FROM lembretes WHERE endpoint = ?1').bind(endpoint);
			await q.run();
		},
		async daHora(hora, data) {
			await pronto(db);
			const { results } = await db
				.prepare(
					`SELECT endpoint, usuario, p256dh, auth, hora, ultimo_envio AS ultimoEnvio FROM lembretes
					 WHERE hora = ?1 AND (ultimo_envio IS NULL OR ultimo_envio <> ?2)`
				)
				.bind(hora, data)
				.all<InscricaoGravada>();
			return results;
		},
		async marcarEnvio(endpoint, data) {
			await pronto(db);
			await db.prepare('UPDATE lembretes SET ultimo_envio = ?2 WHERE endpoint = ?1').bind(endpoint, data).run();
		}
	};
}

export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		return (
			(await tratarLembrete(req, lembretesD1(env.DB), env.VAPID_PUBLICA)) ??
			(await tratarApi(req, bancoD1(env.DB))) ??
			env.ASSETS.fetch(req)
		);
	},
	async scheduled(controle: ControladorAgendado, env: Env, ctx: Contexto): Promise<void> {
		const { data, hora } = agoraEmSaoPaulo(new Date(controle.scheduledTime));
		if (!env.VAPID_PUBLICA || !env.VAPID_PRIVADA) return; // sem as chaves da fase 4, nada a enviar
		const banco = bancoD1(env.DB);
		const lembretes = lembretesD1(env.DB);
		const planos = new Map<string, PlanoMissoes | null>();
		const vapid = {
			publica: env.VAPID_PUBLICA,
			privada: JSON.parse(env.VAPID_PRIVADA) as JsonWebKey,
			assunto: env.VAPID_ASSUNTO ?? 'https://cgu.solarpunk.workers.dev'
		};
		const deps: DependenciasCron = {
			inscritosDaHora: (h, dia) => lembretes.daHora(h, dia),
			marcarEnvio: (endpoint, dia) => lembretes.marcarEnvio(endpoint, dia),
			apagarInscricao: (endpoint) => lembretes.apagar(endpoint),
			progresso: async (usuario) => {
				const registro = await banco.ler(usuario);
				return Object.fromEntries(Object.entries(registro).map(([chave, { valor }]) => [chave, valor]));
			},
			plano: async (cargo) => {
				if (!planos.has(cargo)) {
					try {
						const r = await env.ASSETS.fetch(new Request(`https://assets/conteudo/missoes-${cargo}.json`));
						planos.set(cargo, r.ok ? ((await r.json()) as PlanoMissoes) : null);
					} catch {
						planos.set(cargo, null);
					}
				}
				return planos.get(cargo) ?? null;
			},
			enviar: async (inscricao, lembrete) => (await fetch(await montarEnvio(inscricao, JSON.stringify(lembrete), vapid))).status
		};
		ctx.waitUntil(cronDoDia(deps, data, hora));
	}
};

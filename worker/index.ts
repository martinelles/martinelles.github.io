/**
 * Worker do Cloudflare: `/api/*` vai para a API de progresso no D1; o resto (o app) sai dos assets.
 * Os tipos do D1 estão reduzidos ao que se usa aqui, para não trazer `@cloudflare/workers-types`
 * ao `svelte-check` do app.
 */
import { tratarLembrete, type BancoLembretes, type InscricaoGravada } from './lembrete';
import { tratarApi, type Banco, type Gravado } from './progresso';

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
	}
};

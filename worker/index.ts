/**
 * Worker do Cloudflare: `/api/*` vai para a API de progresso no D1; o resto (o app) sai dos assets.
 * Os tipos do D1 estão reduzidos ao que se usa aqui, para não trazer `@cloudflare/workers-types`
 * ao `svelte-check` do app.
 */
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
}

/**
 * A tabela nasce na primeira requisição de cada isolate, em vez de migração aplicada à mão:
 * o deploy pelo painel do Cloudflare não roda `wrangler d1 migrations apply`.
 */
const ESQUEMA =
	'CREATE TABLE IF NOT EXISTS progresso (usuario TEXT NOT NULL, chave TEXT NOT NULL, valor TEXT NOT NULL, atualizado_em INTEGER NOT NULL, PRIMARY KEY (usuario, chave))';
let esquemaPronto: Promise<unknown> | null = null;

function bancoD1(db: D1): Banco {
	const pronto = () => (esquemaPronto ??= db.exec(ESQUEMA).catch((e) => ((esquemaPronto = null), Promise.reject(e))));
	const atual = (usuario: string, chave: string) =>
		db
			.prepare('SELECT valor, atualizado_em AS atualizadoEm FROM progresso WHERE usuario = ?1 AND chave = ?2')
			.bind(usuario, chave)
			.first<Gravado>();
	return {
		async ler(usuario) {
			await pronto();
			const { results } = await db
				.prepare('SELECT chave, valor, atualizado_em AS atualizadoEm FROM progresso WHERE usuario = ?1')
				.bind(usuario)
				.all<Gravado & { chave: string }>();
			return Object.fromEntries(results.map(({ chave, valor, atualizadoEm }) => [chave, { valor, atualizadoEm }]));
		},
		async gravar(usuario, chave, novo) {
			await pronto();
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

export default {
	async fetch(req: Request, env: Env): Promise<Response> {
		return (await tratarApi(req, bancoD1(env.DB))) ?? env.ASSETS.fetch(req);
	}
};

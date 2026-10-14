/**
 * Carga de `/conteudo/missoes-<cargo>.json`, no padrão do repositório do feed: uma busca por
 * arquivo (promessa compartilhada), falha sai do cache, e arquivo inválido é buscado uma vez de
 * novo sem cache (o service worker pode estar servindo uma cópia de antes de uma importação).
 */
import { BASE_CONTEUDO, fetchJson, type Buscar } from '$lib/feed/conteudo';
import type { Cargo, PlanoMissoes } from './tipos';

const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIPOS = ['novo', 'rev', 'disc', 'sim', 'q'];

export const urlMissoes = (cargo: Cargo) => `${BASE_CONTEUDO}missoes-${cargo}.json`;

const cache = new Map<string, Promise<PlanoMissoes>>();

/** O mínimo de que o painel depende; o resto o importador já garantiu. */
export function validarMissoes(bruto: unknown): PlanoMissoes {
	const p = bruto as Partial<PlanoMissoes> | null;
	const erro = (motivo: string) => new Error(`Plano das Missões inválido: ${motivo}`);
	if (!p || typeof p !== 'object' || !Array.isArray(p.plan) || !p.plan.length) throw erro('sem dias');
	for (const d of p.plan) {
		if (!d || typeof d.data !== 'string' || !DIA_RE.test(d.data) || !Array.isArray(d.blocos))
			throw erro(`dia malformado: ${JSON.stringify(d).slice(0, 80)}`);
		for (const b of d.blocos)
			if (!b || !TIPOS.includes(b.tipo) || !Number.isInteger(b.min)) throw erro(`bloco malformado em ${d.data}`);
	}
	const mapa = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, string>) : {});
	return {
		gerado: String(p.gerado ?? ''),
		plan: p.plan,
		cortes: Array.isArray(p.cortes) ? p.cortes : [],
		qc: mapa(p.qc),
		qcErros: mapa(p.qcErros)
	};
}

async function buscarSemCache(url: string): Promise<unknown> {
	const r = await fetch(url, { cache: 'reload' });
	if (!r.ok) throw new Error(`HTTP ${r.status} em ${url}`);
	return r.json();
}

export function carregarMissoes(cargo: Cargo, buscar: Buscar = fetchJson, recarregar: Buscar = buscarSemCache): Promise<PlanoMissoes> {
	const url = urlMissoes(cargo);
	const atual = cache.get(url);
	if (atual) return atual;
	const nova = (async () => {
		const falha = (e: unknown) =>
			new Error(`Não foi possível carregar o plano das Missões (${url}): ${e instanceof Error ? e.message : String(e)}`);
		let bruto: unknown;
		try {
			bruto = await buscar(url);
		} catch (e) {
			throw falha(e);
		}
		try {
			return validarMissoes(bruto);
		} catch {
			try {
				bruto = await recarregar(url);
			} catch (e) {
				throw falha(e);
			}
			return validarMissoes(bruto);
		}
	})();
	cache.set(url, nova);
	nova.catch(() => {
		if (cache.get(url) === nova) cache.delete(url);
	});
	return nova;
}

/** Esquece o cache (testes). */
export function esquecerMissoes(): void {
	cache.clear();
}

/** Apoio dos testes do motor do feed: índices sintéticos, repositório falso e Storage falsos. */
import type { Repositorio, ResultadoPosts } from '$lib/feed/conteudo';
import type { EntradaIndice, Indice, InicialTipo, Post } from '$lib/feed/tipos';
import { TIPO_POR_INICIAL } from '$lib/feed/tipos';

import indiceFixture from './fixtures/indice.json';
import materiasFixture from './fixtures/materias.json';
import loteDados from './fixtures/lote-ti-ciencia-de-dados-1.json';
import loteOutros from './fixtures/lote-outros-ramos-do-direito-1.json';

export const FIXTURES: Record<string, unknown> = {
	'/conteudo/indice.json': indiceFixture,
	'/conteudo/materias.json': materiasFixture,
	'/conteudo/lote-ti-ciencia-de-dados-1.json': loteDados,
	'/conteudo/lote-outros-ramos-do-direito-1.json': loteOutros
};

const INICIAIS: InicialTipo[] = ['q', 'l', 'r', 'f'];

/** `n` posts, tipos em rodízio q/l/r/f, matérias em rodízio entre `materias`, lotes de 25 por matéria. */
export function indiceSintetico(n: number, materias = ['ti-ciencia-de-dados', 'direito-administrativo', 'auditoria']): Indice {
	const porMateria = new Map<string, number>();
	const posts: EntradaIndice[] = [];
	const lotes: Record<string, string> = {};
	for (let i = 0; i < n; i++) {
		const t = INICIAIS[i % 4];
		const m = materias[i % materias.length];
		const k = porMateria.get(m) ?? 0;
		porMateria.set(m, k + 1);
		const l = `${m}-${Math.floor(k / 25) + 1}`;
		lotes[l] = `lote-${l}.json`;
		posts.push({ id: `${t}:p${i}`, t, m, l });
	}
	return { versao: 1, geradoEm: '2026-09-30T00:00:00.000Z', posts, lotes };
}

/** Post mínimo a partir da entrada do índice (o conteúdo não importa ao motor). */
export function postDe(e: EntradaIndice): Post {
	return { id: e.id, tipo: TIPO_POR_INICIAL[e.t], materia: e.m, pergunta: e.id, resposta: e.id, conferido: false, fonte: { rotulo: 'teste' } } as Post;
}

/** `buscar` falso servindo índice + lotes de um índice sintético; conta chamadas por URL. */
export function buscarSintetico(indice: Indice) {
	const chamadas = new Map<string, number>();
	const falhando = new Set<string>();
	const buscar = async (url: string): Promise<unknown> => {
		chamadas.set(url, (chamadas.get(url) ?? 0) + 1);
		await Promise.resolve();
		const arquivo = url.replace('/conteudo/', '');
		if (falhando.has(arquivo)) throw new Error(`rede: ${arquivo}`);
		if (arquivo === 'indice.json') return indice;
		const chave = Object.keys(indice.lotes).find((l) => indice.lotes[l] === arquivo);
		if (chave === undefined) throw new Error(`404: ${arquivo}`);
		return indice.posts.filter((e) => e.l === chave).map(postDe);
	};
	return { buscar, chamadas, falhando };
}

/** Repositório falso em memória; `falhar(id)` decide quais ids falham na próxima chamada. */
export function repoFalso(indice: Indice, falhar: (id: string) => boolean = () => false): Repositorio & { pedidos: string[][] } {
	const porId = new Map(indice.posts.map((e) => [e.id, e]));
	const pedidos: string[][] = [];
	return {
		pedidos,
		indice: async () => indice,
		materias: async () => [],
		posts: async (ids: string[]): Promise<ResultadoPosts> => {
			pedidos.push([...ids]);
			const falharam = ids.filter((id) => porId.has(id) && falhar(id));
			const posts = ids.filter((id) => porId.has(id) && !falharam.includes(id)).map((id) => postDe(porId.get(id)!));
			return { posts, falharam };
		}
	};
}

/** Storage em memória. */
export class StorageFalso implements Storage {
	private mapa = new Map<string, string>();
	get length() {
		return this.mapa.size;
	}
	clear() {
		this.mapa.clear();
	}
	getItem(k: string) {
		return this.mapa.get(k) ?? null;
	}
	key(i: number) {
		return [...this.mapa.keys()][i] ?? null;
	}
	removeItem(k: string) {
		this.mapa.delete(k);
	}
	setItem(k: string, v: string) {
		this.mapa.set(k, String(v));
	}
}

/** Storage que lança em toda chamada (janela privada / cota esgotada). */
export class StorageQueLanca implements Storage {
	get length(): number {
		throw new Error('bloqueado');
	}
	clear(): void {
		throw new Error('bloqueado');
	}
	getItem(): string | null {
		throw new Error('bloqueado');
	}
	key(): string | null {
		throw new Error('bloqueado');
	}
	removeItem(): void {
		throw new Error('bloqueado');
	}
	setItem(): void {
		throw new Error('bloqueado');
	}
}

/** Storage que lê normalmente mas falha ao gravar (cota esgotada). */
export class StorageSoLeitura extends StorageFalso {
	setItem(): void {
		throw new Error('QuotaExceededError');
	}
}

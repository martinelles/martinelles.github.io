/**
 * Ordem do feed (research R5): Fisher–Yates com `mulberry32` semeado por dia + filtro (matéria, tópico) + tipo,
 * depois intercalação por tipo na proporção questão 3 : lei 2 : resumo 1 : flashcard 2.
 * Tudo puro: o dia chega por parâmetro.
 */
import { TIPO_POR_INICIAL, type Filtro, type Indice, type TipoPost } from './tipos';

/** PRNG de 32 bits; devolve números em [0, 1). */
export function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** FNV-1a de 32 bits sobre as unidades UTF-16 do texto. */
export function hashTexto(s: string): number {
	let h = 0x811c9dc5;
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return h >>> 0;
}

/** Fisher–Yates; devolve cópia, não muta a entrada. */
export function embaralhar<T>(lista: readonly T[], rng: () => number): T[] {
	const copia = [...lista];
	for (let i = copia.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1));
		[copia[i], copia[j]] = [copia[j], copia[i]];
	}
	return copia;
}

/** Proporção da intercalação, na ordem em que cada rodada serve as filas. */
export const PROPORCAO: ReadonlyArray<readonly [TipoPost, number]> = [
	['questao', 3],
	['lei', 2],
	['resumo', 1],
	['flashcard', 2]
];

/** Texto da semente de uma fila; sem tópico fica igual ao de antes do filtro por tópico. */
function semente(dia: string, filtro: Filtro, tipo: TipoPost): string {
	const base = `${dia}|${filtro.materia ?? ''}|${tipo}`;
	return filtro.topico === undefined ? base : `${base}|${filtro.topico}`;
}

/** Ids do índice que passam no filtro, em ordem do dia. É sempre uma permutação dos ids filtrados. */
export function ordemDoDia(indice: Pick<Indice, 'posts'>, filtro: Filtro, dia: string): string[] {
	const filas = new Map<TipoPost, string[]>(PROPORCAO.map(([tipo]) => [tipo, []]));
	for (const e of indice.posts) {
		const tipo = TIPO_POR_INICIAL[e.t];
		if (!tipo) continue;
		if (filtro.materia !== undefined && e.m !== filtro.materia) continue;
		if (filtro.tipo !== undefined && tipo !== filtro.tipo) continue;
		if (filtro.topico !== undefined && e.tp !== filtro.topico) continue;
		filas.get(tipo)!.push(e.id);
	}

	const embaralhadas = PROPORCAO.map(([tipo, cota]) => ({
		cota,
		ids: embaralhar(filas.get(tipo)!, mulberry32(hashTexto(semente(dia, filtro, tipo)))),
		pos: 0
	}));

	const saida: string[] = [];
	let restam = embaralhadas.reduce((n, f) => n + f.ids.length, 0);
	while (restam > 0) {
		for (const fila of embaralhadas) {
			const fim = Math.min(fila.pos + fila.cota, fila.ids.length);
			for (; fila.pos < fim; fila.pos++, restam--) saida.push(fila.ids[fila.pos]);
		}
	}
	return saida;
}

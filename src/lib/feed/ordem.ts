/**
 * Ordem do feed (research R5): Fisher–Yates com `mulberry32` semeado por dia + filtro (matéria, tópico) + tipo,
 * depois intercalação por tipo na proporção questão 3 : lei 2 : resumo 1 : flashcard 2.
 * Tudo puro: o dia chega por parâmetro.
 */
import { naMateria, noTopico } from './entrada';
import { especialidadePorId } from './foco.svelte';
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

/** Nota de 0 a 1 de cada tópico com alguma questão respondida (acertos ÷ respondidas). */
export type NotasPorTopico = ReadonlyMap<string, number>;

/**
 * "Fracos primeiro": nota de acerto por tópico (o `tp` principal da questão). Tópico sem
 * questão respondida não entra — na ordenação ele fica junto com as questões sem tópico.
 */
export function notasPorTopico(
	indice: Pick<Indice, 'posts'>,
	respostas: Readonly<Record<string, { ok: boolean }>>
): NotasPorTopico {
	const acertos = new Map<string, number>();
	const total = new Map<string, number>();
	for (const e of indice.posts) {
		if (TIPO_POR_INICIAL[e.t] !== 'questao' || e.tp === undefined) continue;
		const r = respostas[e.id];
		if (!r) continue;
		total.set(e.tp, (total.get(e.tp) ?? 0) + 1);
		if (r.ok) acertos.set(e.tp, (acertos.get(e.tp) ?? 0) + 1);
	}
	const notas = new Map<string, number>();
	for (const [tp, n] of total) notas.set(tp, (acertos.get(tp) ?? 0) / n);
	return notas;
}

/**
 * Ids do índice que passam no filtro, em ordem do dia. É sempre uma permutação dos ids filtrados.
 * Com `fracos`, a fila de questões é ordenada pela pior nota de tópico primeiro (empate e questão
 * sem nota seguem a ordem sorteada da rodada); lei, resumo e flashcard continuam sorteados.
 */
export function ordemDoDia(
	indice: Pick<Indice, 'posts'>,
	filtro: Filtro,
	dia: string,
	fracos?: NotasPorTopico | null
): string[] {
	const filas = new Map<TipoPost, string[]>(PROPORCAO.map(([tipo]) => [tipo, []]));
	const fora = filtro.especialidade ? especialidadePorId(filtro.especialidade).fora : () => false;
	for (const e of indice.posts) {
		const tipo = TIPO_POR_INICIAL[e.t];
		if (!tipo) continue;
		if (filtro.materia !== undefined && !naMateria(e, filtro.materia)) continue;
		if (fora(e.m)) continue;
		if (filtro.tipo !== undefined && tipo !== filtro.tipo) continue;
		if (filtro.topico !== undefined && !noTopico(e, filtro.topico)) continue;
		filas.get(tipo)!.push(e.id);
	}

	const embaralhadas = PROPORCAO.map(([tipo, cota]) => {
		let ids = embaralhar(filas.get(tipo)!, mulberry32(hashTexto(semente(dia, filtro, tipo))));
		if (fracos && tipo === 'questao') {
			// Sort estável: empates ficam na ordem sorteada, então a variedade da rodada segue.
			const tpPorId = new Map(
				indice.posts.filter((e) => TIPO_POR_INICIAL[e.t] === 'questao' && e.tp !== undefined).map((e) => [e.id, e.tp!])
			);
			ids = ids
				.map((id) => {
					const tp = tpPorId.get(id);
					const nota = tp === undefined ? null : (fracos.get(tp) ?? null);
					return { id, nota };
				})
				.sort((a, b) => (a.nota === null ? 1 : 0) - (b.nota === null ? 1 : 0) || (a.nota ?? 0) - (b.nota ?? 0))
				.map((x) => x.id);
		}
		return { cota, ids, pos: 0 };
	});

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

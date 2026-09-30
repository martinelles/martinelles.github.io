/**
 * Funções puras de apresentação dos posts (sem estado, sem armazenamento).
 */
import { hashTexto } from '$lib/feed/ordem';
import type { Post } from '$lib/feed/tipos';

/** Quantidade de cores por matéria definidas em app.css (`--materia-0` … `--materia-7`). */
export const CORES_MATERIA = 8;

/** Cor estável da matéria, derivada do id: `var(--materia-N)`. */
export function corMateria(id: string): string {
	return `var(--materia-${hashTexto(id) % CORES_MATERIA})`;
}

/** Até duas letras para o avatar: iniciais de duas palavras ("Dir. Adm." → "DA") ou as duas primeiras ("Dados" → "DA"). */
export function iniciais(abrev: string): string {
	const palavras = abrev.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
	if (palavras.length === 0) return '?';
	const txt = palavras.length > 1 ? palavras[0][0] + palavras[1][0] : palavras[0].slice(0, 2);
	return txt.toLocaleUpperCase('pt-BR');
}

/** Rótulo do tipo no cabeçalho: "Questão · CGU 2022 · AFFC TI · Q. 47", "Lei seca · LAI", "Resumo", "Flashcard". */
export function rotuloTipo(post: Post): string {
	switch (post.tipo) {
		case 'questao':
			return `Questão · ${post.prova.orgao} ${post.prova.ano} · ${post.prova.cargo} · Q. ${post.numero}`;
		case 'lei':
			return `Lei seca · ${siglaNorma(post.norma.titulo)}`;
		case 'resumo':
			return 'Resumo';
		case 'flashcard':
			return 'Flashcard';
	}
}

/** "Lei 12.527/2011 — LAI" → "LAI"; sem apelido, o título inteiro. */
export function siglaNorma(titulo: string): string {
	const partes = titulo.split(/\s+[—–-]\s+/);
	return partes.length > 1 ? partes[partes.length - 1] : titulo;
}

export type RecuoLinha = 0 | 1 | 2 | 3;

/** Recuo visual de uma linha de lei: caput 0, inciso/§ 1, alínea 2, item 3. */
export function recuoLinha(linha: string): RecuoLinha {
	const t = linha.trimStart();
	if (/^(§|Parágrafo único)/i.test(t)) return 1;
	if (/^[IVXLCDM]+\s*[-–—.]/.test(t)) return 1;
	if (/^[a-z]\)/.test(t)) return 2;
	if (/^\d+\s*[.)-]\s/.test(t) && !/^\d+(\.\d+)+\s/.test(t)) return 3;
	return 0;
}

/** Separa a nota final de um dispositivo revogado: "II - texto (Revogado pela Lei X)" → ["II - texto", "(Revogado pela Lei X)"]. */
export function separarNota(linha: string): [string, string] {
	const m = linha.match(/^(.*?)\s*(\((?:revogad|vetad|reda[cç][aã]o|inclu[ií]d)[^()]*\))\s*$/i);
	return m ? [m[1], m[2]] : [linha, ''];
}

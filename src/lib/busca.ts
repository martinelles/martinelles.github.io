import type { Concurso } from '$lib/dados';

/** Minúsculas, sem acento e sem espaço nas pontas: 'Controladoria-Geral da União' -> 'controladoria-geral da uniao'. */
export function normalizar(texto: string): string {
	return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

export interface ItemIndexado<T> {
	item: T;
	chave: string;
}

/**
 * Pré-computa a chave de busca (nome, órgão, banca e cargos) uma vez, na carga (research R3).
 * Do cargo entram o nome e o id: o id carrega siglas que o nome escreve por extenso
 * ("auditor-ti" para "Tecnologia da Informação"), e é assim que "cgu ti" acha o CGU TI.
 */
export function indexar(concursos: Concurso[]): ItemIndexado<Concurso>[] {
	return concursos.map((item) => ({
		item,
		chave: normalizar([item.nome, item.orgao, item.banca, ...item.cargos.flatMap((c) => [c.nome, c.id])].join(' '))
	}));
}

/**
 * Filtra pelo termo: cada palavra precisa aparecer na chave (E lógico).
 * Termo vazio ou só com espaços devolve todos, na ordem original.
 * Usa `includes`, nunca regex montada a partir do termo.
 */
export function filtrar(indice: ItemIndexado<Concurso>[], termo: string): Concurso[] {
	const palavras = normalizar(termo).split(/\s+/).filter(Boolean);
	if (palavras.length === 0) return indice.map((i) => i.item);
	return indice.filter((i) => palavras.every((p) => i.chave.includes(p))).map((i) => i.item);
}

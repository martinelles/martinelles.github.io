/**
 * Tipos do conteúdo do feed — espelham kitty-specs/feed-estudo-cgu-01M3S6H8/contracts/conteudo-importado.schema.json
 * (saída da importação em `static/conteudo/`).
 */

export type TipoPost = 'questao' | 'lei' | 'resumo' | 'flashcard';
export type InicialTipo = 'q' | 'l' | 'r' | 'f';

export const TIPO_POR_INICIAL: Record<InicialTipo, TipoPost> = {
	q: 'questao',
	l: 'lei',
	r: 'resumo',
	f: 'flashcard'
};

export interface Fonte {
	rotulo: string;
	arquivo?: string;
	url?: string;
}

interface PostBase {
	id: string;
	tipo: TipoPost;
	materia: string;
	subtopico?: string;
	fonte?: Fonte;
}

export interface Alternativa {
	letra: 'A' | 'B' | 'C' | 'D' | 'E';
	texto: string;
}

export interface PostQuestao extends PostBase {
	tipo: 'questao';
	prova: { orgao: 'CGU' | 'TCU'; ano: number; cargo: string; banca?: string };
	numero: number;
	textoBase?: string;
	enunciado: string;
	formato: 'ce' | 'me';
	alternativas?: Alternativa[];
	gabarito: 'C' | 'E' | 'A' | 'B' | 'D';
	situacao: 'valida' | 'alterada';
}

export interface PostLei extends PostBase {
	tipo: 'lei';
	norma: { arquivo: string; titulo: string; numero?: string };
	artigo: string;
	telas: string[];
	revogados?: number[];
}

export interface TelaResumo {
	titulo?: string;
	texto: string;
}

export interface PostResumo extends PostBase {
	tipo: 'resumo';
	titulo: string;
	telas: TelaResumo[];
	conferido: boolean;
	fonte: Fonte;
}

export interface PostFlashcard extends PostBase {
	tipo: 'flashcard';
	pergunta: string;
	resposta: string;
	conferido: boolean;
	fonte: Fonte;
}

export type Post = PostQuestao | PostLei | PostResumo | PostFlashcard;

/** Item de `materias.json`. */
export interface Materia {
	id: string;
	nome: string;
	abrev: string;
	ordem: number;
	total: number;
}

/** Entrada curta do índice: `t` inicial do tipo, `m` id da matéria, `l` chave do lote em `Indice.lotes`. */
export interface EntradaIndice {
	id: string;
	t: InicialTipo;
	m: string;
	l: string;
}

/** `indice.json`. */
export interface Indice {
	versao: number | string;
	geradoEm: string;
	posts: EntradaIndice[];
	lotes: Record<string, string>;
}

/** Filtro do feed: sem campos = "Tudo". */
export interface Filtro {
	materia?: string;
	tipo?: TipoPost;
}

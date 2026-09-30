export type Situacao = 'aberto' | 'previsto' | 'encerrado';
export type CorConcurso = 'azul' | 'verde' | 'roxo' | 'laranja' | 'vermelho';
export type GrupoFerramenta = 'teorico' | 'pratica' | 'atalho';

export const SITUACOES = ['aberto', 'previsto', 'encerrado'] as const satisfies readonly Situacao[];
export const CORES = ['azul', 'verde', 'roxo', 'laranja', 'vermelho'] as const satisfies readonly CorConcurso[];
export const GRUPOS = ['teorico', 'pratica', 'atalho'] as const satisfies readonly GrupoFerramenta[];

/** Nomes de ícone válidos: o componente de ícones desenha estes e só estes. */
export const ICONES = [
	'balanca',
	'escudo',
	'moeda',
	'predio',
	'martelo',
	'grafico',
	'livro',
	'caderno',
	'mapa',
	'documento',
	'lista',
	'raio',
	'cartas',
	'cronometro',
	'calendario',
	'busca',
	'whatsapp',
	'voltar',
	'seta-baixo',
	'seta-cima',
	'edital',
	'pessoas',
	'relogio',
	'trocar',
	// Feed de estudo
	'coracao',
	'coracao-cheio',
	'marcador',
	'marcador-cheio',
	'casa',
	'grade',
	'seta-esquerda',
	'seta-direita',
	'virar',
	'check',
	'x',
	'lei',
	'lampada',
	'interrogacao'
] as const;
export type NomeIcone = (typeof ICONES)[number];

export interface Cargo {
	id: string;
	nome: string;
	disciplinas: string[];
}

export interface Concurso {
	id: string;
	nome: string;
	orgao: string;
	banca: string;
	area: string;
	situacao: Situacao;
	emAlta?: boolean;
	vagas?: number;
	salario?: string;
	/** AAAA-MM-DD */
	dataProva?: string;
	/** https:// */
	edital?: string;
	icone: string;
	cor: CorConcurso;
	cargos: Cargo[];
}

export interface Ferramenta {
	id: string;
	titulo: string;
	subtitulo: string;
	icone: string;
	grupo: GrupoFerramenta;
}

export interface Config {
	whatsapp: string | null;
	limiteEmAlta: number;
}

export interface Dados {
	concursos: Concurso[];
	ferramentas: Ferramenta[];
	config: Config;
}

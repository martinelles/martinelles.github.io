/**
 * Plano de 61 dias das Missões, como o importador grava em `/conteudo/missoes-<cargo>.json`
 * (`scripts/importar/missoes.mjs`). Plano: planos/2026-10-14-missao-unica.md.
 */

/** Cargo, na mesma forma da âncora das páginas (`#cd`, `#aud`). */
export type Cargo = 'cd' | 'aud';

export type TipoBloco = 'novo' | 'rev' | 'disc' | 'sim' | 'q';

export interface ItemBloco {
	/** Id do tópico: o do `ESTUDO.csv` (que é o `tp` das questões do feed) ou `AUD-E<n>-<x.y>`.
	 *  Item-aula (plano por aula, de 2026-11-09 em diante): o UUID da aula na plataforma. */
	cid: string;
	/** Código do guia, como `E1 1.1`; item-aula: `E2·1` (aula 1 da disciplina). */
	cod: string;
	texto: string;
	prova?: string;
	prio?: string;
	/** Minutos do subitem no bloco (estudo novo). */
	min?: number;
	/** O tópico termina neste bloco (estudo novo). */
	fim?: boolean;
	/** Intervalo da revisão: `D+1`, `D+7`, `D+30`. */
	lab?: string;
	/** Item-aula: subitens do edital cobertos pela aula, como referência (mapas, questões do feed). */
	subitens?: { cid: string; cod: string }[];
}

export interface Bloco {
	tipo: TipoBloco;
	titulo: string;
	/** Pode ser 0: a revisão "encaixe 15 min" dos dias de simulado, já contada no simulado. */
	min: number;
	itens?: ItemBloco[];
	/** Instrução do bloco. */
	det?: string;
}

export interface DiaMissao {
	/** AAAA-MM-DD */
	data: string;
	/** `seg`…`dom`. */
	dow: string;
	fase: string;
	blocos: Bloco[];
}

export interface PlanoMissoes {
	gerado: string;
	plan: DiaMissao[];
	cortes: unknown[];
	/** Mapa mental do subitem (`/mapa/<slug>`, SVG de `/conteudo/mapas/`), por `cid`. */
	mapas: Record<string, string>;
}

/** Marcações: `{ "<cargo>~<AAAA-MM-DD>~<índice do bloco>": true }`, a chave `missoes-cgu-2026`. */
export type Marcas = Record<string, true>;

/**
 * Subitem da missão de hoje que ela abriu no Qconcursos ("Questões no Qconcursos" ou "Questões que
 * errei"): ao voltar ao painel, ele aparece destacado até ela marcar ou dispensar. Vale só no dia em
 * que foi aberto e só neste aparelho (`localStorage`, sem sincronizar: é onde ela parou aqui, não
 * progresso). Toda leitura e escrita em try/catch: falhou, o lembrete vive só em memória.
 */
import type { Cargo } from './tipos';

export const CHAVE_EM_ANDAMENTO = 'painel-concurso:missoes:em-andamento:v1';

export interface EmAndamento {
	cargo: Cargo;
	/** Data do dia do plano (`2026-10-14`). */
	data: string;
	/** Índice do bloco no dia. */
	bloco: number;
	cid: string;
}

let atual = $state<EmAndamento | null>(null);
let armazenamento: Storage | null = null;
let carregado = false;

function tentarLocalStorage(): Storage | null {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
}

/** Gravado válido, ou null (ausente, corrompido ou de outro formato). */
export function lerEmAndamento(texto: string | null): EmAndamento | null {
	try {
		const b: unknown = JSON.parse(texto ?? 'null');
		if (!b || typeof b !== 'object') return null;
		const { cargo, data, bloco, cid } = b as Record<string, unknown>;
		if ((cargo === 'cd' || cargo === 'aud') && typeof data === 'string' && Number.isInteger(bloco) && typeof cid === 'string')
			return { cargo, data, bloco: bloco as number, cid };
	} catch {
		// Corrompido: sem lembrete.
	}
	return null;
}

/** Lê o gravado só se ninguém leu ainda nesta aba (fora de `$derived`: muda estado). */
export function garantirEmAndamento(): void {
	if (!carregado) carregarEmAndamento();
}

/** Lê o que está gravado (idempotente). */
export function carregarEmAndamento(arm: Storage | null = tentarLocalStorage()): void {
	carregado = true;
	armazenamento = arm;
	try {
		atual = lerEmAndamento(arm?.getItem(CHAVE_EM_ANDAMENTO) ?? null);
	} catch {
		atual = null;
	}
}

function gravar(): void {
	try {
		if (atual) armazenamento?.setItem(CHAVE_EM_ANDAMENTO, JSON.stringify(atual));
		else armazenamento?.removeItem(CHAVE_EM_ANDAMENTO);
	} catch {
		// Armazenamento cheio ou bloqueado: o lembrete fica em memória nesta aba.
	}
}

export const emAndamento = {
	/** O subitem aberto neste cargo e dia, ou null. Lido dentro de `$derived`, é reativo. */
	de(cargo: Cargo, data: string): EmAndamento | null {
		return atual && atual.cargo === cargo && atual.data === data ? atual : null;
	},
	/** Abriu as questões de um subitem: ele passa a ser o lembrete (substitui o anterior). */
	abrir(m: EmAndamento): void {
		if (!carregado) carregarEmAndamento();
		atual = { ...m };
		gravar();
	},
	limpar(): void {
		if (!carregado) carregarEmAndamento();
		if (!atual) return;
		atual = null;
		gravar();
	}
};

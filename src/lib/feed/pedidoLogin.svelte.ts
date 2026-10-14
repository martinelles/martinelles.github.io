/**
 * Responder sem login pede o login antes, num popup: a resposta só no aparelho seria apagada no
 * primeiro login de uma conta que já tem progresso no servidor (lá vale o mais novo, e o carimbo
 * do servidor ganha de um aparelho que nunca sincronizou).
 *
 * A resposta que pediu o login fica na sessão da aba e entra depois da sincronização da carga
 * nova, como a marcação das Missões. "Agora não" responde só no aparelho e não pergunta de novo
 * nesta aba.
 */
import { conta } from '$lib/conta/sessao.svelte';
import { CHAVE_INTERACOES, interacoes } from './interacoes.svelte';

export const CHAVE_PENDENTE = `${CHAVE_INTERACOES}:pendente`;
export const CHAVE_DISPENSADO = `${CHAVE_INTERACOES}:sem-login`;

export interface RespostaPendente {
	id: string;
	r: string;
	gabarito: string;
}

let pedido = $state<RespostaPendente | null>(null);

function tentarSessao(): Storage | null {
	try {
		return globalThis.sessionStorage ?? null;
	} catch {
		return null;
	}
}

function dispensado(sessao: Storage | null): boolean {
	try {
		return sessao?.getItem(CHAVE_DISPENSADO) === '1';
	} catch {
		return false;
	}
}

/** Logado (ou já disse "Agora não"): responde na hora. Sem login: guarda e abre o popup. */
export function responderQuestao(id: string, r: string, gabarito: string, sessao = tentarSessao()): void {
	if (conta.usuario || dispensado(sessao)) {
		interacoes.responder(id, r, gabarito);
		return;
	}
	pedido = { id, r, gabarito };
	try {
		sessao?.setItem(CHAVE_PENDENTE, JSON.stringify(pedido));
	} catch {
		// Sem sessão: se entrar, a carga nova não acha a resposta, e ela responde de novo.
	}
}

/** Tira a resposta pendente da sessão (uma vez só). */
export function tomarRespostaPendente(sessao = tentarSessao()): RespostaPendente | null {
	try {
		const p: unknown = JSON.parse(sessao?.getItem(CHAVE_PENDENTE) ?? 'null');
		sessao?.removeItem(CHAVE_PENDENTE);
		if (p && typeof p === 'object') {
			const { id, r, gabarito } = p as Record<string, unknown>;
			if (typeof id === 'string' && typeof r === 'string' && typeof gabarito === 'string') return { id, r, gabarito };
		}
	} catch {
		// Corrompida: nada pendente.
	}
	return null;
}

export const pedidoLogin = {
	get aberto(): boolean {
		return pedido !== null;
	},
	/** Responde só no aparelho e não pergunta mais nesta aba. */
	agoraNao(sessao = tentarSessao()): void {
		const p = pedido;
		pedido = null;
		tomarRespostaPendente(sessao);
		try {
			sessao?.setItem(CHAVE_DISPENSADO, '1');
		} catch {
			// Sem sessão: pergunta de novo na próxima resposta.
		}
		if (p) interacoes.responder(p.id, p.r, p.gabarito);
	}
};

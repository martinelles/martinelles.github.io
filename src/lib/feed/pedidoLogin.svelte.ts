/**
 * Responder, curtir ou salvar sem login pede o login antes, num popup: a interação só no aparelho
 * seria apagada no primeiro login de uma conta que já tem progresso no servidor (lá vale o mais
 * novo, e o carimbo do servidor ganha de um aparelho que nunca sincronizou).
 *
 * A interação que pediu o login fica na sessão da aba e entra depois da sincronização da carga
 * nova, como a marcação das Missões. Curtir e salvar guardam o estado pedido (`on`), não o
 * alternar: o servidor pode já ter o post curtido. "Agora não" faz a interação só no aparelho e
 * não pergunta de novo nesta aba.
 */
import { conta } from '$lib/conta/sessao.svelte';
import { CHAVE_INTERACOES, interacoes } from './interacoes.svelte';

export const CHAVE_PENDENTE = `${CHAVE_INTERACOES}:pendente`;
export const CHAVE_DISPENSADO = `${CHAVE_INTERACOES}:sem-login`;

export type Pendente =
	| { acao: 'responder'; id: string; r: string; gabarito: string }
	| { acao: 'curtir' | 'salvar'; id: string; on: boolean };

let pedido = $state<Pendente | null>(null);

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

/** Faz a interação; curtir e salvar só alternam se o estado ainda não é o pedido. */
export function aplicar(p: Pendente): void {
	if (p.acao === 'responder') interacoes.responder(p.id, p.r, p.gabarito);
	else if (p.acao === 'curtir') {
		if (interacoes.curtido(p.id) !== p.on) interacoes.alternarCurtida(p.id);
	} else if (interacoes.salvo(p.id) !== p.on) interacoes.alternarSalvo(p.id);
}

/** Logado (ou já disse "Agora não"): faz na hora. Sem login: guarda e abre o popup. */
function pedir(p: Pendente, sessao: Storage | null): void {
	if (conta.usuario || dispensado(sessao)) return aplicar(p);
	pedido = p;
	try {
		sessao?.setItem(CHAVE_PENDENTE, JSON.stringify(p));
	} catch {
		// Sem sessão: se entrar, a carga nova não acha a interação, e ela faz de novo.
	}
}

export function responderQuestao(id: string, r: string, gabarito: string, sessao = tentarSessao()): void {
	pedir({ acao: 'responder', id, r, gabarito }, sessao);
}

export function alternarCurtida(id: string, sessao = tentarSessao()): void {
	pedir({ acao: 'curtir', id, on: !interacoes.curtido(id) }, sessao);
}

export function alternarSalvo(id: string, sessao = tentarSessao()): void {
	pedir({ acao: 'salvar', id, on: !interacoes.salvo(id) }, sessao);
}

/** Tira a interação pendente da sessão (uma vez só). */
export function tomarPendente(sessao = tentarSessao()): Pendente | null {
	try {
		const p: unknown = JSON.parse(sessao?.getItem(CHAVE_PENDENTE) ?? 'null');
		sessao?.removeItem(CHAVE_PENDENTE);
		if (p && typeof p === 'object') {
			const { acao, id, r, gabarito, on } = p as Record<string, unknown>;
			if (typeof id !== 'string') return null;
			if (acao === 'responder' && typeof r === 'string' && typeof gabarito === 'string')
				return { acao, id, r, gabarito };
			if ((acao === 'curtir' || acao === 'salvar') && typeof on === 'boolean') return { acao, id, on };
		}
	} catch {
		// Corrompida: nada pendente.
	}
	return null;
}

export const pedidoLogin = {
	/** A interação esperando o login, ou null com o popup fechado. */
	get pedido(): Pendente | null {
		return pedido;
	},
	/** Faz só no aparelho e não pergunta mais nesta aba. */
	agoraNao(sessao = tentarSessao()): void {
		const p = pedido;
		pedido = null;
		tomarPendente(sessao);
		try {
			sessao?.setItem(CHAVE_DISPENSADO, '1');
		} catch {
			// Sem sessão: pergunta de novo na próxima interação.
		}
		if (p) aplicar(p);
	}
};

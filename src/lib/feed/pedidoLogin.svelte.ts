/**
 * Responder, curtir ou salvar sem login pede o login antes, num popup: a interação só no aparelho
 * seria apagada no primeiro login de uma conta que já tem progresso no servidor (lá vale o mais
 * novo, e o carimbo do servidor ganha de um aparelho que nunca sincronizou).
 *
 * A interação que pediu o login fica na sessão da aba e entra depois da sincronização da carga
 * nova, como a marcação das Missões. Curtir e salvar guardam o estado pedido (`on`), não o
 * alternar: o servidor pode já ter o post curtido. "Agora não" faz a interação só no aparelho e
 * não pergunta de novo nesta aba.
 *
 * Marcar missão no painel usa o mesmo popup, mas exige login, como na página das Missões: sem
 * nome, "Agora não" não marca, e o popup volta no próximo toque.
 */
import { conta } from '$lib/conta/sessao.svelte';
import type { Mudancas } from '$lib/missoes/calculos';
import { marcasMissoes } from '$lib/missoes/marcas.svelte';
import { CHAVE_INTERACOES, interacoes } from './interacoes.svelte';
import { manterRodada } from './rodada';

export const CHAVE_PENDENTE = `${CHAVE_INTERACOES}:pendente`;
export const CHAVE_DISPENSADO = `${CHAVE_INTERACOES}:sem-login`;

export type Pendente =
	| { acao: 'responder'; id: string; r: string; gabarito: string }
	| { acao: 'curtir' | 'salvar'; id: string; on: boolean }
	/** Marcações do bloco ou do subitem, já calculadas no toque (`mudancasDoBloco`, `mudancasDoItem`). */
	| { acao: 'missao'; mudancas: Mudancas };

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

/** Faz a interação; curtir e salvar só alternam se o estado ainda não é o pedido. Missão só com login. */
export function aplicar(p: Pendente): void {
	if (p.acao === 'missao') {
		if (conta.usuario) marcasMissoes.aplicar(p.mudancas);
	} else if (p.acao === 'responder') interacoes.responder(p.id, p.r, p.gabarito);
	else if (p.acao === 'curtir') {
		if (interacoes.curtido(p.id) !== p.on) interacoes.alternarCurtida(p.id);
	} else if (interacoes.salvo(p.id) !== p.on) interacoes.alternarSalvo(p.id);
}

/** Logado (ou já disse "Agora não"): faz na hora. Sem login: guarda e abre o popup. */
function pedir(p: Pendente, sessao: Storage | null): void {
	if (conta.usuario || (p.acao !== 'missao' && dispensado(sessao))) return aplicar(p);
	pedido = p;
	// Se ela entrar, a carga nova volta ao feed na mesma ordem, com o post à vista.
	manterRodada();
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

/** Chaves do bloco (`cd~2026-10-13~0`, a mesma da página das Missões) e dos subitens dele. */
export function marcarMissao(mudancas: Mudancas, sessao = tentarSessao()): void {
	pedir({ acao: 'missao', mudancas }, sessao);
}

function lerMudancas(m: unknown): Pendente | null {
	if (!m || typeof m !== 'object' || Array.isArray(m)) return null;
	const v = Object.entries(m);
	if (!v.length || !v.every(([k, f]) => k.includes('~') && typeof f === 'boolean')) return null;
	return { acao: 'missao', mudancas: m as Mudancas };
}

/** Tira a interação pendente da sessão (uma vez só). */
export function tomarPendente(sessao = tentarSessao()): Pendente | null {
	try {
		const p: unknown = JSON.parse(sessao?.getItem(CHAVE_PENDENTE) ?? 'null');
		sessao?.removeItem(CHAVE_PENDENTE);
		if (p && typeof p === 'object') {
			const { acao, id, r, gabarito, on, mudancas } = p as Record<string, unknown>;
			if (acao === 'missao') return lerMudancas(mudancas);
			if (typeof id !== 'string') return null;
			if (acao === 'responder' && typeof r === 'string' && typeof gabarito === 'string')
				return { acao, id, r, gabarito };
			if ((acao === 'curtir' || acao === 'salvar') && typeof on === 'boolean')
				return { acao, id, on };
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
	/** Faz só no aparelho e não pergunta mais nesta aba. Missão: não marca, e pergunta de novo. */
	agoraNao(sessao = tentarSessao()): void {
		const p = pedido;
		pedido = null;
		tomarPendente(sessao);
		manterRodada(false);
		if (p?.acao === 'missao') return;
		try {
			sessao?.setItem(CHAVE_DISPENSADO, '1');
		} catch {
			// Sem sessão: pergunta de novo na próxima interação.
		}
		if (p) aplicar(p);
	}
};

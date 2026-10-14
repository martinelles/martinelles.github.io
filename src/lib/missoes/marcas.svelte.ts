/**
 * Marcações das Missões no painel: a mesma chave (`missoes-cgu-2026`) e o mesmo formato que a página
 * das Missões grava, no armazenamento da conta (`armazenamentoAtual`). Com login, cada gravação sobe
 * pelo `Storage` sincronizado; o painel e a página mostram as mesmas bolhas.
 * Toda leitura e escrita em try/catch: falhou, as marcações vivem só em memória.
 */
import { CHAVE_MISSOES } from '$lib/conta/regras';
import type { Marcas } from './tipos';

/** Marcação que pediu o login: aplicada depois de entrar. Mesma chave de sessão da página. */
export const CHAVE_PENDENTE = `${CHAVE_MISSOES}:pendente`;

let marcas = $state<Marcas>({});
let armazenamento: Storage | null = null;

/** Lê o formato da página, inclusive o antigo (`cd#2026-10-13#0` ou sem cargo). */
export function lerMarcas(texto: string | null): Marcas {
	const d: Marcas = {};
	try {
		const bruto: unknown = JSON.parse(texto ?? '{}');
		if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return d;
		for (const [k, v] of Object.entries(bruto)) if (v) d[k.includes('~') ? k : `cd~${k.replace('#', '~')}`] = true;
	} catch {
		// Corrompido: sem marcações.
	}
	return d;
}

/** Lê o que está gravado (idempotente). */
export function carregarMarcas(arm: Storage | null): void {
	armazenamento = arm;
	try {
		marcas = lerMarcas(arm?.getItem(CHAVE_MISSOES) ?? null);
	} catch {
		marcas = {};
	}
}

export const marcasMissoes = {
	/** Cópia para as contas puras; lida dentro de `$derived`, é reativa. */
	todas(): Marcas {
		return { ...marcas };
	},
	feito(chave: string): boolean {
		return !!marcas[chave];
	},
	marcar(chave: string, feito: boolean): void {
		const novas = { ...marcas };
		if (feito) novas[chave] = true;
		else delete novas[chave];
		marcas = novas;
		try {
			armazenamento?.setItem(CHAVE_MISSOES, JSON.stringify(novas));
		} catch {
			// Armazenamento cheio ou bloqueado: a marcação fica em memória nesta aba.
		}
	}
};

/** Guarda a marcação que pediu o login (sessão da aba: sobrevive ao `/entrar`). */
export function guardarPendente(chave: string, feito: boolean, sessao: Storage | null = tentarSessao()): void {
	try {
		sessao?.setItem(CHAVE_PENDENTE, JSON.stringify({ k: chave, on: feito }));
	} catch {
		// Sem sessão: depois de entrar, ela marca de novo.
	}
}

/** Tira a pendência da sessão (uma vez só). */
export function tomarPendente(sessao: Storage | null = tentarSessao()): { k: string; on: boolean } | null {
	try {
		const p: unknown = JSON.parse(sessao?.getItem(CHAVE_PENDENTE) ?? 'null');
		sessao?.removeItem(CHAVE_PENDENTE);
		if (p && typeof p === 'object' && typeof (p as { k?: unknown }).k === 'string')
			return { k: (p as { k: string }).k, on: !!(p as { on?: unknown }).on };
	} catch {
		// Corrompida: nada pendente.
	}
	return null;
}

function tentarSessao(): Storage | null {
	try {
		return globalThis.sessionStorage ?? null;
	} catch {
		return null;
	}
}

/**
 * Aulas feitas fora da missão do dia: o que a pessoa estudou e não estava no plano daquele dia.
 * A mesma ideia das marcações (`marcas.svelte.ts`): chave própria no armazenamento da conta
 * (`armazenamentoAtual`), sobe pelo `Storage` sincronizado com login; falhou, fica em memória.
 */
import { CHAVE_EXTRAS } from '$lib/conta/regras';
import type { Cargo, Extras, TarefaExtra } from './tipos';

let extras = $state<Extras>({});
let armazenamento: Storage | null = null;

const valida = (t: unknown): t is TarefaExtra =>
	!!t &&
	typeof t === 'object' &&
	((t as TarefaExtra).tipo === 'novo' || (t as TarefaExtra).tipo === 'rev') &&
	typeof (t as TarefaExtra).cid === 'string' &&
	!!(t as TarefaExtra).cid &&
	typeof (t as TarefaExtra).cod === 'string' &&
	typeof (t as TarefaExtra).texto === 'string';

/** Lê o que está gravado, aceitando só dia com lista de tarefa válida. */
export function lerExtras(texto: string | null): Extras {
	const d: Extras = {};
	try {
		const bruto: unknown = JSON.parse(texto ?? '{}');
		if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return d;
		for (const [dia, lista] of Object.entries(bruto as Record<string, unknown>)) {
			if (!Array.isArray(lista)) continue;
			const boas = lista.filter(valida);
			if (boas.length) d[dia] = boas;
		}
	} catch {
		// Corrompido: sem extras.
	}
	return d;
}

/** Lê o que está gravado (idempotente). */
export function carregarExtras(arm: Storage | null): void {
	armazenamento = arm;
	try {
		extras = lerExtras(arm?.getItem(CHAVE_EXTRAS) ?? null);
	} catch {
		extras = {};
	}
}

function gravar(novas: Extras): void {
	extras = novas;
	try {
		if (Object.keys(novas).length) armazenamento?.setItem(CHAVE_EXTRAS, JSON.stringify(novas));
		else armazenamento?.removeItem(CHAVE_EXTRAS);
	} catch {
		// Armazenamento cheio ou bloqueado: a extra fica em memória nesta aba.
	}
}

export const extrasMissoes = {
	/** Cópia para ler dentro de `$derived`; é reativa. */
	todas(): Extras {
		return { ...extras };
	},
	doDia(cargo: Cargo, data: string): TarefaExtra[] {
		return extras[`${cargo}~${data}`] ?? [];
	},
	/** Acrescenta a tarefa ao dia (a mesma aula com o mesmo tipo não entra duas vezes). */
	adicionar(cargo: Cargo, data: string, tarefa: TarefaExtra): void {
		const chave = `${cargo}~${data}`;
		const lista = extras[chave] ?? [];
		if (lista.some((t) => t.tipo === tarefa.tipo && t.cid === tarefa.cid)) return;
		gravar({ ...extras, [chave]: [...lista, tarefa] });
	},
	remover(cargo: Cargo, data: string, tarefa: TarefaExtra): void {
		const chave = `${cargo}~${data}`;
		const lista = (extras[chave] ?? []).filter((t) => t.tipo !== tarefa.tipo || t.cid !== tarefa.cid);
		const novas = { ...extras };
		if (lista.length) novas[chave] = lista;
		else delete novas[chave];
		gravar(novas);
	}
};

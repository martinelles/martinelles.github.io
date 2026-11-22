/**
 * Respostas das questões de certo/errado do material da aula (rota /questoes), na conta: a mesma
 * ideia das marcações — chave própria no armazenamento sincronizado, sobe para o D1 com login.
 * Formato: `{ "<slug-da-aula>~<número>": "C" | "E" }`.
 */
import { CHAVE_QUESTOES } from '$lib/conta/regras';

export type RespostaQuestao = 'C' | 'E';

let respostas = $state<Record<string, RespostaQuestao>>({});
let armazenamento: Storage | null = null;

/** Lê o gravado, aceitando só `C`/`E` por chave `<slug>~<n>`. */
export function lerRespostas(texto: string | null): Record<string, RespostaQuestao> {
	const d: Record<string, RespostaQuestao> = {};
	try {
		const bruto: unknown = JSON.parse(texto ?? '{}');
		if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return d;
		for (const [k, v] of Object.entries(bruto))
			if ((v === 'C' || v === 'E') && /^[a-z0-9-]+~\d+$/.test(k)) d[k] = v;
	} catch {
		// Corrompido: sem respostas.
	}
	return d;
}

/** Lê o que está gravado (idempotente). */
export function carregarRespostas(arm: Storage | null): void {
	armazenamento = arm;
	try {
		respostas = lerRespostas(arm?.getItem(CHAVE_QUESTOES) ?? null);
	} catch {
		respostas = {};
	}
}

function gravar(novas: Record<string, RespostaQuestao>): void {
	respostas = novas;
	try {
		if (Object.keys(novas).length) armazenamento?.setItem(CHAVE_QUESTOES, JSON.stringify(novas));
		else armazenamento?.removeItem(CHAVE_QUESTOES);
	} catch {
		// Armazenamento cheio ou bloqueado: fica em memória nesta aba.
	}
}

export const respostasQuestoes = {
	/** A resposta dada à questão n da aula, quando existe. */
	da(slug: string, n: number): RespostaQuestao | undefined {
		return respostas[`${slug}~${n}`];
	},
	/** Registra (ou apaga, com `undefined`) a resposta; grava na conta. */
	registrar(slug: string, n: number, r: RespostaQuestao | undefined): void {
		const novas = { ...respostas };
		const chave = `${slug}~${n}`;
		if (r) novas[chave] = r;
		else delete novas[chave];
		gravar(novas);
	}
};

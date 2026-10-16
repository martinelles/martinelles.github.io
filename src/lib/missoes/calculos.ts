/**
 * Contas do plano das Missões, puras (o dia e as marcações vêm por parâmetro). As mesmas regras
 * da página das Missões: o dia de hoje, a chave da marcação e o que conta como dia cumprido.
 */
import type { Cargo, DiaMissao, Marcas, PlanoMissoes } from './tipos';

export type FaseMissoes = 'antes' | 'durante' | 'depois';

export const chaveBloco = (cargo: Cargo, data: string, indice: number): string => `${cargo}~${data}~${indice}`;

/** O dia de hoje no plano: antes do primeiro, durante (com o dia) ou depois do último. */
export function diaDeHoje(plano: PlanoMissoes, hoje: string): { fase: FaseMissoes; dia: DiaMissao | null } {
	const { plan } = plano;
	if (!plan.length || hoje < plan[0].data) return { fase: 'antes', dia: null };
	if (hoje > plan[plan.length - 1].data) return { fase: 'depois', dia: null };
	return { fase: 'durante', dia: plan.find((d) => d.data === hoje) ?? null };
}

export const blocoFeito = (marcas: Marcas, cargo: Cargo, dia: DiaMissao, i: number): boolean =>
	!!marcas[chaveBloco(cargo, dia.data, i)];

/** Dia cumprido: todos os blocos marcados (a regra da régua da página). */
export const diaCumprido = (marcas: Marcas, cargo: Cargo, dia: DiaMissao): boolean =>
	dia.blocos.every((_, i) => blocoFeito(marcas, cargo, dia, i));

export interface ResumoMissoes {
	dias: number;
	blocos: number;
	blocosFeitos: number;
	/** Minutos de todos os blocos e dos blocos marcados. */
	minutos: number;
	minutosFeitos: number;
}

export function resumo(plano: PlanoMissoes, marcas: Marcas, cargo: Cargo): ResumoMissoes {
	const r: ResumoMissoes = { dias: plano.plan.length, blocos: 0, blocosFeitos: 0, minutos: 0, minutosFeitos: 0 };
	for (const dia of plano.plan) {
		dia.blocos.forEach((b, i) => {
			r.blocos++;
			r.minutos += b.min;
			if (blocoFeito(marcas, cargo, dia, i)) {
				r.blocosFeitos++;
				r.minutosFeitos += b.min;
			}
		});
	}
	return r;
}

/** Blocos do dia: quantos há e quantos estão marcados. */
export function progressoDoDia(marcas: Marcas, cargo: Cargo, dia: DiaMissao): { feitos: number; total: number } {
	return { feitos: dia.blocos.filter((_, i) => blocoFeito(marcas, cargo, dia, i)).length, total: dia.blocos.length };
}

/**
 * Subitem de um bloco com mais de um, marcado à parte: `<cargo>~<data>~<bloco>~<cid>`, na mesma chave
 * `missoes-cgu-2026`. A página das Missões só lê a chave do bloco e mantém as outras como estão.
 */
export const chaveItem = (cargo: Cargo, data: string, indice: number, cid: string): string =>
	`${chaveBloco(cargo, data, indice)}~${cid}`;

/** Bloco marcado vale para todos os subitens dele. */
export const itemFeito = (marcas: Marcas, cargo: Cargo, dia: DiaMissao, i: number, cid: string): boolean =>
	blocoFeito(marcas, cargo, dia, i) || !!marcas[chaveItem(cargo, dia.data, i, cid)];

/** O que gravar (`true`) e apagar (`false`) para marcar ou desmarcar uma marcação. */
export type Mudancas = Record<string, boolean>;

/** Bloco: desmarcar apaga também os subitens dele, para que não voltem marcados um a um. */
export function mudancasDoBloco(marcas: Marcas, cargo: Cargo, dia: DiaMissao, i: number, feito: boolean): Mudancas {
	const m: Mudancas = { [chaveBloco(cargo, dia.data, i)]: feito };
	if (!feito) for (const it of dia.blocos[i].itens ?? []) {
		const k = chaveItem(cargo, dia.data, i, it.cid);
		if (marcas[k]) m[k] = false;
	}
	return m;
}

/**
 * Subitem: com o último marcado, o bloco se marca (é a chave que a página e as contas leem).
 * Desmarcar um subitem de bloco marcado desmarca o bloco e mantém os outros subitens marcados.
 */
export function mudancasDoItem(marcas: Marcas, cargo: Cargo, dia: DiaMissao, i: number, cid: string, feito: boolean): Mudancas {
	const itens = dia.blocos[i].itens ?? [];
	const bloco = chaveBloco(cargo, dia.data, i);
	const m: Mudancas = { [chaveItem(cargo, dia.data, i, cid)]: feito };
	if (feito) {
		if (itens.every((it) => it.cid === cid || itemFeito(marcas, cargo, dia, i, it.cid))) m[bloco] = true;
	} else if (marcas[bloco]) {
		m[bloco] = false;
		for (const it of itens) if (it.cid !== cid) m[chaveItem(cargo, dia.data, i, it.cid)] = true;
	}
	return m;
}

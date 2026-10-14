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
	diasCumpridos: number;
	blocos: number;
	blocosFeitos: number;
	/** Minutos de todos os blocos e dos blocos marcados. */
	minutos: number;
	minutosFeitos: number;
}

export function resumo(plano: PlanoMissoes, marcas: Marcas, cargo: Cargo): ResumoMissoes {
	const r: ResumoMissoes = { dias: plano.plan.length, diasCumpridos: 0, blocos: 0, blocosFeitos: 0, minutos: 0, minutosFeitos: 0 };
	for (const dia of plano.plan) {
		if (diaCumprido(marcas, cargo, dia)) r.diasCumpridos++;
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

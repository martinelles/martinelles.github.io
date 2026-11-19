/**
 * Decisão de quem recebe o lembrete de estudo (planos/2026-10-17-notificacoes-de-estudo.md, fase
 * 2): o texto do dia, do plano e das marcações da conta, avisando também as aulas adiadas que
 * ficaram pendentes, que é o que acumula dívida. Puro como `progresso.ts`: sem nada do Cloudflare.
 */
import { blocoCumprido, diaDeHoje, itemFeito, planoAjustado, progressoDoDia, soPonteiros } from '../src/lib/missoes/calculos';
import { aulasPorCod, type AulaDoCatalogo } from '../src/lib/missoes/catalogo';
import aulasBruto from '../src/lib/dados/mentoria.json' with { type: 'json' };
import type { Cargo, Extras, Marcas, PlanoMissoes } from '../src/lib/missoes/tipos';

export interface Lembrete {
	titulo: string;
	corpo: string;
	url: string;
}

/** O dia e a hora de Brasília de um instante: o cron do Cloudflare roda em UTC. */
export function agoraEmSaoPaulo(instante: Date): { data: string; hora: number } {
	const partes = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'America/Sao_Paulo',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: 'numeric',
		hour12: false
	}).formatToParts(instante);
	const de = (tipo: string): number => +partes.find((p) => p.type === tipo)!.value;
	const dois = (n: number) => String(n).padStart(2, '0');
	return { data: `${de('year')}-${dois(de('month'))}-${dois(de('day'))}`, hora: de('hour') % 24 };
}

/**
 * Especialidade → cargo do plano das Missões. Cópia da `ancora` de `ESPECIALIDADES` (que mora em
 * módulo com runas e não entra no Worker); o teste confere que batem. Sem plano: `undefined`.
 */
export const CARGO_DA_ESPECIALIDADE: Record<string, Cargo | undefined> = {
	'ciencia-de-dados': 'cd',
	auditoria: 'aud',
	infraestrutura: undefined
};

/** Especialidade das preferências; sem ela (ou corrompida), Ciência de Dados, como no app. */
export function lerEspecialidade(texto: string | null): string {
	try {
		const bruto: unknown = JSON.parse(texto ?? 'null');
		const id = (bruto as { especialidade?: unknown } | null)?.especialidade;
		return typeof id === 'string' ? id : 'ciencia-de-dados';
	} catch {
		return 'ciencia-de-dados';
	}
}

/** Marcações no formato que o app grava (o teste confere com o `lerMarcas` do app). */
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

/** Extras no formato que o app grava (o teste confere com o `lerExtras` do app). */
export function lerExtras(texto: string | null): Extras {
	const d: Extras = {};
	try {
		const bruto: unknown = JSON.parse(texto ?? '{}');
		if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return d;
		for (const [dia, lista] of Object.entries(bruto as Record<string, unknown>)) {
			if (!Array.isArray(lista)) continue;
			const boas = lista.filter(
				(t): t is Extras[string][number] =>
					!!t &&
					typeof t === 'object' &&
					((t as { tipo?: unknown }).tipo === 'novo' || (t as { tipo?: unknown }).tipo === 'rev') &&
					typeof (t as { cid?: unknown }).cid === 'string' &&
					!!(t as { cid?: unknown }).cid &&
					typeof (t as { cod?: unknown }).cod === 'string' &&
					typeof (t as { texto?: unknown }).texto === 'string'
			);
			if (boas.length) d[dia] = boas;
		}
	} catch {
		// Corrompido: sem extras.
	}
	return d;
}

const duracao = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}` : `${min} min`);

/**
 * O lembrete do dia: `null` fora da janela do plano, em dia sem missão ou com o dia cumprido (as
 * aulas adiadas contam como bloco do dia). O corpo traz o que falta e, quando há aula adiada
 * pendente, quantas são.
 */
export function lembreteDoDia(
	plano: PlanoMissoes,
	marcas: Marcas,
	extras: Extras,
	cargo: Cargo,
	hoje: string,
	catalogo: Map<string, AulaDoCatalogo> = aulasPorCod(aulasBruto.aulas ?? [], cargo)
): Lembrete | null {
	const dia = diaDeHoje(planoAjustado(plano, extras, cargo, marcas, hoje, catalogo), hoje).dia;
	if (!dia) return null;
	const p = progressoDoDia(marcas, cargo, dia);
	if (!p.total || p.feitos === p.total) return null;
	let minutos = 0;
	let atrasadas = 0;
	dia.blocos.forEach((b, i) => {
		if (soPonteiros(b) || blocoCumprido(marcas, cargo, dia, i, b)) return;
		minutos += b.min;
		if (b.atrasado) for (const it of b.itens ?? []) if (!itemFeito(marcas, cargo, dia, i, it.cid)) atrasadas++;
	});
	if (!minutos && !atrasadas) return null;
	const corpo =
		`Faltam ${p.total - p.feitos} de ${p.total} blocos` +
		(minutos ? ` (${duracao(minutos)})` : '') +
		(atrasadas ? ` · ${atrasadas} aula${atrasadas > 1 ? 's' : ''} atrasada${atrasadas > 1 ? 's' : ''}` : '');
	return { titulo: 'Missão de hoje', corpo, url: '/painel' };
}

/**
 * Contas do plano das Missões, puras (o dia e as marcações vêm por parâmetro). As mesmas regras
 * da página das Missões: o dia de hoje, a chave da marcação e o que conta como dia cumprido.
 */
import { formatarData } from '$lib/datas';
import type { Bloco, Cargo, DiaMissao, Extras, ItemBloco, Marcas, PlanoMissoes, TipoBloco } from './tipos';

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
	dia.blocos.every((b, i) => soMovidas(b) || blocoFeito(marcas, cargo, dia, i));

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
			if (soMovidas(b)) return;
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
	let feitos = 0;
	let total = 0;
	dia.blocos.forEach((b, i) => {
		if (soMovidas(b)) return;
		total++;
		if (blocoFeito(marcas, cargo, dia, i)) feitos++;
	});
	return { feitos, total };
}

/** Bloco que só tem ponteiros de revisão remarcada para outro dia: nada a fazer neste dia. */
export const soMovidas = (b: Bloco): boolean => !!b.itens?.length && b.itens.every((it) => it.movida !== undefined);

/** Discursiva do plano na lista de todas (blocos `disc`), na ordem dos dias. */
export interface DiscursivaDoPlano {
	dia: DiaMissao;
	/** Índice do bloco no dia, o mesmo da chave da marcação. */
	indice: number;
	bloco: Bloco;
}

export function discursivasDoPlano(plano: PlanoMissoes): DiscursivaDoPlano[] {
	const lista: DiscursivaDoPlano[] = [];
	for (const dia of plano.plan)
		dia.blocos.forEach((bloco, indice) => {
			if (bloco.tipo === 'disc') lista.push({ dia, indice, bloco });
		});
	return lista;
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

/** Onde a aula aparece no plano (item-aula pelo `cid`), na ordem dos dias. */
export interface OcorrenciaDaAula {
	dia: DiaMissao;
	/** Índice do bloco no dia, o mesmo da chave da marcação. */
	bloco: number;
	tipo: TipoBloco;
	item: ItemBloco;
}

export function ocorrenciasDaAula(plano: PlanoMissoes, cid: string): OcorrenciaDaAula[] {
	const lista: OcorrenciaDaAula[] = [];
	for (const dia of plano.plan)
		dia.blocos.forEach((bloco, i) => {
			for (const item of bloco.itens ?? [])
				if (item.cid === cid) lista.push({ dia, bloco: i, tipo: bloco.tipo, item });
		});
	return lista;
}

/**
 * Aula nova feita fora da missão do dia: conclui a aula onde o plano a traz como estudo novo.
 * As revisões não se marcam aqui: com a extra gravada, `planoAjustado` as leva para a data real.
 * Aula já concluída em outro dia não gera marcação.
 */
export function mudancasDaAulaNova(marcas: Marcas, cargo: Cargo, plano: PlanoMissoes, cid: string): Mudancas {
	const m: Mudancas = {};
	const simuladas = { ...marcas };
	for (const o of ocorrenciasDaAula(plano, cid)) {
		if (o.tipo !== 'novo' || itemFeito(simuladas, cargo, o.dia, o.bloco, cid)) continue;
		const um = mudancasDoItem(simuladas, cargo, o.dia, o.bloco, cid, true);
		Object.assign(m, um);
		for (const [k, feito] of Object.entries(um)) {
			if (feito) simuladas[k] = true;
			else delete simuladas[k];
		}
	}
	return m;
}

/** 'AAAA-MM-DD' + n dias, em data de calendário (meia-noite UTC, sem relógio nem fuso). */
function somarDias(iso: string, n: number): string {
	const [a, m, d] = iso.split('-').map(Number);
	const t = new Date(Date.UTC(a, m - 1, d) + n * 86_400_000);
	const dois = (x: number) => String(x).padStart(2, '0');
	return `${t.getUTCFullYear()}-${dois(t.getUTCMonth() + 1)}-${dois(t.getUTCDate())}`;
}

/** Intervalo do `lab` da revisão (`D+1`, `D+7`, `D+30`) em dias. */
const diasDoLab = (lab: string | undefined): number | undefined => (lab?.startsWith('D+') ? +lab.slice(2) : undefined);

/**
 * Plano com as revisões na data que a repetição espaçada pede: aula nova feita em outro dia, as
 * revisões dela (D+1, D+7, D+30) contam da data em que a aula foi feita de verdade (a última
 * registrada nas extras), não da data que o plano tinha. No dia previsto fica um ponteiro
 * (`movida`) e a revisão entra no bloco de revisão do dia novo (ou num bloco no fim do dia, quando
 * o dia não tem); intervalo que o plano nem trazia (o D+30 cortado por cair após o fim) volta a
 * existir quando a data real o traz de volta para dentro. Sem extras de aula nova, o plano volta
 * igual. Só a vista muda: os blocos mantêm os índices, as marcações do plano original continuam
 * valendo; o que cai além do fim do plano some (como o próprio plano faz com os D+30 do fim).
 */
export function planoAjustado(plano: PlanoMissoes, extras: Extras, cargo: Cargo): PlanoMissoes {
	/** Data real de cada aula nova registrada: a mais recente, se entrou mais de uma vez. */
	const real = new Map<string, string>();
	for (const [chave, tarefas] of Object.entries(extras)) {
		if (!chave.startsWith(`${cargo}~`)) continue;
		const dia = chave.slice(cargo.length + 1);
		for (const t of tarefas)
			if (t.tipo === 'novo' && (!real.has(t.cid) || dia > real.get(t.cid)!)) real.set(t.cid, dia);
	}
	if (!real.size) return plano;
	const fim = plano.plan[plano.plan.length - 1].data;
	/** Item do estudo novo da aula (código e texto para a revisão criada). */
	const aulaNova = new Map<string, ItemBloco>();
	for (const dia of plano.plan)
		for (const b of dia.blocos) {
			if (b.tipo !== 'novo') continue;
			for (const it of b.itens ?? []) if (real.has(it.cid) && !aulaNova.has(it.cid)) aulaNova.set(it.cid, it);
		}
	/** Itens que entram em cada dia, pela data real da aula. */
	const entram = new Map<string, ItemBloco[]>();
	/** Intervalos que o plano já traz para a aula; os outros são criados quando cabem no fim. */
	const previstos = new Map<string, Set<string>>();
	const plan = plano.plan.map((dia) => ({
		...dia,
		blocos: dia.blocos.map((b) => {
			if (b.tipo !== 'rev' || !b.itens) return b;
			let mudou = false;
			const itens = b.itens.map((it) => {
				const diaReal = real.get(it.cid);
				const n = diasDoLab(it.lab);
				if (!diaReal || n === undefined) return it;
				const labs = previstos.get(it.cid) ?? new Set();
				labs.add(it.lab!);
				previstos.set(it.cid, labs);
				const alvo = somarDias(diaReal, n);
				if (alvo === dia.data) return it;
				mudou = true;
				const fica = alvo <= fim;
				if (fica) {
					const lista = entram.get(alvo) ?? [];
					lista.push({ ...it, nota: `aula feita em ${formatarData(diaReal)}` });
					entram.set(alvo, lista);
				}
				return { ...it, movida: fica ? alvo : null };
			});
			return mudou ? { ...b, itens } : b;
		})
	}));
	for (const [cid, diaReal] of real) {
		const it = aulaNova.get(cid);
		if (!it) continue; // aula fora do plano: sem revisão para remarcar
		for (const n of [1, 7, 30]) {
			const lab = `D+${n}`;
			if (previstos.get(cid)?.has(lab)) continue;
			const alvo = somarDias(diaReal, n);
			if (alvo > fim) continue;
			const lista = entram.get(alvo) ?? [];
			lista.push({ cid, cod: it.cod, texto: it.texto, lab, nota: `aula feita em ${formatarData(diaReal)}` });
			entram.set(alvo, lista);
		}
	}
	return {
		...plano,
		plan: plan.map((dia) => {
			const novos = entram.get(dia.data);
			if (!novos?.length) return dia;
			const rev = dia.blocos.findIndex((b) => b.tipo === 'rev');
			if (rev < 0)
				return {
					...dia,
					blocos: [
						...dia.blocos,
						{ tipo: 'rev', titulo: 'Revisão remarcada', min: 15, itens: novos, det: 'Aula feita em outro dia; a revisão segue a data real.' }
					]
				};
			return { ...dia, blocos: dia.blocos.map((b, i) => (i === rev ? { ...b, itens: [...(b.itens ?? []), ...novos] } : b)) };
		})
	};
}

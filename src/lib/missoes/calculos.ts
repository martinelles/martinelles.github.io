/**
 * Contas do plano das Missões, puras (o dia e as marcações vêm por parâmetro). As mesmas regras
 * da página das Missões: o dia de hoje, a chave da marcação e o que conta como dia cumprido.
 */
// Caminho relativo (e não `$lib/datas`): o Worker importa este arquivo para decidir o lembrete.
import { formatarData } from '../datas';
import type { AulaDoCatalogo } from './catalogo';
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
	dia.blocos.every((b, i) => soPonteiros(b) || blocoCumprido(marcas, cargo, dia, i, b));

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
			if (soPonteiros(b)) return;
			r.blocos++;
			r.minutos += b.min;
			if (blocoCumprido(marcas, cargo, dia, i, b)) {
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
		if (soPonteiros(b)) return;
		total++;
		if (blocoCumprido(marcas, cargo, dia, i, b)) feitos++;
	});
	return { feitos, total };
}

/** Bloco que só tem ponteiros (revisão movida ou suspensa): nada a fazer neste dia. */
export const soPonteiros = (b: Bloco): boolean =>
	!!b.itens?.length && b.itens.every((it) => it.movida !== undefined || it.suspensa === true);

/** Item de estudo cumprido: marcado no dia, ou aula feita em outro dia (`feitaEm`). */
export const itemCumprido = (marcas: Marcas, cargo: Cargo, dia: DiaMissao, i: number, it: ItemBloco): boolean =>
	it.feitaEm !== undefined || itemFeito(marcas, cargo, dia, i, it.cid);

/** Bloco cumprido para as contas: marcado, ou com todos os subitens visíveis cumpridos (o
 *  estudo novo e também a revisão marcada item a item, como a movida vinda de um ponteiro). */
export const blocoCumprido = (marcas: Marcas, cargo: Cargo, dia: DiaMissao, i: number, b: Bloco): boolean =>
	blocoFeito(marcas, cargo, dia, i) ||
	(!!b.itens?.length &&
		b.itens.some((it) => it.movida === undefined && it.suspensa !== true) &&
		b.itens.every((it) => it.movida !== undefined || it.suspensa === true || itemCumprido(marcas, cargo, dia, i, it)));

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

/** Aulas do catálogo concluídas, para o cabeçalho. Recebe o plano BRUTO (o arquivo carregado):
 *  marcação de chegada atrasada é a de item em índice além dos blocos previstos do dia, e o plano
 *  ajustado acrescenta blocos — o índice deixaria de estar "além". No plano, concluída com as
 *  ocorrências marcadas; fora dele, só registrada ou marcada na chegada. */
export function aulasConcluidas(
	plano: PlanoMissoes,
	extras: Extras,
	cargo: Cargo,
	marcas: Marcas,
	catalogo?: Map<string, AulaDoCatalogo>
): { feitas: number; total: number } | null {
	if (!catalogo) return null;
	const ids = new Set([...catalogo.values()].map((a) => a.id));
	const feitas = new Set<string>();
	for (const [chave, tarefas] of Object.entries(extras)) {
		if (!chave.startsWith(`${cargo}~`)) continue;
		for (const t of tarefas) if (t.tipo === 'novo' && ids.has(t.cid)) feitas.add(t.cid);
	}
	const previstos = plano.plan.map((d) => d.blocos.length);
	for (const [chave, valor] of Object.entries(marcas)) {
		if (!valor) continue;
		const partes = chave.split('~');
		if (partes.length < 4 || partes[0] !== cargo) continue;
		const d = plano.plan.findIndex((x) => x.data === partes[1]);
		if (d < 0 || +partes[partes.length - 2] < previstos[d]) continue;
		const cid = partes.slice(3).join('~');
		if (ids.has(cid)) feitas.add(cid);
	}
	const abertas = new Set<string>();
	const noPlano = new Set<string>();
	plano.plan.forEach((dia) =>
		dia.blocos.forEach((b, i) => {
			if (b.tipo !== 'novo') return;
			for (const it of b.itens ?? []) {
				if (!ids.has(it.cid)) continue;
				noPlano.add(it.cid);
				if (!itemFeito(marcas, cargo, dia, i, it.cid)) abertas.add(it.cid);
			}
		})
	);
	for (const id of noPlano) if (!abertas.has(id)) feitas.add(id);
	return { feitas: feitas.size, total: ids.size };
}

/** Onde a revisão movida deste ponteiro está marcável: o dia de destino (`it.movida`) e o
 * índice do bloco de revisação que a recebeu. `null` quando o dia não existe no plano. */
export function alvoDaMovida(
	plano: PlanoMissoes,
	it: ItemBloco
): { dia: DiaMissao; bloco: number } | null {
	if (it.movida === undefined || it.movida === null) return null;
	const dia = plano.plan.find((d) => d.data === it.movida);
	if (!dia) return null;
	const bloco = dia.blocos.findIndex((b) => b.itens?.some((x) => x.cid === it.cid && x.nota));
	return bloco < 0 ? null : { dia, bloco };
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
 * Plano com as revisões na data que a repetição espaçada pede e as aulas que ficaram para trás:
 *
 * - Aula nova feita em outro dia: as revisões dela (D+1, D+7, D+30) contam da data em que a aula
 *   foi feita de verdade (a última registrada nas extras, ou o dia em que a aula deslizante foi
 *   marcada), não da data que o plano tinha. No dia previsto fica um ponteiro (`movida`) e a
 *   revisão entra no bloco de revisão do dia novo (ou num bloco no fim do dia, quando o dia não
 *   tem); intervalo que o plano nem trazia (o D+30 cortado por cair após o fim) volta a existir
 *   quando a data real o traz de volta para dentro.
 * - Aula nova de um dia que passou sem marcação: ela desliza para o dia seguinte, e segue
 *   deslizando enquanto o dia passa e ela não é feita, até parar no dia de hoje. O dia previsto
 *   fica um ponteiro e a aula entra num bloco "Aula adiada" no fim do dia de hoje. Marcada lá, a
 *   marcação vale a data do dia em que foi feita (e as revisões contam dela).
 * - Revisão de estudo que não foi concluído: suspensa (só o ponteiro, sem marcação) quando o
 *   último dia previsto do estudo já passou; estudo ainda por vir mantém a revisão no lugar.
 * - Conteúdo em aberto cuja aula nem está no plano (o gerador a tirou porque o tópico "já passou",
 *   sem saber da conclusão): a aula do catálogo chega como tarefa de recuperação no bloco de
 *   atrasadas de hoje, cobrindo os tópicos em aberto. Marcada, os tópicos ligados contam como
 *   concluídos e as revisões deles passam a contar da data real.
 *
 * Sem extras e sem aula atrasada, o plano volta igual. Só a vista muda: os blocos previstos
 * mantêm os índices, as marcações do plano original continuam valendo; o que cai além do fim do
 * plano some (como o próprio plano faz com os D+30 do fim).
 */
export function planoAjustado(
	plano: PlanoMissoes,
	extras: Extras,
	cargo: Cargo,
	marcas: Marcas,
	hoje: string,
	/** Aulas do catálogo da mentoria por código do guia; sem ele, nada se sintetiza. */
	catalogo?: Map<string, AulaDoCatalogo>
): PlanoMissoes {
	/** Data real de cada aula nova registrada: a mais recente, se entrou mais de uma vez. */
	const real = new Map<string, string>();
	for (const [chave, tarefas] of Object.entries(extras)) {
		if (!chave.startsWith(`${cargo}~`)) continue;
		const dia = chave.slice(cargo.length + 1);
		for (const t of tarefas)
			if (t.tipo === 'novo' && (!real.has(t.cid) || dia > real.get(t.cid)!)) real.set(t.cid, dia);
	}
	/** Blocos previstos por dia: marcação de item além deles é de aula que deslizou para o dia. */
	const previstos = plano.plan.map((d) => d.blocos.length);
	/** Estudo (tópico ou aula) com ocorrência de estudo novo sem marcação no lugar previsto. */
	const abertas = new Set<string>();
	/** Minutos em aberto de cada estudo, para o custo da aula de recuperação. */
	const minAberto = new Map<string, number>();
	/** Último dia previsto de cada estudo: suspender a revisão é para o que ficou para trás. */
	const fimDe = new Map<string, string>();
	/** Código do guia de cada estudo, para achar a aula do catálogo. */
	const codDe = new Map<string, string>();
	/** Aulas do plano e o tópico que cada uma cobre. */
	const aulasNoPlano = new Set<string>();
	const aulaDoTopico = new Map<string, string>();
	const topicosDaAula = new Map<string, { cid: string; cod: string }[]>();
	plano.plan.forEach((dia) =>
		dia.blocos.forEach((b, i) => {
			for (const it of b.itens ?? []) {
				if (b.tipo !== 'novo') continue;
				codDe.set(it.cid, it.cod);
				if (!fimDe.has(it.cid) || dia.data > fimDe.get(it.cid)!) fimDe.set(it.cid, dia.data);
				if (!itemFeito(marcas, cargo, dia, i, it.cid)) {
					abertas.add(it.cid);
					minAberto.set(it.cid, (minAberto.get(it.cid) ?? 0) + (it.min ?? 0));
				}
				if (it.subitens?.length) {
					aulasNoPlano.add(it.cid);
					topicosDaAula.set(it.cid, it.subitens);
					for (const s of it.subitens) aulaDoTopico.set(s.cid, it.cid);
				}
			}
		})
	);
	/** Concluída: registrada (extras) ou marcada no dia em que chegou atrasada. */
	const concluidas = new Set(real.keys());
	for (const [chave, valor] of Object.entries(marcas)) {
		if (!valor) continue;
		const partes = chave.split('~');
		if (partes.length < 4 || partes[0] !== cargo) continue;
		const d = plano.plan.findIndex((x) => x.data === partes[1]);
		if (d < 0 || +partes[partes.length - 2] < previstos[d]) continue;
		// Chegou atrasada e foi marcada neste dia: a data real da aula é esta.
		const cid = partes.slice(3).join('~');
		if (!real.has(cid) || partes[1] > real.get(cid)!) real.set(cid, partes[1]);
		concluidas.add(cid);
	}
	/** Concluída: registrada (extras) ou marcada na chegada; aula do plano, com as partes fechadas. */
	const aulaConcluida = (cid: string): boolean => concluidas.has(cid) || (aulasNoPlano.has(cid) && !abertas.has(cid));
	/** Tópicos em aberto cuja aula do catálogo nem está no plano: viram tarefa de recuperação. */
	const sintetizadas: ItemBloco[] = [];
	if (catalogo) {
		const grupos = new Map<string, { cid: string; cod: string; min: number }[]>();
		for (const cid of abertas) {
			if ((fimDe.get(cid) ?? '') >= hoje || aulaDoTopico.has(cid)) continue;
			const aula = catalogo.get(codDe.get(cid) ?? '');
			if (!aula || aulasNoPlano.has(aula.id)) continue;
			const g = grupos.get(aula.id) ?? [];
			g.push({ cid, cod: codDe.get(cid)!, min: minAberto.get(cid) ?? 0 });
			grupos.set(aula.id, g);
		}
		for (const [id, topicos] of grupos) {
			const aula = catalogo.get(topicos[0].cod)!;
			topicosDaAula.set(id, topicos);
			for (const t of topicos) aulaDoTopico.set(t.cid, id);
			// Concluída (registrada ou marcada na chegada): só o mapeamento importa, para valer
			// aos tópicos; sem tarefa nova.
			if (aulaConcluida(id)) continue;
			sintetizadas.push({
				cid: id,
				cod: aula.cod,
				texto: aula.titulo,
				min: topicos.reduce((s, t) => s + t.min, 0),
				subitens: topicos.map(({ cid, cod }) => ({ cid, cod })),
				nota: 'conteúdo que passou em aberto'
			});
		}
	}
	// A data real da aula vale para os tópicos que ela cobre (revisões e conclusão contam dela).
	for (const [aula, topicos] of topicosDaAula) {
		const data = real.get(aula);
		if (data) for (const t of topicos) if (!real.has(t.cid)) real.set(t.cid, data);
	}
	const feita = (cid: string): boolean =>
		concluidas.has(cid) || !abertas.has(cid) || (aulaDoTopico.has(cid) && aulaConcluida(aulaDoTopico.get(cid)!));
	const fim = plano.plan[plano.plan.length - 1].data;
	const atrasou = plano.plan.some(
		(d) => d.data < hoje && d.blocos.some((b) => b.tipo === 'novo' && b.itens?.some((it) => it.subitens && !feita(it.cid)))
	);
	/** Revisão suspensa: o estudo dela não foi concluído e o último dia previsto já passou. */
	const suspendeu = plano.plan.some((d) =>
		d.blocos.some((b) =>
			b.tipo === 'rev' &&
			b.itens?.some(
				(it) => diasDoLab(it.lab) !== undefined && !feita(it.cid) && (fimDe.get(it.cid) ?? '') < hoje
			)
		)
	);
	if (!real.size && !atrasou && !suspendeu && !sintetizadas.length) return plano;
	const chegou = hoje >= plano.plan[0].data && hoje <= fim;
	/** Item do estudo novo da aula (código e texto para a revisão criada). */
	const aulaNova = new Map<string, ItemBloco>();
	for (const dia of plano.plan)
		for (const b of dia.blocos) {
			if (b.tipo !== 'novo') continue;
			for (const it of b.itens ?? []) if (!aulaNova.has(it.cid)) aulaNova.set(it.cid, it);
		}
	for (const s of sintetizadas) aulaNova.set(s.cid, s);
	/** Itens de revisão que entram em cada dia, pela data real da aula. */
	const entram = new Map<string, ItemBloco[]>();
	/** Atrasadas que chegam no dia de hoje, na ordem dos dias previstos. */
	const atrasadas: ItemBloco[] = [];
	const encabeça = new Set<string>();
	/** Intervalos que o plano já traz para a aula; os outros são criados quando cabem no fim. */
	const labs = new Map<string, Set<string>>();
	const plan = plano.plan.map((dia) => ({
		...dia,
		blocos: dia.blocos.map((b, i) => {
			if (b.tipo === 'rev' && b.itens) {
				let mudou = false;
				const itens = b.itens.map((it) => {
					const n = diasDoLab(it.lab);
					if (n === undefined) return it;
					// Estudo que passou sem ser concluído: a revisão dele fica suspensa, sem marcação.
					if (!feita(it.cid) && (fimDe.get(it.cid) ?? '') < hoje) {
						mudou = true;
						return { ...it, suspensa: true };
					}
					const diaReal = real.get(it.cid);
					if (!diaReal) return it;
					const doPlano = labs.get(it.cid) ?? new Set();
					doPlano.add(it.lab!);
					labs.set(it.cid, doPlano);
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
			}
			if (b.tipo === 'novo' && b.itens && dia.data < hoje) {
				let mudou = false;
				const itens = b.itens.map((it) => {
					if (itemFeito(marcas, cargo, dia, i, it.cid)) return it;
					// Feita em outro dia (registrada ou marcada na chegada) — ou o tópico, pela aula
					// que o cobre já concluída no dia previsto dela: vale como feita aqui.
					let diaReal = real.get(it.cid);
					const aula = aulaDoTopico.get(it.cid);
					if (!diaReal && aula && aulaConcluida(aula)) diaReal = fimDe.get(aula) ?? dia.data;
					if (diaReal) {
						mudou = true;
						return { ...it, feitaEm: diaReal };
					}
					if (!it.subitens) return it;
					mudou = true;
					// A primeira parte em aberto é a que chega; as outras só apontam.
					if (!encabeça.has(it.cid)) {
						encabeça.add(it.cid);
						atrasadas.push(it);
					}
					return { ...it, movida: chegou ? hoje : null };
				});
				return mudou ? { ...b, itens } : b;
			}
			return b;
		})
	}));
	for (const [cid, diaReal] of real) {
		const it = aulaNova.get(cid);
		if (!it) continue; // aula fora do plano: sem revisão para remarcar
		for (const n of [1, 7, 30]) {
			const lab = `D+${n}`;
			if (labs.get(cid)?.has(lab)) continue;
			const alvo = somarDias(diaReal, n);
			if (alvo > fim) continue;
			const lista = entram.get(alvo) ?? [];
			lista.push({ cid, cod: it.cod, texto: it.texto, lab, nota: `aula feita em ${formatarData(diaReal)}` });
			entram.set(alvo, lista);
		}
	}
	/** Atrasada concluída hoje (marcada na chegada ou registrada): fica no bloco de hoje,
	 *  riscada com a data, em vez de sumir da lista no mesmo toque. */
	const concluidasHoje: ItemBloco[] = [];
	for (const [cid, data] of real) {
		if (data !== hoje) continue;
		const item = aulaNova.get(cid);
		// Só a que estava atrasada hoje: a de fim previsto depois de hoje já tem o lugar dela.
		if (!item || (fimDe.get(cid) ?? '') >= hoje) continue;
		concluidasHoje.push({ ...item, feitaEm: data });
	}
	return {
		...plano,
		plan: plan.map((dia) => {
			const novos = entram.get(dia.data);
			let blocos = dia.blocos;
			if (novos?.length) {
				const rev = blocos.findIndex((b) => b.tipo === 'rev');
				blocos =
					rev < 0
						? [
								...blocos,
								{ tipo: 'rev', titulo: 'Revisão remarcada', min: 15, itens: novos, det: 'Aula feita em outro dia; a revisão segue a data real.' }
							]
						: blocos.map((b, i) => (i === rev ? { ...b, itens: [...(b.itens ?? []), ...novos] } : b));
			}
			const atraso = [...atrasadas, ...concluidasHoje, ...sintetizadas];
			if (atraso.length && dia.data === hoje)
				blocos = [
					...blocos,
					{
						tipo: 'novo',
						titulo: 'Aulas atrasadas',
						min: atraso.reduce((s, it) => s + (it.min ?? 0), 0),
						itens: atraso,
						det: 'Aula que passou do dia, ou conteúdo em aberto cuja aula o plano não trouxe; fica até ser feita.',
						atrasado: true
					}
				];
			return blocos === dia.blocos ? dia : { ...dia, blocos };
		})
	};
}

/** Marcar o bloco de aulas adiadas: cada aula na chave dela (e o bloco com a última). */
export function mudancasDoBlocoAtrasado(marcas: Marcas, cargo: Cargo, dia: DiaMissao, i: number, feito: boolean): Mudancas {
	if (!feito) return mudancasDoBloco(marcas, cargo, dia, i, false);
	const m: Mudancas = {};
	const simuladas = { ...marcas };
	for (const it of dia.blocos[i].itens ?? []) {
		const um = mudancasDoItem(simuladas, cargo, dia, i, it.cid, true);
		Object.assign(m, um);
		for (const [k, f] of Object.entries(um)) {
			if (f) simuladas[k] = true;
			else delete simuladas[k];
		}
	}
	return m;
}

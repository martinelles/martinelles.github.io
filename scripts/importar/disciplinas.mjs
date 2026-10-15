/**
 * Divisão do feed pelas disciplinas do Edital CGU 1/2026 (itens 15.2.2 a 15.2.4), a mesma dos
 * guias de conteúdo programático e das Missões: B1–B4 (P1), C1–C5 (P2) e a P3 de cada cargo,
 * E1–E4 de Ciência de Dados, E1–E5 de Auditoria e E1–E4 de Infraestrutura de TI. Decisão em
 * planos/2026-10-15-feed-por-edital.md.
 *
 * `materias.mjs` continua validando os nomes de matéria que chegam do vault; a matéria que vai
 * ao feed é a disciplina dada por `disciplinaDoPost`.
 */

import { GUIAS } from './guias.mjs';

/** @typedef {{ id: string, cod: string, nome: string, abrev: string }} DefDisciplina */

/** Na ordem do edital. `id` com prefixo `cd-`/`aud-`/`infra-` só na P3, que é de um cargo só. @type {DefDisciplina[]} */
export const DISCIPLINAS = [
	{ id: 'b1', cod: 'B1', nome: 'Estado, Democracia, Direitos e Ciência Política', abrev: 'Estado' },
	{ id: 'b2', cod: 'B2', nome: 'Sociedade Brasileira, Desigualdades, Diversidade e Desenvolvimento', abrev: 'Sociedade' },
	{ id: 'b3', cod: 'B3', nome: 'Ética Pública e Responsabilidade Profissional', abrev: 'Ética' },
	{ id: 'b4', cod: 'B4', nome: 'Administração Pública e Fundamentos de Políticas Públicas', abrev: 'Adm. Púb.' },
	{ id: 'c1', cod: 'C1', nome: 'Governança, Riscos e Integridade Pública e Privada', abrev: 'Governança' },
	{ id: 'c2', cod: 'C2', nome: 'Transparência, Ouvidoria e Participação Social', abrev: 'Transpar.' },
	{ id: 'c3', cod: 'C3', nome: 'Direito Público Aplicado, Controle e Responsabilização', abrev: 'Dir. Públ.' },
	{ id: 'c4', cod: 'C4', nome: 'Evidências, Dados e Inteligência Artificial', abrev: 'Evidências' },
	{ id: 'c5', cod: 'C5', nome: 'Auditoria Governamental e Atuação Integrada da CGU', abrev: 'Auditoria' },
	{ id: 'cd-e1', cod: 'E1', nome: 'Estatística, Programação e Análise de Dados', abrev: 'Estatíst.' },
	{ id: 'cd-e2', cod: 'E2', nome: 'Engenharia, Arquitetura e Governança de Dados', abrev: 'Eng. Dados' },
	{ id: 'cd-e3', cod: 'E3', nome: 'Aprendizado de Máquina e Inteligência Artificial', abrev: 'ML e IA' },
	{ id: 'cd-e4', cod: 'E4', nome: 'Operação, Governança e Gestão de Soluções de Dados e IA', abrev: 'Gestão IA' },
	{ id: 'aud-e1', cod: 'E1', nome: 'Auditoria Governamental: Avaliação, Consultoria e Apuração', abrev: 'Aud. Gov.' },
	{ id: 'aud-e2', cod: 'E2', nome: 'Finanças Públicas, Orçamento e Contabilidade Pública', abrev: 'Finanças' },
	{ id: 'aud-e3', cod: 'E3', nome: 'Políticas Públicas e Métodos de Investigação e Avaliação', abrev: 'Políticas' },
	{ id: 'aud-e4', cod: 'E4', nome: 'Auditoria de Contratações, Transferências e Execução de Recursos', abrev: 'Contrat.' },
	{ id: 'aud-e5', cod: 'E5', nome: 'Integridade, Transparência e Responsabilização Aplicadas ao Controle Público', abrev: 'Integrid.' },
	// Cargo 3: posts vêm do guia da P3 (guias.mjs; planos/2026-10-15-guia-infraestrutura-no-feed.md).
	{ id: 'infra-e1', cod: 'E1', nome: 'Redes, Sistemas e Plataformas de Dados', abrev: 'Redes' },
	{ id: 'infra-e2', cod: 'E2', nome: 'Computação em Nuvem, Virtualização e Automação', abrev: 'Nuvem' },
	{ id: 'infra-e3', cod: 'E3', nome: 'Cibersegurança, Privacidade e Continuidade de Serviços', abrev: 'Ciberseg.' },
	{ id: 'infra-e4', cod: 'E4', nome: 'Operação, Governança e Gestão de Serviços Digitais', abrev: 'Operação' }
];

const POR_ID = new Map(DISCIPLINAS.map((d) => [d.id, d]));

/** @param {string} id */
export const disciplinaPorId = (id) => POR_ID.get(id);

/**
 * Prefixo do id de tópico do `ESTUDO.csv` (`topico_estudo` da questão) → disciplina. O `ESTUDO.csv`
 * só tem a P3 de Ciência de Dados; a de Auditoria usa os ids dos subitens das Missões
 * (`AUD-E2-3.1` → `aud-e2`), tratados em `disciplinaDoPost`.
 * @type {Record<string, string>}
 */
export const TOPICO_PARA_DISCIPLINA = {
	EDC: 'b1',
	SBD: 'b2',
	EPR: 'b3',
	ADP: 'b4',
	GRI: 'c1',
	TOP: 'c2',
	DPC: 'c3',
	EDI: 'c4',
	AGI: 'c5',
	EPA: 'cd-e1',
	EAG: 'cd-e2',
	AMI: 'cd-e3',
	OGS: 'cd-e4'
};

/**
 * Norma de `leis-secas/` (sem `.md`) → disciplina em que o edital a cobra; a que serve a mais de
 * uma vai à disciplina comum aos dois cargos (P1/P2), para não sumir do feed de um deles.
 * @type {Record<string, string>}
 */
export const LEI_PARA_DISCIPLINA = {
	'01-Constituicao-Federal-1988': 'c3',
	'02-Lei-8112-1990-Regime-Juridico': 'c3',
	'03-Lei-9784-1999-Processo-Administrativo': 'c3',
	'04-Lei-8429-1992-Improbidade': 'c3',
	'05-Lei-14133-2021-Licitacoes': 'c3',
	'06-Lei-12527-2011-LAI': 'c2',
	'07-Lei-13709-2018-LGPD': 'c2',
	'08-Decreto-1171-1994-Codigo-de-Etica': 'b3',
	'09-Lei-12813-2013-Conflito-de-Interesses': 'b3',
	'10-Decreto-Lei-4657-1942-LINDB': 'c3',
	'11-LC-101-2000-LRF': 'b4',
	'12-Lei-10180-2001-Sistemas-Federais': 'c5',
	'13-Decreto-3591-2000-Controle-Interno': 'c5',
	'14-Lei-13844-2019-Estrutura-Ministerios': 'b4',
	'15-Decreto-9681-2019-Estrutura-CGU': 'c5',
	'16-Decreto-9203-2017-Governanca-Publica': 'c1',
	'17-Decreto-11330-2023-Estrutura-CGU-vigente': 'c5',
	'18-Lei-14600-2023-Estrutura-Ministerios-vigente': 'b4',
	'19-MOT-CGU-2017-Auditoria-Interna': 'c5',
	'20-IN-SFC-CGU-3-2017-Referencial-Auditoria': 'c5',
	'21-IN-SGD-ME-1-2019-Contratacoes-TIC': 'cd-e4',
	'22-IN-SEGES-ME-40-2020-ETP': 'cd-e4',
	'23-IN-GSI-PR-1-2020-Seguranca-da-Informacao': 'cd-e4',
	'24-IN-SGD-ME-94-2022-Contratacoes-TIC-vigente': 'cd-e4'
};

/** Baralho de `flashcards/` → disciplina. @type {Record<string, string>} */
export const BARALHO_PARA_DISCIPLINA = {
	'LGPD Flashcards.csv': 'c2',
	'Auditoria Governamental Flashcards.csv': 'c5'
};

/**
 * Arquivo de `feed-conteudo/` (sem `.md`) → disciplina; vale a primeira regra que casar.
 * @type {[RegExp, string][]}
 */
export const FEED_PARA_DISCIPLINA = [
	[/^(lai|lgpd)--/, 'c2'],
	[/^auditoria--/, 'c5'],
	[/^ti-governanca--decreto-9203/, 'c1'],
	[/^ti-governanca--/, 'cd-e4'],
	[/^ti-seguranca-da-informacao--/, 'cd-e4'],
	[/^ti-ciencia-de-dados--(estatistica|python)/, 'cd-e1'],
	[/^ti-ciencia-de-dados--(big-data|data-lake|governanca|pipelines)/, 'cd-e2'],
	[/^ti-ciencia-de-dados--/, 'cd-e3']
];

/**
 * Disciplina do edital de um post importado, ou `undefined` se nenhuma regra o alcança.
 * @param {{ tipo: string, topicoEstudo?: string, subtopico?: string, fonte?: { arquivo?: string } }} post
 * @returns {string | undefined}
 */
export function disciplinaDoPost(post) {
	const prefixoGuia = GUIAS[/** @type {keyof typeof GUIAS} */ (post.fonte?.arquivo ?? '')];
	if (prefixoGuia) {
		// Post do guia da P3 (guias.mjs): o código do subitem abre o subtópico ("E3 6.4 · …").
		const e = /^E([1-9]) /.exec(post.subtopico ?? '');
		return e ? disciplinaPorId(`${prefixoGuia}-e${e[1]}`)?.id : undefined;
	}
	if (post.tipo === 'questao') {
		const [prefixo, especifica] = (post.topicoEstudo ?? '').split('-');
		if (prefixo === 'AUD') return disciplinaPorId(`aud-${especifica?.toLowerCase()}`)?.id;
		return TOPICO_PARA_DISCIPLINA[prefixo];
	}
	const arquivo = post.fonte?.arquivo ?? '';
	const [pasta, ...resto] = arquivo.split('/');
	const nome = resto.join('/');
	if (pasta === 'leis-secas') return LEI_PARA_DISCIPLINA[nome.replace(/\.md$/i, '')];
	if (pasta === 'flashcards') return BARALHO_PARA_DISCIPLINA[nome];
	if (pasta === 'feed-conteudo') {
		const base = nome.replace(/^(resumos|flashcards)\//, '').replace(/\.md$/i, '');
		return FEED_PARA_DISCIPLINA.find(([re]) => re.test(base))?.[1];
	}
	return undefined;
}

/** Arquivo do vault com o segundo tópico das questões (P3 de Auditoria). */
export const ARQUIVO_SEGUNDO_TOPICO = 'catalogo-questoes/topicos-p3-auditoria.csv';

const SUBITEM_AUD = /^AUD-E([1-5])-\d+\.\d+$/;

/**
 * Segundo tópico de questões que já têm tópico de P1/P2 e também cobrem um subitem da P3 de
 * Auditoria (planos/2026-10-15-feed-por-edital.md). Linhas de `topicos-p3-auditoria.csv`
 * (`id`, `topico`, …) → id da questão no catálogo → `{ m2: 'aud-e1', tp2: 'AUD-E1-2.1' }`.
 * @param {Record<string, string>[]} linhas
 * @returns {{ mapa: Map<string, { m2: string, tp2: string }>, avisos: string[] }}
 */
export function lerSegundosTopicos(linhas) {
	const mapa = new Map();
	/** @type {string[]} */
	const avisos = [];
	for (const l of linhas) {
		const id = (l.id ?? '').trim();
		const tp2 = (l.topico ?? '').trim();
		const m = SUBITEM_AUD.exec(tp2);
		if (!id || !m) {
			avisos.push(`${ARQUIVO_SEGUNDO_TOPICO}: linha ignorada (id "${id}", topico "${tp2}")`);
			continue;
		}
		mapa.set(id, { m2: `aud-e${m[1]}`, tp2 });
	}
	return { mapa, avisos };
}

/**
 * Lista de `materias.json`: as disciplinas na ordem do edital, sem as que ficaram sem post.
 * O nome leva o código ("C3 · Direito Público…"), para casar com o edital, os guias e as Missões.
 * @param {Record<string, number>} totais posts por id de disciplina
 * @returns {{ id: string, nome: string, abrev: string, ordem: number, total: number }[]}
 */
export function ordenarDisciplinas(totais) {
	return DISCIPLINAS.filter((d) => (totais[d.id] ?? 0) > 0).map((d, i) => ({
		id: d.id,
		nome: `${d.cod} · ${d.nome}`,
		abrev: d.abrev,
		ordem: i + 1,
		total: totais[d.id]
	}));
}

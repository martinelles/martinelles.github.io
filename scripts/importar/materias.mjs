/**
 * Tabela de matérias, fixada a partir dos nomes distintos da coluna `materia` de
 * `catalogo-questoes/questoes.csv` (conferido em 2026-09-30: 21 nomes), e mapa
 * arquivo de lei seca → matéria (conferido contra os 24 arquivos de `leis-secas/`).
 *
 * `grupo` define a ordem: 0 = TI: Ciência de Dados, 1 = demais TI, 2 = as outras.
 * Dentro do grupo, a ordem final sai do total de posts (calculado na importação).
 */

/** @typedef {{ id: string, nome: string, abrev: string, grupo: number }} DefMateria */

/** @type {DefMateria[]} */
export const MATERIAS = [
	{ id: 'ti-ciencia-de-dados', nome: 'TI: Ciência de Dados', abrev: 'Dados', grupo: 0 },
	{ id: 'ti-seguranca-da-informacao', nome: 'TI: Segurança da Informação', abrev: 'Seg. Info', grupo: 1 },
	{ id: 'ti-governanca-gestao-e-contratacoes-de-ti', nome: 'TI: Governança, Gestão e Contratações de TI', abrev: 'Gov. TI', grupo: 1 },
	{ id: 'ti-desenvolvimento-e-engenharia-de-software', nome: 'TI: Desenvolvimento e Engenharia de Software', abrev: 'Desenv.', grupo: 1 },
	{ id: 'ti-infraestrutura-redes-e-sistemas-operacionais', nome: 'TI: Infraestrutura, Redes e Sistemas Operacionais', abrev: 'Infra', grupo: 1 },
	{ id: 'lingua-portuguesa', nome: 'Língua Portuguesa', abrev: 'Português', grupo: 2 },
	{ id: 'lingua-inglesa', nome: 'Língua Inglesa', abrev: 'Inglês', grupo: 2 },
	{ id: 'raciocinio-critico-e-argumentacao', nome: 'Raciocínio Crítico e Argumentação', abrev: 'Argument.', grupo: 2 },
	{ id: 'raciocinio-logico-e-matematica', nome: 'Raciocínio Lógico e Matemática', abrev: 'RLM', grupo: 2 },
	{ id: 'direito-constitucional', nome: 'Direito Constitucional', abrev: 'Const.', grupo: 2 },
	{ id: 'direito-administrativo', nome: 'Direito Administrativo', abrev: 'Adm.', grupo: 2 },
	{ id: 'outros-ramos-do-direito', nome: 'Outros Ramos do Direito', abrev: 'Out. Dir.', grupo: 2 },
	{ id: 'adm-publica-politicas-publicas-e-adm-geral', nome: 'Adm. Pública, Políticas Públicas e Adm. Geral', abrev: 'Adm. Púb.', grupo: 2 },
	{ id: 'fundamentos-de-auditoria-governamental', nome: 'Fundamentos de Auditoria Governamental', abrev: 'Auditoria', grupo: 2 },
	{ id: 'adm-financeira-e-orcamentaria', nome: 'Adm. Financeira e Orçamentária', abrev: 'AFO', grupo: 2 },
	{ id: 'cgu-correicao-integridade-e-leniencia', nome: 'CGU: Correição, Integridade e Leniência', abrev: 'Correição', grupo: 2 },
	{ id: 'contabilidade', nome: 'Contabilidade', abrev: 'Contab.', grupo: 2 },
	{ id: 'economia-e-financas-publicas', nome: 'Economia e Finanças Públicas', abrev: 'Economia', grupo: 2 },
	{ id: 'estatistica', nome: 'Estatística', abrev: 'Estatíst.', grupo: 2 },
	{ id: 'ouvidoria-e-comunicacao-social', nome: 'Ouvidoria e Comunicação Social', abrev: 'Ouvidoria', grupo: 2 },
	{ id: 'outras', nome: 'Outras', abrev: 'Outras', grupo: 2 }
];

const POR_NOME = new Map(MATERIAS.map((m) => [m.nome, m]));
const POR_ID = new Map(MATERIAS.map((m) => [m.id, m]));

/**
 * @param {string} nome nome exatamente como no catálogo
 * @returns {DefMateria}
 */
export function materiaPorNome(nome) {
	const m = POR_NOME.get(nome.trim());
	if (!m) {
		throw new Error(
			`Matéria desconhecida: "${nome}". Acrescente-a em scripts/importar/materias.mjs (MATERIAS).`
		);
	}
	return m;
}

/** @param {string} id */
export function materiaPorId(id) {
	return POR_ID.get(id);
}

/**
 * Arquivo de `leis-secas/` (sem `.md`) → id de matéria. `00-INDICE` é ignorado.
 * @type {Record<string, string>}
 */
export const LEI_PARA_MATERIA = {
	'01-Constituicao-Federal-1988': 'direito-constitucional',
	'02-Lei-8112-1990-Regime-Juridico': 'direito-administrativo',
	'03-Lei-9784-1999-Processo-Administrativo': 'direito-administrativo',
	'04-Lei-8429-1992-Improbidade': 'direito-administrativo',
	'05-Lei-14133-2021-Licitacoes': 'direito-administrativo',
	'06-Lei-12527-2011-LAI': 'outros-ramos-do-direito',
	'07-Lei-13709-2018-LGPD': 'outros-ramos-do-direito',
	'08-Decreto-1171-1994-Codigo-de-Etica': 'outros-ramos-do-direito',
	'09-Lei-12813-2013-Conflito-de-Interesses': 'outros-ramos-do-direito',
	'10-Decreto-Lei-4657-1942-LINDB': 'outros-ramos-do-direito',
	'11-LC-101-2000-LRF': 'adm-financeira-e-orcamentaria',
	'12-Lei-10180-2001-Sistemas-Federais': 'fundamentos-de-auditoria-governamental',
	'13-Decreto-3591-2000-Controle-Interno': 'fundamentos-de-auditoria-governamental',
	'14-Lei-13844-2019-Estrutura-Ministerios': 'fundamentos-de-auditoria-governamental',
	'15-Decreto-9681-2019-Estrutura-CGU': 'fundamentos-de-auditoria-governamental',
	'16-Decreto-9203-2017-Governanca-Publica': 'adm-publica-politicas-publicas-e-adm-geral',
	'17-Decreto-11330-2023-Estrutura-CGU-vigente': 'fundamentos-de-auditoria-governamental',
	'18-Lei-14600-2023-Estrutura-Ministerios-vigente': 'fundamentos-de-auditoria-governamental',
	'19-MOT-CGU-2017-Auditoria-Interna': 'fundamentos-de-auditoria-governamental',
	'20-IN-SFC-CGU-3-2017-Referencial-Auditoria': 'fundamentos-de-auditoria-governamental',
	'21-IN-SGD-ME-1-2019-Contratacoes-TIC': 'ti-governanca-gestao-e-contratacoes-de-ti',
	'22-IN-SEGES-ME-40-2020-ETP': 'ti-governanca-gestao-e-contratacoes-de-ti',
	'23-IN-GSI-PR-1-2020-Seguranca-da-Informacao': 'ti-seguranca-da-informacao',
	'24-IN-SGD-ME-94-2022-Contratacoes-TIC-vigente': 'ti-governanca-gestao-e-contratacoes-de-ti'
};

/** Arquivos de `leis-secas/` que não são norma. */
export const LEIS_IGNORADAS = new Set(['00-INDICE']);

/**
 * Baralho de `flashcards/` (nome do arquivo) → matéria.
 * @type {Record<string, string>}
 */
export const BARALHO_PARA_MATERIA = {
	'LGPD Flashcards.csv': 'outros-ramos-do-direito',
	'Auditoria Governamental Flashcards.csv': 'fundamentos-de-auditoria-governamental'
};

/**
 * Ordena as matérias: grupo (Ciência de Dados, demais TI, outras), depois total de posts
 * (maior primeiro), depois nome. Devolve a lista de `materias.json`.
 * @param {Record<string, number>} totais posts por id de matéria
 * @returns {{ id: string, nome: string, abrev: string, ordem: number, total: number }[]}
 */
export function ordenarMaterias(totais) {
	return [...MATERIAS]
		.map((m) => ({ ...m, total: totais[m.id] ?? 0 }))
		.sort(
			(a, b) =>
				a.grupo - b.grupo || b.total - a.total || (a.nome < b.nome ? -1 : a.nome > b.nome ? 1 : 0)
		)
		.map((m, i) => ({ id: m.id, nome: m.nome, abrev: m.abrev, ordem: i + 1, total: m.total }));
}

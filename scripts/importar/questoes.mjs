/**
 * Linhas de `catalogo-questoes/questoes.csv` → posts de questão.
 * Gabarito copiado sem transformação (NFR-008).
 */
import { materiaPorNome } from './materias.mjs';

/**
 * Rótulo do cargo por id de prova, sem o prefixo órgão+ano (conferido contra
 * `catalogo-questoes/provas.csv` em 2026-09-30).
 * @type {Record<string, { cargo: string, banca: string }>}
 */
export const PROVAS = {
	'TCU2026-AUFC-TI': { cargo: 'AUFC TI', banca: 'Cebraspe' },
	'TCU2022-AUFC-CE': { cargo: 'AUFC Controle Externo', banca: 'FGV' },
	'TCU2015-BAS': { cargo: 'AUFC Conhec. Gerais', banca: 'Cebraspe' },
	'TCU2015-TI': { cargo: 'AUFC TI', banca: 'Cebraspe' },
	'TCU2015-AUD': { cargo: 'AUFC Auditoria Gov.', banca: 'Cebraspe' },
	'CGU2022-AFFC-BAS': { cargo: 'AFFC Básicos', banca: 'FGV' },
	'CGU2022-AFFC-TI': { cargo: 'AFFC TI', banca: 'FGV' },
	'CGU2022-AFFC-AUD': { cargo: 'AFFC Auditoria', banca: 'FGV' },
	'CGU2022-AFFC-CONT': { cargo: 'AFFC Contab. e Finanças', banca: 'FGV' },
	'CGU2022-AFFC-CORR': { cargo: 'AFFC Correição', banca: 'FGV' },
	'CGU2022-TFFC': { cargo: 'TFFC', banca: 'FGV' },
	'CGU2012-P1': { cargo: 'Prova 1 · Gerais', banca: 'ESAF' },
	'CGU2012-P2': { cargo: 'Prova 2 · Específicos', banca: 'ESAF' },
	'CGU2012-P3-TI-DES': { cargo: 'Prova 3 · TI Desenv.', banca: 'ESAF' },
	'CGU2012-P3-TI-INFRA': { cargo: 'Prova 3 · TI Infra', banca: 'ESAF' },
	'CGU2012-P3-AUD': { cargo: 'Prova 3 · Auditoria', banca: 'ESAF' },
	'CGU2012-P3-COM': { cargo: 'Prova 3 · Comunicação', banca: 'ESAF' },
	'CGU2012-P3-PREV': { cargo: 'Prova 3 · Prevenção', banca: 'ESAF' },
	'CGU2008-P1': { cargo: 'Prova 1 · Gerais', banca: 'ESAF' },
	'CGU2008-P2': { cargo: 'Prova 2 · Específicos', banca: 'ESAF' },
	'CGU2008-P3-TI-DES': { cargo: 'Prova 3 · TI Desenv.', banca: 'ESAF' },
	'CGU2008-P3-TI-INFRA': { cargo: 'Prova 3 · TI Infra', banca: 'ESAF' },
	'CGU2008-P3-CORR': { cargo: 'Prova 3 · Correição', banca: 'ESAF' },
	'CGU2006-P1': { cargo: 'Prova 1 · Gerais', banca: 'ESAF' },
	'CGU2006-P2-TI': { cargo: 'Prova 2 · TI', banca: 'ESAF' },
	'CGU2006-P2-AUD': { cargo: 'Prova 2 · Auditoria', banca: 'ESAF' },
	'CGU2006-P2-CORR': { cargo: 'Prova 2 · Correição', banca: 'ESAF' },
	'CGU2004-P1': { cargo: 'Prova 1 · Gerais', banca: 'ESAF' },
	'CGU2004-P3-TI': { cargo: 'Prova 3 · TI', banca: 'ESAF' },
	'CGU2004-P3-AUD': { cargo: 'Prova 3 · Auditoria', banca: 'ESAF' }
};

/**
 * @param {string} idProva
 * @param {string[]} avisos
 * @returns {{ orgao: 'CGU' | 'TCU', ano: number, cargo: string, banca?: string }}
 */
export function lerProva(idProva, avisos) {
	const m = /^(CGU|TCU)(\d{4})(?:-(.+))?$/.exec(idProva);
	if (!m) throw new Error(`id_prova fora do padrão ÓrgãoAAAA-…: "${idProva}"`);
	const orgao = /** @type {'CGU' | 'TCU'} */ (m[1]);
	const ano = Number(m[2]);
	const conhecida = PROVAS[idProva];
	if (conhecida) return { orgao, ano, cargo: conhecida.cargo, banca: conhecida.banca };
	avisos.push(`prova sem rótulo em PROVAS (questoes.mjs): ${idProva} — usado o id cru`);
	return { orgao, ano, cargo: m[3] ?? idProva };
}

/**
 * Separa o texto-base (entre colchetes no início) do enunciado. Respeita colchetes aninhados.
 * @param {string} texto
 * @returns {{ textoBase?: string, enunciado: string }}
 */
export function separarTextoBase(texto) {
	const t = texto.trim();
	if (!t.startsWith('[')) return { enunciado: t };
	let prof = 0;
	for (let i = 0; i < t.length; i++) {
		if (t[i] === '[') prof++;
		else if (t[i] === ']') {
			prof--;
			if (prof === 0) {
				const textoBase = t.slice(1, i).trim();
				const enunciado = t.slice(i + 1).trim();
				if (!enunciado) return { enunciado: t };
				return { textoBase, enunciado };
			}
		}
	}
	return { enunciado: t };
}

/**
 * `(A) … | (B) … | …` → lista. Parte só em ` | ` seguido de `(X) `, para não quebrar
 * alternativa que tem `|` no texto (ex.: operadores `||`).
 * @param {string} celula
 * @returns {{ letra: 'A' | 'B' | 'C' | 'D' | 'E', texto: string }[]}
 */
export function lerAlternativas(celula) {
	const partes = celula.trim().split(/ \| (?=\([A-E]\) )/);
	return partes.map((p, i) => {
		const m = /^\(([A-E])\) ([\s\S]*)$/.exec(p.trim());
		if (!m) throw new Error(`alternativa ${i + 1} sem prefixo "(X) ": "${p.slice(0, 60)}"`);
		return { letra: /** @type {'A' | 'B' | 'C' | 'D' | 'E'} */ (m[1]), texto: m[2].trim() };
	});
}

/** Id de tópico do `ESTUDO.csv` (ex.: `FAG-02`). */
export const ID_TOPICO = /^[A-Z]+-\d+$/;

/** Valor de `topico_estudo` que marca questão de matéria sem tópico no edital. */
export const SEM_TOPICO = 'sem-topico';

/**
 * `topico_estudo` → id do tópico, ou `undefined` (vazio, `sem-topico` ou fora do padrão).
 * @param {string | undefined} celula
 * @returns {string | undefined}
 */
export function lerTopicoEstudo(celula) {
	const v = (celula ?? '').trim();
	return ID_TOPICO.test(v) ? v : undefined;
}

/**
 * @param {Record<string, string>[]} linhas linhas do CSV (com cabeçalho)
 * @returns {{ posts: any[], descartes: Record<string, number>, avisos: string[], topicos: { questoes: number, distintos: number } }}
 */
export function importarQuestoes(linhas) {
	/** @type {any[]} */
	const posts = [];
	/** @type {Record<string, number>} */
	const descartes = { anulada: 0, 'sem gabarito': 0 };
	/** @type {string[]} */
	const avisos = [];
	const avisosProva = new Set();
	/** @type {Set<string>} */
	const avisosTopico = new Set();
	/** @type {Set<string>} */
	const topicosVistos = new Set();
	let comTopico = 0;
	for (const l of linhas) {
		if (l.situacao === 'anulada') {
			descartes.anulada++;
			continue;
		}
		const gabarito = (l.gabarito ?? '').trim();
		if (!gabarito) {
			descartes['sem gabarito']++;
			continue;
		}
		/** @type {string[]} */
		const avisosLinha = [];
		const prova = lerProva(l.id_prova, avisosLinha);
		for (const a of avisosLinha) avisosProva.add(a);
		const materia = materiaPorNome(l.materia).id;
		const { textoBase, enunciado } = separarTextoBase(l.enunciado);
		const temAlternativas = (l.alternativas ?? '').trim() !== '';
		if (!temAlternativas && gabarito !== 'C' && gabarito !== 'E') {
			throw new Error(`questão ${l.id}: gabarito "${gabarito}" sem alternativas`);
		}
		/** @type {any} */
		const post = {
			id: `q:${l.id}`,
			tipo: 'questao',
			materia
		};
		if (l.subtopico?.trim()) post.subtopico = l.subtopico.trim();
		const topico = lerTopicoEstudo(l.topico_estudo);
		if (topico) {
			post.topicoEstudo = topico;
			comTopico++;
			topicosVistos.add(topico);
		} else {
			const cru = (l.topico_estudo ?? '').trim();
			if (cru && cru !== SEM_TOPICO) avisosTopico.add(`questão ${l.id}: topico_estudo fora do padrão ("${cru}") — ficou sem tópico`);
		}
		post.prova = prova;
		post.numero = Number(l.numero);
		if (textoBase !== undefined) post.textoBase = textoBase;
		post.enunciado = enunciado;
		post.formato = temAlternativas ? 'me' : 'ce';
		if (temAlternativas) {
			try {
				post.alternativas = lerAlternativas(l.alternativas);
			} catch (e) {
				throw new Error(`questão ${l.id}: ${/** @type {Error} */ (e).message}`);
			}
		}
		post.gabarito = gabarito;
		post.situacao = l.situacao === 'alterada' ? 'alterada' : 'valida';
		posts.push(post);
	}
	avisos.push(...[...avisosProva].sort(), ...[...avisosTopico].sort());
	return { posts, descartes, avisos, topicos: { questoes: comTopico, distintos: topicosVistos.size } };
}

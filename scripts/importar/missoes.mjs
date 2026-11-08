/**
 * Plano de 61 dias das Missões (planos/2026-10-14-missao-unica.md): `artifacts/missoes/plano-<cargo>.json`
 * do vault, gerado por `artifacts/missoes/plano.py`, → `missoes-<cargo>.json`. É o mesmo plano que a
 * página das Missões mostra; o painel passa a usá-lo na "Missão de hoje".
 *
 * Formato fora do esperado é erro fatal: o painel confiaria em datas e blocos que não existem.
 *
 * Os links de questões eram do Qconcursos (`qc`/`qcErros`, de
 * `catalogo-questoes/qconcursos/links.json`) e saíram em 2026-11-08: o caderno de questões de cada
 * aula da mentoria mora no próprio PDF dela (`src/lib/dados/mentoria.json`). As fontes ficam no
 * vault, desativadas.
 */

export const CARGOS = ['cd', 'aud'];
export const TIPOS_BLOCO = ['novo', 'rev', 'disc', 'sim', 'q'];

const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @param {unknown} v
 * @returns {v is Record<string, unknown>}
 */
const ehObjeto = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
/** @param {unknown} v */
const texto = (v) => typeof v === 'string' && v.trim() !== '';
/** Minutos do bloco: 0 vale (a revisão "encaixe 15 min" dos dias de simulado, já contada nele). */
const minutos = (/** @type {unknown} */ v) => Number.isInteger(v) && /** @type {number} */ (v) >= 0;

/** `E4 1.1` do cargo `cd` → `CD:E4-1.1`; os blocos comuns (`B1 1.1`) não levam o cargo. */
export const chaveLink = (/** @type {string} */ cargo, /** @type {string} */ cod) =>
	(/^E/.test(cod) ? `${cargo.toUpperCase()}:` : '') + cod.replace(' ', '-');
const paiDe = (/** @type {string} */ k) => /^(.*-\d+\.\d+)\.\d+$/.exec(k)?.[1] ?? null;

/**
 * `{ [cid]: slug}`: o mapa mental do subitem, quando a chave dele (ou a do pai) tem SVG
 * (`mapas.mjs`), para o atalho da Missão de hoje. Item-aula (com `subitens`) mapeia os
 * subitens de dentro: o atalho aparece na lista de referência de cada um.
 * @param {{ plan: { blocos: { tipo: string, itens?: { cid: string, cod: string, subitens?: { cid: string, cod: string }[] }[] }[] }[] }} plano
 * @param {string} cargo
 * @param {Record<string, string>} mapa chave do edital → slug
 */
export function mapasDoPlano(plano, cargo, mapa) {
	/** @type {Record<string, string>} */
	const mapas = {};
	for (const d of plano.plan)
		for (const b of d.blocos)
			for (const it of b.itens ?? []) {
				const alvos = it.subitens?.length ? it.subitens : [it];
				for (const alvo of alvos) {
					const ch = chaveLink(cargo, alvo.cod);
					const slug = mapa[ch] ?? mapa[paiDe(ch) ?? ''];
					if (slug) mapas[alvo.cid] = slug;
				}
			}
	return mapas;
}

/**
 * Valida e enxuga o plano de um cargo: só o que o painel usa (`plan`, `cortes`, `gerado`).
 * @param {unknown} bruto conteúdo de `plano-<cargo>.json`
 * @param {string} onde nome do arquivo, para as mensagens
 */
export function validarMissoes(bruto, onde) {
	const erro = (/** @type {string} */ m) => new Error(`${onde}: ${m}`);
	if (!ehObjeto(bruto)) throw erro('não é um objeto');
	const { plan, cortes, gerado } = bruto;
	if (!Array.isArray(plan) || !plan.length) throw erro('plan deveria ser uma lista de dias');
	if (typeof gerado !== 'string' || !DIA_RE.test(gerado)) throw erro('gerado deveria ser AAAA-MM-DD');
	let anterior = '';
	plan.forEach((d, i) => {
		const ondeDia = `plan[${i}]`;
		if (!ehObjeto(d) || typeof d.data !== 'string' || !DIA_RE.test(d.data)) throw erro(`${ondeDia}: data fora de AAAA-MM-DD`);
		if (d.data <= anterior) throw erro(`${ondeDia}: ${d.data} fora de ordem (depois de ${anterior})`);
		anterior = d.data;
		if (!texto(d.fase)) throw erro(`${ondeDia}: fase ausente`);
		if (!Array.isArray(d.blocos) || !d.blocos.length) throw erro(`${ondeDia}: sem blocos`);
		d.blocos.forEach((b, j) => {
			const ondeBloco = `${ondeDia}.blocos[${j}] (${d.data})`;
			if (!ehObjeto(b) || !TIPOS_BLOCO.includes(/** @type {string} */ (b.tipo))) throw erro(`${ondeBloco}: tipo fora de ${TIPOS_BLOCO.join('|')}`);
			if (!texto(b.titulo)) throw erro(`${ondeBloco}: título ausente`);
			if (!minutos(b.min)) throw erro(`${ondeBloco}: min deveria ser inteiro ≥ 0`);
			if (b.itens !== undefined && !Array.isArray(b.itens)) throw erro(`${ondeBloco}: itens deveria ser lista`);
			(/** @type {unknown[]} */ (b.itens ?? [])).forEach((it, k) => {
				if (!ehObjeto(it) || !texto(it.cid) || !texto(it.cod) || !texto(it.texto))
					throw erro(`${ondeBloco}.itens[${k}]: item sem cid, cod ou texto`);
				// item-aula (planos/2026-11-08-missoes-por-aula-da-mentoria.md): subitens de referência
				if (it.subitens !== undefined) {
					if (!Array.isArray(it.subitens) || !it.subitens.length)
						throw erro(`${ondeBloco}.itens[${k}].subitens: deveria ser lista não vazia quando presente`);
					it.subitens.forEach((/** @type {unknown} */ sb, j) => {
						if (!ehObjeto(sb) || !texto(sb.cid) || !texto(sb.cod))
							throw erro(`${ondeBloco}.itens[${k}].subitens[${j}]: sem cid ou cod`);
					});
				}
				// item-aula maior que o dia: posição do pedaço e o total
				if (it.parte !== undefined || it.partes !== undefined) {
					if (
						!Number.isInteger(it.parte) ||
						!Number.isInteger(it.partes) ||
						/** @type {number} */ (it.parte) < 1 ||
						/** @type {number} */ (it.parte) > /** @type {number} */ (it.partes)
					)
						throw erro(`${ondeBloco}.itens[${k}]: parte/partes deveriam ser inteiros com parte ≤ partes`);
				}
			});
		});
	});
	return { gerado, plan, cortes: Array.isArray(cortes) ? cortes : [] };
}

/**
 * @param {Record<string, string>} fontes `plano-<cargo>.json` presentes no vault, por cargo
 * @param {Record<string, string>} [mapa] chave → slug dos mapas mentais (`mapas.mjs`); sem ele, sem `mapas`
 * @returns {{ arquivo: string, conteudo: string }[]}
 */
export function montarMissoes(fontes, mapa) {
	return CARGOS.filter((c) => fontes[c] !== undefined).map((c) => {
		const onde = `artifacts/missoes/plano-${c}.json`;
		let bruto;
		try {
			bruto = JSON.parse(fontes[c]);
		} catch (e) {
			throw new Error(`${onde}: JSON inválido (${/** @type {Error} */ (e).message})`);
		}
		const plano = validarMissoes(bruto, onde);
		const saida = {
			...plano,
			...(mapa ? { mapas: mapasDoPlano(plano, c, mapa) } : {})
		};
		return { arquivo: `missoes-${c}.json`, conteudo: `${JSON.stringify(saida)}\n` };
	});
}

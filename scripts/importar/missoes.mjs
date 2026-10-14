/**
 * Plano de 61 dias das Missões (planos/2026-10-14-missao-unica.md): `artifacts/missoes/plano-<cargo>.json`
 * do vault, gerado por `artifacts/missoes/plano.py`, → `missoes-<cargo>.json`. É o mesmo plano que a
 * página das Missões mostra; o painel passa a usá-lo na "Missão de hoje".
 *
 * Formato fora do esperado é erro fatal: o painel confiaria em datas e blocos que não existem.
 *
 * Link do Qconcursos de cada subitem (`qc`, por `cid`): o padrão do par que a página das Missões
 * mostra, de `catalogo-questoes/qconcursos/links.json`. Assim todo subitem da "Missão de hoje" tem
 * onde treinar, mesmo sem questão no feed. A chave é a da página: `<CARGO>:` nos itens `E…`, o código
 * com hífen (`CD:E4-1.1`), e o subitem pai quando o próprio não tem link. Nos itens das revisões, também
 * o link só das questões que ela errou (`qcErros`), como o "erros ↗" da página.
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

const ehQc = (/** @type {unknown} */ u) => typeof u === 'string' && u.startsWith('https://www.qconcursos.com/');

/**
 * `{ qc, qcErros }`, cada um `{ cid: url }`: o link padrão de todo item que tem link e, nos itens
 * das revisões, o das questões erradas.
 * @param {{ plan: { blocos: { tipo: string, itens?: { cid: string, cod: string }[] }[] }[] }} plano
 * @param {string} cargo
 * @param {Record<string, unknown>} links conteúdo de links.json
 */
export function linksDoPlano(plano, cargo, links) {
	/** @type {Record<string, string>} */
	const qc = {};
	/** @type {Record<string, string>} */
	const qcErros = {};
	for (const d of plano.plan)
		for (const b of d.blocos)
			for (const it of b.itens ?? []) {
				const ch = chaveLink(cargo, it.cod);
				const l = /** @type {Record<string, unknown> | undefined} */ (links[ch] ?? links[paiDe(ch) ?? '']);
				if (!l) continue;
				const url = typeof l.padrao === 'string' ? l[l.padrao] : undefined;
				if (ehQc(url)) qc[it.cid] = /** @type {string} */ (url);
				if (b.tipo === 'rev' && ehQc(l.erros)) qcErros[it.cid] = /** @type {string} */ (l.erros);
			}
	return { qc, qcErros };
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
			});
		});
	});
	return { gerado, plan, cortes: Array.isArray(cortes) ? cortes : [] };
}

/**
 * @param {Record<string, string>} fontes `plano-<cargo>.json` presentes no vault, por cargo
 * @param {string} [links] conteúdo de `catalogo-questoes/qconcursos/links.json`; sem ele, sem `qc`
 * @returns {{ arquivo: string, conteudo: string }[]}
 */
export function montarMissoes(fontes, links) {
	/** @type {Record<string, unknown> | null} */
	let mapa = null;
	if (links !== undefined) {
		try {
			mapa = JSON.parse(links);
		} catch (e) {
			throw new Error(`catalogo-questoes/qconcursos/links.json: JSON inválido (${/** @type {Error} */ (e).message})`);
		}
		if (!ehObjeto(mapa)) throw new Error('catalogo-questoes/qconcursos/links.json: não é um objeto');
	}
	return CARGOS.filter((c) => fontes[c] !== undefined).map((c) => {
		const onde = `artifacts/missoes/plano-${c}.json`;
		let bruto;
		try {
			bruto = JSON.parse(fontes[c]);
		} catch (e) {
			throw new Error(`${onde}: JSON inválido (${/** @type {Error} */ (e).message})`);
		}
		const plano = validarMissoes(bruto, onde);
		const saida = mapa ? { ...plano, ...linksDoPlano(plano, c, mapa) } : plano;
		return { arquivo: `missoes-${c}.json`, conteudo: `${JSON.stringify(saida)}\n` };
	});
}

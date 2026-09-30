/**
 * Frontmatter YAML restrito: bloco `---` no início do arquivo, uma `chave: valor` por linha.
 * Valores: string (com ou sem aspas duplas), `true`/`false`, números; datas ficam como string.
 * Comentário `# …` depois de valor sem aspas é ignorado. Sem YAML aninhado.
 */

/** @typedef {string | number | boolean} ValorFrontmatter */

/**
 * @param {string} bruto
 * @returns {ValorFrontmatter}
 */
function converterValor(bruto) {
	let v = bruto.trim();
	if (v.startsWith('"')) {
		const fim = v.lastIndexOf('"');
		if (fim <= 0) throw new Error('aspas não fechadas');
		return v.slice(1, fim).replace(/\\"/g, '"');
	}
	const comentario = v.search(/\s#/);
	if (comentario >= 0) v = v.slice(0, comentario).trim();
	if (v === 'true') return true;
	if (v === 'false') return false;
	if (/^-?\d+(\.\d+)?$/.test(v) && !/^\d{4}-/.test(v)) return Number(v);
	return v;
}

/**
 * @param {string} texto
 * @returns {{ dados: Record<string, ValorFrontmatter>, corpo: string }}
 */
export function lerFrontmatter(texto) {
	if (texto.charCodeAt(0) === 0xfeff) texto = texto.slice(1);
	const linhas = texto.split(/\r?\n/);
	if (linhas[0]?.trim() !== '---') return { dados: {}, corpo: linhas.join('\n') };
	/** @type {Record<string, ValorFrontmatter>} */
	const dados = {};
	for (let i = 1; i < linhas.length; i++) {
		const linha = linhas[i];
		if (linha.trim() === '---') {
			return { dados, corpo: linhas.slice(i + 1).join('\n') };
		}
		if (linha.trim() === '' || linha.trim().startsWith('#')) continue;
		const m = /^([A-Za-z_][\w-]*)\s*:(.*)$/.exec(linha);
		if (!m) throw new Error(`frontmatter malformado na linha ${i + 1}: "${linha}"`);
		try {
			dados[m[1]] = converterValor(m[2]);
		} catch (e) {
			throw new Error(`frontmatter malformado na linha ${i + 1}: ${/** @type {Error} */ (e).message}`);
		}
	}
	throw new Error('frontmatter malformado: bloco `---` sem fechamento');
}

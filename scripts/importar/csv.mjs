/**
 * Leitor de CSV RFC 4180, sem dependência.
 * Aspas duplas delimitam campo; `""` dentro de aspas é uma aspa; vírgula e quebra de linha
 * dentro de aspas fazem parte do campo; aceita `\r\n` e `\n`; remove BOM inicial.
 */

/**
 * @param {string} texto
 * @returns {string[][]}
 */
export function lerLinhasCsv(texto) {
	if (texto.charCodeAt(0) === 0xfeff) texto = texto.slice(1);
	/** @type {string[][]} */
	const linhas = [];
	/** @type {string[]} */
	let linha = [];
	let campo = '';
	let emAspas = false;
	let i = 0;
	const n = texto.length;
	while (i < n) {
		const c = texto[i];
		if (emAspas) {
			if (c === '"') {
				if (texto[i + 1] === '"') {
					campo += '"';
					i += 2;
					continue;
				}
				emAspas = false;
				i++;
				continue;
			}
			campo += c;
			i++;
			continue;
		}
		if (c === '"' && campo === '') {
			emAspas = true;
			i++;
		} else if (c === ',') {
			linha.push(campo);
			campo = '';
			i++;
		} else if (c === '\r' || c === '\n') {
			linha.push(campo);
			linhas.push(linha);
			linha = [];
			campo = '';
			i += c === '\r' && texto[i + 1] === '\n' ? 2 : 1;
		} else {
			campo += c;
			i++;
		}
	}
	if (emAspas) throw new Error('CSV malformado: aspas não fechadas no fim do arquivo');
	if (campo !== '' || linha.length > 0) {
		linha.push(campo);
		linhas.push(linha);
	}
	// linhas totalmente vazias (ex.: linha em branco no fim) não contam
	return linhas.filter((l) => !(l.length === 1 && l[0] === ''));
}

/**
 * @param {string} texto
 * @param {{ cabecalho?: boolean }} [opcoes]
 * @returns {Record<string, string>[] | string[][]}
 */
export function lerCsv(texto, { cabecalho = true } = {}) {
	const linhas = lerLinhasCsv(texto);
	if (!cabecalho) return linhas;
	const [cab, ...resto] = linhas;
	if (!cab) return [];
	return resto.map((l) => {
		/** @type {Record<string, string>} */
		const obj = {};
		cab.forEach((nome, j) => {
			obj[nome] = l[j] ?? '';
		});
		return obj;
	});
}

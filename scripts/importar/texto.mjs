/** Utilitários de texto compartilhados pela importação. */

/**
 * Slug sem acento, minúsculo, só `[a-z0-9-]`.
 * @param {string} s
 */
export function slug(s) {
	return s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[º°]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Comparação por code unit: determinística, independente de locale.
 * @param {string} a
 * @param {string} b
 */
export function comparar(a, b) {
	return a < b ? -1 : a > b ? 1 : 0;
}

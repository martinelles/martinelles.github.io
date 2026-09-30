/**
 * Lotes por matéria com tamanho gzip ≤ 150 KB (NFR-005). Um post por linha, para o diff do
 * conteúdo commitado ser legível (NFR-008).
 */
import { gzipSync } from 'node:zlib';
import { comparar } from './texto.mjs';

/** Teto do NFR-005. */
export const LIMITE_GZIP = 150 * 1024;
/**
 * Alvo do empacotamento: 10 KB abaixo do teto, porque outro compressor (gzip do servidor,
 * GNU gzip) sai até ~1% maior que o zlib do Node para o mesmo nível.
 */
export const ALVO_GZIP = 140 * 1024;

/** @param {any[]} posts */
export function serializarLote(posts) {
	return `[\n${posts.map((p) => JSON.stringify(p)).join(',\n')}\n]\n`;
}

/**
 * Tamanho gzip no nível padrão do zlib (6), que dá arquivo maior que o nível 9: o lote cabe
 * no limite mesmo quando o servidor comprime com menos esforço que o máximo.
 * @param {string} texto
 */
export function tamanhoGzip(texto) {
	return gzipSync(Buffer.from(texto, 'utf8')).length;
}

/**
 * @typedef {{ chave: string, arquivo: string, posts: any[], conteudo: string, gzip: number }} Lote
 */

/**
 * @param {string} materia id da matéria
 * @param {any[]} posts posts da matéria (qualquer ordem; saem ordenados por id)
 * @param {number} limite
 * @returns {Lote[]}
 */
export function fatiarMateria(materia, posts, limite = ALVO_GZIP) {
	const ordenados = [...posts].sort((a, b) => comparar(a.id, b.id));
	/** @type {Lote[]} */
	const lotes = [];
	/** @param {number} i @param {number} k */
	const medir = (i, k) => {
		const conteudo = serializarLote(ordenados.slice(i, i + k));
		return { conteudo, gzip: tamanhoGzip(conteudo) };
	};
	let i = 0;
	while (i < ordenados.length) {
		const resto = ordenados.length - i;
		let melhor = medir(i, resto);
		let k = resto;
		if (melhor.gzip > limite) {
			const um = medir(i, 1);
			if (um.gzip > limite) {
				throw new Error(`post ${ordenados[i].id} sozinho passa de ${limite} bytes gzip`);
			}
			// maior k que cabe (busca binária; gzip cresce com k)
			let lo = 1;
			let hi = resto - 1;
			melhor = um;
			k = 1;
			while (lo <= hi) {
				const meio = (lo + hi) >> 1;
				const m = medir(i, meio);
				if (m.gzip <= limite) {
					melhor = m;
					k = meio;
					lo = meio + 1;
				} else hi = meio - 1;
			}
		}
		const n = lotes.length + 1;
		lotes.push({
			chave: `${materia}-${n}`,
			arquivo: `lote-${materia}-${n}.json`,
			posts: ordenados.slice(i, i + k),
			conteudo: melhor.conteudo,
			gzip: melhor.gzip
		});
		i += k;
	}
	return lotes;
}

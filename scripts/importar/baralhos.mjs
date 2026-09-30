/**
 * Baralhos Anki existentes em `flashcards/*.csv` (sem cabeçalho: pergunta,resposta).
 * Entram como flashcards com `conferido: false`.
 */
import { lerLinhasCsv } from './csv.mjs';
import { BARALHO_PARA_MATERIA } from './materias.mjs';
import { slug } from './texto.mjs';

/** "LGPD Flashcards.csv" → "LGPD" */
export function nomeDoBaralho(/** @type {string} */ arquivo) {
	return arquivo.replace(/\.csv$/i, '').replace(/\s+Flashcards$/i, '').trim();
}

/**
 * @param {string} arquivo nome do arquivo em `flashcards/`
 * @param {string} texto
 * @returns {{ posts: any[], ignorados: number }}
 */
export function importarBaralho(arquivo, texto) {
	const materia = BARALHO_PARA_MATERIA[arquivo];
	if (!materia) {
		throw new Error(`baralho sem matéria em BARALHO_PARA_MATERIA (materias.mjs): ${arquivo}`);
	}
	const nome = nomeDoBaralho(arquivo);
	const id = slug(nome);
	/** @type {any[]} */
	const posts = [];
	let ignorados = 0;
	for (const linha of lerLinhasCsv(texto)) {
		const pergunta = (linha[0] ?? '').trim();
		const resposta = (linha[1] ?? '').trim();
		if (!pergunta || !resposta) {
			ignorados++;
			continue;
		}
		posts.push({
			id: `f:baralho:${id}:${posts.length + 1}`,
			tipo: 'flashcard',
			materia,
			fonte: { rotulo: `Baralho ${nome}`, arquivo: `flashcards/${arquivo}` },
			pergunta,
			resposta,
			conferido: false
		});
	}
	return { posts, ignorados };
}

/**
 * `feed-conteudo/resumos/*.md` e `feed-conteudo/flashcards/*.md` (contracts/feed-conteudo.md).
 * Arquivo inválido lança `Error` com o motivo; quem chama recusa o arquivo e segue.
 */
import { lerFrontmatter } from './frontmatter.mjs';
import { materiaPorNome } from './materias.mjs';

export const MAX_TEXTO_TELA = 600;

/**
 * Cabeçalho comum de resumo e flashcards.
 * @param {Record<string, string | number | boolean>} dados
 * @param {string} tipoEsperado
 */
function validarCabecalho(dados, tipoEsperado) {
	for (const campo of ['tipo', 'materia', 'fonte', 'conferido']) {
		if (dados[campo] === undefined || dados[campo] === '') {
			throw new Error(`campo obrigatório ausente no cabeçalho: ${campo}`);
		}
	}
	if (dados.tipo !== tipoEsperado) {
		throw new Error(`tipo "${dados.tipo}" onde se esperava "${tipoEsperado}"`);
	}
	if (typeof dados.conferido !== 'boolean') {
		throw new Error(`conferido precisa ser true ou false (veio "${dados.conferido}")`);
	}
	const materia = materiaPorNome(String(dados.materia)).id;
	const subtopico = dados.subtopico !== undefined ? String(dados.subtopico).trim() : '';
	return { materia, subtopico, fonte: String(dados.fonte).trim(), conferido: dados.conferido };
}

/**
 * Referências a artigo no texto: "Art. 7º", "art. 11", "arts. 7º, 8º e 11", "Art. 1º-A".
 * Devolve chaves no formato de `importarLei` ("7", "1-A").
 * @param {string} texto
 */
export function artigosCitados(texto) {
	const num = String.raw`\d+\s*[º°]?(?:\s*-\s*[A-Z]\b)?`;
	const re = new RegExp(String.raw`\barts?\.\s*(${num}(?:\s*(?:,|e)\s*${num})*)`, 'gi');
	const chaves = new Set();
	for (const m of texto.matchAll(re)) {
		for (const n of m[1].matchAll(/(\d+)\s*[º°]?(?:\s*-\s*([A-Z])\b)?/g)) {
			chaves.add(n[2] ? `${n[1]}-${n[2]}` : n[1]);
		}
	}
	return [...chaves];
}

/**
 * Checagem C-004: se a fonte cita arquivo(s) de `leis-secas/`, todo artigo citado no texto
 * precisa existir entre os artigos importados desses arquivos.
 * @param {string} fonte
 * @param {string} texto
 * @param {Map<string, Set<string>>} artigosPorLei nome do arquivo (sem .md) → chaves importadas
 * @param {string[]} leisConhecidas todos os nomes de arquivo de lei seca (sem .md)
 */
export function checarDispositivos(fonte, texto, artigosPorLei, leisConhecidas) {
	const citadas = leisConhecidas.filter((nome) => fonte.includes(nome));
	if (!citadas.length) return;
	const existentes = new Set();
	for (const nome of citadas) {
		const chaves = artigosPorLei.get(nome);
		if (!chaves) throw new Error(`fonte cita ${nome}, que não foi importado`);
		for (const c of chaves) existentes.add(c);
	}
	const faltando = artigosCitados(`${fonte}\n${texto}`).filter((c) => !existentes.has(c));
	if (faltando.length) {
		throw new Error(
			`artigos citados que não existem em ${citadas.join(', ')}: ${faltando.map((c) => `Art. ${c}`).join(', ')}`
		);
	}
}

/**
 * @param {string} nome arquivo sem `.md`
 * @param {string} texto
 * @param {Map<string, Set<string>>} artigosPorLei
 * @param {string[]} leisConhecidas
 */
export function importarResumo(nome, texto, artigosPorLei, leisConhecidas) {
	const { dados, corpo } = lerFrontmatter(texto);
	const cab = validarCabecalho(dados, 'resumo');
	let titulo = '';
	/** @type {{ titulo: string, linhas: string[] }[]} */
	const secoes = [];
	for (const linha of corpo.split(/\r?\n/)) {
		const h1 = /^#\s+(.+)$/.exec(linha);
		const h2 = /^##\s+(.+)$/.exec(linha);
		if (h1 && !titulo && !secoes.length) titulo = h1[1].trim();
		else if (h2) secoes.push({ titulo: h2[1].trim(), linhas: [] });
		else if (secoes.length) secoes[secoes.length - 1].linhas.push(linha);
	}
	if (!titulo) throw new Error('resumo sem título "# …"');
	const telas = secoes.map((s) => ({ titulo: s.titulo, texto: s.linhas.join('\n').trim() }));
	if (telas.length < 3 || telas.length > 8) {
		throw new Error(`resumo com ${telas.length} telas "##" (precisa de 3 a 8)`);
	}
	telas.forEach((t, i) => {
		if (!t.texto) throw new Error(`tela ${i + 1} ("${t.titulo}") sem texto`);
		if (t.texto.length > MAX_TEXTO_TELA) {
			throw new Error(`tela ${i + 1} ("${t.titulo}") com ${t.texto.length} caracteres (máx. ${MAX_TEXTO_TELA})`);
		}
	});
	const textoTodo = [titulo, ...telas.flatMap((t) => [t.titulo, t.texto])].join('\n');
	checarDispositivos(cab.fonte, textoTodo, artigosPorLei, leisConhecidas);
	/** @type {any} */
	const post = { id: `r:${nome}`, tipo: 'resumo', materia: cab.materia };
	if (cab.subtopico) post.subtopico = cab.subtopico;
	post.fonte = { rotulo: cab.fonte, arquivo: `feed-conteudo/resumos/${nome}.md` };
	post.titulo = titulo;
	post.telas = telas;
	post.conferido = cab.conferido;
	return post;
}

/**
 * @param {string} nome arquivo sem `.md`
 * @param {string} texto
 * @returns {any[]}
 */
export function importarFlashcards(nome, texto) {
	const { dados, corpo } = lerFrontmatter(texto);
	const cab = validarCabecalho(dados, 'flashcards');
	/** @type {{ p: string[], r: string[] | null }[]} */
	const pares = [];
	/** @type {'p' | 'r' | null} */
	let em = null;
	let branco = false;
	for (const bruta of corpo.split(/\r?\n/)) {
		const linha = bruta.trimEnd();
		if (linha.trim() === '') {
			branco = true;
			continue;
		}
		const atual = pares[pares.length - 1];
		if (/^P:/.test(linha)) {
			if (atual && atual.r === null) throw new Error(`pergunta ${pares.length} sem "R:"`);
			pares.push({ p: [linha.slice(2).trim()], r: null });
			em = 'p';
		} else if (/^R:/.test(linha)) {
			if (!atual || atual.r !== null) throw new Error(`"R:" sem "P:" antes (par ${pares.length + 1})`);
			atual.r = [linha.slice(2).trim()];
			em = 'r';
		} else if (atual && em === 'r' && atual.r) {
			atual.r.push(branco ? `\n${linha}` : linha);
		} else if (atual && em === 'p') {
			atual.p.push(linha);
		}
		branco = false;
	}
	if (!pares.length) throw new Error('nenhum par P:/R:');
	return pares.map((par, i) => {
		if (par.r === null) throw new Error(`pergunta ${i + 1} sem "R:"`);
		const pergunta = par.p.join('\n').trim();
		const resposta = par.r.join('\n').trim();
		if (!pergunta || !resposta) throw new Error(`par ${i + 1} com pergunta ou resposta vazia`);
		/** @type {any} */
		const post = { id: `f:${nome}:${i + 1}`, tipo: 'flashcard', materia: cab.materia };
		if (cab.subtopico) post.subtopico = cab.subtopico;
		post.fonte = { rotulo: cab.fonte, arquivo: `feed-conteudo/flashcards/${nome}.md` };
		post.pergunta = pergunta;
		post.resposta = resposta;
		post.conferido = cab.conferido;
		return post;
	});
}

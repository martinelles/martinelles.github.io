#!/usr/bin/env node
/**
 * Importação do vault para o feed (FR-016).
 *
 *   node scripts/importar/index.mjs [--vault <dir>] [--saida static/conteudo]
 *
 * Vault: `--vault` > `PAINEL_VAULT` > caminho padrão. O vault é só lido (C-005).
 * Escreve em diretório temporário e troca pelo destino só no fim; com erro fatal a saída
 * anterior fica intacta. Saída determinística: `geradoEm` é a data do arquivo-fonte mais
 * recente, não a hora da execução.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importarBaralho } from './baralhos.mjs';
import { lerCsv } from './csv.mjs';
import { fatiarMateria } from './fatiar.mjs';
import { importarFlashcards, importarResumo } from './feed-conteudo.mjs';
import { importarLei } from './lei-seca.mjs';
import { LEI_PARA_MATERIA, LEIS_IGNORADAS, ordenarMaterias } from './materias.mjs';
import { importarQuestoes } from './questoes.mjs';
import { comparar } from './texto.mjs';

export const VAULT_PADRAO = 'C:/Users/martinelle.santos/OneDrive - mtegovbr/00. vault/Estudo/cgu';
export const SAIDA_PADRAO = 'static/conteudo';

/** @typedef {{ arquivo: string, motivo: string }} Recusa */

/**
 * @typedef {{
 *   vault: string,
 *   saida: string,
 *   geradoEm: string,
 *   totais: Record<string, number>,
 *   porMateria: { id: string, nome: string, total: number, lotes: number }[],
 *   descartes: Record<string, number>,
 *   recusados: Recusa[],
 *   pulados: string[],
 *   avisos: string[],
 *   lotes: { arquivo: string, posts: number, gzip: number }[],
 *   entradasIndice: number
 * }} Relatorio
 */

/**
 * @param {string} dir
 * @param {RegExp} filtro
 */
function listar(dir, filtro) {
	if (!existsSync(dir)) return null;
	return readdirSync(dir)
		.filter((f) => filtro.test(f) && statSync(join(dir, f)).isFile())
		.sort(comparar);
}

/**
 * @param {{ vault: string, saida: string }} opcoes
 * @returns {Relatorio}
 */
export function importar({ vault, saida }) {
	vault = resolve(vault);
	saida = resolve(saida);
	if (!existsSync(vault) || !statSync(vault).isDirectory()) {
		throw new Error(`vault não encontrado: ${vault}`);
	}
	if (saida === vault || saida.startsWith(vault + sep)) {
		throw new Error(`a saída não pode ficar dentro do vault (só leitura): ${saida}`);
	}
	let maisRecente = 0;
	/** @param {string} caminho */
	const ler = (caminho) => {
		maisRecente = Math.max(maisRecente, statSync(caminho).mtimeMs);
		return readFileSync(caminho, 'utf8');
	};

	/** @type {any[]} */
	const posts = [];
	/** @type {Record<string, number>} */
	const descartes = {};
	/** @type {Recusa[]} */
	const recusados = [];
	/** @type {string[]} */
	const pulados = [];
	/** @type {string[]} */
	const avisos = [];

	// Questões
	const csvQuestoes = join(vault, 'catalogo-questoes', 'questoes.csv');
	if (!existsSync(csvQuestoes)) throw new Error(`catálogo não encontrado: ${csvQuestoes}`);
	const q = importarQuestoes(/** @type {Record<string, string>[]} */ (lerCsv(ler(csvQuestoes))));
	posts.push(...q.posts);
	descartes['questão anulada'] = q.descartes.anulada;
	descartes['questão sem gabarito'] = q.descartes['sem gabarito'];
	avisos.push(...q.avisos);

	// Lei seca
	/** @type {Map<string, Set<string>>} */
	const artigosPorLei = new Map();
	const dirLeis = join(vault, 'leis-secas');
	const arquivosLei = listar(dirLeis, /\.md$/i) ?? [];
	if (!arquivosLei.length) avisos.push('leis-secas/ ausente ou vazia');
	descartes['artigo revogado/vetado'] = 0;
	descartes['redação anterior substituída'] = 0;
	for (const arquivo of arquivosLei) {
		const nome = arquivo.replace(/\.md$/i, '');
		if (LEIS_IGNORADAS.has(nome)) continue;
		const materia = LEI_PARA_MATERIA[nome];
		if (!materia) {
			pulados.push(`leis-secas/${arquivo}: sem matéria em LEI_PARA_MATERIA (materias.mjs)`);
			continue;
		}
		const r = importarLei(nome, ler(join(dirLeis, arquivo)), materia);
		avisos.push(...r.avisos);
		if (r.pulado) {
			pulados.push(`leis-secas/${r.pulado}`);
			continue;
		}
		posts.push(...r.posts);
		artigosPorLei.set(nome, r.chaves);
		descartes['artigo revogado/vetado'] += r.descartados;
		descartes['redação anterior substituída'] += r.substituidos;
	}
	const leisConhecidas = Object.keys(LEI_PARA_MATERIA);

	// Baralhos existentes
	const dirBaralhos = join(vault, 'flashcards');
	descartes['cartão de baralho vazio'] = 0;
	for (const arquivo of listar(dirBaralhos, /\.csv$/i) ?? []) {
		try {
			const r = importarBaralho(arquivo, ler(join(dirBaralhos, arquivo)));
			posts.push(...r.posts);
			descartes['cartão de baralho vazio'] += r.ignorados;
		} catch (e) {
			recusados.push({ arquivo: `flashcards/${arquivo}`, motivo: /** @type {Error} */ (e).message });
		}
	}

	// Resumos e flashcards gerados
	const dirFeed = join(vault, 'feed-conteudo');
	if (!existsSync(dirFeed)) {
		avisos.push('feed-conteudo/ ainda não existe: sem resumos nem flashcards gerados');
	} else {
		for (const arquivo of listar(join(dirFeed, 'resumos'), /\.md$/i) ?? []) {
			const nome = arquivo.replace(/\.md$/i, '');
			try {
				const texto = ler(join(dirFeed, 'resumos', arquivo));
				posts.push(importarResumo(nome, texto, artigosPorLei, leisConhecidas));
			} catch (e) {
				recusados.push({ arquivo: `feed-conteudo/resumos/${arquivo}`, motivo: /** @type {Error} */ (e).message });
			}
		}
		for (const arquivo of listar(join(dirFeed, 'flashcards'), /\.md$/i) ?? []) {
			const nome = arquivo.replace(/\.md$/i, '');
			try {
				const texto = ler(join(dirFeed, 'flashcards', arquivo));
				posts.push(...importarFlashcards(nome, texto));
			} catch (e) {
				recusados.push({ arquivo: `feed-conteudo/flashcards/${arquivo}`, motivo: /** @type {Error} */ (e).message });
			}
		}
	}

	// Ids únicos
	const vistos = new Set();
	for (const p of posts) {
		if (vistos.has(p.id)) throw new Error(`id repetido: ${p.id}`);
		vistos.add(p.id);
	}

	// Matérias, lotes e índice
	/** @type {Record<string, any[]>} */
	const porMateria = {};
	for (const p of posts) (porMateria[p.materia] ??= []).push(p);
	/** @type {Record<string, number>} */
	const totaisMateria = {};
	for (const [m, lista] of Object.entries(porMateria)) totaisMateria[m] = lista.length;
	const materias = ordenarMaterias(totaisMateria);

	const geradoEm = new Date(Math.floor(maisRecente / 1000) * 1000).toISOString();
	/** @type {{ id: string, t: string, m: string, l: string }[]} */
	const entradas = [];
	/** @type {Record<string, string>} */
	const mapaLotes = {};
	/** @type {{ arquivo: string, conteudo: string }[]} */
	const arquivos = [];
	/** @type {Relatorio['lotes']} */
	const lotesRel = [];
	/** @type {Relatorio['porMateria']} */
	const materiasRel = [];
	for (const m of materias) {
		const lista = porMateria[m.id];
		if (!lista?.length) continue;
		const lotes = fatiarMateria(m.id, lista);
		for (const lote of lotes) {
			mapaLotes[lote.chave] = lote.arquivo;
			arquivos.push({ arquivo: lote.arquivo, conteudo: lote.conteudo });
			lotesRel.push({ arquivo: lote.arquivo, posts: lote.posts.length, gzip: lote.gzip });
			for (const p of lote.posts) entradas.push({ id: p.id, t: p.tipo[0], m: m.id, l: lote.chave });
		}
		materiasRel.push({ id: m.id, nome: m.nome, total: m.total, lotes: lotes.length });
	}
	const indice =
		`{"versao":1,"geradoEm":${JSON.stringify(geradoEm)},"lotes":${JSON.stringify(mapaLotes)},"posts":[\n` +
		entradas.map((e) => JSON.stringify(e)).join(',\n') +
		'\n]}\n';
	arquivos.push({ arquivo: 'indice.json', conteudo: indice });
	arquivos.push({
		arquivo: 'materias.json',
		conteudo: `[\n${materias.map((m) => JSON.stringify(m)).join(',\n')}\n]\n`
	});

	// Escrita: temporário ao lado do destino, depois troca
	const tmp = `${saida}.tmp-${process.pid}`;
	const velho = `${saida}.old-${process.pid}`;
	rmSync(tmp, { recursive: true, force: true });
	mkdirSync(tmp, { recursive: true });
	try {
		for (const a of arquivos) writeFileSync(join(tmp, a.arquivo), a.conteudo, 'utf8');
		const existia = existsSync(saida);
		if (existia) renameSync(saida, velho);
		renameSync(tmp, saida);
		if (existia) rmSync(velho, { recursive: true, force: true });
	} catch (e) {
		rmSync(tmp, { recursive: true, force: true });
		if (!existsSync(saida) && existsSync(velho)) renameSync(velho, saida);
		throw e;
	}

	/** @type {Record<string, number>} */
	const totais = { questao: 0, lei: 0, resumo: 0, flashcard: 0 };
	for (const p of posts) totais[p.tipo]++;
	return {
		vault,
		saida,
		geradoEm,
		totais,
		porMateria: materiasRel,
		descartes,
		recusados,
		pulados,
		avisos,
		lotes: lotesRel,
		entradasIndice: entradas.length
	};
}

/**
 * @param {Relatorio} r
 * @returns {string}
 */
export function formatarRelatorio(r) {
	const kb = (/** @type {number} */ b) => `${(b / 1024).toFixed(1)} KB`;
	const maior = r.lotes.reduce((a, b) => (b.gzip > a.gzip ? b : a), r.lotes[0] ?? { arquivo: '-', gzip: 0, posts: 0 });
	const total = Object.values(r.totais).reduce((a, b) => a + b, 0);
	const linhas = [
		`Importação do vault — ${r.vault}`,
		`Saída: ${r.saida} (geradoEm ${r.geradoEm})`,
		'',
		`Posts: ${total} (índice: ${r.entradasIndice})`,
		...Object.entries(r.totais).map(([t, n]) => `  ${t}: ${n}`),
		'',
		'Por matéria:',
		...r.porMateria.map((m) => `  ${m.nome}: ${m.total} (${m.lotes} lote${m.lotes > 1 ? 's' : ''})`),
		'',
		'Descartes:',
		...Object.entries(r.descartes).map(([motivo, n]) => `  ${motivo}: ${n}`),
		'',
		`Lotes: ${r.lotes.length}; maior: ${maior.arquivo} com ${kb(maior.gzip)} gzip`,
		'',
		`Arquivos recusados: ${r.recusados.length}`,
		...r.recusados.map((x) => `  ${x.arquivo}: ${x.motivo}`),
		`Arquivos pulados: ${r.pulados.length}`,
		...r.pulados.map((x) => `  ${x}`),
		`Avisos: ${r.avisos.length}`,
		...r.avisos.map((x) => `  ${x}`)
	];
	return linhas.join('\n');
}

/** @param {string[]} args */
export function lerArgumentos(args) {
	/** @type {{ vault: string, saida: string }} */
	const opcoes = { vault: process.env.PAINEL_VAULT || VAULT_PADRAO, saida: SAIDA_PADRAO };
	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--vault' && args[i + 1]) opcoes.vault = args[++i];
		else if (args[i] === '--saida' && args[i + 1]) opcoes.saida = args[++i];
		else throw new Error(`argumento desconhecido: ${args[i]}`);
	}
	return opcoes;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	try {
		const relatorio = importar(lerArgumentos(process.argv.slice(2)));
		console.log(formatarRelatorio(relatorio));
	} catch (e) {
		console.error(`Erro fatal: ${/** @type {Error} */ (e).message}`);
		console.error('A saída anterior, se havia, ficou intacta.');
		process.exit(1);
	}
}

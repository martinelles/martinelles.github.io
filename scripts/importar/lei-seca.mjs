/**
 * `leis-secas/*.md` → posts de lei (research R6): um post por artigo, ou por item numerado
 * nas normas sem `Art.`. Artigo longo vira carrossel (telas ≤ 700 caracteres).
 *
 * Artigo alterado aparece várias vezes (o planalto perde o tachado): vale a última redação
 * no mesmo escopo (corpo, ADCT, cada anexo); se ela está revogada/vetada, o artigo sai.
 * Anexo em prosa numerada (Referencial da IN SFC 3/2017, Código de Ética do Decreto
 * 1.171/1994) vira um post por parágrafo/inciso.
 */
import { slug } from './texto.mjs';

export const MAX_TELA = 700;
export const MIN_ITENS = 10;

const RE_ART = /^(?:\*\*)?Art\.\s*(\d+)\s*([º°]|o(?![a-zà-ú]))?\.?\s*(?:-\s*([A-Z])\b)?/;
const RE_REVOGADO = /\((?:Revogad[oa]s?|VETAD[OA]|Vetad[oa])\b/;
const RE_ADCT = /^ATO DAS DISPOSIÇÕES CONSTITUCIONAIS TRANSITÓRIAS/;
const RE_TERMINADOR = /^(?:Brasília\s*,|Este texto não substitui|\\?\*\s*$)/;
/** Fim do texto da norma no planalto: o que vem depois (fora de ADCT/anexo) é outro ato. */
const RE_FIM_TEXTO = /^Este texto não substitui/;
/** Rótulo quebrado por OCR ("Art. 5 7."): não é o Art. 5, e o número não é confiável. */
const RE_ART_MALFORMADO = /^(?:\*\*)?Art\.\s*\d+\s+\d+\s*[º°]?\.?(?:\s|$)/;
/** Parágrafo numerado de anexo em prosa ("23. A atuação…"). */
const RE_PARAGRAFO = /^(\d{1,3})\.\s+\S/;
/** Regra em algarismo romano ("XIV - São deveres…", "IV- A…", "XVII -- Cada…"). */
const RE_ROMANO = /^([IVXLC]+)\s*[-–—]+\s*\S/;
/** Cabeçalho/rodapé de página de PDF: linha curta repetida pelo menos isto sai antes da emenda. */
export const MIN_REPETICAO_CABECALHO = 10;
const RE_ANEXO = /^(?:#+\s*)?ANEXO(?:\s+([IVXLC]+)\b)?/;
const RE_ITEM = /^(\d+(?:\.\d+)*)\.?\s+(\S.*)$/;
const RE_FIM_ITENS = /^(?:REFERÊNCIAS|GLOSSÁRIO|BIBLIOGRAFIA|APÊNDICES?|ANEXOS?)(?:\s+[A-Z]\b.*)?$/;
const RE_SUMARIO =/(?:\.{4,}|…{2,})\s*\d*\s*$/;
/** Linha que começa dispositivo próprio: nunca é emendada à anterior no texto vindo de PDF. */
const RE_ESTRUTURA =
	/^(?:Art\.|§|Parágrafo único|[IVXLC]+\s*[-–—.)]|[a-z]\)|\d+(?:\.\d+)*[.)]?\s|•|[-–—]\s|\([a-zA-Z0-9]+\)\s)/;

/**
 * @typedef {{ titulo: string, url?: string, baixadoEm?: string, pdf: boolean, inicio: number }} Cabecalho
 */

/**
 * @param {string[]} linhas
 * @returns {Cabecalho}
 */
export function lerCabecalho(linhas) {
	let titulo = '';
	/** @type {string | undefined} */
	let url;
	/** @type {string | undefined} */
	let baixadoEm;
	let pdf = false;
	let inicio = 0;
	for (let i = 0; i < Math.min(linhas.length, 20); i++) {
		const l = linhas[i].trim();
		if (!titulo && /^#\s+/.test(l)) {
			titulo = l.replace(/^#\s+/, '').trim();
			inicio = i + 1;
			continue;
		}
		let m;
		if ((m = /^>\s*Fonte(?: oficial)?:\s*(\S+)/.exec(l))) url = m[1];
		else if ((m = /^>\s*Baixado em:\s*(\S+)/.exec(l))) baixadoEm = m[1];
		else if (/^>\s*PDF oficial/.test(l)) pdf = true;
		if (l.startsWith('>')) inicio = i + 1;
		else if (l === '---' && titulo) {
			inicio = i + 1;
			break;
		}
	}
	return { titulo, url, baixadoEm, pdf, inicio };
}

/**
 * Número da norma a partir do título ("Lei no 12.527/2011 - …" → "12.527/2011").
 * @param {string} titulo
 */
export function numeroDaNorma(titulo) {
	const m = /\bn[oº°]\s*([\d.]+\/\d{4})/.exec(titulo) ?? /(\d[\d.]*\/\d{4})/.exec(titulo);
	return m ? m[1] : undefined;
}

/**
 * Texto extraído de PDF vem com linha quebrada no meio da frase: emenda a linha à anterior
 * quando a anterior não termina em pontuação e a atual não abre dispositivo.
 * @param {string[]} linhas
 * @param {number} fixas quantas linhas do início nunca recebem emenda (título de item)
 */
export function emendarLinhas(linhas, fixas = 0) {
	/** @type {string[]} */
	const saida = [];
	for (const l of linhas) {
		const ant = saida[saida.length - 1];
		if (
			ant !== undefined &&
			saida.length > fixas &&
			!/[.:;!?]["”)]?$/.test(ant) &&
			!RE_ESTRUTURA.test(l)
		) {
			saida[saida.length - 1] = `${ant} ${l}`;
		} else saida.push(l);
	}
	return saida;
}

/**
 * Parte uma linha maior que `max` em pedaços, preferindo fim de frase, depois espaço.
 * @param {string} linha
 * @param {number} max
 */
export function partirLinha(linha, max = MAX_TELA) {
	if (linha.length <= max) return [linha];
	/** @param {string} s @param {RegExp} sep */
	const juntar = (s, sep) => {
		/** @type {string[]} */
		const pedacos = [];
		let atual = '';
		for (const parte of s.split(sep)) {
			const cand = atual ? `${atual} ${parte}` : parte;
			if (cand.length <= max) atual = cand;
			else {
				if (atual) pedacos.push(atual);
				atual = parte;
			}
		}
		if (atual) pedacos.push(atual);
		return pedacos;
	};
	/** @type {string[]} */
	const saida = [];
	for (const frase of juntar(linha, /(?<=[.;:!?])\s+/)) {
		if (frase.length <= max) {
			saida.push(frase);
			continue;
		}
		for (const bloco of juntar(frase, /\s+/)) {
			for (let i = 0; i < bloco.length; i += max) saida.push(bloco.slice(i, i + max));
		}
	}
	return saida;
}

/**
 * Agrupa linhas em telas de até `max` caracteres, quebrando só entre linhas.
 * @param {string[]} linhas
 * @param {number} max
 * @returns {{ telas: string[], revogados: number[] }}
 */
export function montarTelas(linhas, max = MAX_TELA) {
	/** @type {string[][]} */
	const telas = [];
	/** @type {string[]} */
	let atual = [];
	let tamanho = 0;
	/** @type {number[]} */
	const revogados = [];
	let indice = 0;
	for (const linha of linhas) {
		const revogada = RE_REVOGADO.test(linha);
		for (const pedaco of partirLinha(linha, max)) {
			const novo = atual.length ? tamanho + 1 + pedaco.length : pedaco.length;
			if (atual.length && novo > max) {
				telas.push(atual);
				atual = [pedaco];
				tamanho = pedaco.length;
			} else {
				atual.push(pedaco);
				tamanho = novo;
			}
			if (revogada) revogados.push(indice);
			indice++;
		}
	}
	if (atual.length) telas.push(atual);
	return { telas: telas.map((t) => t.join('\n')), revogados };
}

/**
 * @param {string | null} anterior
 * @param {string} atual
 */
function ehSucessor(anterior, atual) {
	if (anterior === null) return atual === '1';
	if (atual === `${anterior}.1`) return true;
	const p = anterior.split('.').map(Number);
	for (let k = p.length; k >= 1; k--) {
		const cand = [...p.slice(0, k - 1), p[k - 1] + 1].join('.');
		if (cand === atual) return true;
	}
	return false;
}

/** @param {string} s */
function quaseMaiusculo(s) {
	const letras = s.replace(/[^A-Za-zÀ-ÿ]/g, '');
	if (!letras) return false;
	const maiusculas = letras.replace(/[^A-ZÀ-Þ]/g, '').length;
	return maiusculas / letras.length >= 0.8;
}

/**
 * `escopo` separa corpo, ADCT e cada anexo: a mesma chave em escopos diferentes é outro artigo.
 * @typedef {{ rotulo: string, chave?: string, escopo?: string, linhas: string[], item?: boolean }} Trecho
 */

/**
 * Artigos: de `Art. N` até o próximo `Art.`, cabeçalho `#` ou fecho (assinatura, "Este texto
 * não substitui…"). Depois do ADCT o rótulo ganha "ADCT"; dentro de anexo, "Anexo N".
 * Depois de "Este texto não substitui…" (fora de ADCT/anexo) vem outro ato — partes vetadas
 * promulgadas depois, lei de conversão com "Art. 37 ......" — e os artigos são ignorados.
 * Rótulo malformado por OCR ("Art. 5 7.") não abre artigo: o trecho é ignorado com aviso.
 * @param {string[]} linhas corpo (sem cabeçalho), já sem linhas vazias
 * @returns {{ trechos: Trecho[], foraAnexo: number, anexos: { prefixo: string, linhas: string[] }[], aposFim: number, malformados: string[] }}
 */
export function segmentarArtigos(linhas) {
	/** @type {Trecho[]} */
	const trechos = [];
	/** @type {Trecho | null} */
	let atual = null;
	let prefixo = '';
	let depoisDoFim = false;
	let foraAnexo = 0;
	let aposFim = 0;
	/** @type {string[]} */
	const malformados = [];
	/** @type {{ prefixo: string, linhas: string[] }[]} */
	const anexos = [];
	/** @type {{ prefixo: string, linhas: string[] } | null} */
	let anexo = null;
	for (const l of linhas) {
		let m;
		if (RE_ADCT.test(l)) {
			atual = null;
			anexo = null;
			depoisDoFim = false;
			prefixo = 'ADCT';
			continue;
		}
		if ((m = RE_ANEXO.exec(l)) && (l.startsWith('#') || l.length < 60)) {
			atual = null;
			depoisDoFim = false;
			prefixo = m[1] ? `Anexo ${m[1]}` : 'Anexo';
			anexo = anexos.find((a) => a.prefixo === prefixo) ?? null;
			if (!anexo) anexos.push((anexo = { prefixo, linhas: [] }));
			continue;
		}
		if (l.startsWith('#') || RE_TERMINADOR.test(l)) {
			atual = null;
			if (RE_FIM_TEXTO.test(l) && !prefixo.startsWith('Anexo')) depoisDoFim = true;
			if (anexo && l.startsWith('#')) anexo.linhas.push(l);
			continue;
		}
		if (RE_ART_MALFORMADO.test(l)) {
			atual = null;
			malformados.push(l.length > 40 ? `${l.slice(0, 40)}…` : l);
			continue;
		}
		if ((m = RE_ART.exec(l))) {
			if (depoisDoFim) {
				atual = null;
				aposFim++;
				continue;
			}
			const chave = `${m[1]}${m[3] ? `-${m[3]}` : ''}`;
			const rotuloArt = `Art. ${m[1]}${m[2] ? 'º' : ''}${m[3] ? `-${m[3]}` : ''}`;
			atual = { rotulo: prefixo ? `${prefixo} ${rotuloArt}` : rotuloArt, chave, escopo: prefixo, linhas: [l] };
			trechos.push(atual);
			continue;
		}
		if (atual) atual.linhas.push(l);
		else if (anexo) {
			foraAnexo += l.length;
			anexo.linhas.push(l);
		}
	}
	return { trechos, foraAnexo, anexos, aposFim, malformados };
}

/**
 * Texto do planalto perde o tachado: artigo alterado aparece duas vezes, a redação antiga
 * primeiro. No mesmo escopo e com a mesma chave, vale a última ocorrência; as anteriores
 * são versões substituídas. Mantém a ordem da última ocorrência.
 * @param {Trecho[]} trechos
 * @returns {{ vigentes: Trecho[], substituidos: number }}
 */
export function ultimaRedacao(trechos) {
	/** @type {Map<string, number>} */
	const ultima = new Map();
	trechos.forEach((t, i) => {
		if (t.chave !== undefined) ultima.set(`${t.escopo ?? ''}|${t.chave}`, i);
	});
	const vigentes = trechos.filter(
		(t, i) => t.chave === undefined || ultima.get(`${t.escopo ?? ''}|${t.chave}`) === i
	);
	return { vigentes, substituidos: trechos.length - vigentes.length };
}

/** @param {string} r */
function romanoParaNumero(r) {
	/** @type {Record<string, number>} */
	const v = { I: 1, V: 5, X: 10, L: 50, C: 100 };
	let total = 0;
	for (let i = 0; i < r.length; i++) {
		const a = v[r[i]];
		const b = v[r[i + 1]] ?? 0;
		total += a < b ? -a : a;
	}
	return total;
}

/**
 * Anexo em prosa sem `Art.`: parágrafos numerados `1.`, `2.`… (Referencial Técnico da IN SFC
 * 3/2017) ou regras em romano `I -`, `II -`… (Código de Ética do Decreto 1.171/1994). A
 * numeração tem de seguir de 1 em 1 a partir de 1; número repetido é nova redação (vale a
 * última). Título (`#`) e subtítulo de seção sem `#` fecham o item; glossário/referências
 * encerram.
 * @param {string[]} linhas linhas do anexo fora de artigo (com os títulos `#`)
 * @param {string} nomeAnexo rótulo base ("Referencial", "Código de Ética", "Anexo")
 * @returns {{ trechos: Trecho[], substituidos: number }}
 */
export function segmentarParagrafosAnexo(linhas, nomeAnexo) {
	const subtitulos = subtitulosDeSecao(linhas);
	/** @param {RegExp} re @param {(s: string) => number} valor @param {string} palavra */
	const tentar = (re, valor, palavra) => {
		/** @type {Trecho[]} */
		const trechos = [];
		/** @type {Trecho | null} */
		let atual = null;
		let ultimo = 0;
		for (const [i, bruta] of linhas.entries()) {
			const l = bruta.replace(/^#+\s*/, '');
			if (RE_FIM_ITENS.test(l)) break;
			if (bruta.startsWith('#') || subtitulos.has(i)) {
				atual = null;
				continue;
			}
			const m = re.exec(l);
			if (m) {
				const n = valor(m[1]);
				if (n === ultimo + 1 || (n === ultimo && n > 0)) {
					ultimo = n;
					atual = { rotulo: `${nomeAnexo} ${palavra} ${m[1]}`, chave: m[1], escopo: nomeAnexo, linhas: [l], item: true };
					trechos.push(atual);
					continue;
				}
			}
			if (atual) atual.linhas.push(l);
		}
		return trechos;
	};
	const arabicos = tentar(RE_PARAGRAFO, Number, 'item');
	const romanos = tentar(RE_ROMANO, romanoParaNumero, 'inciso');
	const melhor = romanos.length > arabicos.length ? romanos : arabicos;
	if (melhor.length < MIN_ITENS) return { trechos: [], substituidos: 0 };
	const { vigentes, substituidos } = ultimaRedacao(melhor);
	return { trechos: vigentes, substituidos };
}

/**
 * Subtítulo de seção sem `#` no anexo ("Gerenciamento de Recursos", "Programa de Trabalho"):
 * sequência de linhas curtas, com maiúscula inicial, sem pontuação final e que não abrem
 * dispositivo, logo depois de uma linha que fecha frase (`.;:)`) ou de um título `#`, e logo
 * antes de parágrafo numerado, de título `#` ou do fim do anexo. Fecha o item anterior e não
 * entra no texto de nenhum. Linha sem ponto no fim do próprio parágrafo ("…autoridade
 * competente") não passa: a anterior termina no meio da frase.
 * @param {string[]} linhas
 * @returns {Set<number>} índices das linhas que são subtítulo
 */
function subtitulosDeSecao(linhas) {
	/** @param {string} l */
	const forma = (l) =>
		l.length <= 80 && /^[A-ZÀ-Ú]/.test(l) && !/[.;:,!?)]$/.test(l) && !RE_ESTRUTURA.test(l) && !RE_FIM_ITENS.test(l);
	/** @type {Set<number>} */
	const achados = new Set();
	for (let i = 0; i < linhas.length; i++) {
		const antes = linhas[i - 1] ?? '';
		if (!forma(linhas[i]) || linhas[i].startsWith('#')) continue;
		if (!(antes.startsWith('#') || /[.;:)]$/.test(antes))) continue;
		let fim = i;
		while (fim + 1 < linhas.length && !linhas[fim + 1].startsWith('#') && forma(linhas[fim + 1])) fim++;
		const depois = linhas[fim + 1];
		if (depois === undefined || depois.startsWith('#') || RE_PARAGRAFO.test(depois) || RE_ROMANO.test(depois)) {
			for (let k = i; k <= fim; k++) achados.add(k);
		}
		i = fim;
	}
	return achados;
}

/**
 * Nome do anexo pelo título na primeira linha de texto dele.
 * @param {string[]} linhas
 */
function nomeDoAnexo(linhas) {
	const primeira = linhas.find((l) => !l.startsWith('#')) ?? '';
	if (/^REFERENCIAL/i.test(primeira)) return 'Referencial';
	if (/^Código de Ética/i.test(primeira)) return 'Código de Ética';
	return 'Anexo';
}

/**
 * Cabeçalho/rodapé corrido de página de PDF ("Ministério da Transparência…", "Brasília, dez.
 * 2017"): linha curta, que não abre dispositivo, repetida `MIN_REPETICAO_CABECALHO` vezes ou
 * mais. Sai antes de segmentar e emendar, para não cair no meio da frase.
 * @param {string[]} linhas
 * @returns {{ linhas: string[], removidas: string[] }}
 */
export function removerCabecalhosPdf(linhas) {
	/** @type {Map<string, number>} */
	const contagem = new Map();
	for (const l of linhas) contagem.set(l, (contagem.get(l) ?? 0) + 1);
	const repetidas = new Set(
		[...contagem]
			.filter(
				([l, n]) =>
					n >= MIN_REPETICAO_CABECALHO &&
					l.length <= 120 &&
					// fim de frase repetido ("trabalho.") é texto, não cabeçalho
					!/[.;:!?]["”)]?$/.test(l) &&
					!RE_ESTRUTURA.test(l) &&
					!l.startsWith('#')
			)
			.map(([l]) => l)
	);
	return { linhas: linhas.filter((l) => !repetidas.has(l)), removidas: [...repetidas].sort() };
}

/**
 * Itens numerados (`1`, `1.1`, `1.1.1`…) em sequência válida; ignora sumário (linha com
 * pontilhado) e notas de rodapé (número fora de sequência ou título que não é maiúsculo).
 * @param {string[]} linhas
 * @returns {Trecho[]}
 */
function segmentarItens(linhas) {
	/** @type {Trecho[]} */
	const trechos = [];
	/** @type {Trecho | null} */
	let atual = null;
	/** @type {string | null} */
	let ultimo = null;
	for (const bruta of linhas) {
		if (RE_ANEXO.test(bruta) && bruta.startsWith('#')) break;
		const l = bruta.replace(/^#+\s*/, '');
		if (RE_FIM_ITENS.test(l)) {
			// referências, glossário e apêndices não pertencem ao último item
			atual = null;
			continue;
		}
		if (RE_SUMARIO.test(l)) continue;
		const m = RE_ITEM.exec(l);
		if (
			m &&
			m[2].length <= 120 &&
			ehSucessor(ultimo, m[1]) &&
			(m[1].includes('.') || quaseMaiusculo(m[2]))
		) {
			ultimo = m[1];
			atual = { rotulo: `Item ${m[1]}`, linhas: [l], item: true };
			trechos.push(atual);
			continue;
		}
		if (atual) atual.linhas.push(l);
	}
	return trechos.filter((t) => t.linhas.length > 1);
}

/**
 * @param {string} nome nome do arquivo sem `.md`
 * @param {string} texto conteúdo do arquivo
 * @param {string} materia id da matéria
 * @returns {{ posts: any[], chaves: Set<string>, descartados: number, substituidos: number, avisos: string[], pulado?: string }}
 */
export function importarLei(nome, texto, materia) {
	const todas = texto.replace(/^﻿/, '').split(/\r?\n/);
	const cab = lerCabecalho(todas);
	/** @type {string[]} */
	const avisos = [];
	let corpo = todas
		.slice(cab.inicio)
		.map((l) => l.trim())
		.filter((l) => l !== '');
	if (cab.pdf) {
		corpo = corpo.filter((l) => !/^\d{1,4}$/.test(l));
		const cabecalhos = removerCabecalhosPdf(corpo);
		corpo = cabecalhos.linhas;
		if (cabecalhos.removidas.length) {
			avisos.push(`${nome}: cabeçalho/rodapé de página removido: ${cabecalhos.removidas.map((l) => `"${l}"`).join(', ')}`);
		}
	}
	const temArtigos = corpo.some((l) => RE_ART.test(l));

	/** @type {Trecho[]} */
	let trechos;
	let substituidos = 0;
	if (temArtigos) {
		const seg = segmentarArtigos(corpo);
		const ultima = ultimaRedacao(seg.trechos);
		trechos = ultima.vigentes;
		substituidos = ultima.substituidos;
		if (seg.malformados.length) {
			avisos.push(`${nome}: rótulo de artigo malformado ignorado: ${seg.malformados.map((l) => `"${l}"`).join(', ')}`);
		}
		if (seg.aposFim) {
			avisos.push(`${nome}: ${seg.aposFim} artigo(s) depois de "Este texto não substitui…" ignorados (outro ato)`);
		}
		/** @type {string[]} */
		const naoImportados = [];
		let foraAnexo = 0;
		for (const anexo of seg.anexos) {
			const tamanho = anexo.linhas.filter((l) => !l.startsWith('#')).reduce((s, l) => s + l.length, 0);
			const par = segmentarParagrafosAnexo(anexo.linhas, nomeDoAnexo(anexo.linhas));
			if (par.trechos.length) {
				trechos.push(...par.trechos);
				substituidos += par.substituidos;
			} else if (tamanho) {
				naoImportados.push(anexo.prefixo);
				foraAnexo += tamanho;
			}
		}
		if (foraAnexo > 2000) {
			avisos.push(`${nome}: ${naoImportados.join(', ')} com ${foraAnexo} caracteres fora de artigo, não importados`);
		}
	} else {
		trechos = segmentarItens(corpo);
		if (trechos.length < MIN_ITENS) {
			return {
				posts: [],
				chaves: new Set(),
				descartados: 0,
				substituidos: 0,
				avisos,
				pulado: `${nome}: sem "Art." e só ${trechos.length} itens numerados válidos (mínimo ${MIN_ITENS})`
			};
		}
	}

	/** @type {any[]} */
	const posts = [];
	const chaves = new Set();
	/** @type {Map<string, number>} */
	const usados = new Map();
	let descartados = 0;
	const numero = numeroDaNorma(cab.titulo);
	for (const t of trechos) {
		// item de manual abre com título (não emenda); parágrafo de anexo abre com texto corrido
		const fixas = t.item && t.chave === undefined ? 1 : 0;
		const linhas = cab.pdf ? emendarLinhas(t.linhas, fixas) : t.linhas;
		// artigo (ou parágrafo de anexo) cuja redação vigente é revogada/vetada sai inteiro
		if (t.chave !== undefined && RE_REVOGADO.test(linhas[0])) {
			descartados++;
			continue;
		}
		if (t.chave !== undefined && !t.item) chaves.add(t.chave);
		const base = slug(t.rotulo);
		const n = (usados.get(base) ?? 0) + 1;
		usados.set(base, n);
		const { telas, revogados } = montarTelas(linhas);
		/** @type {any} */
		const post = {
			id: `l:${nome}:${n > 1 ? `${base}-${n}` : base}`,
			tipo: 'lei',
			materia,
			fonte: cab.url?.startsWith('https://')
				? { rotulo: cab.titulo, arquivo: `leis-secas/${nome}.md`, url: cab.url }
				: { rotulo: cab.titulo, arquivo: `leis-secas/${nome}.md` },
			norma: numero
				? { arquivo: `leis-secas/${nome}.md`, titulo: cab.titulo, numero }
				: { arquivo: `leis-secas/${nome}.md`, titulo: cab.titulo },
			artigo: t.rotulo,
			telas
		};
		if (revogados.length) post.revogados = revogados;
		posts.push(post);
	}
	return { posts, chaves, descartados, substituidos, avisos };
}

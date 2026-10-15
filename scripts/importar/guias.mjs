/**
 * Guia de conteúdo programático da P3 (`GUIA CGU 2026 AFFC <cargo> P3.md`, na raiz do vault) → posts
 * do feed. Cada subitem `#### E3 · 6.4 — Prioridade alta` vira um resumo (o que estudar, fontes e
 * prioridade, em telas de até 600 caracteres) e um flashcard Certo/Errado por pegadinha da parte
 * (D). O texto foi gerado por IA e não revisado: todo post sai com `conferido: false`.
 * Plano: planos/2026-10-15-guia-infraestrutura-no-feed.md.
 */
import { MAX_TEXTO_TELA } from './feed-conteudo.mjs';

/** Guia (nome do arquivo na raiz do vault) → prefixo da P3 em `disciplinas.mjs`. */
export const GUIAS = {
	'GUIA CGU 2026 AFFC Infraestrutura P3.md': 'infra'
};

const MAX_TELAS = 8;
const SUBITEM = /^####\s+(E[1-9])\s+·\s+(\d+\.\d+)\s+—\s+Prioridade\s+(\S+)\s*$/;

/**
 * Markdown do guia → texto corrido da tela, que o feed mostra sem formatação.
 * @param {string} s
 */
export function textoPlano(s) {
	// O código entre crases sai intacto (`COUNT(*)` não pode perder o asterisco).
	/** @type {string[]} */
	const codigos = [];
	return s
		.replace(/`([^`]+)`/g, (_, c) => `\u0000${codigos.push(c) - 1}\u0000`)
		.replace(/\[([^\]]+)\]\(<?[^)>]+>?\)/g, '$1')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/(^|[\s(“"])\*([^*\s][^*]*?)\*(?=[\s).,;:!?”"]|$)/g, '$1$2')
		.replace(/\u0000(\d+)\u0000/g, (_, i) => codigos[Number(i)]);
}

/** Linhas de tabela GFM viram "a · b · c"; a linha de separação sai. @param {string[]} linhas */
function semTabela(linhas) {
	return linhas
		.filter((l) => !/^\s*\|[\s:|-]+\|\s*$/.test(l))
		.map((l) =>
			/^\s*\|/.test(l)
				? l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()).filter(Boolean).join(' · ')
				: l
		);
}

/** Trecho maior que a tela é cortado em frases. @param {string} texto */
function emFrases(texto) {
	if (texto.length <= MAX_TEXTO_TELA) return [texto];
	/** @type {string[]} */
	const pedacos = [];
	let atual = '';
	for (const frase of texto.split(/(?<=[.;:])\s+/)) {
		const junto = atual ? `${atual} ${frase}` : frase;
		if (junto.length <= MAX_TEXTO_TELA) atual = junto;
		else {
			if (atual) pedacos.push(atual);
			// Frase sozinha acima do limite: corta em palavras.
			let resto = frase;
			while (resto.length > MAX_TEXTO_TELA) {
				const corte = resto.lastIndexOf(' ', MAX_TEXTO_TELA - 1);
				const fim = corte > 0 ? corte : MAX_TEXTO_TELA - 1;
				pedacos.push(`${resto.slice(0, fim)}…`);
				resto = resto.slice(fim).trimStart();
			}
			atual = resto;
		}
	}
	if (atual) pedacos.push(atual);
	return pedacos;
}

/**
 * Blocos de lista (o tópico de 1º nível com os filhos) empacotados em telas de até 600 caracteres.
 * @param {string} md
 */
export function emTelas(md) {
	// Bloco de código cercado por ``` fica inteiro e sem limpeza de markdown, dentro do bloco de
	// lista em que aparece; a cerca sai.
	// Cada bloco é uma lista de trechos; o trecho de código é uma consulta inteira.
	/** @type {{ codigo: boolean, linhas: string[] }[][]} */
	const blocos = [];
	let emCodigo = false;
	for (const bruta of md.split(/\r?\n/)) {
		if (/^\s*```/.test(bruta)) {
			emCodigo = !emCodigo;
			if (emCodigo && blocos.length) blocos[blocos.length - 1].push({ codigo: true, linhas: [] });
			continue;
		}
		if (!bruta.trim()) continue;
		const l = emCodigo ? bruta : semTabela([textoPlano(bruta)])[0];
		if (l === undefined) continue;
		if (!emCodigo && (/^\S/.test(l) || !blocos.length)) blocos.push([{ codigo: false, linhas: [l] }]);
		else {
			if (!blocos.length) blocos.push([]);
			const b = blocos[blocos.length - 1];
			const ultimo = b[b.length - 1];
			if (ultimo && ultimo.codigo === emCodigo && (emCodigo || !ultimo.codigo)) ultimo.linhas.push(l);
			else b.push({ codigo: emCodigo, linhas: [l] });
		}
	}
	/** @type {string[]} */
	const pecas = [];
	for (const b of blocos) {
		const texto = b.map((t) => t.linhas.join('\n')).filter(Boolean).join('\n');
		if (texto.length <= MAX_TEXTO_TELA) {
			pecas.push(texto);
			continue;
		}
		for (const t of b) {
			const junto = t.linhas.join('\n');
			if (t.codigo && junto.length <= MAX_TEXTO_TELA) pecas.push(junto);
			else for (const l of t.linhas) pecas.push(...emFrases(l));
		}
	}
	/** @type {string[]} */
	const telas = [];
	for (const p of pecas) {
		const ultima = telas[telas.length - 1];
		if (ultima !== undefined && ultima.length + 1 + p.length <= MAX_TEXTO_TELA) telas[telas.length - 1] = `${ultima}\n${p}`;
		else telas.push(p);
	}
	return telas;
}

/**
 * Corpo de uma parte "**(X) …**" do subitem, até a próxima parte.
 * @param {string} corpo
 * @param {string} letra
 */
function parte(corpo, letra) {
	const m = new RegExp(String.raw`\*\*\(${letra}\)([^*]*)\*\*([^\n]*)\n?([\s\S]*?)(?=\n\*\*\([A-E]\)|$)`).exec(corpo);
	if (!m) return null;
	return { rotulo: m[1].trim().replace(/\.$/, ''), linha: m[2].trim(), resto: m[3].trim() };
}

/** Divide `n` telas em partes de no máximo 8, do mesmo tamanho. @param {number} n */
function tamanhosDasPartes(n) {
	const partes = Math.ceil(n / MAX_TELAS);
	const base = Math.floor(n / partes);
	return Array.from({ length: partes }, (_, i) => base + (i < n % partes ? 1 : 0));
}

/**
 * @param {string} arquivo nome do guia na raiz do vault
 * @param {string} texto
 * @returns {{ posts: any[], avisos: string[] }}
 */
export function importarGuia(arquivo, texto) {
	const prefixo = GUIAS[/** @type {keyof typeof GUIAS} */ (arquivo)];
	if (!prefixo) throw new Error(`guia sem prefixo em GUIAS (guias.mjs): ${arquivo}`);
	const chave = `guia-${prefixo}`;
	/** @type {any[]} */
	const posts = [];
	/** @type {string[]} */
	const avisos = [];
	const linhas = texto.split(/\r?\n/);
	for (let i = 0; i < linhas.length; i++) {
		const m = SUBITEM.exec(linhas[i]);
		if (!m) continue;
		const [, disc, num, prioridade] = m;
		let fim = i + 1;
		while (fim < linhas.length && !/^#{1,4}\s/.test(linhas[fim])) fim++;
		const corpo = linhas.slice(i + 1, fim).join('\n');
		const cod = `${disc} ${num}`;
		const a = parte(corpo, 'A');
		const b = parte(corpo, 'B');
		const c = parte(corpo, 'C');
		const d = parte(corpo, 'D');
		const e = parte(corpo, 'E');
		if (!a || !b || !e) {
			avisos.push(`${arquivo}: ${cod} sem as partes (A), (B) ou (E); subitem fora do feed`);
			continue;
		}
		const edital = textoPlano(a.linha).trim();
		const subtopico = `${cod} · Prioridade ${prioridade}`;
		const fonte = { rotulo: `${arquivo.replace(/\.md$/, '')}, ${cod}`, arquivo };
		const id = `${chave}:${disc}-${num}`;

		/** @type {{ titulo: string, texto: string }[]} */
		const telas = emTelas([b.linha, b.resto].filter(Boolean).join('\n')).map((t, k, todas) => ({
			titulo: todas.length > 1 ? `O que estudar (${k + 1}/${todas.length})` : 'O que estudar',
			texto: t
		}));
		const fontes = c ? emTelas([c.linha, c.resto].filter(Boolean).join('\n'))[0] : undefined;
		if (fontes) telas.push({ titulo: 'Fontes', texto: fontes });
		telas.push({ titulo: `Prioridade ${prioridade}`, texto: emFrases(textoPlano([e.linha, e.resto].filter(Boolean).join(' ')))[0] });
		if (telas.length < 3) telas.unshift({ titulo: 'Texto do edital', texto: emFrases(edital)[0] });

		const tamanhos = tamanhosDasPartes(telas.length);
		let ini = 0;
		tamanhos.forEach((n, k) => {
			const titulo = tamanhos.length > 1 ? `${cod} · ${edital} (parte ${k + 1} de ${tamanhos.length})` : `${cod} · ${edital}`;
			posts.push({
				id: `r:${id}${tamanhos.length > 1 ? `:${k + 1}` : ''}`,
				tipo: 'resumo',
				materia: '',
				subtopico,
				fonte,
				titulo,
				telas: telas.slice(ini, ini + n),
				conferido: false
			});
			ini += n;
		});

		const pegadinhas = d ? [d.linha, d.resto].join('\n').split(/\r?\n/).filter((l) => l.trim()) : [];
		let n = 0;
		for (const l of pegadinhas) {
			const p = /^-\s+\*Afirmação errada:\*\s*(.+?)\s*→\s*\*Certo:\*\s*(.+)$/.exec(l.trim());
			if (!p) {
				avisos.push(`${arquivo}: ${cod}, pegadinha fora do formato "*Afirmação errada:* … → *Certo:* …": ${l.slice(0, 60)}`);
				continue;
			}
			n++;
			const certo = textoPlano(p[2]).trim();
			posts.push({
				id: `f:${id}:${n}`,
				tipo: 'flashcard',
				materia: '',
				subtopico,
				fonte,
				pergunta: `Certo ou errado? ${textoPlano(p[1]).trim()}`,
				resposta: `Errado. ${certo.charAt(0).toUpperCase()}${certo.slice(1)}`,
				conferido: false
			});
		}
	}
	return { posts, avisos };
}

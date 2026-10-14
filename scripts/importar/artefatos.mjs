/**
 * Artefatos do vault servidos pelo painel (plano planos/2026-10-14-artefatos-no-git.md).
 *
 * Fonte: `artifacts/_publicar/*.html`, gerados no vault por `scripts/montar_artifacts.py`. Lá
 * eles são fragmentos (`<title>`, `<style>`, corpo, `<script>`), porque o claude.ai acrescenta o
 * esqueleto ao publicar; aqui ganham o esqueleto e os links `claude.ai/artifact/<id>` entre eles
 * viram caminhos do painel, com a âncora (`#cd`, `#aud`) mantida.
 */

/** Onde cada artefato fica no painel: `static/conteudo/` + `arquivo`. */
export const ARTEFATOS = [
	{ id: 'Jjm6kekrZGBneHmJNvgUPN', fonte: 'prioridades-edital.html', arquivo: 'artefatos/prioridades.html' },
	{ id: 'M5gJa9q3po9iCyLNzkFxdF', fonte: 'missoes-cgu-2026.html', arquivo: 'artefatos/missoes.html' },
	{ id: 'Q4MYW9Fpk7eg4oKnv36H12', fonte: null, arquivo: 'artefatos/raiox.html' }
];

const LINK_RE = /https:\/\/claude\.ai\/artifact\/([A-Za-z0-9]+)/g;

/**
 * Troca os links para artefatos do claude.ai pelos caminhos do painel. Só troca os que este
 * import gera (`gerados`); um artefato conhecido que ainda não é gerado aqui segue no claude.ai.
 * Id desconhecido é erro: link para um artefato que ninguém sabe onde fica.
 * @param {string} html
 * @param {Set<string>} gerados ids gerados neste import
 * @param {string} onde nome do arquivo, para a mensagem de erro
 */
export function trocarLinks(html, gerados, onde) {
	return html.replace(LINK_RE, (url, id) => {
		const a = ARTEFATOS.find((x) => x.id === id);
		if (!a) throw new Error(`${onde}: link para artefato desconhecido ${url}`);
		return gerados.has(id) ? `/conteudo/${a.arquivo}` : url;
	});
}

/**
 * Fragmento do claude.ai → página completa. O `<title>` do fragmento sobe para o `<head>`.
 * @param {string} fragmento
 */
export function envolver(fragmento) {
	const m = /<title>[\s\S]*?<\/title>\s*/.exec(fragmento);
	const titulo = m ? m[0].trim() : '';
	const corpo = m ? fragmento.slice(0, m.index) + fragmento.slice(m.index + m[0].length) : fragmento;
	return [
		'<!doctype html>',
		'<html lang="pt-BR">',
		'<head>',
		'<meta charset="utf-8">',
		'<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
		...(titulo ? [titulo] : []),
		'</head>',
		'<body>',
		corpo.trim(),
		'</body>',
		'</html>',
		''
	].join('\n');
}

/**
 * @param {Record<string, string>} fontes conteúdo de cada `fonte` de ARTEFATOS presente no vault
 * @returns {{ arquivo: string, conteudo: string }[]}
 */
export function montarArtefatos(fontes) {
	const presentes = ARTEFATOS.filter((a) => a.fonte && fontes[a.fonte] !== undefined);
	const gerados = new Set(presentes.map((a) => a.id));
	return presentes.map((a) => ({
		arquivo: a.arquivo,
		conteudo: envolver(trocarLinks(/** @type {string} */ (fontes[/** @type {string} */ (a.fonte)]), gerados, a.fonte ?? a.arquivo))
	}));
}

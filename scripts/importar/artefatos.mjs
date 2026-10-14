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
	// O Raio-X não vem de _publicar/: é montado por montarRaiox, de artifacts/raiox/.
	{ id: 'Q4MYW9Fpk7eg4oKnv36H12', fonte: null, arquivo: 'artefatos/raiox.html' }
];

/**
 * O tema escolhido no app (Ajustes) vale também aqui: Kindle escuro é `data-theme="dark"`, Aventura
 * e Kindle são `light`, e "sistema" deixa o CSS seguir o aparelho. Roda antes da primeira pintura e
 * acompanha a troca feita em outra aba. Mesma chave de src/lib/tema.svelte.ts.
 */
export const TEMA_ARTEFATO = `<script>
(function () {
  function aplicar() {
    var t = null;
    try { t = (JSON.parse(localStorage.getItem('painel-concurso:tema:v1') || 'null') || {}).tema; } catch (e) {}
    var v = t === 'kindle-escuro' ? 'dark' : t === 'aventura' || t === 'kindle' ? 'light' : null;
    if (v) document.documentElement.setAttribute('data-theme', v);
    else document.documentElement.removeAttribute('data-theme');
  }
  aplicar();
  addEventListener('storage', function (e) { if (e.key === null || e.key === 'painel-concurso:tema:v1') aplicar(); });
})();
</script>`;

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
		TEMA_ARTEFATO,
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
 * @param {boolean} [comRaiox] o Raio-X também é gerado neste import (os links para ele viram locais)
 * @returns {{ arquivo: string, conteudo: string }[]}
 */
export function montarArtefatos(fontes, comRaiox = false) {
	const presentes = ARTEFATOS.filter((a) => a.fonte && fontes[a.fonte] !== undefined);
	const gerados = new Set(presentes.map((a) => a.id));
	if (comRaiox) gerados.add('Q4MYW9Fpk7eg4oKnv36H12');
	return presentes.map((a) => ({
		arquivo: a.arquivo,
		conteudo: envolver(trocarLinks(/** @type {string} */ (fontes[/** @type {string} */ (a.fonte)]), gerados, a.fonte ?? a.arquivo))
	}));
}

/**
 * Tokens que a página do Raio-X espera do tipo "dashboard" do claude.ai, com a paleta e as
 * fontes das Missões, claro e escuro (o escuro também por `data-theme`, como nas Missões).
 */
const TOKENS_RAIOX = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
:root {
  color-scheme: light;
  --font-anthropic-sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
  --font-anthropic-serif: "Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif;
  --color-bg: #f5f7f8; --color-panel: #ffffff; --color-fg: #15233a; --color-fg-muted: #5b6878;
  --color-border-line: #d9e0e6; --color-bad: #b01f4a;
  --cds-gap-sm: 8px; --cds-gap-md: 16px; --cds-gap-xl: 32px;
  --cds-pad-xs: 4px; --cds-pad-sm: 8px; --cds-pad-lg: 16px;
  --cds-radius: 10px; --cds-border: #d9e0e6;
  --cds-font-size-title: clamp(28px, 5vw, 40px); --cds-font-size-heading: 18px; --cds-font-size-caption: 13px;
  --cds-font-weight-medium: 600;
  --cds-surface-popover: #ffffff; --cds-shadow-popover: 0 6px 24px rgb(21 35 58 / 0.14);
  --cds-text-secondary: #5b6878;
  --cds-chart-grid: #e6ebef; --cds-chart-axis: #b7c1ca; --cds-chart-muted: #b7c1ca;
  --cds-dur-slow: 300ms;
  --dash-cor-0: #0b6e6b; --dash-cor-1: #3d6aa8; --dash-cor-2: #7a4cc2; --dash-cor-3: #b4521a;
  --dash-cor-4: #b01f4a; --dash-cor-5: #5d7a1f; --dash-cor-6: #8a6d00; --dash-cor-7: #4f5b66;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --color-bg: #0f1520; --color-panel: #161e2b; --color-fg: #e6ebf1; --color-fg-muted: #9aa6b4;
    --color-border-line: #2a3546; --color-bad: #f0668e; --cds-border: #2a3546;
    --cds-surface-popover: #1c2636; --cds-shadow-popover: 0 6px 24px rgb(0 0 0 / 0.5);
    --cds-text-secondary: #9aa6b4;
    --cds-chart-grid: #222c3b; --cds-chart-axis: #3a475a; --cds-chart-muted: #3a475a;
    --dash-cor-0: #4cc2bd; --dash-cor-1: #7fa8e6; --dash-cor-2: #b493ee; --dash-cor-3: #f0915a;
    --dash-cor-4: #f0668e; --dash-cor-5: #a6c95a; --dash-cor-6: #e0c050; --dash-cor-7: #9aa6b4;
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --color-bg: #0f1520; --color-panel: #161e2b; --color-fg: #e6ebf1; --color-fg-muted: #9aa6b4;
  --color-border-line: #2a3546; --color-bad: #f0668e; --cds-border: #2a3546;
  --cds-surface-popover: #1c2636; --cds-shadow-popover: 0 6px 24px rgb(0 0 0 / 0.5);
  --cds-text-secondary: #9aa6b4;
  --cds-chart-grid: #222c3b; --cds-chart-axis: #3a475a; --cds-chart-muted: #3a475a;
  --dash-cor-0: #4cc2bd; --dash-cor-1: #7fa8e6; --dash-cor-2: #b493ee; --dash-cor-3: #f0915a;
  --dash-cor-4: #f0668e; --dash-cor-5: #a6c95a; --dash-cor-6: #e0c050; --dash-cor-7: #9aa6b4;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--color-bg); color: var(--color-fg); font-family: var(--font-anthropic-sans); font-size: 15px; line-height: 1.5; }
#dash-root { padding: 28px 16px 64px; }
.dash-skeleton:empty::before { content: "—"; color: var(--color-fg-muted); }
.rx-irmaos { max-width: 1180px; margin: 0 auto 16px; display: flex; flex-wrap: wrap; gap: 8px; }
.rx-irmaos a { font-weight: 600; font-size: 13.5px; color: var(--color-fg); text-decoration: none; border: 1px solid var(--color-border-line); background: var(--color-panel); border-radius: 999px; padding: 6px 14px; }
.rx-irmaos a:hover { border-color: var(--dash-cor-0); color: var(--dash-cor-0); }
.rx-irmaos a:focus-visible { outline: 2px solid var(--dash-cor-0); outline-offset: 2px; }
</style>`;

/**
 * Raio-X: a página do tipo dashboard, com o substituto de `window.dash` e o d3 vendorizado.
 * @param {{ pagina: string, subitens: string, assuntos: string, dashLocal: string, d3: string, licencaD3: string }} f
 * @returns {{ arquivo: string, conteudo: string }[]}
 */
export function montarRaiox(f) {
	for (const [nome, texto] of [['subitens', f.subitens], ['assuntos', f.assuntos]]) {
		const linhas = JSON.parse(texto);
		if (!Array.isArray(linhas) || !linhas.length) throw new Error(`artifacts/raiox/${nome}.json: esperada uma lista de linhas`);
	}
	const html = [
		'<!doctype html>',
		'<html lang="pt-BR">',
		'<head>',
		'<meta charset="utf-8">',
		'<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
		TEMA_ARTEFATO,
		'<title>Raio-X do Qconcursos</title>',
		TOKENS_RAIOX,
		'</head>',
		'<body>',
		'<div id="dash-root">',
		'<nav class="rx-irmaos" aria-label="Outras páginas">',
		'<a href="/conteudo/artefatos/prioridades.html" target="_blank" rel="noopener">Prioridades do edital →</a>',
		'<a href="/conteudo/artefatos/missoes.html" target="_blank" rel="noopener">Missões até a prova →</a>',
		'</nav>',
		f.pagina.trim(),
		'</div>',
		'</body>',
		'</html>',
		''
	].join('\n');
	// Os scripts da página rodam depois que d3 e dash existem: entram antes do primeiro <script> dela.
	const i = html.indexOf('<script>');
	if (i < 0) throw new Error('artifacts/raiox/index.html: página sem <script>');
	const carga =
		'<script>window.DASH_LOCAL = { datasets: { subitens: "/conteudo/artefatos/raiox-subitens.json", assuntos: "/conteudo/artefatos/raiox-assuntos.json" } };</script>\n' +
		'<script src="/conteudo/artefatos/vendor/d3-7.9.0.min.js"></script>\n' +
		'<script src="/conteudo/artefatos/dash-local.js"></script>\n';
	return [
		{ arquivo: 'artefatos/raiox.html', conteudo: html.slice(0, i) + carga + html.slice(i) },
		{ arquivo: 'artefatos/raiox-subitens.json', conteudo: f.subitens },
		{ arquivo: 'artefatos/raiox-assuntos.json', conteudo: f.assuntos },
		{ arquivo: 'artefatos/dash-local.js', conteudo: f.dashLocal },
		{ arquivo: 'artefatos/vendor/d3-7.9.0.min.js', conteudo: f.d3 },
		{ arquivo: 'artefatos/vendor/d3-LICENSE.txt', conteudo: f.licencaD3 }
	];
}

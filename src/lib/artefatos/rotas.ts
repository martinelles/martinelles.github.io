/**
 * Páginas de artefato (Missões, Prioridades, Raio-X) abertas dentro do app, com a barra de abas:
 * `/conteudo/artefatos/<nome>.html#x` ↔ `/artefato/<nome>#x`. O HTML do vault segue servido onde
 * sempre esteve; a rota do app só o mostra num iframe.
 */
export const PREFIXO_ARTEFATOS = '/conteudo/artefatos/';
export const NOMES_ARTEFATOS = ['missoes', 'prioridades', 'raiox'] as const;
export type NomeArtefato = (typeof NOMES_ARTEFATOS)[number];

export const ehArtefato = (nome: string): nome is NomeArtefato => (NOMES_ARTEFATOS as readonly string[]).includes(nome);

const PAGINA_RE = /^\/conteudo\/artefatos\/([a-z0-9-]+)\.html(#.*)?$/;

/** Caminho do HTML → rota do app; null se não é uma das páginas conhecidas. */
export function rotaDoArtefato(href: string): string | null {
	const m = PAGINA_RE.exec(href);
	return m && ehArtefato(m[1]) ? `/artefato/${m[1]}${m[2] ?? ''}` : null;
}

/** Rota do app → caminho do HTML que o iframe carrega. */
export const paginaDoArtefato = (nome: NomeArtefato, hash = '') => `${PREFIXO_ARTEFATOS}${nome}.html${hash}`;

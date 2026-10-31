import { error } from '@sveltejs/kit';
import { BASE_CONTEUDO } from '$lib/feed/conteudo';
import type { PageLoad } from './$types';

// Rota do mapa mental (planos/2026-10-31-mapas-mentais-nas-missoes.md). O slug é a chave do
// edital com `:` trocado por hífen (`CD:E2-1.2` → `cd-e2-1.2`), o mesmo nome do arquivo que o
// import copia para `/conteudo/mapas/` (scripts/importar/mapas.mjs).
const SLUG = /^[a-z0-9]+(?:-[a-z0-9.]+)+$/;

export const load: PageLoad = async ({ params, fetch }) => {
	if (!SLUG.test(params.slug)) error(404, 'Mapa não encontrado');
	const resposta = await fetch(`${BASE_CONTEUDO}mapas/${params.slug}.svg`);
	if (!resposta.ok) error(404, 'Mapa não encontrado');
	// `cd-e2-1.2` → `E2 1.2`; `b1-8.2` → `B1 8.2`.
	const partes = params.slug.split('-');
	if (partes.length > 2 && (partes[0] === 'cd' || partes[0] === 'aud')) partes.shift();
	return { slug: params.slug, svg: await resposta.text(), rotulo: partes.join(' ').toUpperCase() };
};

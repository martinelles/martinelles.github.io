import { error } from '@sveltejs/kit';
import { dados } from '$lib/dados';
import { carregarAudios } from '$lib/missoes/audios.svelte';
import type { PageLoad } from './$types';

// Rota dos podcasts da aula: `/podcast/e1-2` é o código da aula (`E1·2`) em slug. O catálogo de
// audios (audios.json do importador) é chaveado pelo id da aula; aqui o slug volta a ser aula.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slug = (s: string) =>
	s
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

export const load: PageLoad = async ({ params }) => {
	if (!SLUG.test(params.aula)) error(404, 'Podcast não encontrado');
	const aula = (dados.mentoria?.aulas ?? []).find((a) => {
		const disc = a.disciplina.split(':')[1] ?? a.disciplina;
		const n = a.titulo.match(/^\d+/)?.[0];
		return !!n && slug(`${disc}·${n}`) === params.aula;
	});
	if (!aula) error(404, 'Podcast não encontrado');
	await carregarAudios();
	return { id: aula.id, cod: aula.titulo, titulo: aula.titulo };
};

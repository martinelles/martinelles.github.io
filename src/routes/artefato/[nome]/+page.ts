import { error } from '@sveltejs/kit';
import { ehArtefato } from '$lib/artefatos/rotas';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	if (!ehArtefato(params.nome)) error(404, 'Página não encontrada');
	return { nome: params.nome };
};

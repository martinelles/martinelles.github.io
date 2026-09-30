import { error } from '@sveltejs/kit';
import { buscarFerramenta } from '$lib/dados';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const ferramenta = buscarFerramenta(params.id);
	if (!ferramenta) error(404, 'Ferramenta não encontrada');
	return { ferramenta };
};

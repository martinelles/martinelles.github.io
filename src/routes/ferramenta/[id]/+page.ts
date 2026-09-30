import { error, redirect } from '@sveltejs/kit';
import { buscarFerramenta, rotaDaFerramenta } from '$lib/dados';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const ferramenta = buscarFerramenta(params.id);
	if (!ferramenta) error(404, 'Ferramenta não encontrada');
	// Atalho que virou filtro do feed (FR-015): endereço antigo leva ao feed filtrado.
	const rota = rotaDaFerramenta(ferramenta);
	if (!rota.startsWith('/ferramenta/')) redirect(307, rota);
	return { ferramenta };
};

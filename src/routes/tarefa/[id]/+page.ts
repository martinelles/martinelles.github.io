import { error } from '@sveltejs/kit';
import { carregarPlano } from '$lib/plano/carregar';
import type { PageLoad } from './$types';

// Tarefa do plano (FR-007..FR-009): o id tem de existir no plano importado; senão, 404 local.
export const load: PageLoad = async ({ params }) => {
	const plano = await carregarPlano();
	const tarefa = plano.tarefas.find((t) => t.id === params.id);
	if (!tarefa) error(404, 'Tarefa não encontrada');
	return { plano, tarefa };
};

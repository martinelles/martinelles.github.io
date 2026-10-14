import { error } from '@sveltejs/kit';
import { foco, garantirFoco } from '$lib/feed/foco.svelte';
import { carregarPlanoDe } from '$lib/plano/carregar';
import type { PageLoad } from './$types';

// Tarefa do plano (FR-007..FR-009): o id tem de existir no plano da especialidade; senão, 404 local.
export const load: PageLoad = async ({ params }) => {
	// Aberta direto pelo link, a tarefa carrega antes do layout: o foco ainda não foi lido.
	garantirFoco();
	const plano = await carregarPlanoDe(foco.especialidade.plano);
	const tarefa = plano.tarefas.find((t) => t.id === params.id);
	if (!tarefa) error(404, 'Tarefa não encontrada');
	return { plano, tarefa };
};

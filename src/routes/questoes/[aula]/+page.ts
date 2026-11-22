import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// Rota das questões de certo/errado extraídas do material da aula (PDF do vault →
// /conteudo/questoes-aula/<slug>.json). O gabarito comentado aparece depois de responder.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface QuestaoDaAula {
	n: number;
	texto: string;
}

export interface GabaritoDaAula {
	n: number;
	r: 'C' | 'E';
	comentario: string;
}

export const load: PageLoad = async ({ params, fetch }) => {
	if (!SLUG.test(params.aula)) error(404, 'Questões não encontradas');
	const r = await fetch(`/conteudo/questoes-aula/${params.aula}.json`, { cache: 'force-cache' });
	if (!r.ok) error(404, 'Questões não encontradas');
	const dados = (await r.json()) as { titulo: string; questoes: QuestaoDaAula[]; gabarito: GabaritoDaAula[] };
	if (!dados?.questoes?.length) error(404, 'Questões não encontradas');
	return { slug: params.aula, titulo: dados.titulo, questoes: dados.questoes, gabarito: dados.gabarito };
};

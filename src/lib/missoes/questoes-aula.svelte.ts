/**
 * Questões de certo/errado extraídas do material da aula: o índice
 * `/conteudo/questoes-aula/indice.json` diz quais aulas têm (código → slug da rota /questoes).
 * A missão usa para o atalho; falha de rede deixa sem atalho, como os podcasts.
 */
let indice = $state<Record<string, string> | null>(null);
let carregar: Promise<void> | null = null;

/** Lê o índice uma vez por carga do app (idempotente). */
export function carregarIndiceQuestoes(buscar: typeof fetch = fetch): Promise<void> {
	carregar ??= buscar('/conteudo/questoes-aula/indice.json', { cache: 'no-cache' })
		.then(
			(r) => (r.ok ? (r.json() as Promise<Record<string, string>>) : ({} as Record<string, string>)),
			() => ({}) as Record<string, string>
		)
		.then((d) => {
			indice = d && typeof d === 'object' ? d : {};
		});
	return carregar;
}

export const questoesDaAula = {
	/** Slug da rota `/questoes/<slug>` quando a aula tem questões no painel. */
	slug(cod: string): string | null {
		return indice?.[cod] ?? null;
	}
};

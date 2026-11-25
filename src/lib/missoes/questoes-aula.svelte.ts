/**
 * Questões de certo/errado extraídas do material da aula: o índice
 * `/conteudo/questoes-aula/indice.json` diz quais aulas têm (código → slug da rota /questoes).
 * A missão usa para o atalho; falha de rede deixa sem atalho, como os podcasts.
 * O `indice-rev.json` liga a aula à página de revisão (`<slug>-rev`), redigida a partir das
 * pegadinhas da seção "Como o Cebraspe pode cobrar" do material.
 */
let indice = $state<Record<string, string> | null>(null);
let indiceRev = $state<Record<string, string> | null>(null);
let carregar: Promise<void> | null = null;

/** Lê o índice (e o de revisão) uma vez por carga do app (idempotente). */
export function carregarIndiceQuestoes(buscar: typeof fetch = fetch): Promise<void> {
	carregar ??= Promise.all([
		buscar('/conteudo/questoes-aula/indice.json', { cache: 'no-cache' })
			.then(
				(r) => (r.ok ? (r.json() as Promise<Record<string, string>>) : ({} as Record<string, string>)),
				() => ({}) as Record<string, string>
			),
		buscar('/conteudo/questoes-aula/indice-rev.json', { cache: 'no-cache' })
			.then(
				(r) => (r.ok ? (r.json() as Promise<Record<string, string>>) : ({} as Record<string, string>)),
				() => ({}) as Record<string, string>
			)
	]).then(([principal, revisao]) => {
		indice = principal && typeof principal === 'object' ? principal : {};
		indiceRev = revisao && typeof revisao === 'object' ? revisao : {};
	});
	return carregar;
}

export const questoesDaAula = {
	/** Slug da rota `/questoes/<slug>` quando a aula tem questões no painel. */
	slug(cod: string): string | null {
		return indice?.[cod] ?? null;
	},
	/** Slug da página de revisão (`<slug>-rev`) quando a aula tem. */
	slugRevisao(cod: string): string | null {
		return indiceRev?.[cod] ?? null;
	}
};

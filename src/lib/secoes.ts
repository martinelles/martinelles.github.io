import type { Concurso, Situacao } from '$lib/dados';

export type IdSecao = 'em-alta' | 'previstos' | 'por-area' | 'encerrados';

/** 'encerrado' se a prova já passou (prova hoje ainda não encerrou); senão a situação registrada. */
export function situacaoEfetiva(c: Concurso, hoje: string): Situacao {
	return c.dataProva && c.dataProva < hoje ? 'encerrado' : c.situacao;
}

export interface GrupoArea {
	area: string;
	concursos: Concurso[];
}

export interface Secoes {
	emAlta: Concurso[];
	previstos: Concurso[];
	porArea: GrupoArea[];
	encerrados: Concurso[];
}

const colacao = new Intl.Collator('pt-BR');
const porNome = (a: Concurso, b: Concurso) => colacao.compare(a.nome, b.nome);

/** Data ascendente (ou descendente), sem data sempre por último. */
function porData(a: Concurso, b: Concurso, sentido: 1 | -1): number {
	if (a.dataProva === b.dataProva) return 0;
	if (!a.dataProva) return 1;
	if (!b.dataProva) return -1;
	return (a.dataProva < b.dataProva ? -1 : 1) * sentido;
}

export function agruparEmSecoes(concursos: Concurso[], hoje: string): Secoes {
	const emAlta: Concurso[] = [];
	const previstos: Concurso[] = [];
	const encerrados: Concurso[] = [];
	const areas = new Map<string, Concurso[]>();

	for (const c of concursos) {
		const s = situacaoEfetiva(c, hoje);
		if (s === 'encerrado') {
			encerrados.push(c);
			continue;
		}
		(s === 'aberto' ? emAlta : previstos).push(c);
		const grupo = areas.get(c.area);
		if (grupo) grupo.push(c);
		else areas.set(c.area, [c]);
	}

	emAlta.sort(
		(a, b) => Number(!!b.emAlta) - Number(!!a.emAlta) || porData(a, b, 1) || porNome(a, b)
	);
	previstos.sort(porNome);
	encerrados.sort((a, b) => porData(a, b, -1) || porNome(a, b));
	const porArea = [...areas]
		.sort(([a], [b]) => colacao.compare(a, b))
		.map(([area, lista]) => ({ area, concursos: lista.sort(porNome) }));

	return { emAlta, previstos, porArea, encerrados };
}

/** Concursos distintos visíveis: porArea repete os de emAlta e previstos e não conta. */
export function totalVisivel(s: Secoes): number {
	return s.emAlta.length + s.previstos.length + s.encerrados.length;
}

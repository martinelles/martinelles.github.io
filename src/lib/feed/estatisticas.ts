/**
 * Números do painel e dos stories, calculados a cada chamada sobre as interações e o índice
 * (FR-009, FR-014, SC-007; research R8: nada é armazenado).
 */
import type { DadosInteracoes } from './interacoes.svelte';
import type { Indice, Materia } from './tipos';

export interface ContagemMateria {
	respondidas: number;
	acertos: number;
}

export interface Estatisticas {
	respondidas: number;
	acertos: number;
	/** acertos / respondidas; null quando nada foi respondido (tela mostra "—"). */
	taxa: number | null;
	salvos: number;
	porMateria: Record<string, ContagemMateria>;
}

/**
 * Totais contam todas as interações registradas (inclusive de posts que sumiram do conteúdo);
 * `porMateria` só conta ids presentes no índice, e fica vazio sem índice.
 */
export function estatisticas(
	interacoes: Pick<DadosInteracoes, 'respostas' | 'salvos'>,
	indice?: Pick<Indice, 'posts'>
): Estatisticas {
	const respostas = Object.entries(interacoes.respostas);
	const acertos = respostas.filter(([, r]) => r.ok).length;
	const materiaDe = new Map(indice?.posts.map((e) => [e.id, e.m]) ?? []);

	const porMateria: Record<string, ContagemMateria> = {};
	for (const [id, r] of respostas) {
		const m = materiaDe.get(id);
		if (m === undefined) continue;
		const c = (porMateria[m] ??= { respondidas: 0, acertos: 0 });
		c.respondidas++;
		if (r.ok) c.acertos++;
	}

	return {
		respondidas: respostas.length,
		acertos,
		taxa: respostas.length > 0 ? acertos / respostas.length : null,
		salvos: Object.keys(interacoes.salvos).length,
		porMateria
	};
}

/** Stories: disciplina de foco primeiro, depois `ordem`; matéria sem posts fica fora. "Tudo" é da tela. */
export function ordenarStories(materias: readonly Materia[], foco: string | null | undefined): Materia[] {
	return materias
		.filter((m) => m.total > 0)
		.sort((a, b) => Number(b.id === foco) - Number(a.id === foco) || a.ordem - b.ordem);
}

/** Anel cinza: todos os posts da matéria foram vistos hoje. Matéria sem posts no índice ⇒ false. */
export function materiaVistaHoje(materia: string, indice: Pick<Indice, 'posts'>, vistosHoje: ReadonlySet<string>): boolean {
	let algum = false;
	for (const e of indice.posts) {
		if (e.m !== materia) continue;
		if (!vistosHoje.has(e.id)) return false;
		algum = true;
	}
	return algum;
}

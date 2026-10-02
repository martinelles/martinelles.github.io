/**
 * Missão do dia (FR-005, FR-006; research R2). Puro: recebe o `dia`, não lê o relógio.
 * A missão de um dia é a foto gravada para ele; sem foto, são as próximas pendentes da fila que
 * cabem em `horasPorDia`. Como pendente é "sem `concluidaEm`", a tarefa não feita ontem abre a de hoje.
 */
import type { DadosPlano, Plano, Tarefa } from './tipos';

/** Tarefa pendente = sem registro ou com registro ainda não concluído. */
export function pendente(dados: DadosPlano, id: string): boolean {
	return !dados.registros[id]?.concluidaEm;
}

/**
 * Tarefas da missão de `dia`, na ordem da fila.
 * - Com foto: as tarefas da foto (ids que sumiram do plano numa nova importação são omitidos).
 * - Sem foto: as próximas pendentes, na ordem da fila, enquanto a soma couber em `horasPorDia·60`;
 *   no mínimo 1 (tarefa maior que o dia entra sozinha). Fila esgotada ⇒ `[]`.
 *
 * Borda da missão (emenda D4): a fila traz `:L` e `:Q` do mesmo tópico consecutivas, e o
 * preenchimento segue a fila sem pular; então, se as duas cabem, entram juntas — a missão nunca
 * corta um par que cabe. Se a `:L` cabe e a `:Q` não, a `:L` fica na missão e a `:Q` é a primeira
 * pendente da fila, abrindo a missão seguinte (não se tira a `:L` para "fechar" o par: o dia
 * aproveita o tempo e a ordem da fila é mantida). Com os padrões (25 + 20 min, 3 h) a missão
 * limpa é de 4 tópicos inteiros; o corte só aparece quando a missão começa por sobra do dia anterior.
 */
export function missaoDoDia(plano: Plano, dados: DadosPlano, dia: string): Tarefa[] {
	const foto = dados.fotos[dia];
	if (foto) {
		const porId = new Map(plano.tarefas.map((t) => [t.id, t]));
		return foto.flatMap((id) => porId.get(id) ?? []);
	}
	const limite = plano.horasPorDia * 60;
	const missao: Tarefa[] = [];
	let soma = 0;
	for (const t of plano.tarefas) {
		if (!pendente(dados, t.id)) continue;
		if (missao.length > 0 && soma + t.minutos > limite) break;
		missao.push(t);
		soma += t.minutos;
	}
	return missao;
}

/** Tempo estimado total da missão, em minutos. */
export function minutosEstimados(missao: Tarefa[]): number {
	return missao.reduce((s, t) => s + t.minutos, 0);
}

/** Quantas tarefas da missão já foram concluídas. */
export function concluidasNaMissao(missao: Tarefa[], dados: DadosPlano): number {
	return missao.filter((t) => !pendente(dados, t.id)).length;
}

/** Fração da missão feita, em [0, 1]. Missão vazia ⇒ 0. */
export function percentualMissao(missao: Tarefa[], dados: DadosPlano): number {
	return missao.length === 0 ? 0 : concluidasNaMissao(missao, dados) / missao.length;
}

/** Primeira tarefa pendente da missão (alvo de "Iniciar estudos"), ou `null` se cumprida/vazia. */
export function primeiraPendente(missao: Tarefa[], dados: DadosPlano): Tarefa | null {
	return missao.find((t) => pendente(dados, t.id)) ?? null;
}

/** Tarefas do plano concluídas (só as que ainda estão no plano). */
export function tarefasConcluidas(plano: Plano, dados: DadosPlano): number {
	return plano.tarefas.filter((t) => !pendente(dados, t.id)).length;
}

/** Fração do plano concluída, em [0, 1]: tarefas concluídas ÷ tarefas da fila. Fila vazia ⇒ 0. */
export function percentualPlano(plano: Plano, dados: DadosPlano): number {
	return plano.tarefas.length === 0 ? 0 : tarefasConcluidas(plano, dados) / plano.tarefas.length;
}

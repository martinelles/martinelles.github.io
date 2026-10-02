/**
 * "Continuar estudando" depois da missão cumprida (emenda D5, FR-016). Puro: só a API do motor.
 * Tarefa extra = tarefa do plano fora da foto de hoje. A foto não muda; como pendente é "sem
 * `concluidaEm`", a missão de amanhã começa naturalmente depois das extras feitas hoje.
 */
import { diaLocalDe } from '$lib/plano/dias';
import { minutosEstudados } from '$lib/plano/horas';
import { missaoDoDia, primeiraPendente } from '$lib/plano/missao';
import type { DadosPlano, Plano, Tarefa } from '$lib/plano/tipos';

/** Ids da missão de `dia` (a foto, quando há). */
function idsDaMissao(plano: Plano, dados: DadosPlano, dia: string): Set<string> {
	return new Set(missaoDoDia(plano, dados, dia).map((t) => t.id));
}

/**
 * Alvo de "Continuar estudando": a extra que já tem tempo e não foi concluída (pausada ou
 * rodando), se houver; senão, a primeira pendente da fila inteira. Fila esgotada ⇒ `null`.
 */
export function proximaDaFila(plano: Plano, dados: DadosPlano, dia: string): Tarefa | null {
	const missao = idsDaMissao(plano, dados, dia);
	const comTempo = plano.tarefas.find((t) => {
		const r = dados.registros[t.id];
		return !missao.has(t.id) && !!r && !r.concluidaEm;
	});
	return comTempo ?? primeiraPendente(plano.tarefas, dados);
}

/** Extras de hoje: tarefas fora da missão de `dia` concluídas nesse dia (local), e os minutos cronometrados delas. */
export function extrasDoDia(plano: Plano, dados: DadosPlano, dia: string): { tarefas: number; minutos: number } {
	const missao = idsDaMissao(plano, dados, dia);
	let tarefas = 0;
	let minutos = 0;
	for (const t of plano.tarefas) {
		const r = dados.registros[t.id];
		if (missao.has(t.id) || !r?.concluidaEm || diaLocalDe(r.concluidaEm) !== dia) continue;
		tarefas++;
		minutos += minutosEstudados(r, Date.parse(r.concluidaEm));
	}
	return { tarefas, minutos };
}

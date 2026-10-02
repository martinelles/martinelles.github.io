/**
 * Horas do plano (FR-002; C-003: sempre calculadas a partir dos registros). Puro: recebe `agora`.
 */
import { diasDoPlano } from './dias';
import type { DadosPlano, Plano, RegistroTarefa } from './tipos';

const MINUTO_MS = 60_000;

/** Horas totais = dias no plano × horas por dia. */
export function horasTotais(plano: Plano): number {
	return diasDoPlano(plano).length * plano.horasPorDia;
}

/** Σ(fim − início) dos intervalos + (agora − rodandoDesde) se rodando, em minutos (fracionário). */
export function minutosEstudados(registro: RegistroTarefa | null | undefined, agora: number): number {
	if (!registro) return 0;
	let ms = 0;
	for (const [ini, fim] of registro.intervalos) ms += Math.max(0, fim - ini);
	if (registro.rodandoDesde !== null) ms += Math.max(0, agora - registro.rodandoDesde);
	return ms / MINUTO_MS;
}

/** Soma de todos os registros (inclusive de tarefas que sumiram do plano), em horas. */
export function horasEstudadas(dados: DadosPlano, agora: number): number {
	let minutos = 0;
	for (const r of Object.values(dados.registros)) minutos += minutosEstudados(r, agora);
	return minutos / 60;
}

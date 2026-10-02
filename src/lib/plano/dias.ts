/**
 * Contagem de dias do plano (FR-004; data-model "Derivados"). Puro: recebe `hoje`.
 * Para cada dia `d` em [inicio, fim]:
 *   concluído  — existe foto de `d` e toda tarefa dela tem `concluidaEm` até o fim de `d` (dia local);
 *   em aberto  — `d < hoje` e não concluído;
 *   restante   — o resto (`d ≥ hoje` e não concluído).
 * Cada dia cai em exatamente uma classe: concluídos + em aberto + restantes = noPlano, sempre.
 */
import { hojeLocal } from '$lib/datas';
import type { DadosPlano, Plano } from './tipos';

export interface ContagemDias {
	noPlano: number;
	concluidos: number;
	emAberto: number;
	restantes: number;
}

export type FasePlano = 'antes' | 'durante' | 'depois';

/** 'AAAA-MM-DD' mais n dias de calendário (aritmética em UTC, sem ler o relógio). */
export function somarDias(dia: string, n: number): string {
	const [a, m, d] = dia.split('-').map(Number);
	return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Dias de `inicio` a `fim`, inclusive. */
export function diasDoPlano(plano: Pick<Plano, 'inicio' | 'fim'>): string[] {
	const dias: string[] = [];
	for (let d = plano.inicio; d <= plano.fim; d = somarDias(d, 1)) dias.push(d);
	return dias;
}

/** Dia local (fuso do aparelho) de um instante ISO. */
export function diaLocalDe(iso: string): string {
	return hojeLocal(new Date(iso));
}

/** Missão de `dia` cumprida: há foto e todas as tarefas dela foram concluídas até o fim de `dia`. */
export function diaConcluido(dados: DadosPlano, dia: string): boolean {
	const foto = dados.fotos[dia];
	if (!foto) return false;
	return foto.every((id) => {
		const em = dados.registros[id]?.concluidaEm;
		return !!em && diaLocalDe(em) <= dia;
	});
}

export function contarDias(plano: Plano, dados: DadosPlano, hoje: string): ContagemDias {
	const c: ContagemDias = { noPlano: 0, concluidos: 0, emAberto: 0, restantes: 0 };
	for (const d of diasDoPlano(plano)) {
		c.noPlano++;
		if (diaConcluido(dados, d)) c.concluidos++;
		else if (d < hoje) c.emAberto++;
		else c.restantes++;
	}
	return c;
}

/** "ainda não começou" (antes), em curso, ou "encerrado" (depois). */
export function fasePlano(plano: Pick<Plano, 'inicio' | 'fim'>, hoje: string): FasePlano {
	return hoje < plano.inicio ? 'antes' : hoje > plano.fim ? 'depois' : 'durante';
}

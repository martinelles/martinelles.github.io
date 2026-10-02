import { describe, expect, it } from 'vitest';
import { horasEstudadas, horasTotais, minutosEstudados } from '$lib/plano/horas';
import { dadosVazios, planoTeste } from './apoio';

const MIN = 60_000;

describe('horas', () => {
	it('horas totais = dias no plano × horas por dia (81 × 3 = 243)', () => {
		expect(horasTotais(planoTeste())).toBe(243);
		expect(horasTotais(planoTeste(1, { inicio: '2026-10-01', fim: '2026-10-01', horasPorDia: 2.5 }))).toBe(2.5);
	});

	it('minutos = intervalos fechados + trecho em curso', () => {
		const r = { dia: '2026-10-01', intervalos: [[0, 10 * MIN], [20 * MIN, 25 * MIN]] as [number, number][], rodandoDesde: 30 * MIN, concluidaEm: null, questoes: null, certas: null };
		expect(minutosEstudados(r, 30 * MIN)).toBe(15);
		expect(minutosEstudados(r, 42 * MIN)).toBe(27);
		expect(minutosEstudados({ ...r, rodandoDesde: null }, 99 * MIN)).toBe(15);
		expect(minutosEstudados(null, 0)).toBe(0);
		// relógio que voltou não subtrai
		expect(minutosEstudados(r, 0)).toBe(15);
	});

	it('horas estudadas: zero sem registro; soma inclusive tópico que sumiu do plano', () => {
		expect(horasEstudadas(dadosVazios(), Date.now())).toBe(0);
		const dados = dadosVazios();
		dados.registros['TST-01:L'] = { dia: '2026-10-01', intervalos: [[0, 45 * MIN]], rodandoDesde: null, concluidaEm: null, questoes: null, certas: null };
		dados.registros['SUMIU-01:Q'] = { dia: '2026-10-01', intervalos: [], rodandoDesde: 100 * MIN, concluidaEm: null, questoes: null, certas: null };
		expect(horasEstudadas(dados, 175 * MIN)).toBe(2);
	});
});

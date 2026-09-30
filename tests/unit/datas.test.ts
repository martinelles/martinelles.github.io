import { describe, expect, it } from 'vitest';
import { diasParaProva, formatarData, hojeLocal } from '$lib/datas';

const HOJE = '2026-09-30';

describe('diasParaProva', () => {
	it('conta os dias e escolhe o texto', () => {
		expect(diasParaProva('2026-11-14', HOJE)).toEqual({ tipo: 'dias', dias: 45, texto: 'Faltam 45 dias' });
		expect(diasParaProva('2026-10-01', HOJE)).toEqual({ tipo: 'dias', dias: 1, texto: 'Falta 1 dia' });
		expect(diasParaProva(HOJE, HOJE)).toEqual({ tipo: 'dias', dias: 0, texto: 'É hoje!' });
	});

	it('prova passada vira realizada; sem data vira indefinido', () => {
		expect(diasParaProva('2026-09-29', HOJE)).toEqual({ tipo: 'realizada', texto: 'Prova realizada' });
		expect(diasParaProva(undefined, HOJE)).toEqual({ tipo: 'indefinido', texto: 'Data a definir' });
	});

	it('atravessa ano bissexto e horário de verão sem erro de um dia', () => {
		expect(diasParaProva('2028-03-01', '2028-02-28')).toMatchObject({ dias: 2 });
		expect(diasParaProva('2027-03-01', '2027-02-28')).toMatchObject({ dias: 1 });
		// viradas de horário de verão (EUA 2026-03-08; Europa 2026-10-25)
		expect(diasParaProva('2026-03-09', '2026-03-07')).toMatchObject({ dias: 2 });
		expect(diasParaProva('2026-10-26', '2026-10-24')).toMatchObject({ dias: 2 });
	});
});

describe('hojeLocal', () => {
	it('usa o fuso do aparelho, não UTC', () => {
		expect(hojeLocal(new Date(2026, 8, 30, 23, 30))).toBe('2026-09-30');
		expect(hojeLocal(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01');
	});
});

describe('formatarData', () => {
	it('formata em pt-BR', () => {
		expect(formatarData('2026-11-15')).toBe('15/11/2026');
		expect(formatarData('2027-01-01')).toBe('01/01/2027');
	});
});

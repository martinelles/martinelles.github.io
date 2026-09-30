import { describe, expect, it } from 'vitest';
import { dados, type Concurso } from '$lib/dados';
import { agruparEmSecoes, situacaoEfetiva, totalVisivel } from '$lib/secoes';

const HOJE = '2026-09-30';

function concurso(id: string, extra: Partial<Concurso> = {}): Concurso {
	return {
		id,
		nome: id,
		orgao: 'Órgão',
		banca: 'Banca',
		area: 'Controle',
		situacao: 'aberto',
		icone: 'escudo',
		cor: 'azul',
		cargos: [{ id: 'c', nome: 'Cargo', disciplinas: ['D'] }],
		...extra
	};
}

describe('situacaoEfetiva', () => {
	it('prova de ontem encerra; prova hoje continua aberta', () => {
		expect(situacaoEfetiva(concurso('a', { dataProva: '2026-09-29' }), HOJE)).toBe('encerrado');
		expect(situacaoEfetiva(concurso('a', { dataProva: '2026-09-30' }), HOJE)).toBe('aberto');
	});

	it('sem data mantém a situação registrada', () => {
		expect(situacaoEfetiva(concurso('a', { situacao: 'previsto' }), HOJE)).toBe('previsto');
		expect(situacaoEfetiva(concurso('a', { situacao: 'encerrado' }), HOJE)).toBe('encerrado');
	});
});

describe('agruparEmSecoes', () => {
	it('emAlta: em alta primeiro, depois data asc, sem data por último, empate por nome', () => {
		const lista = [
			concurso('sem-data'),
			concurso('dez', { dataProva: '2026-12-01' }),
			concurso('alta-nov', { emAlta: true, dataProva: '2026-11-01' }),
			concurso('out', { dataProva: '2026-10-15' }),
			concurso('alta-sem-data', { emAlta: true }),
			concurso('b-dez', { nome: 'Beta', dataProva: '2026-12-01' }),
			concurso('a-dez', { nome: 'Alfa', dataProva: '2026-12-01' })
		];
		const { emAlta } = agruparEmSecoes(lista, HOJE);
		expect(emAlta.map((c) => c.id)).toEqual([
			'alta-nov',
			'alta-sem-data',
			'out',
			'a-dez',
			'b-dez',
			'dez',
			'sem-data'
		]);
	});

	it('encerrados: data desc, sem data por último', () => {
		const lista = [
			concurso('enc-sem-data', { situacao: 'encerrado' }),
			concurso('jan', { dataProva: '2026-01-10' }),
			concurso('ago', { dataProva: '2026-08-10' })
		];
		expect(agruparEmSecoes(lista, HOJE).encerrados.map((c) => c.id)).toEqual(['ago', 'jan', 'enc-sem-data']);
	});

	it('previstos por nome', () => {
		const lista = [
			concurso('z', { nome: 'Zeta', situacao: 'previsto' }),
			concurso('e', { nome: 'Éter', situacao: 'previsto' })
		];
		expect(agruparEmSecoes(lista, HOJE).previstos.map((c) => c.id)).toEqual(['e', 'z']);
	});

	it('porArea: sem encerrados, áreas em ordem pt-BR (acento ordena certo), dentro por nome', () => {
		const lista = [
			concurso('t', { area: 'Tribunais' }),
			concurso('ag2', { area: 'Área Geral', nome: 'Beta' }),
			concurso('ag1', { area: 'Área Geral', nome: 'Alfa', situacao: 'previsto' }),
			concurso('b', { area: 'Bancária' }),
			concurso('enc', { area: 'Encerrada', dataProva: '2026-01-01' })
		];
		const { porArea } = agruparEmSecoes(lista, HOJE);
		expect(porArea.map((g) => g.area)).toEqual(['Área Geral', 'Bancária', 'Tribunais']);
		expect(porArea[0].concursos.map((c) => c.id)).toEqual(['ag1', 'ag2']);
		expect(porArea.flatMap((g) => g.concursos).some((c) => c.id === 'enc')).toBe(false);
	});

	it('dados reais: as quatro seções não vazias e o total bate', () => {
		const s = agruparEmSecoes(dados.concursos, HOJE);
		expect(s.emAlta.length).toBeGreaterThan(0);
		expect(s.previstos.length).toBeGreaterThan(0);
		expect(s.porArea.length).toBeGreaterThan(0);
		expect(s.encerrados.length).toBeGreaterThan(0);
		expect(totalVisivel(s)).toBe(dados.concursos.length);
		// pc-df-agente está registrado como aberto, mas a prova (2026-08-23) já passou
		expect(s.encerrados.map((c) => c.id)).toContain('pc-df-agente');
		expect(s.porArea.flatMap((g) => g.concursos)).toHaveLength(s.emAlta.length + s.previstos.length);
	});
});

import { beforeEach, describe, expect, it } from 'vitest';
import { CHAVE_INTERACOES, carregarInteracoes, dadosInteracoes, interacoes } from '$lib/feed/interacoes.svelte';
import { StorageFalso, StorageQueLanca, StorageSoLeitura } from './apoio';

let arm: StorageFalso;
const gravado = () => arm.getItem(CHAVE_INTERACOES);

beforeEach(() => {
	arm = new StorageFalso();
	carregarInteracoes(arm);
});

describe('interacoes', () => {
	it('chave e formato byte a byte do contrato', () => {
		interacoes.responder('q:CGU2022-AFFC-TI-47', 'E', 'E', '2026-09-30');
		interacoes.alternarCurtida('l:06-Lei-12527-2011-LAI:art-7');
		interacoes.alternarSalvo('r:ti-ciencia-de-dados--supervisionado', new Date('2026-09-30T14:02:11.000Z'));
		interacoes.marcarVisto('q:CGU2022-AFFC-TI-47', '2026-09-30');
		expect(arm.length).toBe(1);
		expect(arm.key(0)).toBe('painel-concurso:interacoes:v1');
		expect(gravado()).toBe(
			'{"respostas":{"q:CGU2022-AFFC-TI-47":{"r":"E","ok":true,"em":"2026-09-30"}},' +
				'"curtidas":["l:06-Lei-12527-2011-LAI:art-7"],' +
				'"salvos":{"r:ti-ciencia-de-dados--supervisionado":"2026-09-30T14:02:11.000Z"},' +
				'"vistos":{"2026-09-30":["q:CGU2022-AFFC-TI-47"]}}'
		);
	});

	it('relê o que foi gravado (SC-004) e é idempotente', () => {
		interacoes.responder('q:1', 'C', 'E', '2026-09-30');
		interacoes.alternarCurtida('l:1');
		interacoes.alternarSalvo('r:1', new Date('2026-09-30T10:00:00Z'));
		carregarInteracoes(new StorageFalso());
		expect(interacoes.resposta('q:1')).toBeNull();
		carregarInteracoes(arm);
		carregarInteracoes(arm);
		expect(interacoes.resposta('q:1')).toEqual({ r: 'C', ok: false, em: '2026-09-30' });
		expect(interacoes.curtido('l:1')).toBe(true);
		expect(interacoes.salvo('r:1')).toBe(true);
		expect(interacoes.persistindo).toBe(true);
	});

	it('primeira resposta vale; ok = r === gabarito', () => {
		interacoes.responder('q:1', 'A', 'B', '2026-09-29');
		interacoes.responder('q:1', 'B', 'B', '2026-09-30');
		expect(interacoes.resposta('q:1')).toEqual({ r: 'A', ok: false, em: '2026-09-29' });
		interacoes.responder('q:2', 'C', 'C', '2026-09-30');
		expect(interacoes.resposta('q:2')?.ok).toBe(true);
		expect(interacoes.resposta('q:3')).toBeNull();
	});

	it('curtir e salvar alternam', () => {
		interacoes.alternarCurtida('x');
		interacoes.alternarCurtida('x');
		expect(interacoes.curtido('x')).toBe(false);
		interacoes.alternarSalvo('x', new Date('2026-09-30T10:00:00Z'));
		expect(interacoes.salvo('x')).toBe(true);
		interacoes.alternarSalvo('x');
		expect(interacoes.salvo('x')).toBe(false);
		expect(JSON.parse(gravado()!)).toEqual({ respostas: {}, curtidas: [], salvos: {}, vistos: {} });
	});

	it('salvosOrdenados: mais recente primeiro', () => {
		interacoes.alternarSalvo('a', new Date('2026-09-28T10:00:00Z'));
		interacoes.alternarSalvo('b', new Date('2026-09-30T10:00:00Z'));
		interacoes.alternarSalvo('c', new Date('2026-09-29T10:00:00Z'));
		interacoes.alternarSalvo('d', new Date('2026-09-30T10:00:00Z'));
		expect(interacoes.salvosOrdenados()).toEqual(['d', 'b', 'c', 'a']);
	});

	it('vistos por dia, sem duplicar', () => {
		interacoes.marcarVisto('a', '2026-09-30');
		interacoes.marcarVisto('a', '2026-09-30');
		interacoes.marcarVisto('b', '2026-09-30');
		interacoes.marcarVisto('a', '2026-09-29');
		expect(interacoes.vistosNoDia('2026-09-30')).toEqual(new Set(['a', 'b']));
		expect(interacoes.vistosNoDia('2026-09-29')).toEqual(new Set(['a']));
		expect(interacoes.vistosNoDia('2026-09-01')).toEqual(new Set());
	});

	it('poda vistos para os últimos 7 dias a cada escrita', () => {
		arm.setItem(
			CHAVE_INTERACOES,
			JSON.stringify({
				respostas: {},
				curtidas: [],
				salvos: {},
				vistos: { '2026-09-20': ['a'], '2026-09-23': ['b'], '2026-09-24': ['c'], '2026-09-29': ['d'] }
			})
		);
		carregarInteracoes(arm);
		expect(interacoes.vistosNoDia('2026-09-20')).toEqual(new Set(['a'])); // leitura não poda
		interacoes.marcarVisto('e', '2026-09-30');
		expect(Object.keys(JSON.parse(gravado()!).vistos)).toEqual(['2026-09-24', '2026-09-29', '2026-09-30']);
		expect(interacoes.vistosNoDia('2026-09-23')).toEqual(new Set());
		// Virada de mês/ano.
		interacoes.marcarVisto('f', '2027-01-02');
		expect(Object.keys(JSON.parse(gravado()!).vistos)).toEqual(['2027-01-02']);
		interacoes.marcarVisto('g', '2026-12-27');
		expect(Object.keys(JSON.parse(gravado()!).vistos)).toEqual(['2026-12-27', '2027-01-02']);
	});

	it('JSON corrompido ou fora do formato vira vazio sem lançar', () => {
		for (const lixo of ['{nao e json', '42', '"texto"', '[]', 'null', '{"respostas":7,"curtidas":"x","salvos":[],"vistos":null}']) {
			arm.setItem(CHAVE_INTERACOES, lixo);
			expect(() => carregarInteracoes(arm)).not.toThrow();
			expect(dadosInteracoes()).toEqual({ respostas: {}, curtidas: [], salvos: {}, vistos: {} });
			expect(interacoes.persistindo).toBe(true);
		}
	});

	it('entradas inválidas são descartadas, válidas mantidas (post que sumiu fica no estado)', () => {
		arm.setItem(
			CHAVE_INTERACOES,
			JSON.stringify({
				respostas: { 'q:ok': { r: 'C', ok: true, em: '2026-09-30' }, 'q:ruim': { r: 1 } },
				curtidas: ['l:1', 5, 'l:1'],
				salvos: { 'r:1': '2026-09-30T00:00:00.000Z', 'r:2': 3 },
				vistos: { 'nao-e-dia': ['x'], '2026-09-30': ['a', 2] }
			})
		);
		carregarInteracoes(arm);
		expect(dadosInteracoes()).toEqual({
			respostas: { 'q:ok': { r: 'C', ok: true, em: '2026-09-30' } },
			curtidas: ['l:1'],
			salvos: { 'r:1': '2026-09-30T00:00:00.000Z' },
			vistos: { '2026-09-30': ['a'] }
		});
	});

	it('armazenamento que lança: nada lança, estado em memória, persistindo=false', () => {
		expect(() => carregarInteracoes(new StorageQueLanca())).not.toThrow();
		expect(interacoes.persistindo).toBe(false);
		expect(() => {
			interacoes.responder('q:1', 'C', 'C', '2026-09-30');
			interacoes.alternarCurtida('q:1');
			interacoes.alternarSalvo('q:1');
			interacoes.marcarVisto('q:1', '2026-09-30');
		}).not.toThrow();
		expect(interacoes.resposta('q:1')?.ok).toBe(true);
		expect(interacoes.curtido('q:1')).toBe(true);
		expect(interacoes.salvo('q:1')).toBe(true);
	});

	it('falha só na escrita: persistindo vira false e o estado segue em memória', () => {
		const soLeitura = new StorageSoLeitura();
		carregarInteracoes(soLeitura);
		expect(interacoes.persistindo).toBe(true);
		interacoes.alternarCurtida('x');
		expect(interacoes.persistindo).toBe(false);
		expect(interacoes.curtido('x')).toBe(true);
	});

	it('sem armazenamento (null): memória e persistindo=false', () => {
		carregarInteracoes(null);
		expect(interacoes.persistindo).toBe(false);
		interacoes.alternarCurtida('x');
		expect(interacoes.curtido('x')).toBe(true);
	});

	it('responder sem dia usa hoje (hojeLocal)', async () => {
		const { hojeLocal } = await import('$lib/datas');
		interacoes.responder('q:hoje', 'C', 'C');
		expect(interacoes.resposta('q:hoje')?.em).toBe(hojeLocal());
	});
});

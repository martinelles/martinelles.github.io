import { describe, expect, it } from 'vitest';
import { chavesDoNome, montarMapas, slugDe } from '../../../scripts/importar/mapas.mjs';
import { mapasDoPlano, montarMissoes } from '../../../scripts/importar/missoes.mjs';

const PLANO = (cargos: { cid: string; cod: string }[]) => ({
	gerado: '2026-10-31',
	plan: [
		{
			data: '2026-10-31',
			dow: 'sex',
			fase: 'Base',
			blocos: [
				{
					tipo: 'novo',
					titulo: 'Estudo novo',
					min: 45,
					itens: cargos.map((it) => ({ ...it, texto: 'Texto do subitem.' }))
				}
			]
		}
	],
	cortes: []
});

describe('nome do mapa → chaves do edital', () => {
	it('item de B/C é comum aos cargos', () => {
		expect(chavesDoNome('Resumo B1 8.2 Prevenção, detecção e responsabilização.excalidraw.svg')).toEqual(['B1-8.2']);
	});

	it('item de E sem prefixo é da P3 de Ciência de Dados', () => {
		expect(chavesDoNome('Resumo E2 1.2 Data warehouse, lake, lakehouse e mesh.excalidraw.svg')).toEqual(['CD:E2-1.2']);
	});

	it('prefixo AUD muda o dono', () => {
		expect(chavesDoNome('Resumo AUD E1 1.1 Forma de atuação.excalidraw.svg')).toEqual(['AUD:E1-1.1']);
	});

	it('faixa cobre os dois subitens', () => {
		expect(chavesDoNome('Resumo E2 4.1-4.2 Processamento distribuído.excalidraw.svg')).toEqual(['CD:E2-4.1', 'CD:E2-4.2']);
	});

	it('fora do padrão é null, sem tema depois do código também', () => {
		expect(chavesDoNome('mapa-solo.excalidraw.svg')).toBeNull();
		expect(chavesDoNome('Resumo E2 1.2.excalidraw.svg')).toBeNull();
	});

	it('slug troca os dois pontos por hífen', () => {
		expect(slugDe('CD:E2-1.2')).toBe('cd-e2-1.2');
		expect(slugDe('B1-8.2')).toBe('b1-8.2');
	});
});

describe('montarMapas', () => {
	const validas = new Set(['B1-8.2', 'CD:E2-1.2', 'CD:E2-4.1', 'CD:E2-4.2']);

	it('encaixa o SVG e o mapa chave → slug', () => {
		const r = montarMapas(
			[
				{ nome: 'Resumo E2 1.2 Data warehouse.excalidraw.svg', conteudo: '<svg>um</svg>' },
				{ nome: 'Resumo E2 4.1-4.2 Processamento.excalidraw.svg', conteudo: '<svg>dois</svg>' }
			],
			validas
		);
		expect(r.arquivos).toEqual([
			{ arquivo: 'mapas/cd-e2-1.2.svg', conteudo: '<svg>um</svg>' },
			{ arquivo: 'mapas/cd-e2-4.1.svg', conteudo: '<svg>dois</svg>' }
		]);
		expect(r.mapa).toEqual({ 'CD:E2-1.2': 'cd-e2-1.2', 'CD:E2-4.1': 'cd-e2-4.1', 'CD:E2-4.2': 'cd-e2-4.1' });
		expect(r.avisos).toEqual([]);
	});

	it('nome torto e subitem fora do plano são avisos, não erro', () => {
		const r = montarMapas(
			[
				{ nome: 'rascunho.excalidraw.svg', conteudo: '<svg/>' },
				{ nome: 'Resumo D9 9.9 Inexistente.excalidraw.svg', conteudo: '<svg/>' }
			],
			validas
		);
		expect(r.arquivos).toEqual([]);
		expect(r.avisos).toHaveLength(2);
	});
});

describe('mapasDoPlano', () => {
	const plano = PLANO([
		{ cid: 'EAG-02', cod: 'E2 1.2' },
		{ cid: 'GRI-01', cod: 'C1 1.1' }
	]);
	const mapa = { 'CD:E2-1.2': 'cd-e2-1.2', 'C1-1.1': 'c1-1.1' };

	it('resolve por cid no plano do cargo certo', () => {
		expect(mapasDoPlano(plano, 'cd', mapa)).toEqual({ 'EAG-02': 'cd-e2-1.2', 'GRI-01': 'c1-1.1' });
	});

	it('E de outro cargo não aparece no plano de Auditoria; B/C aparece nos dois', () => {
		expect(mapasDoPlano(plano, 'aud', mapa)).toEqual({ 'GRI-01': 'c1-1.1' });
	});

	it('entra em missoes-<cargo>.json junto com qc', () => {
		const fontes = { cd: JSON.stringify(plano) };
		const links = JSON.stringify({ 'CD:E2-1.2': { padrao: 'amplo', amplo: 'https://www.qconcursos.com/x' } });
		const r = montarMissoes(fontes, links, mapa);
		const saida = JSON.parse(r[0].conteudo);
		expect(saida.qc).toEqual({ 'EAG-02': 'https://www.qconcursos.com/x' });
		expect(saida.mapas).toEqual({ 'EAG-02': 'cd-e2-1.2', 'GRI-01': 'c1-1.1' });
	});

	it('sem mapa passado, o JSON sai como antes', () => {
		const r = montarMissoes({ cd: JSON.stringify(plano) });
		expect(JSON.parse(r[0].conteudo).mapas).toBeUndefined();
	});
});

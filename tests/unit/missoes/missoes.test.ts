import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { chaveLink, montarMissoes, validarMissoes as validarNoImportador } from '../../../scripts/importar/missoes.mjs';
import { importar } from '../../../scripts/importar/index.mjs';
import {
	aulasConcluidas,
	chaveBloco,
	chaveItem,
	diaCumprido,
	diaDeHoje,
	discursivasDoPlano,
	itemFeito,
	mudancasDaAulaNova,
	mudancasDoBloco,
	mudancasDoBlocoAtrasado,
	mudancasDoItem,
	ocorrenciasDaAula,
	planoAjustado,
	progressoDoDia,
	resumo,
	soPonteiros
} from '$lib/missoes/calculos';
import { carregarMissoes, esquecerMissoes, validarMissoes } from '$lib/missoes/carregar';
import { aulasPorCod, type AulaDoCatalogo } from '$lib/missoes/catalogo';
import { carregarMarcas, lerMarcas, marcasMissoes } from '$lib/missoes/marcas.svelte';
import { carregarExtras, extrasMissoes, lerExtras } from '$lib/missoes/extras.svelte';
import type { Extras, Marcas, PlanoMissoes } from '$lib/missoes/tipos';
import { StorageFalso } from '../feed/apoio';

const item = (cid: string) => ({ cid, cod: 'E1 1.1', texto: 'Tópico' });
/** Três dias: 13/10 com 2 blocos (45 + 45), 14/10 com 2 (90 + 0, o encaixe), 15/10 com 1. */
const PLANO: PlanoMissoes = {
	gerado: '2026-10-13',
	cortes: [],
	mapas: {},
	plan: [
		{ data: '2026-10-13', dow: 'ter', fase: 'Base', blocos: [{ tipo: 'novo', titulo: 'N', min: 45, itens: [item('EPA-01')] }, { tipo: 'rev', titulo: 'R', min: 45, itens: [] }] },
		{ data: '2026-10-14', dow: 'qua', fase: 'Base', blocos: [{ tipo: 'sim', titulo: 'S', min: 90 }, { tipo: 'rev', titulo: 'Encaixe', min: 0 }] },
		{ data: '2026-10-15', dow: 'qui', fase: 'Base', blocos: [{ tipo: 'disc', titulo: 'D', min: 90 }] }
	]
};

describe('importador das Missões', () => {
	const bruto = () => JSON.parse(JSON.stringify({ ...PLANO, total: 3, p3: 1 }));

	it('valida e enxuga para { gerado, plan, cortes }', () => {
		const [cd] = montarMissoes({ cd: JSON.stringify(bruto()) });
		expect(cd.arquivo).toBe('missoes-cd.json');
		expect(Object.keys(JSON.parse(cd.conteudo))).toEqual(['gerado', 'plan', 'cortes']);
	});

	it.each([
		['dia fora de ordem', (p: any) => (p.plan[1].data = '2026-10-12'), 'plan[1]: 2026-10-12 fora de ordem'],
		['tipo desconhecido', (p: any) => (p.plan[0].blocos[0].tipo = 'x'), 'tipo fora de novo|rev|disc|sim|q'],
		['minutos negativos', (p: any) => (p.plan[0].blocos[0].min = -5), 'min deveria ser inteiro ≥ 0'],
		['item sem cid', (p: any) => delete p.plan[0].blocos[0].itens[0].cid, 'item sem cid, cod ou texto'],
		['dia sem blocos', (p: any) => (p.plan[2].blocos = []), 'plan[2]: sem blocos'],
		['item-aula com subitens vazio', (p: any) => (p.plan[0].blocos[0].itens[0].subitens = []), 'subitens: deveria ser lista não vazia'],
		['item-aula com subitem sem cod', (p: any) => (p.plan[0].blocos[0].itens[0].subitens = [{ cid: 'x' }]), 'subitens[0]: sem cid ou cod']
	])('%s é erro com o lugar', (_, estragar, msg) => {
		const p = bruto();
		p.plan[0].blocos[0].itens[0].subitens = [{ cid: 'EAG-02', cod: 'E1 2.1' }];
		estragar(p);
		expect(() => validarNoImportador(p, 'plano-cd.json')).toThrow(msg);
	});

	it('item-aula com subitens de referência passa na validação', () => {
		const p = bruto();
		p.plan[0].blocos[0].itens[0].subitens = [{ cid: 'EAG-02', cod: 'E1 2.1' }];
		const [cd] = montarMissoes({ cd: JSON.stringify(p) });
		expect(JSON.parse(cd.conteudo).plan[0].blocos[0].itens[0].subitens).toEqual([{ cid: 'EAG-02', cod: 'E1 2.1' }]);
	});

	it('a chave de link do edital leva o cargo só na P3', () => {
		expect(chaveLink('aud', 'E4 1.1')).toBe('AUD:E4-1.1');
		expect(chaveLink('aud', 'B2 3.1')).toBe('B2-3.1');
	});

	it('JSON inválido é erro com o nome do arquivo', () => {
		expect(() => montarMissoes({ aud: '{' })).toThrow('artifacts/missoes/plano-aud.json: JSON inválido');
	});

	describe('no importador inteiro', () => {
		const VAULT = fileURLToPath(new URL('../importar/fixtures/vault', import.meta.url));
		const raiz = mkdtempSync(join(tmpdir(), 'painel-missoes-'));
		afterAll(() => rmSync(raiz, { recursive: true, force: true }));

		it('sem os planos: aviso por cargo e nada gerado', () => {
			const rel = importar({ vault: VAULT, saida: join(raiz, 'sem') });
			expect(rel.missoes).toEqual([]);
			expect(rel.avisos).toContain('artifacts/missoes/plano-cd.json ausente: missoes-cd.json não gerado');
		});

		it('com o plano de um cargo: grava missoes-<cargo>.json', () => {
			const vault = join(raiz, 'vault');
			cpSync(VAULT, vault, { recursive: true });
			mkdirSync(join(vault, 'artifacts', 'missoes'), { recursive: true });
			writeFileSync(join(vault, 'artifacts', 'missoes', 'plano-aud.json'), JSON.stringify(bruto()));
			const saida = join(raiz, 'com');
			const rel = importar({ vault, saida });
			expect(rel.missoes).toEqual(['missoes-aud.json']);
			expect(JSON.parse(readFileSync(join(saida, 'missoes-aud.json'), 'utf8')).plan).toHaveLength(3);
		});
	});
});

describe('contas das Missões', () => {
	it('dia de hoje: antes, durante e depois', () => {
		expect(diaDeHoje(PLANO, '2026-10-12')).toEqual({ fase: 'antes', dia: null });
		expect(diaDeHoje(PLANO, '2026-10-14')).toEqual({ fase: 'durante', dia: PLANO.plan[1] });
		expect(diaDeHoje(PLANO, '2026-10-16')).toEqual({ fase: 'depois', dia: null });
	});

	it('chave igual à da página: cargo~data~bloco', () => {
		expect(chaveBloco('aud', '2026-10-13', 1)).toBe('aud~2026-10-13~1');
	});

	it('resumo: dia parcial, dia cumprido e o bloco de 0 min', () => {
		const marcas = {
			[chaveBloco('cd', '2026-10-13', 0)]: true as const,
			[chaveBloco('cd', '2026-10-14', 0)]: true as const,
			[chaveBloco('cd', '2026-10-14', 1)]: true as const,
			[chaveBloco('aud', '2026-10-15', 0)]: true as const
		};
		expect(resumo(PLANO, marcas, 'cd')).toEqual({
			dias: 3,
			blocos: 5,
			blocosFeitos: 3,
			minutos: 270,
			minutosFeitos: 135
		});
		expect(diaCumprido(marcas, 'cd', PLANO.plan[0])).toBe(false);
		expect(diaCumprido(marcas, 'cd', PLANO.plan[1])).toBe(true);
		expect(progressoDoDia(marcas, 'cd', PLANO.plan[0])).toEqual({ feitos: 1, total: 2 });
		// A marcação de outro cargo não conta.
		expect(resumo(PLANO, marcas, 'aud').blocosFeitos).toBe(1);
	});

	it('discursivas do plano: só os blocos disc, com o dia e o índice da chave', () => {
		expect(discursivasDoPlano(PLANO)).toEqual([
			{ dia: PLANO.plan[2], indice: 0, bloco: PLANO.plan[2].blocos[0] }
		]);
	});
});

describe('subitem da missão marcado à parte', () => {
	// Planos/2026-10-15-topico-da-missao.md: bloco com dois subitens.
	const dia = {
		data: '2026-10-16',
		dow: 'sex',
		fase: 'Base',
		blocos: [{ tipo: 'novo' as const, titulo: 'N', min: 90, itens: [item('EPA-01'), item('EPA-02')] }]
	};
	const bloco = 'cd~2026-10-16~0';
	const um = 'cd~2026-10-16~0~EPA-01';
	const dois = 'cd~2026-10-16~0~EPA-02';

	it('a chave do subitem é a do bloco com o cid', () => {
		expect(chaveItem('cd', '2026-10-16', 0, 'EPA-01')).toBe(um);
	});

	it('marcar um subitem não marca o bloco; o último marca', () => {
		expect(mudancasDoItem({}, 'cd', dia, 0, 'EPA-01', true)).toEqual({ [um]: true });
		expect(mudancasDoItem({ [um]: true }, 'cd', dia, 0, 'EPA-02', true)).toEqual({ [dois]: true, [bloco]: true });
	});

	it('bloco marcado vale para os subitens; desmarcar um deixa os outros marcados', () => {
		const marcas = { [bloco]: true as const };
		expect(itemFeito(marcas, 'cd', dia, 0, 'EPA-02')).toBe(true);
		expect(mudancasDoItem(marcas, 'cd', dia, 0, 'EPA-01', false)).toEqual({ [um]: false, [bloco]: false, [dois]: true });
	});

	it('desmarcar o bloco apaga os subitens marcados dele', () => {
		expect(mudancasDoBloco({ [bloco]: true, [um]: true }, 'cd', dia, 0, false)).toEqual({ [bloco]: false, [um]: false });
		expect(mudancasDoBloco({}, 'cd', dia, 0, true)).toEqual({ [bloco]: true });
	});

	it('a marcação do subitem não conta como bloco feito', () => {
		const plano = { ...PLANO, plan: [dia] };
		expect(resumo(plano, { [um]: true }, 'cd').blocosFeitos).toBe(0);
	});
});

describe('carga do plano das Missões', () => {
	it('arquivo inválido: tenta de novo sem cache; falha dupla é erro com a URL', async () => {
		esquecerMissoes();
		const p = await carregarMissoes('cd', async () => ({ plan: [] }), async () => PLANO);
		expect(p.plan).toHaveLength(3);
		esquecerMissoes();
		await expect(carregarMissoes('aud', async () => ({}), async () => ({}))).rejects.toThrow('Plano das Missões inválido');
		await expect(carregarMissoes('aud', async () => Promise.reject(new Error('rede')))).rejects.toThrow(
			'Não foi possível carregar o plano das Missões (/conteudo/missoes-aud.json): rede'
		);
	});

	it('o arquivo real gerado do vault é válido', () => {
		for (const c of ['cd', 'aud']) {
			const p = validarMissoes(JSON.parse(readFileSync(`static/conteudo/missoes-${c}.json`, 'utf8')));
			expect(p.plan).toHaveLength(61);
			expect(p.plan[0].data).toBe('2026-10-13');
		}
	});
});

describe('marcações', () => {
	it('lê o formato da página, inclusive o antigo sem cargo', () => {
		expect(lerMarcas('{"cd~2026-10-13~0":true,"2026-10-14#1":true,"aud~2026-10-13~2":false}')).toEqual({
			'cd~2026-10-13~0': true,
			'cd~2026-10-14~1': true
		});
		expect(lerMarcas('lixo')).toEqual({});
	});

	it('marcar e desmarcar gravam na chave da página', () => {
		const arm = new StorageFalso();
		carregarMarcas(arm);
		marcasMissoes.marcar('cd~2026-10-13~0', true);
		marcasMissoes.marcar('cd~2026-10-13~1', true);
		marcasMissoes.marcar('cd~2026-10-13~0', false);
		expect(JSON.parse(arm.getItem('missoes-cgu-2026')!)).toEqual({ 'cd~2026-10-13~1': true });
		expect(marcasMissoes.feito('cd~2026-10-13~1')).toBe(true);
		// Subitem e bloco numa gravação só.
		marcasMissoes.aplicar({ 'cd~2026-10-13~1': false, 'cd~2026-10-13~1~EPA-01': true });
		expect(JSON.parse(arm.getItem('missoes-cgu-2026')!)).toEqual({ 'cd~2026-10-13~1~EPA-01': true });
	});
});

describe('aula nova feita fora da missão', () => {
	const aula = (cid: string, cod: string) => ({ cid, cod, texto: `Aula ${cod}` });
	// Aula 4e7: estudo novo em 16/10 junto de outro subitem e revisão em 17/10; aula 5f5: sozinha no bloco de 18/10.
	const planoAulas: PlanoMissoes = {
		...PLANO,
		plan: [
			{ data: '2026-10-16', dow: 'sex', fase: 'Base', blocos: [{ tipo: 'novo', titulo: 'N1', min: 90, itens: [aula('4e7', 'E1·1'), item('EPA-02')] }] },
			{ data: '2026-10-17', dow: 'sáb', fase: 'Base', blocos: [{ tipo: 'rev', titulo: 'R', min: 30, itens: [aula('4e7', 'E1·1')] }] },
			{ data: '2026-10-18', dow: 'dom', fase: 'Base', blocos: [{ tipo: 'novo', titulo: 'N2', min: 90, itens: [aula('5f5', 'E1·2')] }] }
		]
	};

	it('ocorrências da aula: todos os blocos em que o cid aparece, na ordem dos dias', () => {
		expect(ocorrenciasDaAula(planoAulas, '4e7').map((o) => [o.dia.data, o.tipo, o.item.cod])).toEqual([
			['2026-10-16', 'novo', 'E1·1'],
			['2026-10-17', 'rev', 'E1·1']
		]);
		expect(ocorrenciasDaAula(planoAulas, 'e-pa')).toEqual([]);
	});

	it('conclui o estudo novo da aula; a revisão do plano não se marca', () => {
		expect(mudancasDaAulaNova({}, 'cd', planoAulas, '4e7')).toEqual({ 'cd~2026-10-16~0~4e7': true });
		// Aula sozinha no bloco: o bloco junto, como o último subitem.
		expect(mudancasDaAulaNova({}, 'cd', planoAulas, '5f5')).toEqual({ 'cd~2026-10-18~0~5f5': true, 'cd~2026-10-18~0': true });
	});

	it('aula já concluída em outro dia não gera marcação', () => {
		expect(mudancasDaAulaNova({ 'cd~2026-10-16~0': true }, 'cd', planoAulas, '4e7')).toEqual({});
		expect(mudancasDaAulaNova({ 'cd~2026-10-16~0~4e7': true }, 'cd', planoAulas, '4e7')).toEqual({});
	});
});

describe('aulas fora da missão gravadas', () => {
	const T1 = { tipo: 'novo' as const, cid: '4e7', cod: 'E1·1', texto: 'Aula E1·1' };

	it('lê o gravado e descarta o inválido', () => {
		expect(lerExtras('{"cd~2026-10-16":[{"tipo":"rev","cid":"4e7","cod":"E1·1","texto":"Aula"}]}')).toEqual({
			'cd~2026-10-16': [{ tipo: 'rev', cid: '4e7', cod: 'E1·1', texto: 'Aula' }]
		});
		expect(lerExtras('{"cd~2026-10-16":["x",{"tipo":"nova","cid":"","cod":1}]}')).toEqual({});
		expect(lerExtras(null)).toEqual({});
		expect(lerExtras('lixo')).toEqual({});
	});

	it('adicionar acumula por dia sem repetir; remover apaga', () => {
		const arm = new StorageFalso();
		carregarExtras(arm);
		extrasMissoes.adicionar('cd', '2026-10-16', T1);
		extrasMissoes.adicionar('cd', '2026-10-16', T1);
		extrasMissoes.adicionar('cd', '2026-10-16', { ...T1, tipo: 'rev' });
		extrasMissoes.adicionar('aud', '2026-10-16', T1);
		expect(JSON.parse(arm.getItem('missoes-extras-cgu-2026')!)).toEqual({
			'cd~2026-10-16': [T1, { ...T1, tipo: 'rev' }],
			'aud~2026-10-16': [T1]
		});
		expect(extrasMissoes.doDia('cd', '2026-10-16')).toHaveLength(2);
		extrasMissoes.remover('cd', '2026-10-16', T1);
		expect(extrasMissoes.doDia('cd', '2026-10-16')).toEqual([{ ...T1, tipo: 'rev' }]);
		extrasMissoes.remover('cd', '2026-10-16', { ...T1, tipo: 'rev' });
		expect('cd~2026-10-16' in extrasMissoes.todas()).toBe(false);
	});
});

describe('revisões na data real da aula nova', () => {
	// Aula 4e7 nova em 16/10, com D+1 em 17/10 (junto de outra), D+7 em 23/10 (sozinha) e D+30 em
	// 15/11, o fim do plano; aula 5f5 nova em 18/10, só com D+1 em 19/10. Dias 21/10 e 25/10
	// recebem as remarcadas.
	const dia = (data: string, dow: string, blocos: any[]) => ({ data, dow, fase: 'Base', blocos });
	const aula = (cid: string) => ({ cid, cod: 'E1·1', texto: `Aula ${cid}` });
	const rev = (...itens: [string, string][]) => ({
		tipo: 'rev' as const,
		titulo: 'R',
		min: 30,
		itens: itens.map(([cid, lab]) => ({ ...aula(cid), lab }))
	});
	const planoRevs: PlanoMissoes = {
		...PLANO,
		plan: [
			dia('2026-10-16', 'sex', [{ tipo: 'novo', titulo: 'N', min: 90, itens: [aula('4e7')] }]),
			dia('2026-10-17', 'sáb', [rev(['4e7', 'D+1'], ['zz', 'D+1'])]),
			dia('2026-10-18', 'dom', [{ tipo: 'novo', titulo: 'N', min: 90, itens: [aula('5f5')] }]),
			dia('2026-10-19', 'seg', [rev(['qq', 'D+1'], ['5f5', 'D+1'])]),
			dia('2026-10-21', 'qua', [rev(['w', 'D+1'])]),
			dia('2026-10-23', 'sex', [rev(['4e7', 'D+7'])]),
			dia('2026-10-25', 'dom', [{ tipo: 'disc', titulo: 'D', min: 90 }]),
			dia('2026-11-15', 'dom', [rev(['4e7', 'D+30'])])
		]
	};
	const extra = (data: string, cid = '4e7') => ({ [`cd~${data}`]: [{ tipo: 'novo' as const, cid, cod: 'E1·1', texto: `Aula ${cid}` }] });

	const itemDa = (p: PlanoMissoes, data: string, cid: string) =>
		p.plan.find((d) => d.data === data)!.blocos.flatMap((b) => b.itens ?? []).find((it) => it.cid === cid)!;

	it('sem aula nova registrada (ou só de outro cargo), o plano volta igual', () => {
		expect(planoAjustado(planoRevs, {}, 'cd', {}, '2026-10-15')).toBe(planoRevs);
		expect(planoAjustado(planoRevs, { 'cd~2026-10-18': [{ tipo: 'rev', cid: '4e7', cod: 'E1·1', texto: 'Aula' }] }, 'cd', {}, '2026-10-15')).toBe(planoRevs);
		expect(planoAjustado(planoRevs, extra('2026-10-18'), 'aud', {}, '2026-10-15')).toBe(planoRevs);
	});

	it('aula feita em outro dia: D+1, D+7 e D+30 contam da data real', () => {
		const p = planoAjustado(planoRevs, extra('2026-10-18'), 'cd', {}, '2026-10-15');
		// No lugar previsto, o ponteiro; a revisão junto fica.
		expect(itemDa(p, '2026-10-17', '4e7')).toMatchObject({ lab: 'D+1', movida: '2026-10-19' });
		expect(itemDa(p, '2026-10-17', 'zz').movida).toBeUndefined();
		// No dia novo, ela entra no bloco de revisão que já existe.
		expect(itemDa(p, '2026-10-19', '4e7')).toMatchObject({ lab: 'D+1', nota: 'aula feita em 18/10/2026' });
		// Dia sem bloco de revisão: um no fim do dia.
		expect(itemDa(p, '2026-10-25', '4e7')?.lab).toBe('D+7');
		expect(itemDa(p, '2026-10-25', '4e7')?.movida).toBeUndefined();
		const blocoNovo = p.plan.find((d) => d.data === '2026-10-25')!.blocos.at(-1)!;
		expect(blocoNovo.tipo).toBe('rev');
		// D+30 além do fim do plano (15/11): só o ponteiro, sem dia novo.
		expect(itemDa(p, '2026-11-15', '4e7')).toMatchObject({ lab: 'D+30', movida: null });
		expect(p.plan.some((d) => d.data === '2026-11-17')).toBe(false);
	});

	it('aula registrada duas vezes: vale a data mais recente', () => {
		const p = planoAjustado(planoRevs, { ...extra('2026-10-17'), ...extra('2026-10-20') }, 'cd', {}, '2026-10-15');
		expect(itemDa(p, '2026-10-17', '4e7').movida).toBe('2026-10-21');
		expect(itemDa(p, '2026-10-21', '4e7').nota).toBe('aula feita em 20/10/2026');
	});

	it('aula feita na própria data do plano: nada se move', () => {
		const p = planoAjustado(planoRevs, extra('2026-10-16'), 'cd', {}, '2026-10-15');
		expect(itemDa(p, '2026-10-17', '4e7').movida).toBeUndefined();
		expect(itemDa(p, '2026-10-19', '4e7')).toBeUndefined();
	});

	it('intervalo que o plano não trazia volta quando a data real o traz para dentro', () => {
		// Aula 5f5: prevista em 18/10 só com D+1; feita em 16/10, a D+7 e a D+30 cabem no plano.
		const p = planoAjustado(planoRevs, extra('2026-10-16', '5f5'), 'cd', {}, '2026-10-15');
		expect(itemDa(p, '2026-10-19', '5f5')).toMatchObject({ lab: 'D+1', movida: '2026-10-17' });
		expect(itemDa(p, '2026-10-17', '5f5')).toMatchObject({ lab: 'D+1', nota: 'aula feita em 16/10/2026' });
		expect(itemDa(p, '2026-10-23', '5f5')).toMatchObject({ lab: 'D+7' });
		expect(itemDa(p, '2026-11-15', '5f5')).toMatchObject({ lab: 'D+30' });
	});

	it('bloco que só tem ponteiros não conta no dia nem trava o cumprido', () => {
		const p = planoAjustado(planoRevs, extra('2026-10-18'), 'cd', {}, '2026-10-15');
		const dia23 = p.plan.find((d) => d.data === '2026-10-23')!;
		expect(soPonteiros(dia23.blocos[0])).toBe(true);
		expect(progressoDoDia({}, 'cd', dia23)).toEqual({ feitos: 0, total: 0 });
		expect(diaCumprido({}, 'cd', dia23)).toBe(true);
		// O dia que recebe a revisão conta o bloco de revisão como sempre.
		const dia19 = p.plan.find((d) => d.data === '2026-10-19')!;
		expect(progressoDoDia({}, 'cd', dia19)).toEqual({ feitos: 0, total: 1 });
	});

	it('a revisão remarcada marca como qualquer subitem, na chave do dia novo', () => {
		const p = planoAjustado(planoRevs, extra('2026-10-18'), 'cd', {}, '2026-10-15');
		const dia19 = p.plan.find((d) => d.data === '2026-10-19')!;
		const chave = chaveItem('cd', '2026-10-19', 0, '4e7');
		expect(itemFeito({ [chave]: true }, 'cd', dia19, 0, '4e7')).toBe(true);
		// O índice dos blocos previstos não muda: a marcação antiga continua valendo.
		expect(chaveBloco('cd', '2026-10-16', 0) in { 'cd~2026-10-16~0': true }).toBe(true);
	});

	it('revisão de estudo que passou sem conclusão fica suspensa; concluído o estudo, volta', () => {
		// 4e7 termina em 16/10; em 17/10 sem marcação, as revisões dela suspendem.
		const p = planoAjustado(planoRevs, {}, 'cd', {}, '2026-10-17');
		expect(itemDa(p, '2026-10-17', '4e7')).toMatchObject({ lab: 'D+1', suspensa: true });
		// Item sem estudo no plano (zz): segue como sempre.
		expect(itemDa(p, '2026-10-17', 'zz').suspensa).toBeUndefined();
		// Bloco que só tem suspensas não conta no dia nem trava o cumprido.
		const dia23 = p.plan.find((d) => d.data === '2026-10-23')!;
		expect(itemDa(p, '2026-10-23', '4e7').suspensa).toBe(true);
		expect(soPonteiros(dia23.blocos[0])).toBe(true);
		expect(progressoDoDia({}, 'cd', dia23)).toEqual({ feitos: 0, total: 0 });
		// Com o estudo marcado, a revisão volta ao normal.
		const ok = planoAjustado(planoRevs, {}, 'cd', { 'cd~2026-10-16~0': true }, '2026-10-17');
		expect(itemDa(ok, '2026-10-17', '4e7').suspensa).toBeUndefined();
		expect(soPonteiros(ok.plan.find((d) => d.data === '2026-10-23')!.blocos[0])).toBe(false);
	});
});

describe('aula nova que passou o dia sem ser feita', () => {
	// Aulas (item-aula, com subitens): 4e7 nova em 16/10 com D+1 em 17/10; zz nova em 17/10; qq
	// nova em 18/10, o dia de hoje do teste, com rev [w D+1]; 19/10 só com rev, destino do D+1
	// remarcado de quem foi feita em 18/10.
	const dia = (data: string, dow: string, blocos: any[]) => ({ data, dow, fase: 'Base', blocos });
	const aula = (cid: string, min = 40, parte?: number, partes?: number) => ({
		cid,
		cod: 'E1·1',
		texto: `Aula ${cid}`,
		min,
		subitens: [{ cid: 'EAG-02', cod: 'E1 2.1' }],
		...(parte ? { parte, partes } : {})
	});
	const planoAtraso: PlanoMissoes = {
		...PLANO,
		plan: [
			dia('2026-10-15', 'qui', [{ tipo: 'novo', titulo: 'N', min: 30, itens: [aula('pp', 30, 1, 2)] }]),
			dia('2026-10-16', 'sex', [{ tipo: 'novo', titulo: 'N', min: 40, itens: [aula('4e7')] }]),
			dia('2026-10-17', 'sáb', [
				{ tipo: 'rev', titulo: 'R', min: 30, itens: [{ cid: '4e7', cod: 'E1·1', texto: 'Aula 4e7', lab: 'D+1' }] },
				{ tipo: 'novo', titulo: 'N', min: 40, itens: [aula('zz')] },
				{ tipo: 'novo', titulo: 'N', min: 30, itens: [aula('pp', 30, 2, 2)] }
			]),
			dia('2026-10-18', 'dom', [
				{ tipo: 'novo', titulo: 'N', min: 40, itens: [aula('qq')] },
				{ tipo: 'rev', titulo: 'R', min: 30, itens: [{ cid: 'w', cod: 'E1·1', texto: 'Aula w', lab: 'D+1' }] }
			]),
			dia('2026-10-19', 'seg', [{ tipo: 'rev', titulo: 'R', min: 30, itens: [{ cid: 'x', cod: 'E1·1', texto: 'Aula x', lab: 'D+1' }] }])
		]
	};
	const itemDe = (p: PlanoMissoes, data: string, cid: string) =>
		p.plan.find((d) => d.data === data)!.blocos.flatMap((b) => b.itens ?? []).find((it) => it.cid === cid)!;

	it('sem dia passado em aberto, o plano volta igual', () => {
		expect(planoAjustado(planoAtraso, {}, 'cd', {}, '2026-10-15')).toBe(planoAtraso);
	});

	it('aula de dia que passou desliza para o dia de hoje, no bloco Aula adiada', () => {
		const p = planoAjustado(planoAtraso, {}, 'cd', {}, '2026-10-18');
		expect(itemDe(p, '2026-10-16', '4e7').movida).toBe('2026-10-18');
		expect(itemDe(p, '2026-10-17', 'zz').movida).toBe('2026-10-18');
		// A do dia de hoje fica no lugar.
		expect(itemDe(p, '2026-10-18', 'qq').movida).toBeUndefined();
		const dia18 = p.plan.find((d) => d.data === '2026-10-18')!;
		const adiadas = dia18.blocos.at(-1)!;
		expect(adiadas).toMatchObject({ tipo: 'novo', titulo: 'Aulas atrasadas', min: 110, atrasado: true });
		expect(adiadas.itens!.map((it) => it.cid)).toEqual(['pp', '4e7', 'zz']);
		expect(progressoDoDia({}, 'cd', dia18)).toEqual({ feitos: 0, total: 3 });
	});

	it('aula em partes: a parte feita fica, a que abriu é a que chega', () => {
		const p = planoAjustado(planoAtraso, {}, 'cd', { 'cd~2026-10-15~0': true }, '2026-10-18');
		expect(itemDe(p, '2026-10-15', 'pp').movida).toBeUndefined();
		const adiadas = p.plan.find((d) => d.data === '2026-10-18')!.blocos.at(-1)!;
		expect(adiadas.itens!.map((it) => it.cid)).toEqual(['4e7', 'zz', 'pp']);
		expect(adiadas.itens!.at(-1)).toMatchObject({ parte: 2, partes: 2 });
	});

	it('feita no dia previsto, não desliza', () => {
		const p = planoAjustado(planoAtraso, {}, 'cd', { 'cd~2026-10-16~0': true }, '2026-10-18');
		expect(itemDe(p, '2026-10-16', '4e7').movida).toBeUndefined();
		// As outras seguem atrasadas.
		const adiadas = p.plan.find((d) => d.data === '2026-10-18')!.blocos.at(-1)!;
		expect(adiadas.itens!.map((it) => it.cid)).toEqual(['pp', 'zz']);
	});

	it('marcada no dia em que chegou: para de deslizar e as revisões contam daquele dia', () => {
		const p = planoAjustado(planoAtraso, {}, 'cd', { 'cd~2026-10-18~2~4e7': true }, '2026-10-18');
		expect(itemDe(p, '2026-10-16', '4e7').movida).toBeUndefined();
		expect(itemDe(p, '2026-10-16', '4e7').feitaEm).toBe('2026-10-18');
		// D+1 previsto em 17/10: conta de 18/10 e vai para 19/10.
		expect(itemDe(p, '2026-10-17', '4e7').movida).toBe('2026-10-19');
		expect(itemDe(p, '2026-10-19', '4e7')).toMatchObject({ lab: 'D+1', nota: 'aula feita em 18/10/2026' });
	});

	it('marcada na chegada conta como feita no dia previsto (missão e resumo)', () => {
		const marcas = { 'cd~2026-10-18~2~4e7': true as const };
		const p = planoAjustado(planoAtraso, {}, 'cd', marcas, '2026-10-18');
		const dia16 = p.plan.find((d) => d.data === '2026-10-16')!;
		expect(diaCumprido(marcas, 'cd', dia16)).toBe(true);
		expect(progressoDoDia(marcas, 'cd', dia16)).toEqual({ feitos: 1, total: 1 });
		expect(resumo(p, marcas, 'cd').blocosFeitos).toBe(1);
	});

	it('marcada hoje, fica no bloco de atrasadas riscada, em vez de sumir da lista', () => {
		const marcas = { 'cd~2026-10-18~2~4e7': true as const };
		const p = planoAjustado(planoAtraso, {}, 'cd', marcas, '2026-10-18');
		const adiadas = p.plan.find((d) => d.data === '2026-10-18')!.blocos.at(-1)!;
		expect(adiadas.atrasado).toBe(true);
		// A 4e7 concluída segue no bloco, riscada com a data; as outras atrasadas continuam abertas.
		expect(adiadas.itens!.map((i) => [i.cid, i.feitaEm])).toContainEqual(['4e7', '2026-10-18']);
		expect(adiadas.itens!.map((i) => i.cid)).toEqual(['pp', 'zz', '4e7']);
		// Registrada por fora hoje (sem marcação de chegada): o mesmo eco riscado no bloco.
		const porExtra = planoAjustado(
			planoAtraso,
			{ 'cd~2026-10-18': [{ tipo: 'novo', cid: '4e7', cod: 'E1·1', texto: 'Aula 4e7' }] },
			'cd',
			{},
			'2026-10-18'
		);
		const blocoExtra = porExtra.plan.find((d) => d.data === '2026-10-18')!.blocos.at(-1)!;
		expect(blocoExtra.itens!.map((i) => [i.cid, i.feitaEm])).toContainEqual(['4e7', '2026-10-18']);
	});

	it('hoje além do fim do plano: só o ponteiro, sem aula adiada', () => {
		const p = planoAjustado(planoAtraso, {}, 'cd', {}, '2026-10-20');
		expect(itemDe(p, '2026-10-16', '4e7').movida).toBeNull();
		expect(p.plan.some((d) => d.blocos.some((b) => b.atrasado))).toBe(false);
	});

	it('a bolha do bloco adiadas marca cada aula na chave do dia em que chegou', () => {
		const dia18 = planoAjustado(planoAtraso, {}, 'cd', {}, '2026-10-18').plan.find((d) => d.data === '2026-10-18')!;
		const i = dia18.blocos.length - 1;
		expect(mudancasDoBlocoAtrasado({}, 'cd', dia18, i, true)).toEqual({
			'cd~2026-10-18~2~pp': true,
			'cd~2026-10-18~2~4e7': true,
			'cd~2026-10-18~2~zz': true,
			'cd~2026-10-18~2': true
		});
		expect(mudancasDoBlocoAtrasado({ 'cd~2026-10-18~2': true }, 'cd', dia18, i, false)).toEqual({
			'cd~2026-10-18~2': false
		});
	});
});

describe('conteúdo em aberto cuja aula não está no plano', () => {
	// Tópicos E1 1.1 (fim 16/10) e E1 2.1 (fim 17/10) sem marcação; E1 3.1 (fim 16/10) em aberto,
	// mas coberto pela aula do plano de hoje. O catálogo traz aula para E1 1.1 e E1 2.1.
	const dia = (data: string, dow: string, blocos: any[]) => ({ data, dow, fase: 'Base', blocos });
	const topico = (cid: string, cod: string, min: number) => ({ cid, cod, texto: `Tópico ${cod}`, min });
	const planoAberto: PlanoMissoes = {
		...PLANO,
		plan: [
			dia('2026-10-16', 'sex', [
				{ tipo: 'novo', titulo: 'N', min: 45, itens: [topico('EAG-01', 'E1 1.1', 45)] },
				{ tipo: 'novo', titulo: 'N', min: 30, itens: [topico('EAG-03', 'E1 3.1', 30)] }
			]),
			dia('2026-10-17', 'sáb', [
				{ tipo: 'rev', titulo: 'R', min: 30, itens: [{ cid: 'EAG-01', cod: 'E1 1.1', texto: 'Tópico', lab: 'D+1' }] },
				{ tipo: 'novo', titulo: 'N', min: 30, itens: [topico('EAG-02', 'E1 2.1', 30)] }
			]),
			dia('2026-10-18', 'dom', [
				{ tipo: 'novo', titulo: 'N', min: 50, itens: [{ cid: 'al', cod: 'E1·4', texto: 'Aula do plano', min: 50, subitens: [{ cid: 'EAG-03', cod: 'E1 3.1' }] }] }
			]),
			dia('2026-10-19', 'seg', [{ tipo: 'rev', titulo: 'R', min: 30, itens: [{ cid: 'x', cod: 'E1 9.9', texto: 'Tópico', lab: 'D+1' }] }])
		]
	};
	const catalogo = aulasPorCod(
		[
			{ id: 'x1', disciplina: 'CD:E1', titulo: '1. Modelagem e arquiteturas', subitens: ['CD:E1-1.1'] },
			{ id: 'x2', disciplina: 'CD:E1', titulo: '2. SQL e consultas analíticas', subitens: ['CD:E1-2.1'] }
		],
		'cd'
	);
	const itemDe = (p: PlanoMissoes, data: string, cid: string) =>
		p.plan.find((d) => d.data === data)!.blocos.flatMap((b) => b.itens ?? []).find((it) => it.cid === cid)!;

	it('tópico em aberto com fim passado vira aula do catálogo no bloco de atrasadas', () => {
		const p = planoAjustado(planoAberto, {}, 'cd', {}, '2026-10-18', catalogo);
		const atraso = p.plan.find((d) => d.data === '2026-10-18')!.blocos.at(-1)!;
		expect(atraso).toMatchObject({ tipo: 'novo', titulo: 'Aulas atrasadas', atrasado: true });
		expect(atraso.itens!.map((i) => [i.cid, i.cod, i.min])).toEqual([
			['x1', 'E1·1', 45],
			['x2', 'E1·2', 30]
		]);
		expect(atraso.itens![0]).toMatchObject({ texto: '1. Modelagem e arquiteturas', subitens: [{ cid: 'EAG-01', cod: 'E1 1.1' }], nota: 'conteúdo que passou em aberto' });
		// E1 3.1 é coberto pela aula do plano: não sintetiza.
		expect(atraso.itens!.some((i) => i.subitens?.some((s) => s.cid === 'EAG-03'))).toBe(false);
	});

	it('sem catálogo, nada se sintetiza (a revisão segue suspensa)', () => {
		const p = planoAjustado(planoAberto, {}, 'cd', {}, '2026-10-18');
		expect(itemDe(p, '2026-10-17', 'EAG-01').suspensa).toBe(true);
		expect(p.plan.find((d) => d.data === '2026-10-18')!.blocos.some((b) => b.atrasado)).toBe(false);
	});

	it('marcada a aula de recuperação, os tópicos contam concluídos e a revisão conta da data real', () => {
		// A aula do plano de hoje (que cobre E1 3.1) também marcada, no lugar previsto dela.
		const marcas = { 'cd~2026-10-18~1~x1': true as const, 'cd~2026-10-18~0': true as const };
		const p = planoAjustado(planoAberto, {}, 'cd', marcas, '2026-10-18', catalogo);
		// O dia do tópico cumpre e a ocorrência mostra a data real.
		const dia16 = p.plan.find((d) => d.data === '2026-10-16')!;
		expect(diaCumprido(marcas, 'cd', dia16)).toBe(true);
		expect(itemDe(p, '2026-10-16', 'EAG-01').feitaEm).toBe('2026-10-18');
		// A D+1 prevista para 17/10 conta de 18/10 e vai para 19/10.
		expect(itemDe(p, '2026-10-17', 'EAG-01')).toMatchObject({ movida: '2026-10-19' });
		expect(itemDe(p, '2026-10-19', 'EAG-01')).toMatchObject({ lab: 'D+1', nota: 'aula feita em 18/10/2026' });
	});
});

describe('aulas da mentoria concluídas (cabeçalho)', () => {
	const dia = (data: string, dow: string, blocos: any[]) => ({ data, dow, fase: 'Base', blocos });
	const aula = (cid: string) => ({ cid, cod: 'E1·1', texto: 'Aula', min: 40, subitens: [{ cid: 'EAG-02', cod: 'E1 2.1' }] });
	const catalogo = aulasPorCod(
		[
			{ id: 'x1', disciplina: 'CD:E1', titulo: '1. Modelo', subitens: ['CD:E1-1.1'] },
			{ id: 'x2', disciplina: 'CD:E1', titulo: '2. SQL', subitens: ['CD:E1-2.1'] },
			{ id: 'al', disciplina: 'CD:E1', titulo: '4. Distribuído', subitens: ['CD:E1-4.1'] }
		],
		'cd'
	);
	const base: PlanoMissoes = {
		...PLANO,
		plan: [
			dia('2026-10-16', 'sex', [{ tipo: 'novo', titulo: 'N', min: 40, itens: [aula('al')] }]),
			dia('2026-10-17', 'sáb', [{ tipo: 'rev', titulo: 'R', min: 30, itens: [{ cid: 'zz', cod: 'E1 1.1', texto: 'T', lab: 'D+1' }] }])
		]
	};
	// A conta lê o plano bruto (o ajustado acrescenta blocos e esconderia a chegada atrasada).
	it('sem marcação nenhuma, zero; aula do plano marcada conta; a de fora do plano, só registrada', () => {
		expect(aulasConcluidas(base, {}, 'cd', {}, catalogo)).toEqual({ feitas: 0, total: 3 });
		expect(aulasConcluidas(base, {}, 'cd', { 'cd~2026-10-16~0': true }, catalogo)).toEqual({ feitas: 1, total: 3 });
		const extra: Extras = { 'cd~2026-10-15': [{ tipo: 'novo', cid: 'x2', cod: 'E1·2', texto: 'Aula' }] };
		expect(aulasConcluidas(base, extra, 'cd', {}, catalogo)).toEqual({ feitas: 1, total: 3 });
	});

	it('aula que desliza (passou o dia sem marcação) segue em aberto', () => {
		expect(aulasConcluidas(base, {}, 'cd', {}, catalogo)).toEqual({ feitas: 0, total: 3 });
	});

	it('regressão: marcar a aula atrasada na chegada hoje conta no cabeçalho', () => {
		// 17/10: 16/10 passou em aberto, a aula desliza para 17/10 (índice além dos 1 blocos previstos).
		const marcas = { 'cd~2026-10-17~1~al': true as const };
		expect(aulasConcluidas(base, {}, 'cd', marcas, catalogo)).toEqual({ feitas: 1, total: 3 });
	});
});

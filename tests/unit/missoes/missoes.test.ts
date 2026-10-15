import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { chaveLink, montarMissoes, validarMissoes as validarNoImportador } from '../../../scripts/importar/missoes.mjs';
import { importar } from '../../../scripts/importar/index.mjs';
import { chaveBloco, diaCumprido, diaDeHoje, progressoDoDia, resumo } from '$lib/missoes/calculos';
import { carregarMissoes, esquecerMissoes, validarMissoes } from '$lib/missoes/carregar';
import { carregarMarcas, lerMarcas, marcasMissoes } from '$lib/missoes/marcas.svelte';
import type { PlanoMissoes } from '$lib/missoes/tipos';
import { StorageFalso } from '../feed/apoio';

const item = (cid: string) => ({ cid, cod: 'E1 1.1', texto: 'Tópico' });
/** Três dias: 13/10 com 2 blocos (45 + 45), 14/10 com 2 (90 + 0, o encaixe), 15/10 com 1. */
const PLANO: PlanoMissoes = {
	gerado: '2026-10-13',
	cortes: [],
	qc: {},
	qcErros: {},
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
		['dia sem blocos', (p: any) => (p.plan[2].blocos = []), 'plan[2]: sem blocos']
	])('%s é erro com o lugar', (_, estragar, msg) => {
		const p = bruto();
		estragar(p);
		expect(() => validarNoImportador(p, 'plano-cd.json')).toThrow(msg);
	});

	it('com links.json: o link padrão do Qconcursos de cada subitem, por cid, com a chave da página', () => {
		const qc = (x: string) => `https://www.qconcursos.com/questoes-de-concursos/questoes?${x}`;
		const p = bruto();
		p.plan[0].blocos[1].itens = [{ cid: 'EDC-06', cod: 'B1 6.1', texto: 'Comum' }, { cid: 'EPA-02', cod: 'E1 2.1.3', texto: 'Neto' }];
		const links = {
			'CD:E1-1.1': { padrao: 'amplo', amplo: qc('a'), cobrados: qc('c'), erros: qc('a-e') },
			'B1-6.1': { padrao: 'cobrados', amplo: qc('b-a'), cobrados: qc('b-c'), erros: qc('b-e') },
			'CD:E1-2.1': { padrao: 'amplo', amplo: qc('pai') }
		};
		const [cd] = montarMissoes({ cd: JSON.stringify(p) }, JSON.stringify(links));
		const saida = JSON.parse(cd.conteudo);
		expect(saida.qc).toEqual({ 'EPA-01': qc('a'), 'EDC-06': qc('b-c'), 'EPA-02': qc('pai') });
		// "erros" só nos itens de revisão (o bloco 1 do dia 13 é rev; EPA-01 está num bloco novo).
		expect(saida.qcErros).toEqual({ 'EDC-06': qc('b-e') });
		expect(chaveLink('aud', 'E4 1.1')).toBe('AUD:E4-1.1');
		expect(chaveLink('aud', 'B2 3.1')).toBe('B2-3.1');
		expect(() => montarMissoes({ cd: JSON.stringify(p) }, '[')).toThrow('links.json: JSON inválido');
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
	});
});

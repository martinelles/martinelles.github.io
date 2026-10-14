import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { montarArtefatos, montarRaiox } from '../../../scripts/importar/artefatos.mjs';

const FONTE_DASH = readFileSync(fileURLToPath(new URL('../../../scripts/importar/raiox/dash-local.js', import.meta.url)), 'utf8');

type Dash = {
	data(id: string): { status: string; data: unknown; columns: string[]; message?: string };
	calc(id: string, def: { inputs: string[]; fn: (...rows: unknown[]) => unknown }): void;
	onData(fn: () => void): void;
	params(): Record<string, string>;
	setParams(p: Record<string, string | null>): void;
	setLink(nome: string): void;
	colors: string[];
};

/** Janela e fetch falsos; `responder` resolve os pedidos pendentes. */
function montar(url = 'https://painel.dev/conteudo/artefatos/raiox.html', datasets: Record<string, string> = { a: '/a.json', b: '/b.json' }) {
	const pendentes: { url: string; resolver: (r: Response) => void }[] = [];
	const ouvintes: Record<string, () => void> = {};
	const janela = {
		DASH_LOCAL: { datasets },
		innerWidth: 800,
		location: new URL(url),
		history: {
			replaceState(_: unknown, __: string, novo: string) {
				janela.location = new URL(novo);
			}
		},
		addEventListener(ev: string, fn: () => void) {
			ouvintes[ev] = fn;
		},
		dash: undefined as unknown as Dash
	};
	const fetchFalso = (u: string) => new Promise<Response>((resolver) => pendentes.push({ url: u, resolver }));
	new Function('window', 'fetch', FONTE_DASH)(janela, fetchFalso);
	const esvaziar = () => new Promise((r) => setTimeout(r, 0));
	return {
		dash: janela.dash,
		janela,
		ouvintes,
		pendentes,
		async responder(u: string, corpo: unknown, status = 200) {
			const p = pendentes.find((x) => x.url === u)!;
			p.resolver(new Response(JSON.stringify(corpo), { status }));
			await esvaziar();
			await esvaziar();
		}
	};
}

describe('dash-local.js', () => {
	it('data: loading até o JSON chegar, depois ok com colunas; um fetch por conjunto', async () => {
		const m = montar();
		expect(m.dash.data('a').status).toBe('loading');
		m.dash.data('a');
		expect(m.pendentes).toHaveLength(1);
		await m.responder('/a.json', [{ x: 1, y: 2 }]);
		expect(m.dash.data('a')).toMatchObject({ status: 'ok', data: [{ x: 1, y: 2 }], columns: ['x', 'y'] });
	});

	it('data: erro HTTP vira status error; conjunto desconhecido, missing', async () => {
		const m = montar();
		m.dash.data('a');
		await m.responder('/a.json', {}, 404);
		expect(m.dash.data('a')).toMatchObject({ status: 'error', message: '/a.json respondeu 404' });
		expect(m.dash.data('zz').status).toBe('missing');
	});

	it('onData roda na hora e de novo quando os dados chegam', async () => {
		const m = montar();
		const vistos: string[] = [];
		m.dash.onData(() => vistos.push(m.dash.data('a').status));
		await m.responder('/a.json', [{ x: 1 }]);
		expect(vistos).toEqual(['loading', 'ok']);
	});

	it('calc: espera as entradas, calcula uma vez e propaga erro', async () => {
		const m = montar();
		let chamadas = 0;
		m.dash.calc('soma', {
			inputs: ['a', 'b'],
			fn: (a, b) => (chamadas++, [{ n: (a as unknown[]).length + (b as unknown[]).length }])
		});
		expect(m.dash.data('soma').status).toBe('loading');
		await m.responder('/a.json', [{ x: 1 }, { x: 2 }]);
		expect(m.dash.data('soma').status).toBe('loading');
		await m.responder('/b.json', [{ y: 1 }]);
		expect(m.dash.data('soma')).toMatchObject({ status: 'ok', data: [{ n: 3 }] });
		m.dash.data('soma');
		expect(chamadas).toBe(1);

		const e = montar();
		e.dash.calc('c', { inputs: ['a'], fn: () => [] });
		e.dash.data('c');
		await e.responder('/a.json', {}, 500);
		expect(e.dash.data('c').status).toBe('error');
	});

	it('params: query string, âncora #aud/#cd como cargo, setParams avisa os ouvintes', () => {
		expect(montar('https://p.dev/r.html?cargo=Auditoria').dash.params()).toEqual({ cargo: 'Auditoria' });
		expect(montar('https://p.dev/r.html#aud').dash.params()).toEqual({ cargo: 'Auditoria' });
		expect(montar('https://p.dev/r.html#cd').dash.params()).toEqual({ cargo: 'Ciência de Dados' });
		const m = montar('https://p.dev/r.html#aud');
		let n = 0;
		m.dash.onData(() => n++);
		m.dash.setParams({ cargo: 'Ciência de Dados' });
		expect(m.dash.params()).toEqual({ cargo: 'Ciência de Dados' });
		expect(m.janela.location.search).toBe('?cargo=Ci%C3%AAncia+de+Dados');
		expect(n).toBe(2);
	});

	it('setLink troca a âncora; resize só redesenha se a largura mudar', () => {
		const m = montar();
		m.dash.setLink('todos');
		expect(m.janela.location.hash).toBe('#todos');
		let n = 0;
		m.dash.onData(() => n++);
		m.ouvintes.resize();
		m.janela.innerWidth = 400;
		m.ouvintes.resize();
		expect(n).toBe(2);
	});

	it('8 cores, como tokens CSS', () => {
		expect(montar().dash.colors).toEqual([0, 1, 2, 3, 4, 5, 6, 7].map((i) => `var(--dash-cor-${i})`));
	});
});

describe('montarRaiox', () => {
	const f = {
		pagina: '<style>.rx{}</style>\n<div class="rx"></div>\n<script>dash.onData(() => {});</script>',
		subitens: '[{"chave":"B1-1.1"}]',
		assuntos: '[{"subject_id":1}]',
		dashLocal: '/* dash */',
		d3: '/* d3 */',
		licencaD3: 'ISC'
	};

	it('d3 e dash-local carregam antes do primeiro script da página', () => {
		const html = montarRaiox(f)[0].conteudo;
		const d3 = html.indexOf('vendor/d3-7.9.0.min.js');
		const dash = html.indexOf('dash-local.js');
		const pagina = html.indexOf('dash.onData');
		expect(d3).toBeGreaterThan(0);
		expect(d3).toBeLessThan(dash);
		expect(dash).toBeLessThan(pagina);
		expect(html).toContain('<div id="dash-root">');
		expect(html).toContain('--cds-chart-axis');
	});

	it('grava a página, os dois JSON, o substituto e o d3 com a licença', () => {
		expect(montarRaiox(f).map((a) => a.arquivo)).toEqual([
			'artefatos/raiox.html',
			'artefatos/raiox-subitens.json',
			'artefatos/raiox-assuntos.json',
			'artefatos/dash-local.js',
			'artefatos/vendor/d3-7.9.0.min.js',
			'artefatos/vendor/d3-LICENSE.txt'
		]);
	});

	it('JSON que não é lista de linhas é erro', () => {
		expect(() => montarRaiox({ ...f, assuntos: '{}' })).toThrow('artifacts/raiox/assuntos.json: esperada uma lista de linhas');
	});

	it('com o Raio-X gerado, o link para ele nas outras páginas vira local', () => {
		const m = montarArtefatos({ 'missoes-cgu-2026.html': '<a href="https://claude.ai/artifact/Q4MYW9Fpk7eg4oKnv36H12">' }, true);
		expect(m[0].conteudo).toContain('href="/conteudo/artefatos/raiox.html"');
	});
});

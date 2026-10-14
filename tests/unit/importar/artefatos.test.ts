import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { envolver, montarArtefatos, TEMA_ARTEFATO, trocarLinks } from '../../../scripts/importar/artefatos.mjs';
import { importar } from '../../../scripts/importar/index.mjs';

const PRIOR = 'https://claude.ai/artifact/Jjm6kekrZGBneHmJNvgUPN';
const MISSOES = 'https://claude.ai/artifact/M5gJa9q3po9iCyLNzkFxdF';
const RAIOX = 'https://claude.ai/artifact/Q4MYW9Fpk7eg4oKnv36H12';

const fragmento = (titulo: string, links: string) =>
	`<title>${titulo}</title>\n<style>body{color:red}</style>\n<main>${links}</main>\n<script>const x = 1;</script>`;

describe('artefatos do vault', () => {
	it('troca o link gerado aqui pelo caminho do painel e mantém a âncora', () => {
		const gerados = new Set(['M5gJa9q3po9iCyLNzkFxdF']);
		expect(trocarLinks(`<a href="${MISSOES}#aud">`, gerados, 'x')).toBe('<a href="/conteudo/artefatos/missoes.html#aud">');
	});

	it('artefato conhecido mas não gerado aqui segue no claude.ai', () => {
		expect(trocarLinks(`<a href="${RAIOX}">`, new Set(), 'x')).toBe(`<a href="${RAIOX}">`);
	});

	it('artefato desconhecido é erro com o nome do arquivo', () => {
		expect(() => trocarLinks('https://claude.ai/artifact/Zzz', new Set(), 'p.html')).toThrow(
			'p.html: link para artefato desconhecido https://claude.ai/artifact/Zzz'
		);
	});

	it('envolve o fragmento numa página completa, com o título no head', () => {
		const html = envolver(fragmento('Missões', ''));
		expect(html.startsWith('<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">')).toBe(true);
		expect(html).toMatch(/<\/head>\n<body>\n<style>/);
		expect(html.indexOf('<title>Missões</title>')).toBeLessThan(html.indexOf('</head>'));
		expect(html.match(/<title>/g)).toHaveLength(1);
		// O tema do app entra antes da primeira pintura.
		expect(html.indexOf(TEMA_ARTEFATO)).toBeGreaterThan(0);
		expect(html.indexOf(TEMA_ARTEFATO)).toBeLessThan(html.indexOf('</head>'));
		expect(html.endsWith('</body>\n</html>\n')).toBe(true);
	});

	it('monta só o que veio do vault; Prioridades e Missões ligam uma à outra pelo painel', () => {
		const saida = montarArtefatos({
			'prioridades-edital.html': fragmento('P', `<a href="${MISSOES}#cd"></a><a href="${RAIOX}"></a>`),
			'missoes-cgu-2026.html': fragmento('M', `<a href="${PRIOR}#cd"></a>`)
		});
		expect(saida.map((a) => a.arquivo)).toEqual(['artefatos/prioridades.html', 'artefatos/missoes.html']);
		expect(saida[0].conteudo).toContain('href="/conteudo/artefatos/missoes.html#cd"');
		expect(saida[0].conteudo).toContain(`href="${RAIOX}"`);
		expect(saida[1].conteudo).toContain('href="/conteudo/artefatos/prioridades.html#cd"');
		expect(montarArtefatos({ 'missoes-cgu-2026.html': fragmento('M', `<a href="${PRIOR}"></a>`) })[0].conteudo).toContain(PRIOR);
	});
});

describe('artefatos no importador', () => {
	const VAULT = fileURLToPath(new URL('./fixtures/vault', import.meta.url));
	const raiz = mkdtempSync(join(tmpdir(), 'painel-artefatos-'));
	afterAll(() => rmSync(raiz, { recursive: true, force: true }));

	it('sem artifacts/_publicar: aviso e nenhum artefato', () => {
		const rel = importar({ vault: VAULT, saida: join(raiz, 'sem') });
		expect(rel.artefatos).toEqual([]);
		expect(rel.avisos).toContain('artifacts/_publicar ausente: nenhum artefato gerado');
	});

	it('com artifacts/_publicar: grava em artefatos/', () => {
		const vault = join(raiz, 'vault');
		cpSync(VAULT, vault, { recursive: true });
		mkdirSync(join(vault, 'artifacts', '_publicar'), { recursive: true });
		writeFileSync(join(vault, 'artifacts', '_publicar', 'missoes-cgu-2026.html'), fragmento('M', `<a href="${PRIOR}"></a>`));
		const saida = join(raiz, 'com');
		const rel = importar({ vault, saida });
		expect(rel.artefatos).toEqual(['artefatos/missoes.html']);
		expect(rel.avisos).toContain('artifacts/_publicar/prioridades-edital.html ausente: artefatos/prioridades.html não gerado');
		expect(readFileSync(join(saida, 'artefatos', 'missoes.html'), 'utf8')).toContain('<title>M</title>');
	});
});

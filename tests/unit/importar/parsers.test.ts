import { describe, expect, it } from 'vitest';
import { lerCsv, lerLinhasCsv } from '../../../scripts/importar/csv.mjs';
import { lerFrontmatter } from '../../../scripts/importar/frontmatter.mjs';

describe('lerCsv', () => {
	it('remove BOM, lê cabeçalho e aceita \\r\\n e \\n', () => {
		const linhas = lerCsv('﻿id,nome\r\n1,a\n2,b\r\n') as Record<string, string>[];
		expect(linhas).toEqual([
			{ id: '1', nome: 'a' },
			{ id: '2', nome: 'b' }
		]);
	});

	it('campo entre aspas com vírgula, "" e quebra de linha', () => {
		const texto = 'a,b\r\n"x, y","diz ""oi""\nsegunda linha"\r\n';
		expect(lerCsv(texto)).toEqual([{ a: 'x, y', b: 'diz "oi"\nsegunda linha' }]);
	});

	it('preserva | e aspas tipográficas dentro do campo (caso real do catálogo)', () => {
		const alt = '(A) == significa atribuição. || significa “OU” lógico. | (B) <> significa igualdade.';
		const texto = `id,alternativas\nq1,"${alt}"\n`;
		expect((lerCsv(texto) as Record<string, string>[])[0].alternativas).toBe(alt);
	});

	it('sem cabeçalho devolve arrays; linha vazia no fim não conta', () => {
		expect(lerCsv('p1,r1\n"p2","r, 2"\n\n', { cabecalho: false })).toEqual([
			['p1', 'r1'],
			['p2', 'r, 2']
		]);
	});

	it('campo vazio no meio e no fim', () => {
		expect(lerLinhasCsv('a,,c,\n')).toEqual([['a', '', 'c', '']]);
	});

	it('aspas não fechadas é erro', () => {
		expect(() => lerLinhasCsv('a,"b\n')).toThrow(/aspas não fechadas/);
	});
});

describe('lerFrontmatter', () => {
	it('lê string com e sem aspas, booleano, número, data como string e comentário', () => {
		const { dados, corpo } = lerFrontmatter(
			'---\ntipo: resumo\nmateria: TI: Ciência de Dados   # como no catálogo\nfonte: "Edital, item 3: \\"x\\""\nconferido: false\nordem: 3\ngerado_em: 2026-09-30\n---\n\n# Título\n'
		);
		expect(dados).toEqual({
			tipo: 'resumo',
			materia: 'TI: Ciência de Dados',
			fonte: 'Edital, item 3: "x"',
			conferido: false,
			ordem: 3,
			gerado_em: '2026-09-30'
		});
		expect(corpo).toBe('\n# Título\n');
	});

	it('sem frontmatter devolve dados vazios e o texto inteiro', () => {
		expect(lerFrontmatter('# Só corpo\n')).toEqual({ dados: {}, corpo: '# Só corpo\n' });
	});

	it('linha malformada é erro com o número da linha', () => {
		expect(() => lerFrontmatter('---\ntipo: resumo\nisso não é chave\n---\n')).toThrow(/linha 3/);
	});

	it('bloco sem fechamento é erro', () => {
		expect(() => lerFrontmatter('---\ntipo: resumo\n')).toThrow(/sem fechamento/);
	});

	it('aspas não fechadas é erro com o número da linha', () => {
		expect(() => lerFrontmatter('---\nfonte: "abc\n---\n')).toThrow(/linha 2/);
	});
});

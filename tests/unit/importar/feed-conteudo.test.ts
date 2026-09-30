import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { importarBaralho, nomeDoBaralho } from '../../../scripts/importar/baralhos.mjs';
import {
	artigosCitados,
	importarFlashcards,
	importarResumo
} from '../../../scripts/importar/feed-conteudo.mjs';

const ler = (rel: string) => readFileSync(fileURLToPath(new URL(`./fixtures/vault/${rel}`, import.meta.url)), 'utf8');
const LAI = '06-Lei-12527-2011-LAI';
const artigos = new Map([[LAI, new Set(['1', '2', '3', '4', '5', '6', '7'])]]);
const leis = [LAI, '07-Lei-13709-2018-LGPD'];

const resumo = (frontmatter: string, corpo: string) => `---\n${frontmatter}\n---\n\n${corpo}`;
const FM_OK = 'tipo: resumo\nmateria: Outros Ramos do Direito\nfonte: "leis-secas/06-Lei-12527-2011-LAI.md, art. 7º"\nconferido: false';
const TRES = '# Título\n\n## Um\nTexto um.\n\n## Dois\nTexto dois.\n\n## Três\nTexto três.\n';

describe('importarResumo', () => {
	it('fixture: título, telas por ##, fonte e selo', () => {
		const p = importarResumo('outros-ramos-do-direito--lai-direito-de-acesso', ler('feed-conteudo/resumos/outros-ramos-do-direito--lai-direito-de-acesso.md'), artigos, leis);
		expect(p).toMatchObject({
			id: 'r:outros-ramos-do-direito--lai-direito-de-acesso',
			tipo: 'resumo',
			materia: 'outros-ramos-do-direito',
			subtopico: 'Lei de Acesso à Informação',
			titulo: 'LAI: o direito de acesso',
			conferido: false
		});
		expect(p.fonte.rotulo).toContain('06-Lei-12527-2011-LAI.md');
		expect(p.telas.map((t: { titulo: string }) => t.titulo)).toEqual(['Regra e exceção', 'O que o acesso compreende', 'Parte sigilosa']);
		expect(p.telas[1].texto).toContain('\n');
	});

	it.each([
		['campo obrigatório ausente', 'tipo: resumo\nmateria: Outros Ramos do Direito\nconferido: false', TRES, /fonte/],
		['matéria desconhecida', FM_OK.replace('Outros Ramos do Direito', 'Astrologia'), TRES, /Matéria desconhecida/],
		['conferido não booleano', FM_OK.replace('conferido: false', 'conferido: talvez'), TRES, /conferido/],
		['tipo errado', FM_OK.replace('tipo: resumo', 'tipo: flashcards'), TRES, /tipo/],
		['menos de 3 telas', FM_OK, '# T\n\n## Um\nx\n\n## Dois\ny\n', /2 telas/],
		['tela vazia', FM_OK, '# T\n\n## Um\nx\n\n## Dois\n\n## Três\nz\n', /sem texto/],
		['tela > 600', FM_OK, `# T\n\n## Um\n${'x'.repeat(601)}\n\n## Dois\ny\n\n## Três\nz\n`, /601 caracteres/],
		['sem título', FM_OK, TRES.replace('# Título\n', ''), /sem título/]
	])('recusa: %s', (_nome, fm, corpo, erro) => {
		expect(() => importarResumo('x', resumo(fm, corpo), artigos, leis)).toThrow(erro);
	});

	it('C-004: artigo citado que não existe na lei seca recusa o arquivo, listando os artigos', () => {
		const corpo = TRES.replace('Texto dois.', 'Ver Art. 99 e arts. 7º e 150.');
		expect(() => importarResumo('x', resumo(FM_OK, corpo), artigos, leis)).toThrow(/Art\. 99, Art\. 150/);
	});

	it('C-004: lei citada que não foi importada recusa o arquivo', () => {
		const fm = FM_OK.replace(LAI, '07-Lei-13709-2018-LGPD');
		expect(() => importarResumo('x', resumo(fm, TRES), artigos, leis)).toThrow(/não foi importado/);
	});

	it('fonte sem lei seca não passa pela checagem de artigos', () => {
		const fm = FM_OK.replace('"leis-secas/06-Lei-12527-2011-LAI.md, art. 7º"', '"Edital FGV 2021, item 3"');
		const corpo = TRES.replace('Texto dois.', 'Art. 999 de outra norma.');
		expect(importarResumo('x', resumo(fm, corpo), artigos, leis).fonte.rotulo).toBe('Edital FGV 2021, item 3');
	});
});

describe('artigosCitados', () => {
	it('singular, plural com lista, ordinal e letra', () => {
		expect(artigosCitados('Art. 7º; arts. 8º, 9 e 11; art. 1º-A; Art.5')).toEqual(['7', '8', '9', '11', '1-A', '5']);
	});
});

describe('importarFlashcards', () => {
	it('fixture: pares P:/R:, resposta com várias linhas, conferido do arquivo', () => {
		const posts = importarFlashcards('outros-ramos-do-direito--lai', ler('feed-conteudo/flashcards/outros-ramos-do-direito--lai.md'));
		expect(posts.map((p) => p.id)).toEqual(['f:outros-ramos-do-direito--lai:1', 'f:outros-ramos-do-direito--lai:2']);
		expect(posts[1].resposta).toBe('A informação coletada na fonte,\ncom o máximo de detalhamento possível, sem modificações.');
		expect(posts.every((p) => p.conferido === true && p.materia === 'outros-ramos-do-direito')).toBe(true);
		expect(posts[0].fonte).toEqual({
			rotulo: 'leis-secas/06-Lei-12527-2011-LAI.md, arts. 3º e 4º',
			arquivo: 'feed-conteudo/flashcards/outros-ramos-do-direito--lai.md'
		});
	});

	const FM = '---\ntipo: flashcards\nmateria: TI: Segurança da Informação\nfonte: "Edital"\nconferido: false\n---\n\n';
	it('P: sem R: é recusado', () => {
		expect(() => importarFlashcards('x', `${FM}P: um\nR: a\n\nP: dois\n\nP: três\nR: c\n`)).toThrow(/pergunta 2 sem "R:"/);
		expect(() => importarFlashcards('x', `${FM}P: um\n`)).toThrow(/sem "R:"/);
	});
	it('sem pares é recusado', () => {
		expect(() => importarFlashcards('x', `${FM}nada aqui\n`)).toThrow(/nenhum par/);
	});
});

describe('importarBaralho', () => {
	it('CSV sem cabeçalho, matéria pela tabela, conferido false', () => {
		const { posts, ignorados } = importarBaralho('LGPD Flashcards.csv', ler('flashcards/LGPD Flashcards.csv'));
		expect(ignorados).toBe(0);
		expect(posts).toHaveLength(5);
		expect(posts[0]).toMatchObject({
			id: 'f:baralho:lgpd:1',
			tipo: 'flashcard',
			materia: 'outros-ramos-do-direito',
			fonte: { rotulo: 'Baralho LGPD', arquivo: 'flashcards/LGPD Flashcards.csv' },
			conferido: false
		});
		expect(posts[1].resposta).toBe('União, Estados, Distrito Federal e Municípios.');
		expect(posts[3].pergunta).toMatch(/^A LGPD aplica-se a operações/);
	});
	it('baralho sem matéria é erro; nome do baralho', () => {
		expect(() => importarBaralho('Outro.csv', 'a,b\n')).toThrow(/BARALHO_PARA_MATERIA/);
		expect(nomeDoBaralho('Auditoria Governamental Flashcards.csv')).toBe('Auditoria Governamental');
	});
});

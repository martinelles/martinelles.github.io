import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CHAVE_MISSOES, CHAVES_SINCRONIZADAS, nomeValido, normalizarNome } from '$lib/conta/regras';
import { CHAVE_INTERACOES } from '$lib/feed/interacoes.svelte';
import { CHAVE_FOCO } from '$lib/feed/foco.svelte';
import { CHAVE_TEMA } from '$lib/tema.svelte';

describe('regras da conta', () => {
	it('as chaves sincronizadas são as dos três stores e a das marcações das Missões', () => {
		expect([...CHAVES_SINCRONIZADAS].sort()).toEqual([CHAVE_INTERACOES, CHAVE_FOCO, CHAVE_TEMA, CHAVE_MISSOES].sort());
	});

	it('a chave das Missões é a mesma que a página grava', () => {
		const pagina = readFileSync('static/conteudo/artefatos/missoes.html', 'utf8');
		expect(pagina).toContain(`const KEY = '${CHAVE_MISSOES}';`);
	});

	it.each([
		['Maria Sílva', 'maria-silva'],
		['  João  ', 'joao'],
		['ANA_PAULA!!', 'ana-paula'],
		['---x---', 'x'],
		['a'.repeat(29) + ' b', 'a'.repeat(29)]
	])('normaliza %j → %j', (entrada, saida) => {
		expect(normalizarNome(entrada)).toBe(saida);
	});

	it('valida o nome normalizado', () => {
		expect(nomeValido('maria-silva')).toBe(true);
		expect(nomeValido('abc')).toBe(true);
		expect(nomeValido('ab')).toBe(false);
		expect(nomeValido(normalizarNome('Zé'))).toBe(false);
	});
});

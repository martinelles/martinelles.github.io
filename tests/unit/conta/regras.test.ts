import { describe, expect, it } from 'vitest';
import { CHAVES_SINCRONIZADAS, nomeValido, normalizarNome } from '$lib/conta/regras';
import { CHAVE_INTERACOES } from '$lib/feed/interacoes.svelte';
import { CHAVE_PLANO } from '$lib/plano/registro.svelte';
import { CHAVE_FOCO } from '$lib/feed/foco.svelte';
import { CHAVE_TEMA } from '$lib/tema.svelte';

describe('regras da conta', () => {
	it('as chaves sincronizadas são exatamente as dos quatro stores', () => {
		expect([...CHAVES_SINCRONIZADAS].sort()).toEqual([CHAVE_INTERACOES, CHAVE_PLANO, CHAVE_FOCO, CHAVE_TEMA].sort());
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

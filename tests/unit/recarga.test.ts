import { describe, expect, it } from 'vitest';
import { ehFalhaDeModulo, recarregarUmaVez } from '$lib/recarga';
import { StorageFalso } from './feed/apoio';

describe('recarga depois de um deploy', () => {
	it('reconhece a falha de carga de módulo de cada navegador', () => {
		expect(ehFalhaDeModulo(new TypeError('Failed to fetch dynamically imported module: https://x/_app/immutable/nodes/2.js'))).toBe(true);
		expect(ehFalhaDeModulo(new TypeError('Importing a module script failed.'))).toBe(true);
		expect(ehFalhaDeModulo(new TypeError('error loading dynamically imported module'))).toBe(true);
		expect(ehFalhaDeModulo(new Error('Unable to preload CSS for /_app/immutable/assets/0.css'))).toBe(true);
		expect(ehFalhaDeModulo(new TypeError("Cannot read properties of undefined (reading 'x')"))).toBe(false);
		expect(ehFalhaDeModulo(null)).toBe(false);
	});

	it('recarrega uma vez por minuto na aba, para não entrar em laço', () => {
		const sessao = new StorageFalso();
		const idas: string[] = [];
		const ir = (u: string) => idas.push(u);
		expect(recarregarUmaVez('/painel', sessao, 1_000_000, ir)).toBe(true);
		expect(recarregarUmaVez('/painel', sessao, 1_030_000, ir)).toBe(false);
		expect(recarregarUmaVez('/', sessao, 1_061_000, ir)).toBe(true);
		expect(idas).toEqual(['/painel', '/']);
	});

	it('sem sessão, recarrega mesmo assim', () => {
		const idas: string[] = [];
		expect(recarregarUmaVez('/', null, 0, (u) => idas.push(u))).toBe(true);
		expect(idas).toEqual(['/']);
	});
});

import { describe, expect, it } from 'vitest';
import { dados, type Concurso } from '$lib/dados';
import { filtrar, indexar, normalizar } from '$lib/busca';

const indice = indexar(dados.concursos);
const ids = (termo: string) => filtrar(indice, termo).map((c) => c.id);

describe('normalizar', () => {
	it('tira acento, baixa a caixa e apara as pontas', () => {
		expect(normalizar('ÁRVORE Ção')).toBe('arvore cao');
		expect(normalizar('  Controladoria-Geral da União ')).toBe('controladoria-geral da uniao');
	});
});

describe('filtrar', () => {
	it('acha por nome, órgão, banca e cargo, sem acento', () => {
		expect(ids('cgu')).toContain('cgu-affc-ti');
		expect(ids('uniao')).toContain('cgu-affc-ti'); // órgão "Controladoria-Geral da União"
		expect(ids('CEBRASPE')).toContain('cgu-affc-ti'); // banca
		expect(ids('tecnologia')).toContain('cgu-affc-ti'); // cargo "Auditor — Tecnologia da Informação"
	});

	it('exige todas as palavras (E lógico)', () => {
		expect(ids('cgu ti')).toContain('cgu-affc-ti');
		expect(ids('cebraspe fgv')).toEqual([]);
	});

	it('termo sem correspondência devolve lista vazia', () => {
		expect(ids('xyz')).toEqual([]);
	});

	it('termo vazio ou só com espaços devolve todos, na ordem original', () => {
		const todos = dados.concursos.map((c) => c.id);
		expect(ids('')).toEqual(todos);
		expect(ids('   ')).toEqual(todos);
	});

	it('caracteres de regex no termo não lançam', () => {
		for (const t of ['(', 'cgu+', '[a', '*', '\\']) expect(() => ids(t)).not.toThrow();
	});

	it('NFR-002: 500 concursos, cada filtragem abaixo de 100 ms', () => {
		const modelo = dados.concursos[0];
		const sinteticos: Concurso[] = Array.from({ length: 500 }, (_, i) => ({
			...structuredClone(modelo),
			id: `sintetico-${i}`,
			nome: `Concurso Sintético ${i} — Órgão ${i % 37}`,
			orgao: `Secretaria de Estado nº ${i}`,
			banca: ['Cebraspe', 'FGV', 'FCC', 'Vunesp'][i % 4]
		}));
		const idx = indexar(sinteticos);
		const termos = [
			'c', 'co', 'con', 'conc', 'sint', 'sintético 4', 'fgv', 'cebraspe 12', 'órgão 3', 'secretaria',
			'estado nº 49', 'auditor', 'tecnologia', 'xyz', 'a', 'e', 'ti', 'fcc 1', 'vunesp', ''
		];
		let maior = 0;
		for (const t of termos) {
			const inicio = performance.now();
			filtrar(idx, t);
			maior = Math.max(maior, performance.now() - inicio);
		}
		console.log(`[NFR-002] maior filtragem em 500 itens: ${maior.toFixed(3)} ms`);
		expect(maior).toBeLessThan(100);
	});
});

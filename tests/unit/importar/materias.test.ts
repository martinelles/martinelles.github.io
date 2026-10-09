import { describe, expect, it } from 'vitest';
import {
	BARALHO_PARA_MATERIA,
	LEI_PARA_MATERIA,
	MATERIAS,
	materiaPorId,
	materiaPorNome,
	ordenarMaterias
} from '../../../scripts/importar/materias.mjs';
import { slug } from '../../../scripts/importar/texto.mjs';

describe('materias', () => {
	it('21 matérias do catálogo; id é o slug do nome; abrev ≤ 10', () => {
		expect(MATERIAS).toHaveLength(21);
		for (const m of MATERIAS) {
			expect(m.id).toBe(slug(m.nome));
			expect(m.abrev.length).toBeLessThanOrEqual(10);
		}
		expect(new Set(MATERIAS.map((m) => m.abrev)).size).toBe(21);
	});

	it('materiaPorNome acha pelo nome exato e falha claro em nome desconhecido', () => {
		expect(materiaPorNome('TI: Ciência de Dados').id).toBe('ti-ciencia-de-dados');
		expect(() => materiaPorNome('TI: Ciencia de Dados')).toThrow(/Matéria desconhecida: "TI: Ciencia de Dados"/);
	});

	it('24 normas mapeadas, todas para matérias existentes; baralhos também', () => {
		expect(Object.keys(LEI_PARA_MATERIA)).toHaveLength(24);
		for (const id of [...Object.values(LEI_PARA_MATERIA), ...Object.values(BARALHO_PARA_MATERIA)]) {
			expect(materiaPorId(id), id).toBeDefined();
		}
	});

	it('ordem: Ciência de Dados, demais TI por total, depois as outras por total', () => {
		const lista = ordenarMaterias({
			'ti-ciencia-de-dados': 1,
			'ti-seguranca-da-informacao': 5,
			'ti-governanca-gestao-e-contratacoes-de-ti': 50,
			'direito-constitucional': 900,
			contabilidade: 10
		});
		expect(lista.slice(0, 3).map((m) => m.id)).toEqual([
			'ti-ciencia-de-dados',
			'ti-governanca-gestao-e-contratacoes-de-ti',
			'ti-seguranca-da-informacao'
		]);
		expect(lista[3]).toMatchObject({ id: 'direito-constitucional', ordem: 4, total: 900 });
		expect(lista[4].id).toBe('contabilidade');
		expect(lista.map((m) => m.ordem)).toEqual([1, 2, 3, 4, 5]);
	});

	it('matéria sem post fica fora da lista (questões fora do edital não vão ao feed)', () => {
		const lista = ordenarMaterias({ 'ti-ciencia-de-dados': 3, 'lingua-portuguesa': 0 });
		expect(lista.map((m) => m.id)).toEqual(['ti-ciencia-de-dados']);
	});
});

import { describe, expect, it } from 'vitest';
import {
	BARALHO_PARA_DISCIPLINA,
	DISCIPLINAS,
	disciplinaDoPost,
	disciplinaPorId,
	FEED_PARA_DISCIPLINA,
	LEI_PARA_DISCIPLINA,
	ordenarDisciplinas,
	TOPICO_PARA_DISCIPLINA
} from '../../../scripts/importar/disciplinas.mjs';
import { LEI_PARA_MATERIA } from '../../../scripts/importar/materias.mjs';

describe('disciplinas do edital', () => {
	it('B1–B4, C1–C5, E1–E4 de Ciência de Dados e E1–E5 de Auditoria; abrev ≤ 10', () => {
		expect(DISCIPLINAS.map((d) => d.id)).toEqual([
			'b1', 'b2', 'b3', 'b4', 'c1', 'c2', 'c3', 'c4', 'c5',
			'cd-e1', 'cd-e2', 'cd-e3', 'cd-e4', 'aud-e1', 'aud-e2', 'aud-e3', 'aud-e4', 'aud-e5'
		]);
		for (const d of DISCIPLINAS) expect(d.abrev.length, d.id).toBeLessThanOrEqual(10);
	});

	it('todo mapa aponta para disciplina existente; toda norma importada tem disciplina', () => {
		const destinos = [
			...Object.values(TOPICO_PARA_DISCIPLINA),
			...Object.values(LEI_PARA_DISCIPLINA),
			...Object.values(BARALHO_PARA_DISCIPLINA),
			...FEED_PARA_DISCIPLINA.map(([, d]) => d)
		];
		for (const id of destinos) expect(disciplinaPorId(id), id).toBeDefined();
		expect(Object.keys(LEI_PARA_DISCIPLINA).sort()).toEqual(Object.keys(LEI_PARA_MATERIA).sort());
	});

	it('disciplinaDoPost: questão pelo tópico, o resto pelo arquivo de origem', () => {
		expect(disciplinaDoPost({ tipo: 'questao', topicoEstudo: 'DPC-07' })).toBe('c3');
		expect(disciplinaDoPost({ tipo: 'questao', topicoEstudo: 'AMI-12' })).toBe('cd-e3');
		expect(disciplinaDoPost({ tipo: 'questao', topicoEstudo: 'AUD-E2-3.1' })).toBe('aud-e2');
		expect(disciplinaDoPost({ tipo: 'questao', topicoEstudo: 'AUD-E9-1.1' })).toBeUndefined();
		expect(disciplinaDoPost({ tipo: 'questao', topicoEstudo: 'XYZ-01' })).toBeUndefined();
		expect(disciplinaDoPost({ tipo: 'questao' })).toBeUndefined();
		expect(disciplinaDoPost({ tipo: 'lei', fonte: { arquivo: 'leis-secas/06-Lei-12527-2011-LAI.md' } })).toBe('c2');
		expect(disciplinaDoPost({ tipo: 'flashcard', fonte: { arquivo: 'flashcards/Auditoria Governamental Flashcards.csv' } })).toBe('c5');
		const feed = (nome: string) => disciplinaDoPost({ tipo: 'resumo', fonte: { arquivo: `feed-conteudo/resumos/${nome}.md` } });
		expect(feed('ti-ciencia-de-dados--python-pandas')).toBe('cd-e1');
		expect(feed('ti-ciencia-de-dados--data-lake-lakehouse-data-mesh')).toBe('cd-e2');
		expect(feed('ti-ciencia-de-dados--redes-neurais-deep-learning')).toBe('cd-e3');
		expect(feed('ti-governanca--decreto-9203-2017')).toBe('c1');
		expect(feed('ti-governanca--itil-4')).toBe('cd-e4');
		expect(feed('inventado')).toBeUndefined();
	});

	it('ordem do edital, nome com o código e sem as disciplinas vazias', () => {
		const lista = ordenarDisciplinas({ 'cd-e3': 4, b1: 2, c3: 9, 'aud-e1': 0 });
		expect(lista).toEqual([
			{ id: 'b1', nome: 'B1 · Estado, Democracia, Direitos e Ciência Política', abrev: 'Estado', ordem: 1, total: 2 },
			{ id: 'c3', nome: 'C3 · Direito Público Aplicado, Controle e Responsabilização', abrev: 'Dir. Públ.', ordem: 2, total: 9 },
			{ id: 'cd-e3', nome: 'E3 · Aprendizado de Máquina e Inteligência Artificial', abrev: 'ML e IA', ordem: 3, total: 4 }
		]);
	});
});

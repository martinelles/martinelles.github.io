import { beforeEach, describe, expect, it } from 'vitest';
import { estatisticas, materiaVistaHoje, ordenarStories } from '$lib/feed/estatisticas';
import { CHAVE_FOCO, carregarFoco, DISCIPLINA_PADRAO, foco } from '$lib/feed/foco.svelte';
import { carregarInteracoes, dadosInteracoes, interacoes } from '$lib/feed/interacoes.svelte';
import type { Indice, Materia } from '$lib/feed/tipos';
import { StorageFalso, StorageQueLanca } from './apoio';
import indiceJson from './fixtures/indice.json';
import materiasJson from './fixtures/materias.json';

const indice = indiceJson as Indice;
const materias = materiasJson as Materia[];

describe('estatisticas', () => {
	beforeEach(() => carregarInteracoes(new StorageFalso()));

	it('sem interações: zeros e taxa null', () => {
		expect(estatisticas(dadosInteracoes(), indice)).toEqual({ respondidas: 0, acertos: 0, taxa: null, salvos: 0, porMateria: {} });
	});

	it('SC-007: muda ao responder e bate com as interações; por matéria via índice', () => {
		interacoes.responder('q:CGU2022-AFFC-TI-47', 'C', 'C', '2026-09-30');
		interacoes.responder('q:TCU2026-AUFC-TI-12', 'A', 'B', '2026-09-30');
		interacoes.responder('q:sumiu-do-conteudo', 'E', 'E', '2026-09-30');
		interacoes.alternarSalvo('l:06-Lei-12527-2011-LAI:art-7');
		const e = estatisticas(dadosInteracoes(), indice);
		expect(e).toEqual({
			respondidas: 3,
			acertos: 2,
			taxa: 2 / 3,
			salvos: 1,
			porMateria: { 'ti-ciencia-de-dados': { respondidas: 2, acertos: 1 } }
		});
		expect(estatisticas(dadosInteracoes()).porMateria).toEqual({});
		interacoes.responder('q:outra', 'C', 'E', '2026-09-30');
		expect(estatisticas(dadosInteracoes(), indice).respondidas).toBe(4);
	});
});

describe('ordenarStories', () => {
	it('foco primeiro, depois ordem; total 0 fica fora; não muta a entrada', () => {
		const copia = structuredClone(materias);
		expect(ordenarStories(materias, 'outros-ramos-do-direito').map((m) => m.id)).toEqual(['outros-ramos-do-direito', 'ti-ciencia-de-dados']);
		expect(ordenarStories(materias, 'ti-ciencia-de-dados').map((m) => m.id)).toEqual(['ti-ciencia-de-dados', 'outros-ramos-do-direito']);
		expect(ordenarStories(materias, 'direito-penal').map((m) => m.id)).toEqual(['ti-ciencia-de-dados', 'outros-ramos-do-direito']);
		expect(ordenarStories(materias, null).map((m) => m.id)).toEqual(['ti-ciencia-de-dados', 'outros-ramos-do-direito']);
		expect(materias).toEqual(copia);
	});
});

describe('materiaVistaHoje', () => {
	it('true só quando todos os posts da matéria foram vistos', () => {
		const dados = indice.posts.filter((e) => e.m === 'ti-ciencia-de-dados').map((e) => e.id);
		expect(materiaVistaHoje('ti-ciencia-de-dados', indice, new Set(dados.slice(1)))).toBe(false);
		expect(materiaVistaHoje('ti-ciencia-de-dados', indice, new Set(dados))).toBe(true);
		expect(materiaVistaHoje('outros-ramos-do-direito', indice, new Set(dados))).toBe(false);
		expect(materiaVistaHoje('direito-penal', indice, new Set(dados))).toBe(false);
	});
});

describe('foco', () => {
	let arm: StorageFalso;
	beforeEach(() => {
		arm = new StorageFalso();
		carregarFoco(arm);
	});

	it('padrão ti-ciencia-de-dados; v1 é ignorada e não é apagada', () => {
		arm.setItem('painel-concurso:preferencias:v1', '{"concursoId":"cgu-affc-ti","cargoId":"auditor-ti","disciplina":"Governança de TI"}');
		carregarFoco(arm);
		expect(foco.disciplina).toBe(DISCIPLINA_PADRAO);
		expect(DISCIPLINA_PADRAO).toBe('ti-ciencia-de-dados');
		expect(arm.getItem('painel-concurso:preferencias:v1')).not.toBeNull();
		expect(arm.getItem(CHAVE_FOCO)).toBeNull();
	});

	it('escolher grava no formato do contrato e relê', () => {
		foco.escolherDisciplina('direito-administrativo');
		expect(arm.getItem('painel-concurso:preferencias:v2')).toBe('{"disciplina":"direito-administrativo"}');
		carregarFoco(new StorageFalso());
		expect(foco.disciplina).toBe(DISCIPLINA_PADRAO);
		carregarFoco(arm);
		expect(foco.disciplina).toBe('direito-administrativo');
	});

	it('valor inválido é ignorado; JSON corrompido vira padrão', () => {
		foco.escolherDisciplina('Direito Penal');
		expect(foco.disciplina).toBe(DISCIPLINA_PADRAO);
		for (const lixo of ['{x', '42', '[]', '{"disciplina":7}', '{"disciplina":"Com Espaço"}']) {
			arm.setItem(CHAVE_FOCO, lixo);
			expect(() => carregarFoco(arm)).not.toThrow();
			expect(foco.disciplina).toBe(DISCIPLINA_PADRAO);
		}
	});

	it('armazenamento que lança: funciona em memória', () => {
		expect(() => carregarFoco(new StorageQueLanca())).not.toThrow();
		expect(() => foco.escolherDisciplina('auditoria')).not.toThrow();
		expect(foco.disciplina).toBe('auditoria');
	});
});

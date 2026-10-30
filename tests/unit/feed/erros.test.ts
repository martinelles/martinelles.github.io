import { beforeEach, describe, expect, it } from 'vitest';
import {
	ACERTOS_PARA_DOMINAR,
	CHAVE_ERROS,
	carregarErros,
	dadosErros,
	erros,
	semearErros
} from '$lib/feed/erros.svelte';
import { CHAVE_INTERACOES } from '$lib/feed/interacoes.svelte';
import { StorageFalso } from './apoio';

let arm: StorageFalso;
const gravado = () => arm.getItem(CHAVE_ERROS);

beforeEach(() => {
	arm = new StorageFalso();
	carregarErros(arm);
});

describe('erros', () => {
	it('chave e formato byte a byte do contrato', () => {
		erros.registrar('q:CGU2022-AFFC-TI-47', '2026-09-30');
		expect(arm.length).toBe(1);
		expect(arm.key(0)).toBe('painel-concurso:erros:v1');
		expect(gravado()).toBe('{"q:CGU2022-AFFC-TI-47":{"acertos":0,"tentativas":1,"em":"2026-09-30"}}');
	});

	it('registrar é idempotente: um erro só entra uma vez', () => {
		erros.registrar('q:1', '2026-09-30');
		erros.registrar('q:1', '2026-10-01');
		expect(erros.registrado('q:1')).toEqual({ acertos: 0, tentativas: 1, em: '2026-09-30' });
	});

	it('2 acertos de re-treino tiram a questão; errado mantém e conta tentativa', () => {
		erros.registrar('q:1', '2026-09-30');
		erros.reponder('q:1', false, '2026-10-01');
		expect(erros.registrado('q:1')).toEqual({ acertos: 0, tentativas: 2, em: '2026-10-01' });
		erros.reponder('q:1', true, '2026-10-02');
		expect(erros.registrado('q:1')).toEqual({ acertos: 1, tentativas: 3, em: '2026-10-02' });
		erros.reponder('q:1', true, '2026-10-03');
		expect(erros.registrado('q:1')).toBeNull();
		expect(JSON.parse(gravado() ?? '{}')).toEqual({});
		expect(ACERTOS_PARA_DOMINAR).toBe(2);
	});

	it('reponder ignora id fora do caderno', () => {
		erros.reponder('q:nunca-errei', true, '2026-09-30');
		expect(erros.registrado('q:nunca-errei')).toBeNull();
		expect(gravado()).toBeNull();
	});

	it('registrados: da tentativa mais recente para a mais antiga', () => {
		erros.registrar('q:velha', '2026-09-28');
		erros.registrar('q:nova', '2026-10-02');
		erros.registrar('q:meio', '2026-09-30');
		erros.reponder('q:velha', false, '2026-10-01'); // velha passa o meio pela tentativa nova
		expect(erros.registrados()).toEqual(['q:nova', 'q:velha', 'q:meio']);
	});

	it('semear: primeira visita nasce das respostas erradas das interações', () => {
		arm.setItem(
			CHAVE_INTERACOES,
			JSON.stringify({
				respostas: {
					'q:errei': { r: 'C', ok: false, em: '2026-09-29' },
					'q:acertei': { r: 'E', ok: true, em: '2026-09-30' }
				}
			})
		);
		carregarErros(arm);
		semearErros(arm);
		expect(erros.registrados()).toEqual(['q:errei']);
		expect(erros.registrado('q:errei')).toEqual({ acertos: 0, tentativas: 1, em: '2026-09-29' });

		// Chave já existe: questão dominada não volta, nem erro novo entra sozinho.
		erros.reponder('q:errei', true, '2026-10-01');
		erros.reponder('q:errei', true, '2026-10-02');
		arm.setItem(
			CHAVE_INTERACOES,
			JSON.stringify({ respostas: { 'q:errei': { r: 'C', ok: false, em: '2026-09-29' } } })
		);
		carregarErros(arm);
		semearErros(arm);
		expect(erros.registrados()).toEqual([]);
	});

	it('relê o que foi gravado e é idempotente; sem armazenamento não persiste', () => {
		erros.registrar('q:1', '2026-09-30');
		carregarErros(new StorageFalso());
		expect(erros.registrado('q:1')).toBeNull();
		carregarErros(arm);
		carregarErros(arm);
		expect(erros.registrado('q:1')).toEqual({ acertos: 0, tentativas: 1, em: '2026-09-30' });
		expect(erros.persistindo).toBe(true);
		expect(dadosErros()['q:1']).toEqual({ acertos: 0, tentativas: 1, em: '2026-09-30' });

		carregarErros(null);
		expect(erros.persistindo).toBe(false);
	});

	it('conteúdo corrompido começa vazio e segue persistindo', () => {
		arm.setItem(CHAVE_ERROS, '{nope');
		carregarErros(arm);
		expect(erros.registrados()).toEqual([]);
		expect(erros.persistindo).toBe(true);
	});
});

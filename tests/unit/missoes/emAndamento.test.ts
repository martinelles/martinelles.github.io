import { describe, expect, it } from 'vitest';
import { CHAVE_EM_ANDAMENTO, carregarEmAndamento, emAndamento, lerEmAndamento } from '$lib/missoes/emAndamento.svelte';
import { StorageFalso, StorageSoLeitura } from '../feed/apoio';

const M = { cargo: 'cd' as const, data: '2026-10-14', bloco: 1, cid: 'CDE-01' };

describe('emAndamento', () => {
	it('lê só o formato válido', () => {
		expect(lerEmAndamento(JSON.stringify(M))).toEqual(M);
		expect(lerEmAndamento(null)).toBeNull();
		expect(lerEmAndamento('{')).toBeNull();
		expect(lerEmAndamento(JSON.stringify({ ...M, cargo: 'infra' }))).toBeNull();
		expect(lerEmAndamento(JSON.stringify({ ...M, bloco: '1' }))).toBeNull();
	});

	it('abrir grava; vale só no cargo e no dia; limpar apaga', () => {
		const arm = new StorageFalso();
		carregarEmAndamento(arm);
		emAndamento.abrir(M);
		expect(JSON.parse(arm.getItem(CHAVE_EM_ANDAMENTO)!)).toEqual(M);
		carregarEmAndamento(arm);
		expect(emAndamento.de('cd', '2026-10-14')).toEqual(M);
		expect(emAndamento.de('cd', '2026-10-15')).toBeNull();
		expect(emAndamento.de('aud', '2026-10-14')).toBeNull();
		emAndamento.limpar();
		expect(arm.getItem(CHAVE_EM_ANDAMENTO)).toBeNull();
		expect(emAndamento.de('cd', '2026-10-14')).toBeNull();
	});

	it('armazenamento bloqueado: fica em memória', () => {
		carregarEmAndamento(new StorageSoLeitura());
		emAndamento.abrir(M);
		expect(emAndamento.de('cd', '2026-10-14')).toEqual(M);
	});
});

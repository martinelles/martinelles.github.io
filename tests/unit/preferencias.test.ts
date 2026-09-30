import { beforeEach, describe, expect, it } from 'vitest';
import { carregar, preferencias } from '$lib/preferencias.svelte';

const CHAVE = 'painel-concurso:preferencias:v1';

/** Storage em memória. */
class StorageFalso implements Storage {
	private mapa = new Map<string, string>();
	get length() {
		return this.mapa.size;
	}
	clear() {
		this.mapa.clear();
	}
	getItem(k: string) {
		return this.mapa.get(k) ?? null;
	}
	key(i: number) {
		return [...this.mapa.keys()][i] ?? null;
	}
	removeItem(k: string) {
		this.mapa.delete(k);
	}
	setItem(k: string, v: string) {
		this.mapa.set(k, String(v));
	}
}

/** Storage que lança em toda chamada (janela privada / cota esgotada). */
class StorageQueLanca implements Storage {
	get length(): number {
		throw new Error('bloqueado');
	}
	clear(): void {
		throw new Error('bloqueado');
	}
	getItem(): string | null {
		throw new Error('bloqueado');
	}
	key(): string | null {
		throw new Error('bloqueado');
	}
	removeItem(): void {
		throw new Error('bloqueado');
	}
	setItem(): void {
		throw new Error('bloqueado');
	}
}

const estado = () => ({
	concursoId: preferencias.concursoId,
	cargoId: preferencias.cargoId,
	disciplina: preferencias.disciplina
});
const VAZIO = { concursoId: null, cargoId: null, disciplina: null };

let arm: StorageFalso;
const gravado = () => JSON.parse(arm.getItem(CHAVE) ?? 'null');
const comGravado = (valor: string) => {
	arm.setItem(CHAVE, valor);
	carregar(arm);
};

beforeEach(() => {
	arm = new StorageFalso();
	carregar(arm);
});

describe('preferencias', () => {
	it('sem nada gravado, tudo null', () => {
		expect(estado()).toEqual(VAZIO);
	});

	it('concurso de cargo único preenche o cargo; de vários cargos, não', () => {
		preferencias.escolherConcurso('pf-agente');
		expect(estado()).toEqual({ concursoId: 'pf-agente', cargoId: 'agente', disciplina: null });
		preferencias.escolherConcurso('cgu-affc-ti');
		expect(estado()).toEqual({ concursoId: 'cgu-affc-ti', cargoId: null, disciplina: null });
	});

	it('trocar cargo limpa a disciplina', () => {
		preferencias.escolherConcurso('cgu-affc-ti');
		preferencias.escolherCargo('auditor-ti');
		preferencias.escolherDisciplina('Ciência de Dados');
		expect(preferencias.disciplina).toBe('Ciência de Dados');
		preferencias.escolherCargo('auditor-geral');
		expect(estado()).toEqual({ concursoId: 'cgu-affc-ti', cargoId: 'auditor-geral', disciplina: null });
	});

	it('mesmo concurso de novo preserva cargo e disciplina; outro concurso limpa', () => {
		preferencias.escolherConcurso('cgu-affc-ti');
		preferencias.escolherCargo('auditor-ti');
		preferencias.escolherDisciplina('Ciência de Dados');
		preferencias.escolherConcurso('cgu-affc-ti');
		expect(estado()).toEqual({ concursoId: 'cgu-affc-ti', cargoId: 'auditor-ti', disciplina: 'Ciência de Dados' });
		preferencias.escolherConcurso('receita-auditor');
		expect(estado()).toEqual({ concursoId: 'receita-auditor', cargoId: null, disciplina: null });
	});

	it('valores que não pertencem ao concurso/cargo atual são ignorados', () => {
		preferencias.escolherConcurso('nao-existe');
		expect(estado()).toEqual(VAZIO);
		expect(arm.getItem(CHAVE)).toBeNull();
		preferencias.escolherConcurso('cgu-affc-ti');
		preferencias.escolherCargo('agente');
		expect(preferencias.cargoId).toBeNull();
		preferencias.escolherCargo('auditor-ti');
		preferencias.escolherDisciplina('Direito Penal');
		expect(preferencias.disciplina).toBeNull();
		expect(gravado()).toEqual({ concursoId: 'cgu-affc-ti', cargoId: 'auditor-ti', disciplina: null });
	});

	it('persiste e relê no formato exato do contrato', () => {
		preferencias.escolherConcurso('cgu-affc-ti');
		preferencias.escolherCargo('auditor-ti');
		preferencias.escolherDisciplina('Governança de TI');
		expect(arm.length).toBe(1);
		expect(arm.key(0)).toBe(CHAVE);
		expect(arm.getItem(CHAVE)).toBe(
			'{"concursoId":"cgu-affc-ti","cargoId":"auditor-ti","disciplina":"Governança de TI"}'
		);
		carregar(new StorageFalso());
		expect(estado()).toEqual(VAZIO);
		carregar(arm);
		carregar(arm); // idempotente
		expect(estado()).toEqual({ concursoId: 'cgu-affc-ti', cargoId: 'auditor-ti', disciplina: 'Governança de TI' });
	});

	it('JSON corrompido vira vazio sem lançar', () => {
		for (const lixo of ['{nao e json', '42', '"texto"', '[]', 'null', '{"concursoId":7}']) {
			expect(() => comGravado(lixo)).not.toThrow();
			expect(estado()).toEqual(VAZIO);
		}
	});

	it('concurso gravado que sumiu dos dados vira vazio (cascata)', () => {
		comGravado('{"concursoId":"sumiu","cargoId":"auditor-ti","disciplina":"Ciência de Dados"}');
		expect(estado()).toEqual(VAZIO);
	});

	it('cargo fora do concurso zera cargo e disciplina; disciplina fora do cargo vira null', () => {
		comGravado('{"concursoId":"cgu-affc-ti","cargoId":"agente","disciplina":"Ciência de Dados"}');
		expect(estado()).toEqual({ concursoId: 'cgu-affc-ti', cargoId: null, disciplina: null });
		comGravado('{"concursoId":"cgu-affc-ti","cargoId":"auditor-geral","disciplina":"Ciência de Dados"}');
		expect(estado()).toEqual({ concursoId: 'cgu-affc-ti', cargoId: 'auditor-geral', disciplina: null });
	});

	it('concurso gravado de cargo único sem cargo recebe o cargo na leitura', () => {
		comGravado('{"concursoId":"pf-agente","cargoId":null,"disciplina":null}');
		expect(estado()).toEqual({ concursoId: 'pf-agente', cargoId: 'agente', disciplina: null });
	});

	it('armazenamento que lança: nada lança e o estado muda em memória (janela privada)', () => {
		const bloqueado = new StorageQueLanca();
		expect(() => carregar(bloqueado)).not.toThrow();
		expect(estado()).toEqual(VAZIO);
		expect(() => {
			preferencias.escolherConcurso('cgu-affc-ti');
			preferencias.escolherCargo('auditor-ti');
			preferencias.escolherDisciplina('Ciência de Dados');
		}).not.toThrow();
		expect(estado()).toEqual({ concursoId: 'cgu-affc-ti', cargoId: 'auditor-ti', disciplina: 'Ciência de Dados' });
	});

	it('sem armazenamento algum (null) funciona só em memória', () => {
		carregar(null);
		preferencias.escolherConcurso('pf-agente');
		expect(preferencias.cargoId).toBe('agente');
	});
});

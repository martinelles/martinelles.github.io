// Store de tema (FR-001, FR-002, FR-003): leitura da chave, regra de resolução, ouvinte do aparelho
// e paridade com o script inline de src/app.html. Contrato: contracts/tema.md §2, §3 e §4.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CHAVE_TEMA, carregarTema, tema, type AlvoTema, type PreferenciaTema, type Tema } from '$lib/tema.svelte';
import { StorageFalso, StorageQueLanca, StorageSoLeitura } from './feed/apoio';

/** MediaQueryList falso: conta ouvintes e dispara `change`. */
class MqFalso {
	ouvintes = new Set<(e: MediaQueryListEvent) => void>();
	constructor(public matches: boolean) {}
	addEventListener(_tipo: 'change', fn: (e: MediaQueryListEvent) => void) {
		this.ouvintes.add(fn);
	}
	removeEventListener(_tipo: 'change', fn: (e: MediaQueryListEvent) => void) {
		this.ouvintes.delete(fn);
	}
	mudar(matches: boolean) {
		this.matches = matches;
		for (const fn of this.ouvintes) fn({ matches } as MediaQueryListEvent);
	}
}
const mqDe = (escuro: boolean) => new MqFalso(escuro) as unknown as MediaQueryList & MqFalso;

/** Alvo que registra cada tema aplicado. */
function alvoFalso(): AlvoTema & { chamadas: Tema[] } {
	const chamadas: Tema[] = [];
	return { chamadas, definir: (t) => void chamadas.push(t) };
}

function armCom(valor?: string): StorageFalso {
	const arm = new StorageFalso();
	if (valor !== undefined) arm.setItem(CHAVE_TEMA, valor);
	return arm;
}

const INVALIDOS = ['lixo{', '{"tema":"roxo"}', '"kindle"', '{"tema":null}'];

describe('carregarTema', () => {
	it('1: nada gravado e aparelho claro ⇒ sistema, aventura', () => {
		const alvo = alvoFalso();
		carregarTema(armCom(), mqDe(false), alvo);
		expect(tema.preferencia).toBe('sistema');
		expect(tema.ativo).toBe('aventura');
		expect(alvo.chamadas).toEqual(['aventura']);
	});

	it('2: nada gravado e aparelho escuro ⇒ kindle-escuro', () => {
		carregarTema(armCom(), mqDe(true), alvoFalso());
		expect(tema.ativo).toBe('kindle-escuro');
	});

	it('3: kindle gravado vence o aparelho escuro', () => {
		carregarTema(armCom('{"tema":"kindle"}'), mqDe(true), alvoFalso());
		expect(tema.preferencia).toBe('kindle');
		expect(tema.ativo).toBe('kindle');
	});

	it.each(INVALIDOS)('4: gravado %s ⇒ sistema, sem apagar nem reescrever', (valor) => {
		const arm = armCom(valor);
		carregarTema(arm, mqDe(false), alvoFalso());
		expect(tema.preferencia).toBe('sistema');
		expect(arm.getItem(CHAVE_TEMA)).toBe(valor);
		expect(arm.length).toBe(1);
	});

	it('5: armazenamento que lança ⇒ sistema, sem exceção', () => {
		expect(() => carregarTema(new StorageQueLanca(), mqDe(false), alvoFalso())).not.toThrow();
		expect(tema.preferencia).toBe('sistema');
		expect(tema.ativo).toBe('aventura');
	});

	it('11: chamado duas vezes deixa um ouvinte só', () => {
		const mq = mqDe(false);
		carregarTema(armCom(), mq, alvoFalso());
		carregarTema(armCom(), mq, alvoFalso());
		expect(mq.ouvintes.size).toBe(1);
	});

	it('11b: trocar de MediaQueryList solta o ouvinte do anterior', () => {
		const a = mqDe(false);
		const b = mqDe(false);
		carregarTema(armCom(), a, alvoFalso());
		carregarTema(armCom(), b, alvoFalso());
		expect(a.ouvintes.size).toBe(0);
		expect(b.ouvintes.size).toBe(1);
	});

	it('12: sem matchMedia, sistema resolve para aventura', () => {
		carregarTema(armCom(), null, alvoFalso());
		expect(tema.ativo).toBe('aventura');
	});

	it('sem armazenamento nem alvo, não lança', () => {
		expect(() => carregarTema(null, null, null)).not.toThrow();
		expect(() => tema.escolher('kindle')).not.toThrow();
		expect(tema.ativo).toBe('kindle');
	});
});

describe('tema.escolher', () => {
	it('6: aplica e grava exatamente {"tema":"kindle"}', () => {
		const arm = armCom();
		const alvo = alvoFalso();
		carregarTema(arm, mqDe(false), alvo);
		tema.escolher('kindle');
		expect(alvo.chamadas.at(-1)).toBe('kindle');
		expect(arm.getItem(CHAVE_TEMA)).toBe('{"tema":"kindle"}');
	});

	it('6b: escolher sistema de volta grava e segue o aparelho', () => {
		const arm = armCom('{"tema":"kindle"}');
		carregarTema(arm, mqDe(true), alvoFalso());
		tema.escolher('sistema');
		expect(tema.ativo).toBe('kindle-escuro');
		expect(arm.getItem(CHAVE_TEMA)).toBe('{"tema":"sistema"}');
	});

	it('7: valor fora da lista é ignorado', () => {
		const arm = armCom();
		const alvo = alvoFalso();
		carregarTema(arm, mqDe(false), alvo);
		tema.escolher('roxo' as unknown as PreferenciaTema);
		expect(tema.preferencia).toBe('sistema');
		expect(alvo.chamadas).toEqual(['aventura']);
		expect(arm.getItem(CHAVE_TEMA)).toBeNull();
	});

	it('8: gravação que falha deixa a escolha em memória', () => {
		carregarTema(new StorageSoLeitura(), mqDe(false), alvoFalso());
		expect(() => tema.escolher('kindle')).not.toThrow();
		expect(tema.ativo).toBe('kindle');
	});
});

describe('ouvinte do aparelho', () => {
	it('9: em sistema, o aparelho escurecer aplica kindle-escuro', () => {
		const mq = mqDe(false);
		const alvo = alvoFalso();
		carregarTema(armCom(), mq, alvo);
		mq.mudar(true);
		expect(tema.ativo).toBe('kindle-escuro');
		expect(alvo.chamadas.at(-1)).toBe('kindle-escuro');
	});

	it('10: com kindle fixo, o aparelho mudar não troca o tema', () => {
		const mq = mqDe(false);
		carregarTema(armCom('{"tema":"kindle"}'), mq, alvoFalso());
		mq.mudar(true);
		expect(tema.ativo).toBe('kindle');
		// O estado do aparelho foi acompanhado: voltar a `sistema` já resolve para o escuro.
		tema.escolher('sistema');
		expect(tema.ativo).toBe('kindle-escuro');
	});
});

describe('13: paridade com o script inline de src/app.html', () => {
	const html = readFileSync(fileURLToPath(new URL('../../src/app.html', import.meta.url)), 'utf8');
	const iife = html.match(/\(function \(\) \{([\s\S]*?)\}\)\(\);/);

	it('o script inline é um IIFE extraível', () => {
		expect(iife).not.toBeNull();
	});

	/** Roda o corpo do IIFE com globais falsos e devolve o data-tema que ele pôs. */
	function rodarScript(arm: Storage, escuro: boolean): string | undefined {
		const dataset: Record<string, string> = {};
		const documento = { documentElement: { dataset }, querySelector: () => null };
		const matchMedia = () => ({ matches: escuro });
		new Function('localStorage', 'matchMedia', 'document', iife![1])(arm, matchMedia, documento);
		return dataset.tema;
	}

	const casos: [string, () => Storage, boolean][] = [
		['1: nada gravado, claro', () => armCom(), false],
		['2: nada gravado, escuro', () => armCom(), true],
		['3: kindle gravado, escuro', () => armCom('{"tema":"kindle"}'), true],
		...INVALIDOS.map((v): [string, () => Storage, boolean] => [`4: gravado ${v}, escuro`, () => armCom(v), true]),
		['5: armazenamento que lança, claro', () => new StorageQueLanca(), false]
	];

	it.each(casos)('%s', (_nome, arm, escuro) => {
		const alvo = alvoFalso();
		carregarTema(arm(), mqDe(escuro), alvo);
		expect(rodarScript(arm(), escuro)).toBe(tema.ativo);
		expect(alvo.chamadas.at(-1)).toBe(tema.ativo);
	});
});

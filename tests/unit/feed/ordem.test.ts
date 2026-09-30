import { describe, expect, it } from 'vitest';
import { embaralhar, hashTexto, mulberry32, ordemDoDia } from '$lib/feed/ordem';
import { TIPO_POR_INICIAL } from '$lib/feed/tipos';
import { indiceSintetico } from './apoio';

const indice = indiceSintetico(400);
const tipoDe = new Map(indice.posts.map((e) => [e.id, e.t]));
const materiaDe = new Map(indice.posts.map((e) => [e.id, e.m]));

describe('mulberry32, hashTexto, embaralhar', () => {
	it('mulberry32 é determinístico e fica em [0, 1)', () => {
		const a = mulberry32(42);
		const b = mulberry32(42);
		const xs = Array.from({ length: 1000 }, () => a());
		expect(xs).toEqual(Array.from({ length: 1000 }, () => b()));
		expect(xs.every((x) => x >= 0 && x < 1)).toBe(true);
		expect(mulberry32(43)()).not.toBe(xs[0]);
	});

	it('hashTexto é FNV-1a 32 bits', () => {
		expect(hashTexto('')).toBe(0x811c9dc5);
		expect(hashTexto('a')).toBe(0xe40c292c);
		expect(hashTexto('foobar')).toBe(0xbf9cf968);
	});

	it('embaralhar não muta a entrada e devolve permutação', () => {
		const lista = Array.from({ length: 50 }, (_, i) => i);
		const copia = [...lista];
		const saida = embaralhar(lista, mulberry32(1));
		expect(lista).toEqual(copia);
		expect(saida).not.toEqual(lista);
		expect([...saida].sort((x, y) => x - y)).toEqual(lista);
		expect(embaralhar([], mulberry32(1))).toEqual([]);
	});
});

describe('ordemDoDia', () => {
	it('mesma entrada e mesmo dia ⇒ mesma saída', () => {
		expect(ordemDoDia(indice, {}, '2026-09-30')).toEqual(ordemDoDia(indice, {}, '2026-09-30'));
	});

	it('dia diferente ⇒ ordem diferente', () => {
		expect(ordemDoDia(indice, {}, '2026-10-01')).not.toEqual(ordemDoDia(indice, {}, '2026-09-30'));
	});

	it('é permutação dos ids filtrados', () => {
		const ordem = ordemDoDia(indice, {}, '2026-09-30');
		expect(ordem).toHaveLength(indice.posts.length);
		expect(new Set(ordem).size).toBe(ordem.length);
		expect([...ordem].sort()).toEqual(indice.posts.map((e) => e.id).sort());
	});

	it('respeita a proporção q3 : l2 : r1 : f2 no início', () => {
		const ordem = ordemDoDia(indice, {}, '2026-09-30');
		const padrao = 'qqqllrff';
		expect(ordem.slice(0, 32).map((id) => tipoDe.get(id)).join('')).toBe(padrao.repeat(4));
	});

	it('quando uma fila acaba, as outras continuam', () => {
		const pequeno = indiceSintetico(8); // 2 de cada tipo
		const tipos = ordemDoDia(pequeno, {}, '2026-09-30').map((id) => pequeno.posts.find((e) => e.id === id)!.t);
		expect(tipos.join('')).toBe('qqllrffr');
	});

	it('filtra por matéria e por tipo', () => {
		const porMateria = ordemDoDia(indice, { materia: 'auditoria' }, '2026-09-30');
		expect(porMateria.length).toBe(indice.posts.filter((e) => e.m === 'auditoria').length);
		expect(porMateria.every((id) => materiaDe.get(id) === 'auditoria')).toBe(true);

		const porTipo = ordemDoDia(indice, { tipo: 'lei' }, '2026-09-30');
		expect(porTipo.length).toBe(100);
		expect(porTipo.every((id) => TIPO_POR_INICIAL[tipoDe.get(id)!] === 'lei')).toBe(true);

		const ambos = ordemDoDia(indice, { materia: 'auditoria', tipo: 'questao' }, '2026-09-30');
		expect(ambos.length).toBeGreaterThan(0);
		expect(ambos.every((id) => materiaDe.get(id) === 'auditoria' && tipoDe.get(id) === 'q')).toBe(true);

		expect(ordemDoDia(indice, { materia: 'nao-existe' }, '2026-09-30')).toEqual([]);
	});
});

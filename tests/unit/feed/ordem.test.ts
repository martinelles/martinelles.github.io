import { describe, expect, it } from 'vitest';
import { embaralhar, hashTexto, mulberry32, ordemDoDia } from '$lib/feed/ordem';
import { TIPO_POR_INICIAL, type Indice } from '$lib/feed/tipos';
import { indiceSintetico } from './apoio';

const indice = indiceSintetico(400);
const tipoDe = new Map(indice.posts.map((e) => [e.id, e.t]));
const materiaDe = new Map(indice.posts.map((e) => [e.id, e.m]));

/** Índice com tópico: questões em rodízio entre FAG-01, FAG-02 e sem tópico; outros tipos nunca têm `tp`. */
function indiceComTopico(n: number): Indice {
	const base = indiceSintetico(n);
	let k = 0;
	return {
		...base,
		posts: base.posts.map((e) => {
			if (e.t !== 'q') return e;
			const tp = ['FAG-01', 'FAG-02', undefined][k++ % 3];
			return tp === undefined ? e : { ...e, tp };
		})
	};
}

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

	it('filtra por tópico: só entradas com tp igual, sem repetição', () => {
		const ind = indiceComTopico(400);
		const esperado = ind.posts.filter((e) => e.tp === 'FAG-02').map((e) => e.id);
		expect(esperado.length).toBeGreaterThan(0);
		const ordem = ordemDoDia(ind, { topico: 'FAG-02' }, '2026-09-30');
		expect(new Set(ordem).size).toBe(ordem.length);
		expect([...ordem].sort()).toEqual([...esperado].sort());
	});

	it('tópico combina com tipo e matéria', () => {
		const ind = indiceComTopico(400);
		const qTopico = ordemDoDia(ind, { topico: 'FAG-01', tipo: 'questao' }, '2026-09-30');
		expect(qTopico.length).toBe(ind.posts.filter((e) => e.tp === 'FAG-01').length);
		expect(ordemDoDia(ind, { topico: 'FAG-01', tipo: 'lei' }, '2026-09-30')).toEqual([]);
		const comMateria = ordemDoDia(ind, { topico: 'FAG-01', materia: 'auditoria' }, '2026-09-30');
		expect(comMateria.length).toBe(ind.posts.filter((e) => e.tp === 'FAG-01' && e.m === 'auditoria').length);
	});

	it('tópico inexistente ⇒ vazio', () => {
		expect(ordemDoDia(indiceComTopico(400), { topico: 'XYZ-99' }, '2026-09-30')).toEqual([]);
	});

	it('tópico entra na semente; sem tópico a ordem é a de antes', () => {
		const ind = indiceComTopico(400);
		const a = ordemDoDia(ind, { topico: 'FAG-01' }, '2026-09-30');
		expect(ordemDoDia(ind, { topico: 'FAG-01' }, '2026-09-30')).toEqual(a);
		// Semente sem tópico: mesmo resultado de um índice sem `tp` (filtros antigos não mudam).
		expect(ordemDoDia(ind, { tipo: 'questao' }, '2026-09-30')).toEqual(ordemDoDia(indice, { tipo: 'questao' }, '2026-09-30'));
		// Mesmo conjunto embaralhado com e sem tópico na semente dá ordens diferentes.
		const so = { posts: ind.posts.filter((e) => e.tp === 'FAG-01') };
		expect(ordemDoDia(so, { topico: 'FAG-01' }, '2026-09-30')).not.toEqual(ordemDoDia(so, {}, '2026-09-30'));
	});
});

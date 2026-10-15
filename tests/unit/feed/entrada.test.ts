import { describe, expect, it } from 'vitest';
import { naMateria, noTopico, topicosDa } from '$lib/feed/entrada';
import { ordemDoDia } from '$lib/feed/ordem';
import type { EntradaIndice } from '$lib/feed/tipos';

const posts: EntradaIndice[] = [
	{ id: 'q:1', t: 'q', m: 'c5', l: 'c5-1', tp: 'AGI-01', m2: 'aud-e1', tp2: 'AUD-E1-1.2' },
	{ id: 'q:2', t: 'q', m: 'c5', l: 'c5-1', tp: 'AGI-02' },
	{ id: 'q:3', t: 'q', m: 'cd-e1', l: 'cd-e1-1', tp: 'EPA-01' }
];

describe('segundo tópico no índice', () => {
	it('a entrada vale para as duas disciplinas e os dois tópicos', () => {
		expect(naMateria(posts[0], 'c5')).toBe(true);
		expect(naMateria(posts[0], 'aud-e1')).toBe(true);
		expect(naMateria(posts[1], 'aud-e1')).toBe(false);
		expect(noTopico(posts[0], 'AUD-E1-1.2')).toBe(true);
		expect(topicosDa(posts[0])).toEqual(['AGI-01', 'AUD-E1-1.2']);
		expect(topicosDa(posts[1])).toEqual(['AGI-02']);
	});

	it('o filtro por disciplina e por tópico acha a questão pela segunda; a P3 da outra especialidade sai', () => {
		expect(ordemDoDia({ posts }, { materia: 'aud-e1', especialidade: 'auditoria' }, '2026-10-15')).toEqual(['q:1']);
		expect(ordemDoDia({ posts }, { topico: 'AUD-E1-1.2' }, '2026-10-15')).toEqual(['q:1']);
		expect(ordemDoDia({ posts }, { especialidade: 'auditoria' }, '2026-10-15').sort()).toEqual(['q:1', 'q:2']);
	});
});

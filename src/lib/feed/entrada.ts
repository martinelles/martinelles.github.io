/**
 * Leitura de uma entrada do índice com o segundo tópico (planos/2026-10-15-feed-por-edital.md):
 * questão de P1/P2 que também cobre um subitem da P3 de Auditoria aparece nas duas disciplinas.
 */
import type { EntradaIndice } from './tipos';

/** A entrada pertence à disciplina, como principal (`m`) ou segunda (`m2`). */
export const naMateria = (e: Pick<EntradaIndice, 'm' | 'm2'>, materia: string): boolean =>
	e.m === materia || e.m2 === materia;

/** A entrada é do tópico, como principal (`tp`) ou segundo (`tp2`). */
export const noTopico = (e: Pick<EntradaIndice, 'tp' | 'tp2'>, topico: string): boolean =>
	e.tp === topico || e.tp2 === topico;

/** Tópicos da entrada, para contar questões por tópico. */
export const topicosDa = (e: Pick<EntradaIndice, 'tp' | 'tp2'>): string[] =>
	[e.tp, e.tp2].filter((t): t is string => !!t);

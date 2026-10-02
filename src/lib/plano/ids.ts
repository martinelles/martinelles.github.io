/**
 * Ids de tarefa (emenda D4): `<topicoId>:L` (Leitura) e `<topicoId>:Q` (Questões).
 * Derivados só do id, para valer também para registros de tarefas que sumiram do plano.
 */
import type { ModoTarefa } from './tipos';

export const SUFIXO_LEITURA = ':L';
export const SUFIXO_QUESTOES = ':Q';

/** Id da tarefa de um tópico no modo dado. */
export function idTarefa(topicoId: string, modo: ModoTarefa): string {
	return topicoId + (modo === 'leitura' ? SUFIXO_LEITURA : SUFIXO_QUESTOES);
}

/** `topicoId` de um id de tarefa (`CDA-01:Q` ⇒ `CDA-01`); id sem sufixo `:L`/`:Q` é ele mesmo. */
export function topicoDe(id: string): string {
	return id.endsWith(SUFIXO_LEITURA) || id.endsWith(SUFIXO_QUESTOES) ? id.slice(0, -2) : id;
}

/** Modo pelo sufixo do id, ou `null` se o id não tem sufixo `:L`/`:Q`. */
export function modoDe(id: string): ModoTarefa | null {
	return id.endsWith(SUFIXO_LEITURA) ? 'leitura' : id.endsWith(SUFIXO_QUESTOES) ? 'questoes' : null;
}

/** Só a tarefa de Questões aceita questões feitas/certas ao concluir (FR-014). */
export function aceitaQuestoes(id: string): boolean {
	return modoDe(id) === 'questoes';
}

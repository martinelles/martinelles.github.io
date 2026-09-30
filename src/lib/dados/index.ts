import concursos from './concursos.json';
import ferramentas from './ferramentas.json';
import config from './config.json';
import { validarDados } from './validar';
import type { Ferramenta } from './tipos';

export const dados = validarDados({ concursos, ferramentas, config });
/** O único concurso do app (FR-001); o validador garante que ele existe. */
export const concursoCgu = dados.concursos[0];
export const buscarFerramenta = (id: string) => dados.ferramentas.find((f) => f.id === id) ?? null;

/** Atalhos que abrem o feed filtrado por tipo de post (FR-015); os demais seguem para "em breve". */
const TIPO_NO_FEED: Readonly<Record<string, 'questao' | 'resumo' | 'flashcard' | 'lei'>> = {
	'questoes-objetivas': 'questao',
	resumos: 'resumo',
	flashcards: 'flashcard',
	jurisprudencia: 'lei'
};

/** Endereço aberto pelo cartão da ferramenta: o feed filtrado ou a tela "em breve". */
export function rotaDaFerramenta(f: Pick<Ferramenta, 'id'>): string {
	const tipo = TIPO_NO_FEED[f.id];
	return tipo ? `/?tipo=${tipo}` : `/ferramenta/${f.id}`;
}

export { validarDados } from './validar';
export * from './tipos';

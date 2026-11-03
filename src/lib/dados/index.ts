import concursos from './concursos.json';
import ferramentas from './ferramentas.json';
import config from './config.json';
import mentoria from './mentoria.json';
import { validarDados } from './validar';
import type { Ferramenta } from './tipos';

export const dados = validarDados({ concursos, ferramentas, config, mentoria });
/** O único concurso do app (FR-001); o validador garante que ele existe. */
export const concursoCgu = dados.concursos[0];
export const buscarFerramenta = (id: string) => dados.ferramentas.find((f) => f.id === id) ?? null;

/**
 * Playlist da mentoria da disciplina do subitem (planos/2026-11-03-aulas-da-mentoria-no-painel.md):
 * `E2 1.2` no cargo cd → `CD:E2`; `B1 8.2` → `B1`. Sem playlist da disciplina, `undefined`.
 * @param cargo cargo do plano das Missões (a P3 é do cargo)
 * @param cod código do guia, como `E1 1.1`
 */
export function aulaDaMentoria(cargo: 'cd' | 'aud', cod: string): string | undefined {
	const disciplina = cod.split(' ')[0];
	const chave = /^E/.test(cod) ? `${cargo.toUpperCase()}:${disciplina}` : disciplina;
	return dados.mentoria?.playlists[chave];
}

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

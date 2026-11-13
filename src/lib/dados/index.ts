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
 * Aula da mentoria do subitem (planos/2026-11-03 e 2026-11-08-catalogo-de-aulas-da-mentoria.md):
 * `E2 1.2` no cargo cd → chave `CD:E2-1.2` → a aula que cobre o subitem (a do pai, quando o
 * subitem exato não tem); sem aula mapeada, a playlist da disciplina. Sem nada, `undefined`.
 * @param cargo cargo do plano das Missões (a P3 é do cargo)
 * @param cod código do guia, como `E1 1.1`
 */
export function aulaDaMentoria(cargo: 'cd' | 'aud', cod: string): string | undefined {
	const [disciplina, numero] = cod.split(' ');
	const pref = /^E/.test(cod) ? `${cargo.toUpperCase()}:` : '';
	const chave = `${pref}${disciplina}-${numero}`;
	const aulas = dados.mentoria?.aulas;
	if (aulas?.length) {
		const pai = chave.replace(/\.\d+$/, '');
		const aula = aulas.find((a) => a.subitens.includes(chave)) ?? aulas.find((a) => a.subitens.includes(pai));
		if (aula) return aula.url;
	}
	return dados.mentoria?.playlists[`${pref}${disciplina}`];
}

/**
 * Aula do catálogo pelo id (UUID da plataforma): o plano das Missões por aula referencia a
 * aula pelo `cid`, e o enriquecimento (URL, caderno do TEC, subitens) vem daqui.
 */
export function aulaPorId(id: string) {
	return dados.mentoria?.aulas?.find((a) => a.id === id) ?? null;
}

/** Atalhos que abrem o feed filtrado por tipo de post (FR-015). */
const TIPO_NO_FEED: Readonly<Record<string, 'questao' | 'resumo' | 'flashcard' | 'lei'>> = {
	'questoes-objetivas': 'questao',
	resumos: 'resumo',
	flashcards: 'flashcard',
	jurisprudencia: 'lei'
};

/** Ferramentas que já têm tela própria; as demais seguem para a tela "em breve". */
const ROTA_PROPRIA: Readonly<Record<string, string>> = {
	'questoes-discursivas': '/discursivas'
};

/** Endereço aberto pelo cartão da ferramenta: o feed filtrado, a tela própria ou a "em breve". */
export function rotaDaFerramenta(f: Pick<Ferramenta, 'id'>): string {
	const tipo = TIPO_NO_FEED[f.id];
	if (tipo) return `/?tipo=${tipo}`;
	return ROTA_PROPRIA[f.id] ?? `/ferramenta/${f.id}`;
}

export { validarDados } from './validar';
export * from './tipos';

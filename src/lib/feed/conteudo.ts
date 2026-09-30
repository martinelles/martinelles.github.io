/**
 * Carga do conteúdo do feed (research R3): `indice.json` e `materias.json` inteiros, corpo dos posts
 * em lotes buscados sob demanda. Cada lote é buscado uma vez só (promessa compartilhada entre
 * chamadas concorrentes); lote que falha sai do cache para ser tentado de novo na próxima chamada.
 */
import type { Indice, Materia, Post } from './tipos';

export const BASE_CONTEUDO = '/conteudo/';

export type Buscar = (url: string) => Promise<unknown>;

export async function fetchJson(url: string): Promise<unknown> {
	const resposta = await fetch(url);
	if (!resposta.ok) throw new Error(`HTTP ${resposta.status} em ${url}`);
	return resposta.json();
}

export interface ResultadoPosts {
	/** Posts encontrados, na ordem pedida. Id inexistente no índice ou no lote é ignorado. */
	posts: Post[];
	/** Ids cujo lote falhou ao carregar (rede); podem ser pedidos de novo. */
	falharam: string[];
}

export interface Repositorio {
	indice(): Promise<Indice>;
	materias(): Promise<Materia[]>;
	posts(ids: string[]): Promise<ResultadoPosts>;
}

export function criarRepositorio(buscar: Buscar = fetchJson, base: string = BASE_CONTEUDO): Repositorio {
	let indicePromessa: Promise<Indice> | null = null;
	let materiasPromessa: Promise<Materia[]> | null = null;
	let lotePorId: Promise<Map<string, string>> | null = null;
	const lotes = new Map<string, Promise<Map<string, Post>>>();

	/** Memoiza a promessa; se ela rejeitar, esquece para permitir nova tentativa. */
	function memo<T>(obter: () => Promise<T> | null, guardar: (p: Promise<T> | null) => void, criar: () => Promise<T>): Promise<T> {
		const atual = obter();
		if (atual) return atual;
		const nova = criar();
		guardar(nova);
		nova.catch(() => {
			if (obter() === nova) guardar(null);
		});
		return nova;
	}

	const indice = (): Promise<Indice> =>
		memo(
			() => indicePromessa,
			(p) => (indicePromessa = p),
			async () => (await buscar(`${base}indice.json`)) as Indice
		);

	const materias = (): Promise<Materia[]> =>
		memo(
			() => materiasPromessa,
			(p) => (materiasPromessa = p),
			async () => (await buscar(`${base}materias.json`)) as Materia[]
		);

	const mapaLotes = (): Promise<Map<string, string>> =>
		memo(
			() => lotePorId,
			(p) => (lotePorId = p),
			async () => new Map((await indice()).posts.map((e) => [e.id, String(e.l)]))
		);

	function lote(chave: string, arquivo: string): Promise<Map<string, Post>> {
		const atual = lotes.get(chave);
		if (atual) return atual;
		const nova = (async () => {
			const lista = (await buscar(`${base}${arquivo}`)) as Post[];
			return new Map(lista.map((p) => [p.id, p]));
		})();
		lotes.set(chave, nova);
		nova.catch(() => {
			if (lotes.get(chave) === nova) lotes.delete(chave);
		});
		return nova;
	}

	async function posts(ids: string[]): Promise<ResultadoPosts> {
		const idx = await indice();
		const porId = await mapaLotes();

		const idsPorLote = new Map<string, string[]>();
		for (const id of ids) {
			const chave = porId.get(id);
			if (chave === undefined || idx.lotes[chave] === undefined) continue;
			const grupo = idsPorLote.get(chave);
			if (grupo) grupo.push(id);
			else idsPorLote.set(chave, [id]);
		}

		const encontrados = new Map<string, Post>();
		const falharam = new Set<string>();
		await Promise.all(
			[...idsPorLote].map(async ([chave, grupo]) => {
				try {
					const conteudo = await lote(chave, idx.lotes[chave]);
					for (const id of grupo) {
						const post = conteudo.get(id);
						if (post) encontrados.set(id, post);
					}
				} catch {
					for (const id of grupo) falharam.add(id);
				}
			})
		);

		return {
			posts: ids.flatMap((id) => encontrados.get(id) ?? []),
			falharam: ids.filter((id) => falharam.has(id))
		};
	}

	return { indice, materias, posts };
}

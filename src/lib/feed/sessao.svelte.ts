/**
 * Sessão do feed para um filtro (FR-010, research R5): páginas de 10 posts na ordem do dia,
 * sem nunca repetir um post já mostrado no mesmo filtro enquanto a aba estiver aberta.
 * Trocar de filtro = criar outra sessão; o conjunto de mostrados por filtro vive neste módulo.
 */
import type { Repositorio } from './conteudo';
import { ordemDoDia } from './ordem';
import type { Filtro, Post } from './tipos';

export const TAMANHO_PAGINA = 10;

export const AVISO_FALHA_CARGA = 'Não foi possível carregar alguns posts. Tentaremos de novo ao continuar rolando.';

/** Ids já mostrados, por filtro, enquanto a aba estiver aberta. */
const mostradosPorFiltro = new Map<string, Set<string>>();

export function chaveFiltro(filtro: Filtro): string {
	return `${filtro.materia ?? '*'}|${filtro.tipo ?? '*'}`;
}

/** Esquece o que já foi mostrado em todos os filtros (testes; não usado pelas telas). */
export function esquecerMostrados(): void {
	mostradosPorFiltro.clear();
}

export interface Sessao {
	readonly filtro: Filtro;
	/** Posts carregados nesta sessão, na ordem de exibição. */
	readonly posts: Post[];
	readonly carregando: boolean;
	/** A ordem do filtro esgotou: mostrar o fim do feed. Nunca volta a false. */
	readonly fim: boolean;
	/** Aviso da última página que falhou (total ou parcialmente); null quando a última deu certo. */
	readonly erro: string | null;
	/** Carrega a próxima página. Chamadas enquanto uma página carrega devolvem a mesma promessa. */
	proximaPagina(): Promise<void>;
}

export function criarSessao(repo: Repositorio, filtro: Filtro, dia: string): Sessao {
	const filtroCopia: Filtro = { ...filtro };
	const chave = chaveFiltro(filtroCopia);
	let mostrados = mostradosPorFiltro.get(chave);
	if (!mostrados) {
		mostrados = new Set();
		mostradosPorFiltro.set(chave, mostrados);
	}
	const vistos = mostrados;

	let posts = $state.raw<Post[]>([]);
	let carregando = $state(false);
	let fim = $state(false);
	let erro = $state<string | null>(null);

	let ordem: string[] | null = null;
	let cursor = 0;
	let emAndamento: Promise<void> | null = null;

	/** Avança o cursor sobre o prefixo já mostrado; o que sobra antes dele nunca é pedido de novo. */
	function avancar(lista: string[]) {
		while (cursor < lista.length && vistos.has(lista[cursor])) cursor++;
		if (cursor >= lista.length) fim = true;
	}

	async function carregarPagina(): Promise<void> {
		try {
			ordem ??= ordemDoDia(await repo.indice(), filtroCopia, dia);
			avancar(ordem);
			if (fim) {
				erro = null;
				return;
			}

			const pedidos: string[] = [];
			for (let i = cursor; i < ordem.length && pedidos.length < TAMANHO_PAGINA; i++) {
				if (!vistos.has(ordem[i])) pedidos.push(ordem[i]);
			}

			const { posts: novos, falharam } = await repo.posts(pedidos);
			const falhou = new Set(falharam);
			// Id que sumiu do conteúdo conta como consumido; só o que falhou por rede volta à fila.
			for (const id of pedidos) if (!falhou.has(id)) vistos.add(id);
			if (novos.length > 0) posts = [...posts, ...novos];
			erro = falhou.size > 0 ? AVISO_FALHA_CARGA : null;
			avancar(ordem);
		} catch {
			erro = AVISO_FALHA_CARGA;
		}
	}

	return {
		get filtro() {
			return filtroCopia;
		},
		get posts() {
			return posts;
		},
		get carregando() {
			return carregando;
		},
		get fim() {
			return fim;
		},
		get erro() {
			return erro;
		},
		proximaPagina(): Promise<void> {
			if (emAndamento) return emAndamento;
			if (fim) return Promise.resolve();
			carregando = true;
			emAndamento = carregarPagina().finally(() => {
				carregando = false;
				emAndamento = null;
			});
			return emAndamento;
		}
	};
}

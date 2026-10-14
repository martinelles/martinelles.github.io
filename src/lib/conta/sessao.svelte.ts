/**
 * Quem está logado e qual armazenamento os stores usam (fase 2 do plano
 * planos/2026-10-13-login-por-nome-backend-cloudflare.md). Sem login, é o `localStorage` de
 * sempre; com login, o `Storage` sincronizado. O nome é a credencial (decisão 1 do plano).
 */
import {
	ApiIndisponivel,
	armazenamentoSincronizado,
	CHAVE_SINC,
	lerServidor,
	type StorageSincronizado
} from './armazenamento';
import { CHAVES_SINCRONIZADAS, nomeValido, normalizarNome } from './regras';

export const CHAVE_USUARIO = 'painel-concurso:usuario:v1';

let usuario = $state<string | null>(null);
let atual: { local: Storage | null; sinc: StorageSincronizado | null } | null = null;

function tentarLocalStorage(): Storage | null {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
}

function lerUsuario(local: Storage | null): string | null {
	try {
		const u = local?.getItem(CHAVE_USUARIO) ?? null;
		return u && nomeValido(u) ? u : null;
	} catch {
		return null;
	}
}

/** Lido uma vez por aba. `local` e `f` só existem para teste. */
function iniciar(local = tentarLocalStorage(), f: typeof fetch = (...a) => globalThis.fetch(...a)) {
	if (atual) return atual;
	usuario = lerUsuario(local);
	const sinc = local && usuario ? armazenamentoSincronizado({ usuario, local, fetch: f }) : null;
	atual = { local, sinc };
	if (sinc) globalThis.addEventListener?.('online', () => void sinc.enviarPendentes());
	return atual;
}

/** O armazenamento que os stores recebem: sincronizado com login, `localStorage` sem. */
export function armazenamentoAtual(): Storage | null {
	const { local, sinc } = iniciar();
	return sinc ?? local;
}

/**
 * Ao abrir o app logado: sobe o que ficou pendente e traz o que o servidor tem de mais novo.
 * Se algo mudou aqui, chama `recarregar` para os stores lerem de novo. Falha de rede é silenciosa:
 * o app segue com o que tem no aparelho.
 */
export function sincronizarAoAbrir(recarregar: () => void): Promise<void> {
	const { sinc } = iniciar();
	if (!sinc) return (inicial = Promise.resolve());
	return (inicial = (async () => {
		try {
			await sinc.enviarPendentes();
			if ((await sinc.trazer()).length) recarregar();
		} catch {
			// Sem rede ou API fora do ar: fica para a próxima abertura.
		}
	})());
}

let inicial: Promise<void> | null = null;

/**
 * Termina quando a sincronização da abertura termina (ou na hora, se ela não começou). Quem grava
 * algo que deve vencer o servidor espera por ela: a marcação das Missões que pediu o login.
 */
export function sincronizacaoInicial(): Promise<void> {
	return inicial ?? Promise.resolve();
}

export const conta = {
	get usuario(): string | null {
		iniciar();
		return usuario;
	},
	/**
	 * Confere que a API responde, grava o nome e abre `destino` numa carga nova (que traz o
	 * progresso do servidor ao abrir). Lança `RangeError` para nome inválido e `ApiIndisponivel`
	 * quando o endereço não tem a API (GitHub Pages) ou não há rede.
	 */
	async entrar(
		texto: string,
		f: typeof fetch = (...a) => globalThis.fetch(...a),
		destino = '/painel'
	): Promise<void> {
		const nome = normalizarNome(texto);
		if (!nomeValido(nome)) throw new RangeError('O nome precisa de 3 a 30 letras ou números.');
		await lerServidor(nome, f);
		const local = tentarLocalStorage();
		if (!local) throw new ApiIndisponivel('este navegador não guarda dados');
		local.setItem(CHAVE_USUARIO, nome);
		// Carimbos de outro usuário não valem para este: o progresso local sobe só se o servidor não tiver nada.
		local.removeItem(CHAVE_SINC);
		globalThis.location.assign(destino);
	},
	/** Sobe o que falta, apaga o nome e o progresso deste aparelho e recarrega. */
	async sair(): Promise<void> {
		const { local, sinc } = iniciar();
		await sinc?.enviarPendentes();
		try {
			for (const k of [...CHAVES_SINCRONIZADAS, CHAVE_SINC, CHAVE_USUARIO]) local?.removeItem(k);
		} catch {
			// Armazenamento bloqueado: não havia o que apagar.
		}
		globalThis.location.assign('/painel/ajustes');
	}
};

export { ApiIndisponivel };

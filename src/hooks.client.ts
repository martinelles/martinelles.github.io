// Erro no navegador: a falha de carga de um pedaço do app, depois de um deploy, recarrega a página
// de destino em vez de mostrar "Internal Error" (src/lib/recarga.ts). Não há ouvinte de
// `vite:preloadError`: ele recarregaria a página atual, e não a de destino, e gastaria a trava.
import type { HandleClientError } from '@sveltejs/kit';
import { ehFalhaDeModulo, recarregarUmaVez } from '$lib/recarga';

function sessao(): Storage | null {
	try {
		return sessionStorage;
	} catch {
		return null;
	}
}

export const handleError: HandleClientError = ({ error, event, message }) => {
	if (ehFalhaDeModulo(error)) recarregarUmaVez(event.url.href, sessao());
	return { message };
};

/**
 * Embaralhamento por carga do app: cada atualização da página sorteia uma ordem nova do feed.
 * Dentro da mesma carga a ordem fica (voltar a um filtro não reembaralha o que já está na tela).
 * Exceção: a carga nova que o popup de login provoca mantém a ordem, para ela voltar ao post
 * que pediu o login.
 */
const CHAVE = 'painel-concurso:feed:rodada';

function sessao(): Storage | null {
	try {
		return globalThis.sessionStorage ?? null;
	} catch {
		return null;
	}
}

function iniciar(): string {
	try {
		const guardada = sessao()?.getItem(CHAVE);
		if (guardada) {
			sessao()?.removeItem(CHAVE);
			return guardada;
		}
	} catch {
		// Sem sessão: sorteia.
	}
	return Math.floor(Math.random() * 2 ** 32).toString(36);
}

export const rodada = iniciar();

/** A próxima carga desta aba usa a mesma ordem (só uma vez). */
export function manterRodada(manter = true): void {
	try {
		if (manter) sessao()?.setItem(CHAVE, rodada);
		else sessao()?.removeItem(CHAVE);
	} catch {
		// Sem sessão: a volta do login vem em outra ordem.
	}
}

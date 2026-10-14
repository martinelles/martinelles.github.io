/**
 * Embaralhamento do feed: cada carga do app e cada "puxar para atualizar" sorteiam uma ordem nova.
 * Fora disso a ordem fica (voltar a um filtro não reembaralha o que já está na tela).
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
	return sortear();
}

const sortear = () => Math.floor(Math.random() * 2 ** 32).toString(36);

let atual = iniciar();

export const rodadaAtual = (): string => atual;

/** Atualizar o feed: ordem nova a partir daqui. */
export function novaRodada(): string {
	atual = sortear();
	return atual;
}

/** A próxima carga desta aba usa a mesma ordem (só uma vez). */
export function manterRodada(manter = true): void {
	try {
		if (manter) sessao()?.setItem(CHAVE, atual);
		else sessao()?.removeItem(CHAVE);
	} catch {
		// Sem sessão: a volta do login vem em outra ordem.
	}
}

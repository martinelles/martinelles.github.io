/**
 * Versão nova publicada com o app aberto: o código antigo pede um pedaço (`/_app/immutable/...`)
 * que o deploy já apagou, e a navegação cairia no "Internal Error". O SvelteKit só recarrega
 * sozinho quando o `version.json` já mostra a versão nova, e o GitHub Pages guarda esse arquivo
 * por até 10 minutos (`max-age=600`). Aqui a falha de carga do módulo vira uma recarga da página
 * de destino, no máximo uma vez a cada minuto por aba, para não entrar em laço se o problema for
 * outro. Plano: planos/2026-10-15-recarga-apos-deploy.md.
 */

const CHAVE = 'painel-concurso:recarga';
const INTERVALO_MS = 60_000;

/** Mensagens de Chrome, Safari e Firefox para um `import()` ou pré-carga que falhou. */
const FALHA_DE_MODULO =
	/Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|Failed to load module script/i;

export function ehFalhaDeModulo(erro: unknown): boolean {
	const msg = erro instanceof Error ? erro.message : typeof erro === 'string' ? erro : '';
	return FALHA_DE_MODULO.test(msg);
}

/**
 * Recarrega `destino` se a última recarga desta aba foi há mais de um minuto. Devolve se recarregou.
 * Sem `sessionStorage`, recarrega sem a trava (o pior caso é a mesma tela de erro de antes).
 */
export function recarregarUmaVez(
	destino: string,
	sessao: Storage | null,
	agora = Date.now(),
	ir: (url: string) => void = (url) => location.assign(url)
): boolean {
	try {
		const ultima = Number(sessao?.getItem(CHAVE) ?? -Infinity);
		if (agora - ultima < INTERVALO_MS) return false;
		sessao?.setItem(CHAVE, String(agora));
	} catch {
		// Sessão bloqueada: segue sem a trava.
	}
	ir(destino);
	return true;
}

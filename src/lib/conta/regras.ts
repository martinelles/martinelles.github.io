/**
 * Regras da conta divididas entre o app e o Worker (`worker/`): o nome que vale como login e as
 * chaves do armazenamento que sobem para o servidor. Plano: planos/2026-10-13-login-por-nome-backend-cloudflare.md.
 */

/** Chave das marcações da página das Missões (`KEY` no script dela, no vault). */
export const CHAVE_MISSOES = 'missoes-cgu-2026';

/**
 * As chaves de progresso; qualquer outra não sobe. As quatro primeiras são dos stores do app,
 * escritas por extenso porque o Worker importa este arquivo e não pode puxar os stores (runas do
 * Svelte); `tests/unit/conta` confere que batem com `CHAVE_INTERACOES`, `CHAVE_ERROS`,
 * `CHAVE_FOCO` e `CHAVE_TEMA`. A última é das marcações das Missões, gravada pela página
 * (`/conteudo/artefatos/missoes.html`) e pelo painel (planos/2026-10-14-missao-unica.md).
 * `painel-concurso:plano:v1` (o registro do cronômetro antigo) saiu em 2026-10-14: o que já
 * subiu fica no D1, sem uso.
 */
export const CHAVES_SINCRONIZADAS: readonly string[] = [
	'painel-concurso:interacoes:v1',
	'painel-concurso:erros:v1',
	'painel-concurso:preferencias:v2',
	'painel-concurso:tema:v1',
	CHAVE_MISSOES
];

/** 3 a 30 caracteres, `a-z`, `0-9` e `-`, sem hífen nas pontas (decisão 2). */
export const NOME_RE = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

/** Teto de um valor gravado: o registro do plano de um ano inteiro fica bem abaixo disso. */
export const LIMITE_VALOR = 512 * 1024;

/** "Maria Sílva " → "maria-silva". Pode devolver texto que não passa em `NOME_RE` (curto demais). */
export function normalizarNome(texto: string): string {
	return texto
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 30)
		.replace(/-+$/, '');
}

export const nomeValido = (nome: string): boolean => NOME_RE.test(nome);
export const chaveSincronizada = (chave: string): boolean => CHAVES_SINCRONIZADAS.includes(chave);

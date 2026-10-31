import { expect, test, type Page } from '@playwright/test';

// Fracos primeiro: com o modo ligado, a fila de questões abre pelo tópico de pior acerto.
// O histórico é semeado no localStorage (interações v1); a ordem é conferida pelos data-post-id.

const CHAVE_INTERACOES = 'painel-concurso:interacoes:v1';
const CHAVE_PREFERENCIAS = 'painel-concurso:preferencias:v2';

test.beforeEach(async ({ page, context }) => {
	await context.clearCookies();
	await page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'));
});

const questoes = (page: Page) => page.locator('[data-tipo="questao"]');

test('fracos primeiro: pior tópico abre o feed e o modo persiste', async ({ page, request }) => {
	// Escolhe dois tópicos com questões suficientes no índice real.
	const indice = (await (await request.get('/conteudo/indice.json')).json()) as {
		posts: { id: string; t: string; tp?: string }[];
	};
	const porTopico = new Map<string, string[]>();
	for (const e of indice.posts) {
		if (e.t !== 'q' || e.tp === undefined) continue;
		const lista = porTopico.get(e.tp) ?? [];
		lista.push(e.id);
		porTopico.set(e.tp, lista);
	}
	const [fraco, forte] = [...porTopico.entries()].sort((a, b) => b[1].length - a[1].length);
	expect(fraco[1].length).toBeGreaterThanOrEqual(3);

	// Tudo do fraco errado; tudo do forte certo.
	const respostas: Record<string, { r: string; ok: boolean; em: string }> = {};
	for (const id of fraco[1]) respostas[id] = { r: 'C', ok: false, em: '2026-09-30' };
	for (const id of forte[1]) respostas[id] = { r: 'C', ok: true, em: '2026-09-30' };
	await page.addInitScript(
		([k, v]) => localStorage.setItem(k, v),
		[CHAVE_INTERACOES, JSON.stringify({ respostas })]
	);

	await page.goto('/');
	const botao = page.getByRole('button', { name: 'Fracos primeiro' });
	await expect(botao).toHaveAttribute('aria-pressed', 'false');
	await botao.click();
	await expect(botao).toHaveAttribute('aria-pressed', 'true');

	// As 3 primeiras questões (a primeira cota da intercalação) são do tópico fraco.
	await expect(questoes(page).first()).toBeVisible();
	const primeiras = (
		await questoes(page).evaluateAll((els) => els.slice(0, 3).map((e) => e.dataset.postId))
	).filter((id): id is string => typeof id === 'string');
	expect(primeiras.length).toBe(3);
	for (const id of primeiras) expect(fraco[1]).toContain(id);
	expect(primeiras.some((id) => forte[1].includes(id))).toBe(false);

	// O modo segue ligado depois de recarregar (preferências v2).
	await page.reload();
	await expect(page.getByRole('button', { name: 'Fracos primeiro' })).toHaveAttribute('aria-pressed', 'true');
	const gravado = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), CHAVE_PREFERENCIAS);
	expect(gravado.priorizarFracos).toBe(true);
});

test('desligar volta à ordem sorteada', async ({ page }) => {
	await page.goto('/');
	const botao = page.getByRole('button', { name: 'Fracos primeiro' });
	await botao.click();
	await expect(botao).toHaveAttribute('aria-pressed', 'true');
	await botao.click();
	await expect(botao).toHaveAttribute('aria-pressed', 'false');
	const gravado = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), CHAVE_PREFERENCIAS);
	expect(gravado.priorizarFracos).toBe(false);
});

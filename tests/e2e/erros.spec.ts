import { expect, test, type Locator, type Page } from '@playwright/test';

// Caderno de erros: questão errada no feed entra no caderno; 2 acertos de re-treino tiram.
// A re-resposta no caderno não pede login (é progresso, como o resto da página).

const CHAVE_ERROS = 'painel-concurso:erros:v1';

test.beforeEach(async ({ page, context }) => {
	await context.clearCookies();
	await page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'));
});

const itens = (page: Page) => page.locator('[data-post-id]');
const lerErros = (page: Page) =>
	page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), CHAVE_ERROS);

/** Responde "Certo" na próxima questão sem resposta até uma dar errado; devolve o post e o gabarito. */
async function errarUma(page: Page): Promise<{ post: Locator; gabarito: string }> {
	const popup = page.getByRole('dialog', { name: 'Entre para guardar sua resposta' });
	for (let i = 0; i < 8; i++) {
		const post = page.locator('[data-post-id]').nth(i);
		await post.scrollIntoViewIfNeeded();
		await post.getByRole('button', { name: 'Certo', exact: true, disabled: false }).first().click();
		if (await popup.isVisible()) await popup.getByRole('button', { name: 'Agora não' }).click();
		const resultado = post.getByText(/Você (acertou|errou — gabarito: (Certo|Errado))$/);
		await expect(resultado).toBeVisible();
		const texto = await resultado.innerText();
		const m = /gabarito: (Certo|Errado)/.exec(texto);
		if (m) return { post, gabarito: m[1] };
		// Acertou de primeira (gabarito era Certo): essa não entra no caderno, tenta a próxima.
	}
	throw new Error('nenhuma questão errada em 8 tentativas');
}

test('/erros vazio explica como funciona e a aba marca a página', async ({ page }) => {
	await page.goto('/erros');
	await expect(page).toHaveTitle('Caderno de erros · Painel de Concurso');
	await expect(page.getByRole('heading', { level: 1, name: 'Caderno de erros' })).toBeVisible();
	await expect(page.getByText('Nada errado por aqui — as questões que você errar no feed entram neste caderno.')).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Seções' }).getByRole('link', { name: 'Erros' })).toHaveAttribute(
		'aria-current',
		'page'
	);
});

test('erro no feed entra no caderno; 2 acertos tiram a questão', async ({ page }) => {
	// Errar uma no feed (popup de login dispensado: fica só no aparelho).
	await page.goto('/?tipo=questao');
	await expect(itens(page).first()).toBeVisible();
	const { post, gabarito } = await errarUma(page);
	const id = (await post.getAttribute('data-post-id')) as string;
	const gravado = await lerErros(page);
	expect(gravado[id]).toEqual({ acertos: 0, tentativas: 1, em: '2026-09-30' });

	// O caderno lista a questão como não respondida: dá para tentar de novo, sem popup.
	await page.goto('/erros');
	const item = page.locator(`[data-post-id="${id}"]`);
	await expect(item).toBeVisible();
	await expect(page.getByText('Questão errada no feed entra aqui. Acerte 2 vezes para tirá-la.')).toBeVisible();
	const opcao = item.getByRole('button', { name: gabarito, exact: true });
	await opcao.click();
	await expect(page.getByRole('dialog')).toBeHidden();
	await expect(item.getByText('Você acertou', { exact: false })).toBeVisible();
	expect((await lerErros(page))[id]).toEqual({ acertos: 1, tentativas: 2, em: '2026-09-30' });

	// Na mesma visita a questão não some (lista tirada na abertura); depois do 2º acerto, sai.
	await page.reload();
	await expect(page.locator(`[data-post-id="${id}"]`)).toBeVisible();
	await page.locator(`[data-post-id="${id}"]`).getByRole('button', { name: gabarito, exact: true }).click();
	await expect(await lerErros(page)).toEqual({});
	await page.reload();
	await expect(page.locator(`[data-post-id="${id}"]`)).toHaveCount(0);
	await expect(page.getByText('Nada errado por aqui')).toBeVisible();
});

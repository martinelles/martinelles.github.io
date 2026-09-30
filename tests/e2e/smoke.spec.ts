import { expect, test } from '@playwright/test';

test('abre a raiz com o título do app', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle('Painel de Concurso');
});

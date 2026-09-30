import { expect, test } from '@playwright/test';

test('abre a raiz no feed, com o título da rota', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1, name: 'Feed de estudo' })).toBeAttached();
	await expect(page).toHaveTitle('Feed · Painel de Concurso');
});

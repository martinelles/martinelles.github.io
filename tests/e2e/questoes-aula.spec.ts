import { expect, test } from '@playwright/test';

// Questões de certo/errado extraídas do material da aula (PDF do vault →
// /conteudo/questoes-aula/e4-1.json), com gabarito comentado abrindo ao responder.

test('a página da aula lista os itens, corrige e comenta o gabarito', async ({ page }) => {
	await page.goto('/questoes/e4-1');
	await expect(page.getByRole('heading', { level: 1, name: /Questões de certo ou errado · 1\. Ciclo de vida e MLOps/ })).toBeVisible();

	const itens = page.locator('ol li');
	await expect(itens).toHaveCount(12);
	await expect(page.getByText('12 itens — marque Certo ou Errado', { exact: false })).toBeVisible();

	// Questão 1 (gabarito C): acertar mostra o comentário e o placar.
	await itens.nth(0).getByRole('button', { name: 'Certo' }).click();
	await expect(itens.nth(0)).toContainText('Gabarito: certo');
	await expect(itens.nth(0).locator('.gabarito p')).toContainText('reprodutibilidade');
	await expect(page.getByText('1 de 1 certos', { exact: false })).toBeVisible();

	// Questão 3 (gabarito E): errar marca a borda de erro e permite refazer.
	await itens.nth(2).getByRole('button', { name: 'Certo' }).click();
	await expect(itens.nth(2)).toContainText('Gabarito: errado');
	await itens.nth(2).getByRole('button', { name: 'Refazer' }).click();
	await expect(itens.nth(2).getByText('Gabarito:')).toHaveCount(0);
});

test('slug desconhecido mostra a página de não encontrado', async ({ page }) => {
	await page.goto('/questoes/nao-existe');
	await expect(page.getByText('Questões não encontradas')).toBeVisible();
});

test('a missão traz o atalho de questões na aula que tem', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-11-21T09:00:00-03:00'));
	await page.goto('/painel');
	// E4·1 é estudo novo em 21/11; o índice liga o cod E4·1 à rota.
	const atalho = page.getByRole('link', { name: 'Questões C/E ↗' }).first();
	await expect(atalho).toHaveAttribute('href', '/questoes/e4-1');
	await atalho.click();
	await expect(page).toHaveURL(/\/questoes\/e4-1$/);
});

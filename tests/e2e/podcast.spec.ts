import { expect, test } from '@playwright/test';

// Podcasts da aula (/podcast/e1-2): o conteúdo vem do vault pelo importador, e a marcação de
// ouvido fica na chave painel-concurso:audios:v1, sincronizada com a conta.

const CHAVE = 'painel-concurso:audios:v1';

test('a página da aula lista os audios, toca e marca como ouvido', async ({ page }) => {
	await page.goto('/podcast/e1-2');
	await expect(page.getByRole('heading', { level: 1, name: /Podcasts · 2\. Probabilidade e inferência/ })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Voltar ao painel' })).toHaveAttribute('href', '/painel');

	// Os sete capítulos, com player e caixa de ouvido.
	const itens = page.locator('ol li');
	await expect(itens).toHaveCount(7);
	await expect(itens.first()).toContainText('Podcast Cap 1 - Probabilidade');
	await expect(page.locator('audio')).toHaveCount(7);
	const primeiro = page.locator('audio').first();
	await expect(primeiro).toHaveAttribute('src', '/conteudo/audios/e1-2/podcast-cap-1-probabilidade.mp3');
	await expect(primeiro).toHaveAttribute('preload', 'none');

	// O infográfico da aula (capa) e o de cada capítulo acompanham o podcast (WebP do importador).
	await expect(page.locator('figure.capa img')).toHaveAttribute(
		'src',
		'/conteudo/audios/e1-2/infografico-probabilidade-e-inferencia-kawaii.webp'
	);
	await expect(page.locator('li').first().locator('a.infografico img')).toHaveAttribute(
		'src',
		'/conteudo/audios/e1-2/infografico-cap-1-probabilidade.webp'
	);
	await expect(page.locator('a.infografico')).toHaveCount(7);

	// Marcar como ouvido grava na chave; recarregar mantém.
	await expect(page.getByText('0 de 7 ouvidos')).toBeVisible();
	await page.getByRole('checkbox', { name: 'Marcar Podcast Cap 1 - Probabilidade como ouvido' }).click();
	await expect(page.getByText('1 de 7 ouvidos')).toBeVisible();
	expect(await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), CHAVE)).toEqual({
		'/conteudo/audios/e1-2/podcast-cap-1-probabilidade.mp3': true
	});
	await page.reload();
	await expect(page.getByText('1 de 7 ouvidos')).toBeVisible();
	await expect(page.getByRole('checkbox', { name: 'Marcar Podcast Cap 1 - Probabilidade como ouvido' })).toBeChecked();
});

test('o MP3 é servido pelo painel (bytes de áudio, não HTML de erro)', async ({ request }) => {
	const r = await request.get('/conteudo/audios/e1-2/podcast-cap-1-probabilidade.mp3');
	expect(r.status()).toBe(200);
	expect((r.headers()['content-type'] ?? '').includes('audio')).toBe(true);
});

test('slug desconhecido mostra a página de não encontrado', async ({ page }) => {
	await page.goto('/podcast/nao-existe');
	await expect(page.getByText('Podcast não encontrado')).toBeVisible();
});

test('a missão traz o atalho de podcasts na aula que tem', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-11-19T09:00:00-03:00'));
	await page.goto('/painel');
	// E1·2 está na missão de hoje (parte 2) e no bloco de atrasadas (parte 1): o atalho aparece.
	const atalho = page.getByRole('link', { name: 'Podcasts da aula ↗' }).first();
	await expect(atalho).toHaveAttribute('href', '/podcast/e1-2');
	await atalho.click();
	await expect(page).toHaveURL(/\/podcast\/e1-2$/);
});

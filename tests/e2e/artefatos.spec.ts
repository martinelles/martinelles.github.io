import { expect, test, type Page } from '@playwright/test';

// Prioridades e Missões servidas pelo painel (planos/2026-10-14-artefatos-no-git.md, fase 1).
// As páginas vêm do vault (`npm run importar`); o Raio-X ainda está no claude.ai até a fase 2.

const RAIOX_CLAUDE = 'https://claude.ai/artifact/Q4MYW9Fpk7eg4oKnv36H12';

test.beforeEach(async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-10-14T12:00:00-03:00'));
});

/** Links para o claude.ai que sobraram na página, fora o Raio-X. */
const linksClaude = (page: Page) =>
	page.evaluate(
		(raiox) =>
			[...document.querySelectorAll('a[href]')]
				.map((a) => (a as HTMLAnchorElement).href)
				.filter((h) => h.includes('claude.ai/artifact/') && !h.startsWith(raiox)),
		RAIOX_CLAUDE
	);

test('os botões do cabeçalho abrem as páginas do painel, e uma liga à outra', async ({ page, context }) => {
	await page.goto('/painel');
	const prioridades = page.getByRole('link', { name: 'Prioridades do edital' });
	await expect(prioridades).toHaveAttribute('href', /^\/conteudo\/artefatos\/prioridades\.html#(cd|aud)$/);
	await expect(page.getByRole('link', { name: 'Missões até a prova' })).toHaveAttribute(
		'href',
		/^\/conteudo\/artefatos\/missoes\.html#(cd|aud)$/
	);

	const [p] = await Promise.all([context.waitForEvent('page'), prioridades.click()]);
	await expect(p.getByRole('heading', { level: 1, name: 'Prioridades do edital, subitem a subitem' })).toBeVisible();
	expect(await linksClaude(p)).toEqual([]);

	const [m] = await Promise.all([context.waitForEvent('page'), p.locator('#link-missoes').click()]);
	await expect(m.getByRole('heading', { level: 1, name: 'Missões até a prova' })).toBeVisible();
	await expect(m.locator('#link-prioridades')).toHaveAttribute('href', /^\/conteudo\/artefatos\/prioridades\.html#/);
	expect(await linksClaude(m)).toEqual([]);
	// Sem o banco do claude.ai, as marcações ficam no navegador (modo de antes da v6).
	await expect(m.locator('#sync')).toHaveText('Marcações salvas só neste navegador.');
});

test('a âncora escolhe o cargo nas Missões', async ({ page }) => {
	await page.goto('/conteudo/artefatos/missoes.html#aud');
	await expect(page.locator('#c-aud')).toHaveAttribute('aria-pressed', 'true');
	await page.goto('/conteudo/artefatos/missoes.html#cd');
	await page.reload();
	await expect(page.locator('#c-cd')).toHaveAttribute('aria-pressed', 'true');
});

test('depois de uma visita ao app, as Missões abrem offline', async ({ page, context }) => {
	await page.goto('/');
	await page.evaluate(() => navigator.serviceWorker.ready);
	// A fase 2 do pré-cache grava o conteúdo arquivo por arquivo, em segundo plano.
	await expect
		.poll(() => page.evaluate(async () => !!(await caches.match('/conteudo/artefatos/missoes.html'))), { timeout: 60_000 })
		.toBe(true);

	await context.setOffline(true);
	await page.goto('/conteudo/artefatos/missoes.html#cd');
	await expect(page.getByRole('heading', { level: 1, name: 'Missões até a prova' })).toBeVisible();
	await context.setOffline(false);
});

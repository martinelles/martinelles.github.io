import { expect, test, type Page } from '@playwright/test';
import subitens from '../../static/conteudo/artefatos/raiox-subitens.json' with { type: 'json' };
import assuntos from '../../static/conteudo/artefatos/raiox-assuntos.json' with { type: 'json' };

// Prioridades, Missões e Raio-X servidos pelo painel (planos/2026-10-14-artefatos-no-git.md).
// As páginas vêm do vault (`npm run importar`).

test.beforeEach(async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-10-14T12:00:00-03:00'));
});

/** Links para o claude.ai que sobraram na página. */
const linksClaude = (page: Page) =>
	page.evaluate(() =>
		[...document.querySelectorAll('a[href]')].map((a) => (a as HTMLAnchorElement).href).filter((h) => h.includes('claude.ai/artifact/'))
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

test('Raio-X roda sem o claude.ai: números, gráficos, tabela e troca de cargo', async ({ page, context }) => {
	const erros: string[] = [];
	// Registrados no contexto: valem para a aba nova desde a primeira linha que ela roda.
	context.on('weberror', (e) => erros.push(e.error().message));
	context.on('console', (m) => m.type() === 'error' && erros.push(m.text()));

	await page.goto('/conteudo/artefatos/missoes.html#cd');
	const [r] = await Promise.all([context.waitForEvent('page'), page.locator('#link-raiox').click()]);
	await expect(r).toHaveURL(/\/conteudo\/artefatos\/raiox\.html$/);

	await expect(r.getByRole('heading', { level: 1, name: 'Raio-X do Qconcursos' })).toBeVisible();
	await expect(r.locator('[data-field="assuntos"]')).toHaveText(String(assuntos.length));
	await expect(r.locator('#ch-blocos svg')).toBeVisible();
	await expect(r.locator('#ch-conc svg')).toBeVisible();

	const doCargo = (c: string) => subitens.filter((s) => s.cargo === 'Ambos' || s.cargo === c).length;
	await expect(r.locator('#tb-todos tbody tr')).toHaveCount(doCargo('Ciência de Dados'));
	await r.locator('#c-aud').click();
	await expect(r.locator('#c-aud')).toHaveAttribute('aria-pressed', 'true');
	await expect(r.locator('#tb-todos tbody tr')).toHaveCount(doCargo('Auditoria'));
	expect(r.url()).toContain('cargo=Auditoria');

	expect(await linksClaude(r)).toEqual([]);
	expect(erros).toEqual([]);
});

test('Raio-X: a âncora #aud abre direto em Auditoria', async ({ page }) => {
	await page.goto('/conteudo/artefatos/raiox.html#aud');
	await expect(page.locator('#c-aud')).toHaveAttribute('aria-pressed', 'true');
});

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
	// Sem login, marcar pede o nome antes.
	await expect(m.locator('#sync')).toHaveText('Para marcar missões, toque numa bolha e entre com seu nome.');
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

// Fase 3: marcações das Missões na conta do login por nome. A API é simulada, com a regra do Worker.
const CHAVE = 'missoes-cgu-2026';
type Gravado = { valor: string; atualizadoEm: number };

async function simularApi(page: Page, inicial: Record<string, Gravado> = {}) {
	const dados: Record<string, Gravado> = { ...inicial };
	const pedidos: string[] = [];
	await page.route('**/api/progresso/**', async (rota) => {
		const req = rota.request();
		pedidos.push(`${req.method()} ${decodeURIComponent(new URL(req.url()).pathname)}`);
		const chave = decodeURIComponent(new URL(req.url()).pathname.split('/')[4] ?? '');
		if (req.method() === 'PUT') {
			const novo = req.postDataJSON() as Gravado;
			const gravado = !dados[chave] || novo.atualizadoEm > dados[chave].atualizadoEm;
			if (gravado) dados[chave] = novo;
			return rota.fulfill({ json: { gravado, atual: dados[chave] } });
		}
		return rota.fulfill({ json: dados });
	});
	return { dados, pedidos };
}

const logar = (page: Page, nome = 'maria') =>
	page.addInitScript((n) => localStorage.setItem('painel-concurso:usuario:v1', n), nome);

test('Missões, logada: marcar um bloco sobe para a conta', async ({ page }) => {
	const api = await simularApi(page);
	await logar(page);
	await page.goto('/conteudo/artefatos/missoes.html#cd');
	await expect(page.locator('#sync')).toHaveText('Salvo na conta maria: aparece em qualquer aparelho.');

	const bolha = page.locator('.bubble').first();
	const chaveBloco = await bolha.getAttribute('data-k');
	await bolha.check();
	await expect.poll(() => api.dados[CHAVE]?.valor).toBe(JSON.stringify({ [chaveBloco!]: true }));
	expect(api.pedidos).toContain(`PUT /api/progresso/maria/${CHAVE}`);
});

test('Missões, logada: a conta mais nova traz as marcações de outro aparelho', async ({ page }) => {
	await page.goto('/conteudo/artefatos/missoes.html#cd');
	const chaveBloco = await page.locator('.bubble').first().getAttribute('data-k');
	const api = await simularApi(page, { [CHAVE]: { valor: JSON.stringify({ [chaveBloco!]: true }), atualizadoEm: 5 } });
	await logar(page);
	await page.reload();
	await expect(page.locator(`.bubble[data-k="${chaveBloco}"]`)).toBeChecked();
	expect(await page.evaluate((k) => localStorage.getItem(k), CHAVE)).toBe(JSON.stringify({ [chaveBloco!]: true }));
	expect(api.pedidos.filter((p) => p.startsWith('PUT'))).toEqual([]);
});

test('Missões, sem login: tocar numa bolha abre o login; cancelar não marca nada', async ({ page }) => {
	const api = await simularApi(page);
	await page.goto('/conteudo/artefatos/missoes.html#cd');
	const bolha = page.locator('.bubble').first();
	await bolha.click();
	const popup = page.getByRole('dialog', { name: 'Entre para marcar' });
	await expect(popup).toBeVisible();
	await expect(bolha).not.toBeChecked();
	await popup.getByRole('button', { name: 'Agora não' }).click();
	await expect(popup).toBeHidden();
	expect(await page.evaluate((k) => localStorage.getItem(k), CHAVE)).toBeNull();
	expect(api.pedidos).toEqual([]);
});

test('Missões, sem login: entrar pelo popup marca o bloco tocado e sobe para a conta', async ({ page }) => {
	const api = await simularApi(page);
	await page.goto('/conteudo/artefatos/missoes.html#cd');
	const bolha = page.locator('.bubble').first();
	const chaveBloco = await bolha.getAttribute('data-k');
	await bolha.click();
	const popup = page.getByRole('dialog', { name: 'Entre para marcar' });
	const entrar = popup.getByRole('button', { name: 'Entrar e marcar' });

	await popup.getByLabel('Seu nome').fill('Zé');
	await expect(popup.getByText('O nome precisa de 3 a 30 letras ou números.')).toBeVisible();
	await expect(entrar).toBeDisabled();
	await popup.getByLabel('Seu nome').fill('Maria Sílva');
	await expect(popup.getByText('Você vai entrar como maria-silva.')).toBeVisible();
	await entrar.click();

	await expect(page.locator(`.bubble[data-k="${chaveBloco}"]`)).toBeChecked();
	await expect(page.locator('#sync')).toHaveText('Salvo na conta maria-silva: aparece em qualquer aparelho.');
	expect(await page.evaluate(() => localStorage.getItem('painel-concurso:usuario:v1'))).toBe('maria-silva');
	await expect.poll(() => api.dados[CHAVE]?.valor).toBe(JSON.stringify({ [chaveBloco!]: true }));
});

test('Missões, sem login e sem API: o popup avisa e não entra', async ({ page }) => {
	await page.route('**/api/**', (r) => r.fulfill({ status: 404, contentType: 'text/html', body: '<!doctype html>' }));
	await page.goto('/conteudo/artefatos/missoes.html#cd');
	await page.locator('.bubble').first().click();
	const popup = page.getByRole('dialog', { name: 'Entre para marcar' });
	await popup.getByLabel('Seu nome').fill('maria');
	await popup.getByRole('button', { name: 'Entrar e marcar' }).click();
	await expect(popup.getByText('Login indisponível agora. Confira a internet e tente de novo.')).toBeVisible();
	expect(await page.evaluate(() => localStorage.getItem('painel-concurso:usuario:v1'))).toBeNull();
});

test('Missões, logada e sem API (GitHub Pages): avisa e guarda no aparelho', async ({ page }) => {
	await page.route('**/api/**', (r) => r.fulfill({ status: 404, contentType: 'text/html', body: '<!doctype html>' }));
	await logar(page);
	await page.goto('/conteudo/artefatos/missoes.html#cd');
	await expect(page.locator('#sync')).toHaveText('Sem conexão com a conta: as marcações ficam neste aparelho por enquanto.');
	await page.locator('.bubble').first().check();
	expect(await page.evaluate((k) => localStorage.getItem(k), CHAVE)).toContain('true');
});

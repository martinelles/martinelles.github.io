import { expect, test, type Page } from '@playwright/test';

// Cenário 4: curtir (coração e duplo toque), salvar e rever em /salvos; tudo sobrevive ao recarregar (SC-004).

const CHAVE_INTERACOES = 'painel-concurso:interacoes:v1';

test.beforeEach(async ({ page, context }) => {
	await context.clearCookies();
	await page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'));
});

const itens = (page: Page) => page.locator('[data-post-id]');
const lerInteracoes = (page: Page) =>
	page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{"curtidas":[],"salvos":{}}'), CHAVE_INTERACOES);

test('/salvos vazio explica como salvar', async ({ page }) => {
	await page.goto('/salvos');
	await expect(page).toHaveTitle('Salvos · Painel de Concurso');
	await expect(page.getByRole('heading', { level: 1, name: 'Salvos' })).toBeVisible();
	await expect(page.getByText('Nada salvo ainda — toque no marcador de um post para guardar aqui.')).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Seções' }).getByRole('link', { name: 'Salvos' })).toHaveAttribute(
		'aria-current',
		'page'
	);
});

test('7. curtir pelo coração e por duplo toque, salvar, rever em /salvos e recarregar', async ({ page }) => {
	// Lei seca: fora de questão, o duplo toque vale desde o início (R9).
	await page.goto('/?tipo=lei');
	await expect.poll(() => itens(page).count()).toBeGreaterThanOrEqual(2);
	const primeiro = itens(page).nth(0);
	const segundo = itens(page).nth(1);
	const idPrimeiro = await primeiro.getAttribute('data-post-id');
	const idSegundo = await segundo.getAttribute('data-post-id');

	// Coração: liga e desliga.
	const curtir = primeiro.getByRole('button', { name: 'Curtir' });
	await curtir.click();
	await expect(curtir).toHaveAttribute('aria-pressed', 'true');
	await curtir.click();
	await expect(curtir).toHaveAttribute('aria-pressed', 'false');

	// Duplo toque no conteúdo curte (e não descurte).
	await segundo.scrollIntoViewIfNeeded();
	await segundo.locator('.conteudo').dblclick({ position: { x: 20, y: 20 } });
	await expect(segundo.getByRole('button', { name: 'Curtir' })).toHaveAttribute('aria-pressed', 'true');

	// Salvar os dois; o primeiro depois, então aparece antes em /salvos.
	await segundo.getByRole('button', { name: 'Salvar' }).click();
	await expect(segundo.getByRole('button', { name: 'Salvar' })).toHaveAttribute('aria-pressed', 'true');
	await page.clock.setFixedTime(new Date('2026-09-30T12:05:00-03:00'));
	await primeiro.getByRole('button', { name: 'Salvar' }).click();

	const gravado = await lerInteracoes(page);
	expect(gravado.curtidas).toEqual([idSegundo]);
	expect(Object.keys(gravado.salvos).sort()).toEqual([idPrimeiro, idSegundo].sort());

	await page.getByRole('navigation', { name: 'Seções' }).getByRole('link', { name: 'Salvos' }).click();
	await expect(page).toHaveURL('/salvos');
	await expect(itens(page)).toHaveCount(2);
	const ordem = await itens(page).evaluateAll((els) => els.map((el) => el.getAttribute('data-post-id')));
	expect(ordem).toEqual([idPrimeiro, idSegundo]);

	// Fechar e reabrir: curtida e salvos continuam (SC-004).
	await page.reload();
	await expect(itens(page)).toHaveCount(2);
	const salvoSegundo = page.locator(`[data-post-id="${idSegundo}"]`);
	await expect(salvoSegundo.getByRole('button', { name: 'Curtir' })).toHaveAttribute('aria-pressed', 'true');
	await expect(salvoSegundo.getByRole('button', { name: 'Salvar' })).toHaveAttribute('aria-pressed', 'true');

	// Tirar o marcador aqui mantém o post na tela até sair da aba; na volta ele não está mais.
	await salvoSegundo.getByRole('button', { name: 'Salvar' }).click();
	await expect(salvoSegundo.getByRole('button', { name: 'Salvar' })).toHaveAttribute('aria-pressed', 'false');
	await page.reload();
	await expect(itens(page)).toHaveCount(1);
	await expect(itens(page).first()).toHaveAttribute('data-post-id', idPrimeiro!);
});

test('questão ainda não respondida só curte pelo coração (R9)', async ({ page }) => {
	await page.goto('/?tipo=questao');
	await expect(itens(page).first()).toBeVisible();
	const questao = itens(page).first();
	await questao.locator('.enunciado').dblclick();
	await expect(questao.getByRole('button', { name: 'Curtir' })).toHaveAttribute('aria-pressed', 'false');
	await questao.getByRole('group', { name: 'Responder' }).getByRole('button').first().click();
	await questao.locator('.enunciado').dblclick();
	await expect(questao.getByRole('button', { name: 'Curtir' })).toHaveAttribute('aria-pressed', 'true');
});

test('salvo cujo post sumiu do conteúdo é ignorado', async ({ page }) => {
	await page.addInitScript(
		(k) =>
			localStorage.setItem(
				k,
				JSON.stringify({ respostas: {}, curtidas: [], salvos: { 'q:nao-existe-mais': '2026-09-29T10:00:00.000Z' }, vistos: {} })
			),
		CHAVE_INTERACOES
	);
	await page.goto('/salvos');
	await expect(page.getByText('Nada salvo ainda — toque no marcador de um post para guardar aqui.')).toBeVisible();
	await expect(itens(page)).toHaveCount(0);
});

test('armazenamento indisponível: o feed funciona e avisa uma vez', async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(window, 'localStorage', {
			get() {
				throw new DOMException('bloqueado', 'SecurityError');
			}
		});
	});
	await page.goto('/');
	await expect(page.getByText('Seu progresso não está sendo salvo neste navegador.')).toBeVisible();
	await expect(itens(page).first()).toBeVisible();
	await page.getByRole('button', { name: 'Entendi' }).click();
	await expect(page.getByText('Seu progresso não está sendo salvo neste navegador.')).toHaveCount(0);
});

import { expect, test } from '@playwright/test';

// Deploy com o app aberto (planos/2026-10-15-recarga-apos-deploy.md): o pedaço da rota que o
// código antigo pede já não existe. Em vez do "Internal Error", a página de destino recarrega.

test.use({ serviceWorkers: 'block' }); // o SW serviria o pedaço do cache sem passar pela rota simulada

test('pedaço da rota apagado pelo deploy: a navegação recarrega a página em vez de dar erro', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('navigation', { name: 'Seções' })).toBeVisible();
	let falhas = 0;
	await page.route('**/_app/immutable/**', (rota) => {
		if (falhas === 0 && /nodes\/.*\.js/.test(rota.request().url())) {
			falhas++;
			return rota.fulfill({ status: 404, body: 'apagado' });
		}
		return rota.continue();
	});
	await page.getByRole('navigation', { name: 'Seções' }).getByRole('link', { name: 'Painel' }).click();
	await expect(page).toHaveURL(/\/painel$/);
	await expect(page.getByRole('heading', { name: 'Seu Painel de Estudos' })).toBeVisible();
	await expect(page.getByText('Internal Error')).toHaveCount(0);
	expect(falhas).toBe(1);
});

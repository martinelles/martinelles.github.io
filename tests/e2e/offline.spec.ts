import { expect, test, type Page } from '@playwright/test';

async function esperarServiceWorker(page: Page) {
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	// O SW só controla a página depois de uma recarga (ou do clients.claim).
	await page.reload();
	await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
}

// SC-005 (parte do app): depois da primeira visita, as rotas abrem sem conexão.
// A garantia de todo o conteúdo do feed offline é do WP06.
test('depois da primeira visita, feed, salvos, painel e ferramenta abrem offline', async ({ page, context }) => {
	await page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'));
	await page.goto('/');
	await esperarServiceWorker(page);
	await expect(page.locator('[data-post-id]').first()).toBeVisible();

	await context.setOffline(true);

	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1, name: 'Feed de estudo' })).toBeAttached();
	await expect(page.getByRole('navigation', { name: 'Matérias' })).toBeVisible();
	await expect(page.locator('[data-post-id]').first()).toBeVisible();

	await page.goto('/salvos');
	await expect(page.getByRole('heading', { level: 1, name: 'Salvos' })).toBeVisible();

	await page.goto('/painel');
	await expect(page.getByRole('heading', { level: 1, name: 'Seu Painel de Estudos' })).toBeVisible();

	// Navegação interna offline, a partir do painel.
	await page.locator('a[href="/ferramenta/pdfs"]').click();
	await expect(page).toHaveURL('/ferramenta/pdfs');
	await expect(page.getByRole('heading', { level: 1, name: 'PDFs' })).toBeVisible();

	await page.goto('/ferramenta/pdfs');
	await expect(page.getByRole('heading', { level: 1, name: 'PDFs' })).toBeVisible();

	await context.setOffline(false);
});

test('SC-004: manifest instalável com ícones 192 e 512', async ({ page }) => {
	const resposta = await page.request.get('/manifest.webmanifest');
	expect(resposta.status()).toBe(200);
	const manifest = await resposta.json();
	expect(manifest.name).toBe('Painel de Concurso');
	expect(manifest.display).toBe('standalone');
	expect(manifest.start_url).toBe('/');

	const icones = manifest.icons as { src: string; sizes: string; type: string; purpose?: string }[];
	for (const tamanho of ['192x192', '512x512']) {
		const icone = icones.find((i) => i.sizes === tamanho && i.type === 'image/png' && !i.purpose);
		expect(icone, `ícone ${tamanho}`).toBeTruthy();
	}
	for (const icone of icones) {
		const r = await page.request.get(icone.src);
		expect(r.status(), icone.src).toBe(200);
	}

	// A página aponta para o manifest.
	await page.goto('/');
	await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', /manifest\.webmanifest$/);
});

test('o SW não intercepta outra origem', async ({ page }) => {
	await page.goto('/');
	await esperarServiceWorker(page);

	// Controle: um ativo da mesma origem passa pelo SW...
	const [interno] = await Promise.all([
		page.waitForResponse((r) => r.url().endsWith('/manifest.webmanifest')),
		page.evaluate(() => fetch('/manifest.webmanifest').then(() => null))
	]);
	expect(interno.fromServiceWorker()).toBe(true);

	// ...e um endereço externo (edital, WhatsApp) vai direto à rede, sem o SW no meio.
	await page.route('https://externo.exemplo/**', (r) =>
		r.fulfill({ status: 200, body: 'ok', headers: { 'access-control-allow-origin': '*' } })
	);
	const [externo] = await Promise.all([
		page.waitForResponse((r) => r.url().startsWith('https://externo.exemplo/')),
		page.evaluate(() => fetch('https://externo.exemplo/edital.pdf').then(() => null))
	]);
	expect(externo.fromServiceWorker()).toBe(false);
});

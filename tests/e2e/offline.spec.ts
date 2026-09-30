import { expect, test } from '@playwright/test';

const CHAVE = 'painel-concurso:preferencias:v1';

// Cenário 3 / SC-003: depois da primeira visita, o app abre e navega sem conexão.
test('SC-003: depois da primeira visita, abre e navega offline', async ({ page, context }) => {
	await page.goto('/escolher');
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	// O SW só controla a página depois de uma recarga (ou do clients.claim).
	await page.reload();
	await expect
		.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
		.toBe(true);

	await context.setOffline(true);

	await page.goto('/escolher');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Qual o concurso dos seus sonhos?');

	// Raiz sem preferência vai à escolha.
	await page.goto('/');
	await expect(page).toHaveURL(/\/escolher$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Qual o concurso dos seus sonhos?');

	// Navegação interna offline: escolher um cartão leva ao painel.
	await page.getByRole('listitem').getByRole('button').first().click();
	await expect(page).toHaveURL('/painel');
	await expect(page.getByRole('heading', { level: 1, name: 'Seu Painel de Estudos' })).toBeVisible();
	const salvo = await page.evaluate((k) => localStorage.getItem(k), CHAVE);
	expect(salvo).not.toBeNull();

	// E uma ferramenta a partir do painel.
	await page.locator('a[href="/ferramenta/flashcards"]').click();
	await expect(page).toHaveURL('/ferramenta/flashcards');
	await expect(page.getByRole('heading', { level: 1, name: 'Flashcards' })).toBeVisible();

	// Por URL, com a preferência gravada.
	await page.goto('/painel');
	await expect(page.getByRole('heading', { level: 1, name: 'Seu Painel de Estudos' })).toBeVisible();
	await page.goto('/ferramenta/flashcards');
	await expect(page.getByRole('heading', { level: 1, name: 'Flashcards' })).toBeVisible();
	await page.goto('/');
	await expect(page).toHaveURL('/painel');

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
	await page.goto('/escolher');
	await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', /manifest\.webmanifest$/);
});

test('o SW não intercepta outra origem', async ({ page }) => {
	await page.goto('/escolher');
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	await page.reload();
	await expect
		.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
		.toBe(true);

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

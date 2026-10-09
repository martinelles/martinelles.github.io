import { expect, test, type Page } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';

// FR-017 / SC-005: depois da primeira visita, todo o conteúdo do feed está no Cache Storage e o
// feed abre, rola, salva e responde sem conexão. E um lote que falha na instalação não impede o
// SW de instalar: ele é obtido depois (research.md R4, pré-cache em duas fases).

const indice = JSON.parse(readFileSync('static/conteudo/indice.json', 'utf8')) as { lotes: Record<string, string> };
const LOTES = Object.values(indice.lotes).map((arquivo) => `/conteudo/${arquivo}`);
const ESSENCIAIS = ['/conteudo/indice.json', '/conteudo/materias.json'];

test.beforeEach(async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'));
});

const itens = (page: Page) => page.locator('[data-post-id]');

/** Caminhos gravados no cache do SW (o nome do cache muda a cada versão). */
function conteudoNoCache(page: Page): Promise<string[]> {
	return page.evaluate(async () => {
		const nomes = (await caches.keys()).filter((n) => n.startsWith('painel-concurso-'));
		const caminhos: string[] = [];
		for (const nome of nomes) {
			for (const req of await (await caches.open(nome)).keys()) {
				const { pathname } = new URL(req.url);
				if (pathname.startsWith('/conteudo/')) caminhos.push(pathname);
			}
		}
		return caminhos;
	});
}

async function esperarControle(page: Page) {
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	await page.reload();
	await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
}

/** Rola até o fim para puxar a próxima página e espera ela chegar. */
async function carregarMais(page: Page) {
	const antes = await itens(page).count();
	await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
	await expect.poll(() => itens(page).count(), { timeout: 10_000 }).toBeGreaterThan(antes);
}

test('SC-005: todo o conteúdo fica no cache e o feed funciona offline', async ({ page, context }) => {
	test.setTimeout(120_000);
	await page.goto('/');
	await esperarControle(page);

	// Todos os lotes do índice, mais índice e matérias, gravados pelo SW.
	await expect
		.poll(() => conteudoNoCache(page), { timeout: 60_000 })
		.toEqual(expect.arrayContaining([...ESSENCIAIS, ...LOTES]));

	await context.setOffline(true);

	// Três matérias de lotes diferentes, três páginas de rolagem em cada.
	for (const materia of ['direito-constitucional', 'ti-ciencia-de-dados', 'fundamentos-de-auditoria-governamental']) {
		await page.goto(`/?materia=${materia}`);
		await expect(itens(page).first()).toBeVisible();
		await expect(page.getByRole('alert')).toHaveCount(0);
		for (let i = 0; i < 3; i++) await carregarMais(page);
		const materias = new Set(await itens(page).locator('article h2').allTextContents());
		expect(materias.size, materia).toBe(1);
	}

	// Salvar um post offline e revê-lo em /salvos.
	const post = itens(page).first();
	const id = await post.getAttribute('data-post-id');
	await post.scrollIntoViewIfNeeded();
	await post.getByRole('button', { name: 'Salvar' }).click();
	await page.goto('/salvos');
	await expect(itens(page)).toHaveCount(1);
	await expect(itens(page).first()).toHaveAttribute('data-post-id', id!);

	// Responder uma questão offline.
	await page.goto('/?tipo=questao');
	const questao = itens(page).first();
	await expect(questao).toBeVisible();
	await questao.getByRole('group', { name: 'Responder' }).getByRole('button').first().click();
	await expect(questao.getByText(/Você acertou|Você errou — gabarito: /)).toBeVisible();

	await context.setOffline(false);
});

test('lote que falha na instalação não impede o SW; é obtido depois', async ({ page, context }) => {
	test.setTimeout(120_000);
	const falho = LOTES.find((c) => c.includes('lingua-inglesa')) ?? LOTES[LOTES.length - 1];
	let recusas = 0;
	await context.route(`**${falho}`, (rota) => {
		recusas++;
		return rota.fulfill({ status: 500, body: 'falha simulada' });
	});

	await page.goto('/');
	await esperarControle(page);
	const estado = await page.evaluate(async () => (await navigator.serviceWorker.ready).active?.state);
	expect(estado).toBe('activated');

	// O resto do conteúdo desce; o lote recusado não entra no cache.
	await expect
		.poll(() => conteudoNoCache(page), { timeout: 60_000 })
		.toEqual(expect.arrayContaining([...ESSENCIAIS, ...LOTES.filter((c) => c !== falho)]));
	expect(recusas).toBeGreaterThan(0);
	expect(await conteudoNoCache(page)).not.toContain(falho);

	// A rede volta; a próxima abertura do app completa o que faltou.
	await context.unroute(`**${falho}`);
	await page.reload();
	await expect.poll(() => conteudoNoCache(page), { timeout: 30_000 }).toContain(falho);
});

// Missão identidade-visual (Cenário 5, SC-006): offline, os três temas trazem as fontes e a textura
// iguais às da versão online. A textura é um SVG em data URI no token --textura (WP01 não usou PNG
// em static/papel/), então não há URL de textura a conferir no cache: basta ser a mesma string.
const CHAVE_TEMA = 'painel-concurso:tema:v1';
const TEMAS = ['aventura', 'kindle', 'kindle-escuro'] as const;
const FONTES = readdirSync('static/fontes')
	.filter((f) => f.endsWith('.woff2'))
	.map((f) => `/fontes/${f}`);

/** Caminhos de /fontes/ gravados no cache do SW. */
function fontesNoCache(page: Page): Promise<string[]> {
	return page.evaluate(async () => {
		const nomes = (await caches.keys()).filter((n) => n.startsWith('painel-concurso-'));
		const caminhos: string[] = [];
		for (const nome of nomes) {
			for (const req of await (await caches.open(nome)).keys()) {
				const { pathname } = new URL(req.url);
				if (pathname.startsWith('/fontes/')) caminhos.push(pathname);
			}
		}
		return caminhos;
	});
}

async function usarTema(page: Page, tema: string) {
	await page.evaluate(([k, t]) => localStorage.setItem(k, JSON.stringify({ tema: t })), [CHAVE_TEMA, tema] as const);
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-tema', tema);
	await expect(itens(page).first()).toBeVisible();
}

const textura = (page: Page) => page.evaluate(() => getComputedStyle(document.body, '::before').backgroundImage);

test('SC-006: offline, os três temas têm as fontes e a textura da versão online', async ({ page, context }) => {
	test.setTimeout(120_000);
	expect(FONTES).toHaveLength(4);
	await page.goto('/');
	await esperarControle(page);
	await expect.poll(() => fontesNoCache(page), { timeout: 30_000 }).toEqual(expect.arrayContaining(FONTES));

	const online: Record<string, string> = {};
	for (const tema of TEMAS) {
		await usarTema(page, tema);
		online[tema] = await textura(page);
		expect(online[tema], tema).toMatch(/^url\(/);
	}

	await context.setOffline(true);
	await page.reload();
	await expect(itens(page).first()).toBeVisible();

	for (const tema of TEMAS) {
		await usarTema(page, tema);
		await page.evaluate(() => document.fonts.ready);
		// load() pede a face ao SW se a tela ainda não a usou; offline, só o cache responde.
		const fontes = await page.evaluate(async () => {
			const pedir = async (f: string) => {
				await document.fonts.load(f).catch(() => []);
				return document.fonts.check(f);
			};
			return {
				literata: await pedir('16px Literata'),
				grandstander: await pedir('700 16px Grandstander'),
				comErro: [...document.fonts].filter((f) => f.status === 'error').map((f) => `${f.family} ${f.weight} ${f.style}`)
			};
		});
		expect(fontes.literata, `${tema}: Literata`).toBe(true);
		if (tema === 'aventura') expect(fontes.grandstander, `${tema}: Grandstander`).toBe(true);
		expect(fontes.comErro, tema).toEqual([]);
		expect(await textura(page), `${tema}: textura`).toBe(online[tema]);
	}

	expect(await fontesNoCache(page)).toEqual(expect.arrayContaining(FONTES));
	await context.setOffline(false);
});

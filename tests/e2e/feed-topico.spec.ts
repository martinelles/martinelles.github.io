import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import plano from '../../static/conteudo/plano.json' with { type: 'json' };

// Questões por tarefa (FR-002, FR-003, FR-004; Cenários 1 e 2 e bordas) contra o conteúdo real.
// A contagem esperada vem sempre do índice; o tópico de cada post, do próprio lote.

const HOJE = '2026-09-30';
const CHAVE_TEMA = 'painel-concurso:tema:v1';
const TEMAS = ['aventura', 'kindle', 'kindle-escuro'] as const;

interface EntradaIndice {
	id: string;
	t: string;
	m: string;
	l: string;
	tp?: string;
}
const indice = JSON.parse(readFileSync('static/conteudo/indice.json', 'utf8')) as {
	posts: EntradaIndice[];
	lotes: Record<string, string>;
};
/** `topicoEstudo` de cada questão, lido dos lotes publicados. */
const topicoDoPost = new Map<string, string | undefined>();
for (const arquivo of Object.values(indice.lotes)) {
	const lote = JSON.parse(readFileSync(`static/conteudo/${arquivo}`, 'utf8')) as { id: string; topicoEstudo?: string }[];
	for (const p of lote) topicoDoPost.set(p.id, p.topicoEstudo);
}
const ligadas = (topico: string) => indice.posts.filter((e) => e.t === 'q' && e.tp === topico).length;

/** Tarefa de Questões com questões ligadas (FAG-02: 33 desde 2026-10-02, quando 5 questões de norma do TCU saíram para FAG-04/05/06) e uma sem nenhuma. */
const comQuestoes = plano.tarefas.find((t) => t.id === 'FAG-02:Q')!;
const semQuestoes = plano.tarefas.find((t) => t.modo === 'questoes' && t.materia !== null && ligadas(t.topicoId) === 0)!;
const N = ligadas(comQuestoes.topicoId);
const rota = (t: { id: string }) => `/tarefa/${encodeURIComponent(t.id)}`;
const feedTopico = (topico: string) => `/?topico=${encodeURIComponent(topico)}&tipo=questao`;

const itens = (page: Page) => page.locator('[data-post-id]');

test.beforeEach(async ({ page, context }) => {
	await context.clearCookies();
	await page.clock.setFixedTime(new Date(`${HOJE}T12:00:00-03:00`));
});

test('as amostras existem no conteúdo real', () => {
	expect(comQuestoes).toBeDefined();
	expect(N).toBe(33);
	expect(semQuestoes).toBeDefined();
});

test('tarefa de Questões com questões ligadas: contagem e 1 toque até o feed do tópico (FR-003, SC-001)', async ({ page }) => {
	await page.goto(rota(comQuestoes));
	const fazer = page.getByRole('region', { name: 'O que fazer' });
	await expect(fazer.getByText(`${N} questões deste tópico.`, { exact: true })).toBeVisible();
	const atalho = fazer.getByRole('link', { name: 'Questões deste tópico' });
	await expect(atalho).toHaveAttribute('href', feedTopico(comQuestoes.topicoId));
	// A matéria inteira continua à mão, como saída de segunda ordem.
	await expect(fazer.getByRole('link', { name: 'Questões desta matéria' })).toHaveAttribute(
		'href',
		`/?materia=${comQuestoes.materia}&tipo=questao`
	);
	await expect(fazer.getByText('Nenhuma questão do catálogo')).toHaveCount(0);

	await atalho.click();
	await expect(page).toHaveURL(feedTopico(comQuestoes.topicoId));
	await expect(page.getByRole('heading', { level: 2, name: `Questões de ${comQuestoes.topicoId}` })).toBeVisible();
	await expect(page.getByText(`${N} questões`, { exact: true })).toBeVisible();
	await expect(page).toHaveTitle(`Questões de ${comQuestoes.topicoId} · Feed · Painel de Concurso`);
});

test('feed do tópico: só as questões ligadas, sem repetir, e o fim chega depois de exatamente N (FR-002, FR-004)', async ({ page }) => {
	await page.goto(feedTopico(comQuestoes.topicoId));
	// O resto do feed segue: stories e barra de abas.
	await expect(page.getByRole('navigation', { name: 'Matérias' })).toBeVisible();
	await expect(page.getByRole('navigation', { name: 'Seções' })).toBeVisible();
	await expect(itens(page).first()).toBeVisible();

	const fim = page.getByRole('heading', { name: 'Você viu tudo deste tópico' });
	for (let i = 0; i < 20 && !(await fim.isVisible()); i++) {
		const antes = await itens(page).count();
		await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
		await expect
			.poll(async () => (await itens(page).count()) > antes || (await fim.isVisible()), { timeout: 10_000 })
			.toBe(true);
	}
	await expect(fim).toBeVisible();
	await expect(page.getByRole('link', { name: 'Ver tudo' }).last()).toHaveAttribute('href', '/');

	const ids = await itens(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-post-id')!));
	const tipos = await itens(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-tipo')));
	expect(ids).toHaveLength(N);
	expect(new Set(ids).size).toBe(N);
	expect(new Set(tipos)).toEqual(new Set(['questao']));
	for (const id of ids) expect(topicoDoPost.get(id), id).toBe(comQuestoes.topicoId);
});

test('tarefa de Questões sem questões ligadas: aviso e atalho da matéria (Cenário 2)', async ({ page }) => {
	await page.goto(rota(semQuestoes));
	const fazer = page.getByRole('region', { name: 'O que fazer' });
	await expect(fazer.getByText('Nenhuma questão do catálogo ligada a este tópico ainda.')).toBeVisible();
	await expect(fazer.getByRole('link', { name: 'Questões deste tópico' })).toHaveCount(0);
	await expect(fazer.getByRole('link', { name: 'Questões desta matéria' })).toHaveAttribute(
		'href',
		`/?materia=${semQuestoes.materia}&tipo=questao`
	);
});

test('tarefa de Leitura não ganha contagem nem atalho de tópico', async ({ page }) => {
	await page.goto(rota({ id: `${comQuestoes.topicoId}:L` }));
	const fazer = page.getByRole('region', { name: 'O que fazer' });
	await expect(fazer.getByRole('link', { name: 'Lei seca e resumos desta matéria' })).toBeVisible();
	await expect(fazer.getByText(/questões? deste tópico|Nenhuma questão do catálogo/)).toHaveCount(0);
	await expect(fazer.getByRole('link', { name: 'Questões deste tópico' })).toHaveCount(0);
});

test('id de tópico inexistente na URL: fim imediato com link para "Tudo"', async ({ page }) => {
	await page.goto(feedTopico('NAO-EXISTE-99'));
	await expect(page.getByRole('heading', { level: 2, name: 'Questões de NAO-EXISTE-99' })).toBeVisible();
	await expect(page.getByText('0 questões', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Nenhuma questão deste tópico' })).toBeVisible();
	await expect(itens(page)).toHaveCount(0);
	await page.locator('.fim-topico').getByRole('link', { name: 'Ver tudo' }).click();
	await expect(page).toHaveURL('/');
	await expect.poll(() => itens(page).count()).toBeGreaterThanOrEqual(3);
});

for (const tema of TEMAS) {
	test(`360 px sem rolagem horizontal no tema ${tema}: tarefa e feed do tópico`, async ({ page }) => {
		await page.addInitScript(([k, t]) => localStorage.setItem(k, JSON.stringify({ tema: t })), [CHAVE_TEMA, tema] as const);
		await page.setViewportSize({ width: 360, height: 780 });
		const semRolagem = () =>
			page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

		await page.goto(rota(comQuestoes));
		await expect(page.locator('html')).toHaveAttribute('data-tema', tema);
		await expect(page.getByRole('link', { name: 'Questões deste tópico' })).toBeVisible();
		expect(await semRolagem()).toBe(true);

		await page.goto(rota(semQuestoes));
		await expect(page.getByText('Nenhuma questão do catálogo ligada a este tópico ainda.')).toBeVisible();
		expect(await semRolagem()).toBe(true);

		await page.goto(feedTopico(comQuestoes.topicoId));
		await expect(itens(page).first()).toBeVisible();
		await expect(page.getByText(`${N} questões`, { exact: true })).toBeVisible();
		expect(await semRolagem()).toBe(true);

		await page.goto(feedTopico('NAO-EXISTE-99'));
		await expect(page.getByRole('heading', { name: 'Nenhuma questão deste tópico' })).toBeVisible();
		expect(await semRolagem()).toBe(true);
	});
}

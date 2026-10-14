import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import missoes from '../../static/conteudo/missoes-cd.json' with { type: 'json' };

// Questões por tópico (FR-002, FR-003, FR-004; Cenários 1 e 2 e bordas) contra o conteúdo real.
// A contagem esperada vem sempre do índice; o tópico de cada post, do próprio lote. Desde
// 2026-10-14 o atalho do tópico fica em cada subitem da "Missão de hoje" do painel, que segue o
// plano das Missões (planos/2026-10-14-missao-unica.md); antes ficava na tela /tarefa.
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

/** Subitens das Missões (Ciência de Dados), com o dia em que aparecem. */
const subitens = missoes.plan.flatMap((d) =>
	d.blocos.flatMap((b) => (b.itens ?? []).map((it) => ({ dia: d.data, cid: it.cid, cod: it.cod, texto: it.texto })))
);
/**
 * Um subitem com questões ligadas e um sem nenhuma, no plano das Missões. Se nenhum tópico tiver
 * questão ligada (o catálogo apontando para ids antigos, F6-02 do vault), os testes que precisam
 * de uma são pulados.
 */
const comQuestoes = subitens.find((s) => ligadas(s.cid) > 0)!;
const semQuestoes = subitens.find((s) => ligadas(s.cid) === 0)!;
const N = comQuestoes ? ligadas(comQuestoes.cid) : 0;
const SEM_LIGADAS = 'nenhum tópico do plano tem questão ligada no catálogo (F6-02 do vault)';
const pularSemLigadas = () => test.skip(!comQuestoes, SEM_LIGADAS);
/** Abre o painel no dia em que o subitem está na missão; devolve o item da lista. */
async function abrirNoPainel(page: Page, s: { dia: string; texto: string }) {
	await page.clock.setFixedTime(new Date(`${s.dia}T09:00:00-03:00`));
	await page.goto('/painel');
	return page.getByRole('region', { name: 'Missão de hoje' }).locator('.itens li', { hasText: s.texto }).first();
}
const feedTopico = (topico: string) => `/?topico=${encodeURIComponent(topico)}&tipo=questao`;

const itens = (page: Page) => page.locator('[data-post-id]');

test.beforeEach(async ({ context }) => {
	await context.clearCookies();
});

test('as amostras existem no conteúdo real', () => {
	expect(semQuestoes).toBeDefined();
	pularSemLigadas();
	expect(N).toBeGreaterThan(0);
});

test('subitem com questões ligadas: contagem e 1 toque até o feed do tópico (FR-003, SC-001)', async ({ page }) => {
	pularSemLigadas();
	const item = await abrirNoPainel(page, comQuestoes);
	const atalho = item.getByRole('link', { name: `${N} ${N === 1 ? 'questão' : 'questões'} deste tópico` });
	await expect(atalho).toHaveAttribute('href', feedTopico(comQuestoes.cid));

	await atalho.click();
	await expect(page).toHaveURL(feedTopico(comQuestoes.cid));
	await expect(page.getByRole('heading', { level: 2, name: `Questões de ${comQuestoes.cid}` })).toBeVisible();
	await expect(page.getByText(`${N} questões`, { exact: true })).toBeVisible();
	await expect(page).toHaveTitle(`Questões de ${comQuestoes.cid} · Feed · Painel de Concurso`);
});

test('feed do tópico: só as questões ligadas, sem repetir, e o fim chega depois de exatamente N (FR-002, FR-004)', async ({ page }) => {
	pularSemLigadas();
	await page.goto(feedTopico(comQuestoes.cid));
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
	for (const id of ids) expect(topicoDoPost.get(id), id).toBe(comQuestoes.cid);
});

test('subitem sem questões ligadas: sem atalho de tópico (Cenário 2)', async ({ page }) => {
	const item = await abrirNoPainel(page, semQuestoes);
	await expect(item).toBeVisible();
	await expect(item.getByRole('link', { name: /deste tópico/ })).toHaveCount(0);
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
	test(`360 px sem rolagem horizontal no tema ${tema}: missão e feed do tópico`, async ({ page }) => {
		await page.addInitScript(([k, t]) => localStorage.setItem(k, JSON.stringify({ tema: t })), [CHAVE_TEMA, tema] as const);
		await page.setViewportSize({ width: 360, height: 780 });
		const semRolagem = () =>
			page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

		await expect(await abrirNoPainel(page, semQuestoes)).toBeVisible();
		await expect(page.locator('html')).toHaveAttribute('data-tema', tema);
		expect(await semRolagem()).toBe(true);

		if (comQuestoes) {
			const item = await abrirNoPainel(page, comQuestoes);
			await expect(item.getByRole('link', { name: /deste tópico/ })).toBeVisible();
			expect(await semRolagem()).toBe(true);

			await page.goto(feedTopico(comQuestoes.cid));
			await expect(itens(page).first()).toBeVisible();
			await expect(page.getByText(`${N} questões`, { exact: true })).toBeVisible();
			expect(await semRolagem()).toBe(true);
		}

		await page.goto(feedTopico('NAO-EXISTE-99'));
		await expect(page.getByRole('heading', { name: 'Nenhuma questão deste tópico' })).toBeVisible();
		expect(await semRolagem()).toBe(true);
	});
}

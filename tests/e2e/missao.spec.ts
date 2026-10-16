import { expect, test, type Page } from '@playwright/test';
import missoesCd from '../../static/conteudo/missoes-cd.json' with { type: 'json' };
import missoesAud from '../../static/conteudo/missoes-aud.json' with { type: 'json' };

// Missão única (planos/2026-10-14-missao-unica.md, fase 2): o painel mostra o dia do plano de 61 dias
// das Missões, com as mesmas marcações (chave missoes-cgu-2026) e o mesmo login. A API é simulada.

const CHAVE = 'missoes-cgu-2026';
const USUARIO = 'painel-concurso:usuario:v1';
const HOJE = '2026-10-14';
const diaCd = missoesCd.plan.find((d) => d.data === HOJE)!;
type Gravado = { valor: string; atualizadoEm: number };

async function simularApi(page: Page) {
	const dados: Record<string, Gravado> = {};
	await page.route('**/api/progresso/**', async (rota) => {
		const req = rota.request();
		const chave = decodeURIComponent(new URL(req.url()).pathname.split('/')[4] ?? '');
		if (req.method() === 'PUT') {
			const novo = req.postDataJSON() as Gravado;
			const gravado = !dados[chave] || novo.atualizadoEm > dados[chave].atualizadoEm;
			if (gravado) dados[chave] = novo;
			return rota.fulfill({ json: { gravado, atual: dados[chave] } });
		}
		return rota.fulfill({ json: dados });
	});
	return dados;
}

const missao = (page: Page) => page.getByRole('region', { name: 'Missão de hoje' });
const bolhas = (page: Page) => missao(page).getByRole('checkbox', { name: /como cumprido$/ });
const caixas = (page: Page) => missao(page).getByRole('checkbox', { name: /como estudado$/ });
const marcas = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), CHAVE);

test.beforeEach(async ({ page }) => {
	await page.clock.setFixedTime(new Date(`${HOJE}T09:00:00-03:00`));
});

test('o painel mostra os mesmos blocos e subitens do dia que a página das Missões', async ({ page }) => {
	await page.goto('/painel');
	await expect(missao(page)).toContainText(`0 de ${diaCd.blocos.length} blocos feitos`);
	await expect(bolhas(page)).toHaveCount(diaCd.blocos.length);
	for (const b of diaCd.blocos) {
		await expect(missao(page)).toContainText(b.titulo);
		for (const it of b.itens ?? []) await expect(missao(page)).toContainText(it.cod);
	}

	await page.goto('/conteudo/artefatos/missoes.html#cd');
	const hojePagina = page.locator('.day.is-today');
	await expect(hojePagina.locator('.bubble')).toHaveCount(diaCd.blocos.length);
	for (const b of diaCd.blocos) await expect(hojePagina).toContainText(b.titulo);
});

test('logada: marcar no painel aparece na página das Missões, e o contrário também', async ({ page }) => {
	const dados = await simularApi(page);
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), USUARIO);

	await page.goto('/painel');
	await bolhas(page).first().click();
	await expect(bolhas(page).first()).toBeChecked();
	expect(await marcas(page)).toEqual({ [`cd~${HOJE}~0`]: true });
	await expect.poll(() => dados[CHAVE]?.valor, { timeout: 8000 }).toBe(JSON.stringify({ [`cd~${HOJE}~0`]: true }));

	await page.goto('/conteudo/artefatos/missoes.html#cd');
	await expect(page.locator(`.bubble[data-k="cd~${HOJE}~0"]`)).toBeChecked();
	await page.locator(`.bubble[data-k="cd~${HOJE}~1"]`).click();

	await page.goto('/painel');
	await expect(bolhas(page).nth(1)).toBeChecked();
	await expect(missao(page)).toContainText(`2 de ${diaCd.blocos.length} blocos feitos`);
});

test('sem login: a bolha abre o popup; "Agora não" não marca e, depois de entrar, o bloco tocado está marcado', async ({ page }) => {
	await simularApi(page);
	await page.goto('/painel');
	const popup = page.getByRole('dialog', { name: 'Entre para marcar' });
	await bolhas(page).nth(2).click();
	await expect(popup).toBeVisible();
	await popup.getByRole('button', { name: 'Agora não' }).click();
	await expect(popup).toBeHidden();
	await expect(bolhas(page).nth(2)).not.toBeChecked();
	expect(await marcas(page)).toEqual({});

	// Marcar exige login: o popup volta no próximo toque.
	await bolhas(page).nth(2).click();
	await expect(popup).toBeVisible();
	await popup.getByLabel('Seu nome').fill('maria');
	await popup.getByRole('button', { name: 'Entrar' }).click();
	await expect(page).toHaveURL(/\/painel$/);
	await expect(bolhas(page).nth(2)).toBeChecked();
	expect(await marcas(page)).toEqual({ [`cd~${HOJE}~2`]: true });
});

test('subitem marcado à parte: o último marca o bloco, e desmarcar o bloco limpa os subitens', async ({ page }) => {
	// planos/2026-10-15-topico-da-missao.md. O bloco 0 de 14/10 tem dois subitens.
	await simularApi(page);
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), USUARIO);
	const [a, b] = diaCd.blocos[0].itens!;
	await page.goto('/painel');
	await expect(caixas(page)).toHaveCount(diaCd.blocos.filter((x) => (x.itens?.length ?? 0) > 1).reduce((n, x) => n + x.itens!.length, 0));

	const caixaA = missao(page).getByRole('checkbox', { name: `Marcar ${a.cod} como estudado` }).first();
	const caixaB = missao(page).getByRole('checkbox', { name: `Marcar ${b.cod} como estudado` }).first();
	await caixaA.click();
	await expect(caixaA).toBeChecked();
	await expect(bolhas(page).first()).not.toBeChecked();
	expect(await marcas(page)).toEqual({ [`cd~${HOJE}~0~${a.cid}`]: true });

	await caixaB.click();
	await expect(bolhas(page).first()).toBeChecked();
	await expect(missao(page)).toContainText(`1 de ${diaCd.blocos.length} blocos feitos`);

	await bolhas(page).first().click();
	await expect(caixaA).not.toBeChecked();
	await expect(caixaB).not.toBeChecked();
	expect(await marcas(page)).toEqual({});
});

test('fora da janela: antes de 13/10 e depois de 12/12', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-10-01T09:00:00-03:00'));
	await page.goto('/painel');
	await expect(missao(page)).toContainText('As missões começam em 13/10/2026.');
	await page.clock.setFixedTime(new Date('2026-12-20T09:00:00-03:00'));
	await page.reload();
	await expect(missao(page)).toContainText('O plano terminou em 12/12/2026.');
});

test('Auditoria troca o plano do dia', async ({ page }) => {
	await page.addInitScript(() =>
		localStorage.setItem('painel-concurso:preferencias:v2', JSON.stringify({ especialidade: 'auditoria' }))
	);
	await page.goto('/painel');
	const diaAud = missoesAud.plan.find((d) => d.data === HOJE)!;
	await expect(bolhas(page)).toHaveCount(diaAud.blocos.length);
	for (const b of diaAud.blocos) for (const it of b.itens ?? []) await expect(missao(page)).toContainText(it.cod);
	await expect(page.getByRole('link', { name: /Abrir nas Missões/ })).toHaveAttribute('href', '/artefato/missoes#aud');
});

test('o atalho do subitem abre o feed só com as questões do tópico', async ({ page }) => {
	await page.goto('/painel');
	const atalho = missao(page).getByRole('link', { name: /questões? deste tópico/ }).first();
	await expect(atalho).toBeVisible();
	const href = (await atalho.getAttribute('href'))!;
	expect(href).toMatch(/^\/\?topico=[A-Z]{3}-\d{2}&tipo=questao$/);
	await atalho.click();
	await expect(page).toHaveURL(href);
	await expect(page.locator('[data-post-id]').first()).toBeVisible();
});

test('todo subitem do dia tem link do Qconcursos, mesmo sem questão no feed', async ({ page }) => {
	await page.goto('/painel');
	const itens = diaCd.blocos.flatMap((b) => (b.itens ?? []) as { cid: string }[]);
	const links = missao(page).getByRole('link', { name: 'Questões no Qconcursos ↗' });
	await expect(links).toHaveCount(itens.length);
	for (const [i, it] of itens.entries()) {
		await expect(links.nth(i)).toHaveAttribute('href', (missoesCd.qc as Record<string, string>)[it.cid]);
		await expect(links.nth(i)).toHaveAttribute('target', '_blank');
	}
});

test('nas revisões do dia, cada subitem leva também às questões que ela errou no Qconcursos', async ({ page }) => {
	await page.goto('/painel');
	const itensRev = diaCd.blocos.filter((b) => b.tipo === 'rev').flatMap((b) => (b.itens ?? []) as { cid: string }[]);
	expect(itensRev.length).toBeGreaterThan(0);
	const erros = missao(page).getByRole('link', { name: 'Questões que errei ↗' });
	await expect(erros).toHaveCount(itensRev.length);
	for (const [i, it] of itensRev.entries()) {
		const href = (missoesCd.qcErros as Record<string, string>)[it.cid];
		expect(href).toContain('my_questions=wrong');
		await expect(erros.nth(i)).toHaveAttribute('href', href);
	}
});

test('"Seu plano" conta dias, blocos e horas das marcações', async ({ page }) => {
	await page.addInitScript(
		([k, dia, n]) => {
			const m: Record<string, boolean> = {};
			for (let i = 0; i < n; i++) m[`cd~${dia}~${i}`] = true;
			localStorage.setItem(k, JSON.stringify(m));
		},
		[CHAVE, HOJE, diaCd.blocos.length] as const
	);
	await page.goto('/painel');
	const resumo = page.getByRole('region', { name: 'Seu plano' });
	const blocos = missoesCd.plan.reduce((n, d) => n + d.blocos.length, 0);
	const horas = (min: number) => (min / 60).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
	const minTotal = missoesCd.plan.reduce((n, d) => n + d.blocos.reduce((m, b) => m + b.min, 0), 0);
	const minHoje = diaCd.blocos.reduce((m, b) => m + b.min, 0);
	await expect(resumo).not.toContainText('dias cumpridos');
	await expect(resumo).toContainText(`blocos feitos${diaCd.blocos.length} de ${blocos}`);
	await expect(resumo).toContainText(`horas feitas${horas(minHoje)} de ${horas(minTotal)} h`);
	await expect(missao(page)).toContainText('Missão cumprida');
});

test('feed: a chamada fica acima dos stories, leva ao painel e não tira o 1º post da tela em 360 px', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 780 });
	await page.addInitScript(([k, dia]) => localStorage.setItem(k, JSON.stringify({ [`cd~${dia}~0`]: true })), [CHAVE, HOJE] as const);
	await page.goto('/');
	const chamada = page.getByRole('region', { name: 'Missão de hoje' });
	await expect(chamada).toContainText(`1 de ${diaCd.blocos.length} blocos feitos`);
	const stories = page.getByRole('navigation', { name: 'Matérias' });
	await expect(stories).toBeVisible();
	const [c, st] = await Promise.all([chamada.boundingBox(), stories.boundingBox()]);
	expect(c!.y).toBeLessThan(st!.y);
	const primeiro = page.locator('[data-post-id]').first();
	await expect(primeiro).toBeVisible();
	expect((await primeiro.boundingBox())!.y).toBeLessThan(780);
	await chamada.getByRole('link', { name: 'Abrir' }).click();
	await expect(page).toHaveURL(/\/painel$/);
});

test('feed: missão cumprida vira um aviso discreto; fora da janela, sem chamada', async ({ page }) => {
	await page.addInitScript(
		([k, dia, n]) => {
			const m: Record<string, boolean> = {};
			for (let i = 0; i < n; i++) m[`cd~${dia}~${i}`] = true;
			localStorage.setItem(k, JSON.stringify(m));
		},
		[CHAVE, HOJE, diaCd.blocos.length] as const
	);
	await page.goto('/');
	await expect(page.getByRole('region', { name: 'Missão de hoje' }).getByRole('link', { name: 'Missão cumprida' })).toBeVisible();
	await page.clock.setFixedTime(new Date('2026-12-20T09:00:00-03:00'));
	await page.reload();
	await expect(page.getByRole('navigation', { name: 'Matérias' })).toBeVisible();
	await expect(page.getByRole('region', { name: 'Missão de hoje' })).toHaveCount(0);
});

test('página das Missões: o quadrado clicado na régua e o card do dia ficam destacados', async ({ page }) => {
	await page.goto('/conteudo/artefatos/missoes.html#cd');
	const regua = page.locator('#ruler button');
	await regua.nth(20).click();
	await expect(regua.nth(20)).toHaveClass(/\bsel\b/);
	await expect(regua.nth(20)).toHaveAttribute('aria-current', 'true');
	await expect(page.locator(`#d-${missoesCd.plan[20].data}`)).toHaveClass(/\bis-sel\b/);
	await regua.nth(30).click();
	await expect(page.locator('#ruler button.sel')).toHaveCount(1);
	await expect(regua.nth(30)).toBeFocused();
	await expect(page.locator('.day.is-sel')).toHaveAttribute('id', `d-${missoesCd.plan[30].data}`);
});

test('página das Missões: a régua acompanha Hoje, Esta semana e Os 61 dias', async ({ page }) => {
	await page.goto('/conteudo/artefatos/missoes.html#cd');
	const regua = page.locator('#ruler button');
	const acesos = page.locator('#ruler button:not(.fora)');
	await regua.nth(20).click();
	await expect(acesos).toHaveCount(61);

	await page.locator('#v-hoje').click();
	await expect(acesos).toHaveCount(1);
	await expect(acesos.first()).toHaveClass(/\btoday\b/);
	await expect(page.locator('#ruler button.sel')).toHaveCount(0);

	// 14/10 está na semana 1 do plano, de 13/10 a 18/10.
	await page.locator('#v-semana').click();
	const semana = missoesCd.plan.filter((d) => d.data <= '2026-10-18').length;
	await expect(acesos).toHaveCount(semana);

	await page.locator('#v-tudo').click();
	await expect(acesos).toHaveCount(61);
});

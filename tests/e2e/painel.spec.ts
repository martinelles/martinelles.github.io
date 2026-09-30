import { expect, test, type Page } from '@playwright/test';
import ferramentas from '../../src/lib/dados/ferramentas.json' with { type: 'json' };

// Cenário 5: painel só da CGU, foco fixo, números calculados e atalhos para o feed.

const CHAVE_FOCO = 'painel-concurso:preferencias:v2';
const ATALHOS_FEED: Record<string, string> = {
	'questoes-objetivas': '/?tipo=questao',
	resumos: '/?tipo=resumo',
	flashcards: '/?tipo=flashcard',
	jurisprudencia: '/?tipo=lei'
};
const emBreve = ferramentas.filter((f) => !(f.id in ATALHOS_FEED));

test.beforeEach(async ({ page, context }) => {
	await context.clearCookies();
	await page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'));
});

const numero = (page: Page, rotulo: string) =>
	page.locator('dt', { hasText: rotulo }).locator('xpath=following-sibling::dd[1]');
const abas = (page: Page) => page.getByRole('navigation', { name: 'Seções' });

test('cabeçalho mostra a CGU, a banca e "Data a definir", sem trocar concurso', async ({ page }) => {
	await page.goto('/painel');
	await expect(page).toHaveTitle('Painel · Painel de Concurso');
	await expect(page.getByRole('heading', { level: 1, name: 'Seu Painel de Estudos' })).toBeVisible();
	await expect(
		page.getByText('CGU — Auditor Federal de Finanças e Controle · TI — Ciência de Dados', { exact: true })
	).toBeVisible();
	await expect(page.getByText(/banca Cebraspe/)).toBeVisible();
	await expect(page.getByText('Data a definir')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Trocar concurso' })).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Ver edital' })).toHaveCount(0);
	await expect(abas(page).getByRole('link', { name: 'Painel' })).toHaveAttribute('aria-current', 'page');
});

test('foco: cargo fixo, disciplina começa em Ciência de Dados e persiste', async ({ page }) => {
	await page.goto('/painel');
	await expect(page.getByText('AFFC — TI — Ciência de Dados', { exact: true })).toBeVisible();
	await expect(page.getByLabel('Cargo')).toHaveCount(0);
	const disciplina = page.getByLabel('Disciplina');
	await expect(disciplina).toBeEnabled();
	await expect(disciplina).toHaveValue('ti-ciencia-de-dados');
	await expect(disciplina.locator('option:checked')).toHaveText('TI: Ciência de Dados');

	await disciplina.selectOption({ label: 'Direito Constitucional' });
	expect(await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), CHAVE_FOCO)).toEqual({
		disciplina: 'direito-constitucional'
	});
	await page.reload();
	await expect(page.getByLabel('Disciplina')).toHaveValue('direito-constitucional');

	// E o story dela passa a vir logo depois de "Tudo".
	await abas(page).getByRole('link', { name: 'Feed' }).click();
	await expect(page.getByRole('navigation', { name: 'Matérias' }).getByRole('link').nth(1)).toHaveAccessibleName(
		/^Const\. — Direito Constitucional/
	);
});

test('estatísticas são calculadas e mudam ao responder e salvar no feed (SC-007)', async ({ page }) => {
	await page.goto('/painel');
	await expect(numero(page, 'Respondidas')).toHaveText('0');
	await expect(numero(page, 'Acertos')).toHaveText('0');
	await expect(numero(page, 'Taxa de acerto')).toHaveText('—');
	await expect(numero(page, 'Salvos')).toHaveText('0');
	await expect(page.getByRole('heading', { name: 'Por matéria' })).toHaveCount(0);

	// Responde uma questão e salva um post no feed.
	await page.goto('/?tipo=questao');
	const questao = page.locator('[data-post-id]').first();
	await questao.getByRole('group', { name: 'Responder' }).getByRole('button').first().click();
	const resultado = questao.getByText(/Você (acertou|errou)/);
	await expect(resultado).toBeVisible();
	const acertou = (await resultado.textContent())!.includes('Você acertou');
	const materia = (await questao.locator('article h2').textContent())!.trim();
	await questao.getByRole('button', { name: 'Salvar' }).click();

	await abas(page).getByRole('link', { name: 'Painel' }).click();
	await expect(numero(page, 'Respondidas')).toHaveText('1');
	await expect(numero(page, 'Acertos')).toHaveText(acertou ? '1' : '0');
	await expect(numero(page, 'Taxa de acerto')).toHaveText(acertou ? '100%' : '0%');
	await expect(numero(page, 'Salvos')).toHaveText('1');
	const porMateria = page.getByRole('heading', { name: 'Por matéria' }).locator('xpath=following-sibling::ul[1]/li');
	await expect(porMateria).toHaveCount(1);
	await expect(porMateria).toContainText(materia);
	await expect(porMateria).toContainText(acertou ? '1 de 1' : '0 de 1');
});

test('grade tem as 12 ferramentas: 4 atalhos do feed e 8 "em breve"', async ({ page }) => {
	await page.goto('/painel');
	expect(ferramentas).toHaveLength(12);
	await expect(page.getByRole('heading', { level: 2, name: 'Material Teórico' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 2, name: 'Prática & Revisão' })).toBeVisible();
	await expect(page.locator('a[href^="/ferramenta/"]')).toHaveCount(8);
	await expect(page.locator('a[href^="/?tipo="]')).toHaveCount(4);
	await expect(page.getByRole('link', { name: /^Lei seca/ })).toHaveAttribute('href', '/?tipo=lei');
	await expect(page.getByRole('link', { name: /^Jurisprudência/ })).toHaveCount(0);
});

for (const [id, destino] of Object.entries(ATALHOS_FEED)) {
	test(`atalho ${id} abre o feed filtrado (${destino})`, async ({ page }) => {
		const tipo = destino.split('=')[1];
		await page.goto('/painel');
		await page.locator(`a[href="${destino}"]`).click();
		await expect(page).toHaveURL(destino);
		await expect.poll(() => page.locator('[data-post-id]').count()).toBeGreaterThanOrEqual(1);
		const tipos = await page
			.locator('[data-post-id]')
			.evaluateAll((els) => els.map((el) => el.getAttribute('data-tipo')));
		expect(new Set(tipos)).toEqual(new Set([tipo]));
		// O endereço antigo da ferramenta também leva ao feed filtrado.
		await page.goto(`/ferramenta/${id}`);
		await expect(page).toHaveURL(destino);
	});
}

test('as demais ferramentas abrem "em breve" e voltam ao painel', async ({ page }) => {
	await page.goto('/painel');
	for (const f of emBreve) {
		await page.locator(`a[href="/ferramenta/${f.id}"]`).click();
		await expect(page).toHaveURL(`/ferramenta/${f.id}`);
		await expect(page).toHaveTitle(`${f.titulo} · Painel de Concurso`);
		await expect(page.getByRole('heading', { level: 1, name: f.titulo })).toBeVisible();
		await expect(page.getByText('Em breve por aqui.')).toBeVisible();
		await page.getByRole('link', { name: 'Voltar ao painel' }).click();
		await expect(page).toHaveURL('/painel');
		await expect(page.getByRole('heading', { level: 1, name: 'Seu Painel de Estudos' })).toBeVisible();
	}
});

test('/ferramenta/nao-existe mostra "não encontrada" com link', async ({ page }) => {
	await page.goto('/ferramenta/nao-existe');
	await expect(page.getByRole('heading', { level: 1, name: 'Ferramenta não encontrada' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Voltar ao painel' })).toHaveAttribute('href', '/painel');
});

test('em 360 px nenhum cartão da grade estoura a coluna', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 780 });
	await page.goto('/painel');
	const cartoes = page.locator('a[href^="/ferramenta/"], a[href^="/?tipo="]');
	await expect(cartoes).toHaveCount(12);
	const estouros = await cartoes.evaluateAll((els) =>
		els.filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.getAttribute('href'))
	);
	expect(estouros).toEqual([]);
	expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});

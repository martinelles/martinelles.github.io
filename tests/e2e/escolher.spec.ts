import { expect, test, type Page } from '@playwright/test';

const CHAVE = 'painel-concurso:preferencias:v1';

/**
 * Prepara o aparelho uma vez por teste: o init script roda a cada carga de documento, e
 * uma rota ainda inexistente (/painel antes do WP06) recarrega a página — sem a marca em
 * sessionStorage, a limpeza apagaria a escolha que o teste quer conferir.
 */
async function prepararAparelho(page: Page, preferencias: unknown = null) {
	await page.addInitScript(
		([chave, valor]) => {
			if (sessionStorage.getItem('e2e-preparado')) return;
			sessionStorage.setItem('e2e-preparado', '1');
			localStorage.clear();
			if (valor) localStorage.setItem(chave as string, valor as string);
		},
		[CHAVE, preferencias ? JSON.stringify(preferencias) : null]
	);
	await page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'));
}

/** Cartões visíveis (a consulta por papel ignora os que estão em seção fechada). */
const cartoesVisiveis = (page: Page) => page.getByRole('listitem').getByRole('button');
const emAlta = (page: Page) => page.getByRole('region', { name: /Abertos em alta/ });
const cabecalho = (page: Page, titulo: string) =>
	page.getByRole('button', { name: new RegExp(`^${titulo} \\(`) });

async function conteudoDa(page: Page, titulo: string) {
	const id = await cabecalho(page, titulo).getAttribute('aria-controls');
	return page.locator(`[id="${id}"]`);
}

test.describe('tela de escolha', () => {
	test('1. primeiro acesso em / abre a escolha com busca e as quatro seções', async ({ page }) => {
		await prepararAparelho(page);
		await page.goto('/');
		await expect(page).toHaveURL(/\/escolher$/);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Qual o concurso dos seus sonhos?');
		await expect(page.getByText('Olá!')).toBeVisible();
		await expect(page.getByRole('searchbox', { name: 'Buscar concurso' })).toBeVisible();
		await expect(page.getByRole('heading', { level: 2, name: /Abertos em alta/ })).toBeVisible();
		for (const titulo of ['Autorizados ou Previstos', 'Por Área', 'Encerrados']) {
			await expect(page.getByRole('heading', { level: 2, name: new RegExp(`^${titulo}`) })).toBeVisible();
			await expect(cabecalho(page, titulo)).toHaveAttribute('aria-expanded', 'false');
		}
		await expect(page).toHaveTitle('Painel de Concurso');
	});

	test('2. busca sem diferenciar maiúsculas nem acentos', async ({ page }) => {
		await prepararAparelho(page);
		await page.goto('/escolher');
		const busca = page.getByRole('searchbox', { name: 'Buscar concurso' });
		// Estado manual deixado antes da busca: "Encerrados" aberto, o resto fechado.
		await cabecalho(page, 'Encerrados').click();
		await expect(cartoesVisiveis(page)).toHaveCount(5 + 3);

		await busca.fill('cgu');
		const cartoes = cartoesVisiveis(page);
		// CGU TI aparece em "Abertos em alta" e em "Por Área"; CGU TFC em "Encerrados".
		await expect(cartoes).toHaveCount(3);
		for (const nome of await cartoes.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))) {
			expect(nome).toMatch(/^CGU — /);
		}
		await expect(page.getByText('2 concursos encontrados')).toBeAttached();
		const comCgu = await cartoes.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));

		await busca.fill('controladoria geral da UNIAO');
		await expect(cartoes).toHaveCount(3);
		expect(await cartoes.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))).toEqual(comCgu);

		// Limpar a busca devolve o estado manual das seções e o limite de 5.
		await busca.fill('');
		await expect(cabecalho(page, 'Encerrados')).toHaveAttribute('aria-expanded', 'true');
		await expect(cabecalho(page, 'Por Área')).toHaveAttribute('aria-expanded', 'false');
		await expect(emAlta(page).getByRole('listitem')).toHaveCount(5);
	});

	test('3. busca sem resultado mostra o estado vazio', async ({ page }) => {
		await prepararAparelho(page);
		await page.goto('/escolher');
		await page.getByRole('searchbox', { name: 'Buscar concurso' }).fill('zzzz');

		await expect(page.getByText('Poxa, não encontramos "zzzz"')).toBeVisible();
		await expect(page.getByText('A gente adiciona para você!')).toBeVisible();
		await expect(page.getByRole('heading', { level: 2 })).toHaveCount(0);
		// whatsapp é null em config.json: o link não existe.
		await expect(page.getByRole('link', { name: 'Pedir no WhatsApp' })).toHaveCount(0);

		await page.getByRole('button', { name: 'Estudar por Disciplina' }).click();
		await expect(page).toHaveURL(/\/ferramenta\/estudo-por-disciplina$/);
	});

	test('4. "Abertos em alta" limita a 5, Ver mais expande e Ver menos recolhe', async ({ page }) => {
		await prepararAparelho(page);
		await page.goto('/escolher');
		const itens = emAlta(page).getByRole('listitem');

		await expect(itens).toHaveCount(5);
		await page.getByRole('button', { name: 'Ver mais (2)' }).click();
		await expect(itens).toHaveCount(7);
		await page.getByRole('button', { name: 'Ver menos' }).click();
		await expect(itens).toHaveCount(5);
		await expect(page.getByRole('button', { name: 'Ver mais (2)' })).toBeVisible();
	});

	test('5. cabeçalhos das seções recolhíveis abrem e fecham', async ({ page }) => {
		await prepararAparelho(page);
		await page.goto('/escolher');

		for (const titulo of ['Encerrados', 'Autorizados ou Previstos', 'Por Área']) {
			const botao = cabecalho(page, titulo);
			const conteudo = await conteudoDa(page, titulo);
			await expect(conteudo).toBeHidden();

			await botao.click();
			await expect(botao).toHaveAttribute('aria-expanded', 'true');
			await expect(conteudo.getByRole('button').first()).toBeVisible();

			await botao.click();
			await expect(botao).toHaveAttribute('aria-expanded', 'false');
			await expect(conteudo).toBeHidden();
		}

		// "Por Área" agrupa com um h3 por área.
		await cabecalho(page, 'Por Área').click();
		await expect(page.getByRole('heading', { level: 3, name: 'Controle' })).toBeVisible();
	});

	test('5b. teclado: Enter no cabeçalho abre a seção', async ({ page }) => {
		await prepararAparelho(page);
		await page.goto('/escolher');
		const botao = cabecalho(page, 'Encerrados');
		await botao.focus();
		await page.keyboard.press('Enter');
		await expect(botao).toHaveAttribute('aria-expanded', 'true');
		await page.keyboard.press('Space');
		await expect(botao).toHaveAttribute('aria-expanded', 'false');
	});

	test('6. tocar no cartão grava a escolha e vai ao painel', async ({ page }) => {
		await prepararAparelho(page);
		await page.goto('/escolher');
		await emAlta(page).getByRole('button', { name: /^CGU — Auditor Federal/ }).click();

		await expect(page).toHaveURL(/\/painel$/);
		const gravado = await page.evaluate((chave) => localStorage.getItem(chave), CHAVE);
		expect(gravado).toContain('"concursoId":"cgu-affc-ti"');
	});

	test('7. FR-013: raiz com preferência válida vai ao painel', async ({ page }) => {
		await prepararAparelho(page, { concursoId: 'cgu-affc-ti', cargoId: null, disciplina: null });
		await page.goto('/');
		await expect(page).toHaveURL(/\/painel$/);
	});

	test('7b. FR-013: raiz com concurso que sumiu vai à escolha', async ({ page }) => {
		await prepararAparelho(page, { concursoId: 'nao-existe', cargoId: null, disciplina: null });
		await page.goto('/');
		await expect(page).toHaveURL(/\/escolher$/);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Qual o concurso dos seus sonhos?');
	});

	test('8. concurso "aberto" com prova passada fica em Encerrados', async ({ page }) => {
		await prepararAparelho(page);
		await page.goto('/escolher');
		const pcdf = /^PCDF — Agente de Polícia/;

		await page.getByRole('button', { name: /^Ver mais/ }).click();
		await expect(emAlta(page).getByRole('listitem')).toHaveCount(7);
		await expect(emAlta(page).getByRole('button', { name: pcdf })).toHaveCount(0);

		await cabecalho(page, 'Encerrados').click();
		const encerrados = await conteudoDa(page, 'Encerrados');
		await expect(encerrados.getByRole('button', { name: pcdf })).toBeVisible();
		await expect(encerrados.getByRole('button', { name: pcdf })).toHaveAccessibleName(/Encerrado$/);
	});
});

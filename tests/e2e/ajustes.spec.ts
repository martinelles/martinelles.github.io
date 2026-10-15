import { expect, test, type Locator, type Page } from '@playwright/test';

// Missão aparencia-tela-propria: Cenários 1 a 4 da spec, FR-001 a FR-008, NFR-001 a NFR-003,
// SC-001 e SC-002. Contrato: contracts/tela-ajustes.md (papéis e textos usados aqui).

const CHAVE_FOCO = 'painel-concurso:preferencias:v2';
const CHAVE_TEMA = 'painel-concurso:tema:v1';

test.beforeEach(async ({ page, context }) => {
	await context.clearCookies();
	await page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'));
});

const abas = (page: Page) => page.getByRole('navigation', { name: 'Seções' });
const cabecalho = (page: Page) =>
	page.locator('header', { has: page.getByRole('heading', { level: 1, name: 'Seu Painel de Estudos' }) });
const linkAjustes = (page: Page) => page.getByRole('link', { name: 'Ajustes', exact: true });
const grupoAparencia = (page: Page) => page.getByRole('group', { name: 'Aparência' });
const lerChave = (page: Page, chave: string) =>
	page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), chave);

/** Conta as interações do usuário: cada passo que ele faz passa por aqui. */
function contador() {
	let n = 0;
	return {
		clicar: async (alvo: Locator) => {
			n++;
			await alvo.click();
		},
		escolher: async (alvo: Locator, rotulo: string) => {
			n++;
			await alvo.selectOption({ label: rotulo });
		},
		get total() {
			return n;
		}
	};
}

// ---------------------------------------------------------------------------------------------
// T006 — navegação
// ---------------------------------------------------------------------------------------------

test('painel sem os blocos de Aparência e Disciplina, com o foco em texto (FR-001, FR-006, SC-001)', async ({
	page
}) => {
	await page.goto('/painel');
	await expect(cabecalho(page)).toBeVisible();
	await expect(grupoAparencia(page)).toHaveCount(0);
	await expect(page.getByLabel('Disciplina')).toHaveCount(0);
	await expect(cabecalho(page).getByText('Foco: E1 · Estatística, Programação e Análise de Dados', { exact: true })).toBeVisible();
});

test('link "Ajustes" no cabeçalho, com alvo de 44 × 44 (FR-002, NFR-002)', async ({ page }) => {
	await page.goto('/painel');
	const link = cabecalho(page).getByRole('link', { name: 'Ajustes', exact: true });
	await expect(link).toBeVisible();
	await expect(link).toHaveAttribute('href', '/painel/ajustes');
	const caixa = await link.boundingBox();
	expect(caixa, 'caixa do link Ajustes').not.toBeNull();
	expect(caixa!.width, 'largura do link Ajustes').toBeGreaterThanOrEqual(44);
	expect(caixa!.height, 'altura do link Ajustes').toBeGreaterThanOrEqual(44);
});

test('o link abre a tela de Ajustes na ordem do contrato (FR-003)', async ({ page }) => {
	await page.goto('/painel');
	await linkAjustes(page).click();
	await expect(page).toHaveURL('/painel/ajustes');
	await expect(page).toHaveTitle('Ajustes · Painel de Concurso');

	const h1 = page.getByRole('heading', { level: 1, name: 'Ajustes' });
	const voltar = page.getByRole('link', { name: 'Voltar ao painel' });
	const foco = page.getByRole('heading', { name: 'Foco de Estudo' });
	const aparencia = grupoAparencia(page);
	for (const l of [h1, voltar, foco, aparencia]) await expect(l).toBeVisible();
	await expect(voltar).toHaveAttribute('href', '/painel');

	// Ordem no documento: cada par consecutivo, por compareDocumentPosition.
	const elementos = await Promise.all([h1, voltar, foco, aparencia].map((l) => l.elementHandle()));
	const nomes = ['h1 "Ajustes"', 'link "Voltar ao painel"', 'heading "Foco de Estudo"', 'group "Aparência"'];
	for (let i = 0; i < elementos.length - 1; i++) {
		const segueAntes = await page.evaluate(
			([a, b]) => !!(a!.compareDocumentPosition(b!) & Node.DOCUMENT_POSITION_FOLLOWING),
			[elementos[i], elementos[i + 1]] as const
		);
		expect(segueAntes, `${nomes[i]} vem antes de ${nomes[i + 1]} no DOM`).toBe(true);
	}
});

test('voltar pelo link "Voltar ao painel" (FR-003, Cenário 2.2)', async ({ page }) => {
	await page.goto('/painel');
	await linkAjustes(page).click();
	await expect(page).toHaveURL('/painel/ajustes');
	await page.getByRole('link', { name: 'Voltar ao painel' }).click();
	await expect(page).toHaveURL('/painel');
	await expect(cabecalho(page)).toBeVisible();
});

test('voltar pelo botão do navegador (Cenário 4.3)', async ({ page }) => {
	await page.goto('/painel');
	await linkAjustes(page).click();
	await expect(page).toHaveURL('/painel/ajustes');
	await page.goBack();
	await expect(page).toHaveURL('/painel');
	await expect(cabecalho(page)).toBeVisible();
});

test('na tela de Ajustes, a aba atual é o Painel (FR-008)', async ({ page }) => {
	await page.goto('/painel/ajustes');
	await expect(page.locator('a.aba[aria-current="page"]')).toHaveCount(1);
	await expect(page.locator('a.aba[aria-current="page"]')).toHaveAttribute('href', '/painel');
	await expect(abas(page).getByRole('link', { name: 'Painel' })).toHaveAttribute('aria-current', 'page');
});

test('teclado: Enter no link "Ajustes" abre a tela (NFR-003)', async ({ page }) => {
	await page.goto('/painel');
	await linkAjustes(page).focus();
	await expect(linkAjustes(page)).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL('/painel/ajustes');
	await expect(page.getByRole('heading', { level: 1, name: 'Ajustes' })).toBeVisible();
});

test('2 interações do painel até trocar o tema (NFR-001, SC-002)', async ({ page }) => {
	await page.goto('/painel');
	const passos = contador();
	await passos.clicar(linkAjustes(page));
	await passos.clicar(grupoAparencia(page).getByRole('radio', { name: 'Kindle', exact: true }));
	expect(passos.total).toBe(2);
	await expect(page.locator('html')).toHaveAttribute('data-tema', 'kindle');
	expect(await lerChave(page, CHAVE_TEMA)).toEqual({ tema: 'kindle' });
});

test('link direto para /painel/ajustes numa página nova (FR-007)', async ({ context }) => {
	const nova = await context.newPage();
	await nova.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'));
	await nova.goto('/painel/ajustes');
	await expect(nova.getByRole('heading', { level: 1, name: 'Ajustes' })).toBeVisible();
	await expect(grupoAparencia(nova)).toBeVisible();
	await nova.close();
});

// ---------------------------------------------------------------------------------------------
// T007 — o foco e os efeitos dele
// ---------------------------------------------------------------------------------------------

test.describe('foco escolhido em 2 interações', () => {
	async function escolherDireitoPublico(page: Page) {
		await page.goto('/painel');
		const passos = contador();
		await passos.clicar(linkAjustes(page));
		await passos.escolher(page.getByLabel('Disciplina'), 'C3 · Direito Público Aplicado, Controle e Responsabilização');
		expect(passos.total).toBe(2);
		await expect(page.getByLabel('Disciplina')).toHaveValue('c3');
	}

	test('2 interações do painel até trocar o foco (NFR-001)', async ({ page }) => {
		await escolherDireitoPublico(page);
		expect(await lerChave(page, CHAVE_FOCO)).toEqual({ disciplina: 'c3', especialidade: 'ciencia-de-dados' });
	});

	test('o texto do foco no painel acompanha (FR-006, Cenário 3.1)', async ({ page }) => {
		await escolherDireitoPublico(page);
		await page.getByRole('link', { name: 'Voltar ao painel' }).click();
		await expect(page).toHaveURL('/painel');
		await expect(cabecalho(page).getByText('Foco: C3 · Direito Público Aplicado, Controle e Responsabilização', { exact: true })).toBeVisible();
	});

	test('os stories do feed acompanham (Cenário 3.1)', async ({ page }) => {
		await escolherDireitoPublico(page);
		await abas(page).getByRole('link', { name: 'Feed' }).click();
		await expect(page).toHaveURL('/');
		await expect(page.getByRole('navigation', { name: 'Matérias' }).getByRole('link').nth(1)).toHaveAccessibleName(
			/^Dir\. Públ\. — C3 · Direito Público Aplicado/
		);
	});
});

test('enquanto as matérias carregam, o foco aparece provisório e sem erro (caso de borda)', async ({ page }) => {
	const erros: string[] = [];
	page.on('pageerror', (e) => erros.push(e.message));
	let liberar!: () => void;
	const liberado = new Promise<void>((r) => (liberar = r));
	// Segura as matérias até a primeira asserção (no mínimo 1,5 s), sem depender da carga da máquina.
	await page.route('**/materias.json', async (rota) => {
		await Promise.all([liberado, new Promise((r) => setTimeout(r, 1500))]);
		await rota.continue();
	});

	await page.goto('/painel');
	const linhaFoco = cabecalho(page).getByText(/^Foco: /);
	await expect(linhaFoco).toBeVisible();
	await expect(linhaFoco).not.toHaveText('Foco: E1 · Estatística, Programação e Análise de Dados');

	liberar();
	await expect(cabecalho(page).getByText('Foco: E1 · Estatística, Programação e Análise de Dados', { exact: true })).toBeVisible();
	expect(erros).toEqual([]);
});

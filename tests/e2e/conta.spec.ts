import { expect, test, type Page } from '@playwright/test';

// Login por nome (planos/2026-10-13-login-por-nome-backend-cloudflare.md, fase 3). O `vite preview`
// não roda o Worker: a API de progresso é simulada aqui, com a mesma regra (vale o carimbo maior).

const CHAVE_USUARIO = 'painel-concurso:usuario:v1';
const CHAVE_TEMA = 'painel-concurso:tema:v1';
const CHAVE_INTERACOES = 'painel-concurso:interacoes:v1';

type Gravado = { valor: string; atualizadoEm: number };

/** Servidor falso por usuário; devolve o mapa para o teste conferir o que subiu. */
async function simularApi(page: Page, inicial: Record<string, Record<string, Gravado>> = {}) {
	const dados = structuredClone(inicial);
	await page.route('**/api/progresso/**', async (rota) => {
		const partes = new URL(rota.request().url()).pathname.split('/').map(decodeURIComponent);
		const [, , , usuario, chave] = partes;
		const doUsuario = (dados[usuario] ??= {});
		if (rota.request().method() === 'PUT') {
			const novo = rota.request().postDataJSON() as Gravado;
			const gravado = !doUsuario[chave] || novo.atualizadoEm > doUsuario[chave].atualizadoEm;
			if (gravado) doUsuario[chave] = novo;
			return rota.fulfill({ json: { gravado, atual: doUsuario[chave] } });
		}
		return rota.fulfill({ json: doUsuario });
	});
	return dados;
}

const ajustes = (page: Page) => page.goto('/painel/ajustes');
const secaoConta = (page: Page) => page.getByRole('region', { name: 'Conta' });

test.beforeEach(async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'));
});

test('sem login, Ajustes convida a entrar e nada vai ao servidor', async ({ page }) => {
	let pedidos = 0;
	await page.route('**/api/**', (r) => (pedidos++, r.fulfill({ json: {} })));
	await ajustes(page);
	await expect(secaoConta(page)).toContainText('Seu progresso está só neste aparelho');
	await expect(secaoConta(page).getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/entrar');
	expect(pedidos).toBe(0);
});

test('entrar mostra o nome normalizado, abre o painel e traz o progresso do servidor', async ({ page }) => {
	await simularApi(page, { 'maria-silva': { [CHAVE_TEMA]: { valor: '{"tema":"kindle"}', atualizadoEm: 5 } } });
	await page.goto('/entrar');
	const entrar = page.getByRole('button', { name: 'Entrar' });

	await page.getByLabel('Seu nome').fill('Zé');
	await expect(page.getByText('O nome precisa de 3 a 30 letras ou números.')).toBeVisible();
	await expect(entrar).toBeDisabled();

	await page.getByLabel('Seu nome').fill('Maria Sílva');
	await expect(page.getByText('Você vai entrar como maria-silva.')).toBeVisible();
	await entrar.click();

	await expect(page).toHaveURL(/\/painel$/);
	// A sincronização roda depois da carga; no 1º teste de cada worker, esta máquina é lenta (playwright.config.ts).
	await expect(page.locator('html')).toHaveAttribute('data-tema', 'kindle', { timeout: 15_000 });
	expect(await page.evaluate((k) => localStorage.getItem(k), CHAVE_USUARIO)).toBe('maria-silva');

	await ajustes(page);
	await expect(secaoConta(page)).toContainText('Entrou como maria-silva');
});

test('logado, mudar o tema sobe para o servidor', async ({ page }) => {
	const dados = await simularApi(page);
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), CHAVE_USUARIO);
	await ajustes(page);
	await page.getByRole('radio', { name: 'Kindle', exact: true }).check();
	// setFixedTime só congela a data; os timers correm de verdade, e a espera que junta gravações é de 2 s.
	await expect.poll(() => dados.maria?.[CHAVE_TEMA]?.valor, { timeout: 6000 }).toBe('{"tema":"kindle"}');
});

test('primeiro login com servidor vazio sobe o progresso que já estava no aparelho', async ({ page }) => {
	const dados = await simularApi(page);
	await page.addInitScript((k) => localStorage.setItem(k, JSON.stringify({ tema: 'kindle-escuro' })), CHAVE_TEMA);
	await page.goto('/entrar');
	await page.getByLabel('Seu nome').fill('joana');
	await page.getByRole('button', { name: 'Entrar' }).click();
	await expect(page).toHaveURL(/\/painel$/);
	await expect.poll(() => dados.joana?.[CHAVE_TEMA]?.valor).toBe('{"tema":"kindle-escuro"}');
});

test('sair apaga o nome e o progresso deste aparelho', async ({ page }) => {
	await simularApi(page);
	await page.addInitScript(
		([ku, kt]) => {
			if (!sessionStorage.getItem('iniciado')) {
				sessionStorage.setItem('iniciado', '1');
				localStorage.setItem(ku, 'maria');
				localStorage.setItem(kt, JSON.stringify({ tema: 'kindle' }));
			}
		},
		[CHAVE_USUARIO, CHAVE_TEMA] as const
	);
	await ajustes(page);
	await secaoConta(page).getByRole('button', { name: 'Sair' }).click();
	await expect(secaoConta(page)).toContainText('Seu progresso está só neste aparelho');
	expect(await page.evaluate(([ku, kt]) => [localStorage.getItem(ku), localStorage.getItem(kt)], [CHAVE_USUARIO, CHAVE_TEMA])).toEqual([
		null,
		null
	]);
});

test('endereço sem API (GitHub Pages): avisa e não entra', async ({ page }) => {
	await page.route('**/api/**', (r) => r.fulfill({ status: 404, contentType: 'text/html', body: '<!doctype html>' }));
	await page.goto('/entrar');
	await page.getByLabel('Seu nome').fill('maria');
	await page.getByRole('button', { name: 'Entrar' }).click();
	await expect(page.getByRole('alert')).toContainText('Login indisponível neste endereço');
	await expect(page).toHaveURL(/\/entrar$/);
	expect(await page.evaluate((k) => localStorage.getItem(k), CHAVE_USUARIO)).toBeNull();
});

test('responder no feed sem login abre o popup; entrando, a resposta volta ao feed e sobe', async ({ page }) => {
	// O servidor já tem progresso desta conta: sem o popup, a resposta só do aparelho se perderia no login.
	const antes = JSON.stringify({ respostas: { 'q:antiga': { r: 'C', ok: true, em: '2026-09-29' } }, curtidas: [], salvos: {}, vistos: {} });
	const dados = await simularApi(page, { maria: { [CHAVE_INTERACOES]: { valor: antes, atualizadoEm: 5 } } });
	await page.goto('/?tipo=questao');
	const questao = page.locator('[data-post-id]').first();
	const id = await questao.getAttribute('data-post-id');
	await questao.getByRole('group', { name: 'Responder' }).getByRole('button').first().click();

	const popup = page.getByRole('dialog', { name: 'Entre para guardar sua resposta' });
	await expect(popup).toBeVisible();
	await popup.getByLabel('Seu nome').fill('maria');
	await popup.getByRole('button', { name: 'Entrar' }).click();

	await expect(page).toHaveURL(/\/\?tipo=questao$/);
	await expect(popup).toBeHidden();
	await expect
		.poll(() => Object.keys(JSON.parse(dados.maria?.[CHAVE_INTERACOES]?.valor ?? '{}').respostas ?? {}).sort(), {
			timeout: 15_000
		})
		.toEqual([id, 'q:antiga'].sort());
});

test('logado, responder no feed não abre o popup', async ({ page }) => {
	await simularApi(page);
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), CHAVE_USUARIO);
	await page.goto('/?tipo=questao');
	const questao = page.locator('[data-post-id]').first();
	await questao.getByRole('group', { name: 'Responder' }).getByRole('button').first().click();
	await expect(questao.getByText(/Você (acertou|errou)/)).toBeVisible();
	await expect(page.getByRole('dialog')).toBeHidden();
});

test('curtir e salvar sem login abrem o popup; entrando, voltam ao feed e sobem', async ({ page }) => {
	// O servidor já tem este post curtido: o pedido é "curtir", não "alternar", e não descurte.
	const antes = (curtidas: string[]) => JSON.stringify({ respostas: {}, curtidas, salvos: {}, vistos: {} });
	await page.goto('/?tipo=lei');
	const post = page.locator('[data-post-id]').first();
	const id = (await post.getAttribute('data-post-id'))!;
	const dados = await simularApi(page, { maria: { [CHAVE_INTERACOES]: { valor: antes([id]), atualizadoEm: 5 } } });

	await post.getByRole('button', { name: 'Curtir' }).click();
	const popup = page.getByRole('dialog', { name: 'Entre para guardar sua curtida' });
	await expect(popup).toBeVisible();
	await popup.getByLabel('Seu nome').fill('maria');
	await popup.getByRole('button', { name: 'Entrar' }).click();
	await expect(page).toHaveURL(/\/\?tipo=lei$/);
	await expect(page.locator(`[data-post-id="${id}"]`).getByRole('button', { name: 'Curtir' })).toHaveAttribute(
		'aria-pressed',
		'true',
		{ timeout: 15_000 }
	);

	// Logado, salvar não pergunta e sobe.
	await page.locator(`[data-post-id="${id}"]`).getByRole('button', { name: 'Salvar' }).click();
	await expect(page.getByRole('dialog')).toBeHidden();
	await expect
		.poll(() => Object.keys(JSON.parse(dados.maria[CHAVE_INTERACOES].valor).salvos), { timeout: 6000 })
		.toEqual([id]);
	expect(JSON.parse(dados.maria[CHAVE_INTERACOES].valor).curtidas).toEqual([id]);
});

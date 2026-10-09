import { expect, test, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import materias from '../../static/conteudo/materias.json' with { type: 'json' };

// Cenários 1, 2 e 3 da spec contra o conteúdo real. O conteúdo é grande e a ordem muda por dia:
// nada aqui depende da posição exata de um post; os posts são achados pelo tipo e pelo rótulo.

const HOJE = '2026-09-30';
const CHAVE_INTERACOES = 'painel-concurso:interacoes:v1';
const CHAVE_FOCO = 'painel-concurso:preferencias:v2';

interface EntradaIndice {
	id: string;
	t: string;
	m: string;
}
const indice = JSON.parse(readFileSync('static/conteudo/indice.json', 'utf8')) as { posts: EntradaIndice[] };

test.beforeEach(async ({ page, context }) => {
	await context.clearCookies();
	await page.clock.setFixedTime(new Date(`${HOJE}T12:00:00-03:00`));
});

const itens = (page: Page) => page.locator('[data-post-id]');
const stories = (page: Page) => page.getByRole('navigation', { name: 'Matérias' }).getByRole('link');

/** Rola até o fim da lista para puxar a próxima página; devolve false quando o feed acabou. */
async function carregarMais(page: Page): Promise<boolean> {
	const antes = await itens(page).count();
	if (await page.getByRole('heading', { name: /^Você viu tudo/ }).isVisible()) return false;
	await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
	await expect
		.poll(
			async () =>
				(await itens(page).count()) > antes ||
				(await page.getByRole('heading', { name: /^Você viu tudo/ }).isVisible()),
			{ timeout: 10_000 }
		)
		.toBe(true);
	return true;
}

/** Primeiro post que casa com `alvo`, puxando mais páginas até achar (no máximo `paginas`). */
async function acharPost(page: Page, alvo: Locator, paginas = 15): Promise<Locator> {
	await expect(itens(page).first()).toBeVisible();
	for (let i = 0; i < paginas && (await alvo.count()) === 0; i++) {
		if (!(await carregarMais(page))) break;
	}
	await expect(alvo.first()).toBeAttached();
	// Fixa o post pelo id: o filtro de `alvo` pode deixar de casar depois de uma interação.
	const id = await alvo.first().getAttribute('data-post-id');
	const post = page.locator(`[data-post-id="${id}"]`);
	await post.scrollIntoViewIfNeeded();
	return post;
}

test('1. "/" abre o feed com stories e posts em até 3 s, sem tela de escolha (SC-001)', async ({ page }) => {
	const inicio = Date.now();
	await page.goto('/');
	await expect(stories(page).first()).toBeVisible({ timeout: 3_000 });
	await expect.poll(() => itens(page).count(), { timeout: 3_000 }).toBeGreaterThanOrEqual(3);
	expect(Date.now() - inicio).toBeLessThanOrEqual(3_000);

	await expect(page).toHaveURL('/');
	await expect(page).toHaveTitle('Feed · Painel de Concurso');
	await expect(page.getByRole('heading', { level: 1, name: 'Feed de estudo' })).toBeAttached();
	await expect(page.getByText('Qual o concurso dos seus sonhos?')).toHaveCount(0);
	// Barra de abas sempre visível (Cenário 5.5).
	const abas = page.getByRole('navigation', { name: 'Seções' });
	await expect(abas.getByRole('link')).toHaveText(['Feed', 'Salvos', 'Painel']);
	await expect(abas.getByRole('link', { name: 'Feed' })).toHaveAttribute('aria-current', 'page');
});

test('2. responder Certo e Errado: retorno, gabarito e persistência (só há itens C/E desde o Edital CGU 1/2026)', async ({ page }) => {
	await page.goto('/?tipo=questao');
	const questoes = itens(page).filter({ has: page.getByRole('article', { name: /Questão/ }) });
	await expect(page.getByRole('button', { name: /^Alternativa A/ })).toHaveCount(0);

	// Certo
	const ce = await acharPost(page, questoes.filter({ has: page.getByRole('button', { name: 'Certo', exact: true }) }));
	const idCe = await ce.getAttribute('data-post-id');
	await ce.getByRole('button', { name: 'Certo', exact: true }).click();
	await expect(ce.getByText(/Você acertou|Você errou — gabarito: (Certo|Errado)$/)).toBeVisible();
	await expect(ce.getByRole('button', { name: /Certo|Errado/ }).first()).toBeDisabled();
	await expect(ce.getByRole('article')).toHaveAccessibleName(/Questão · (CGU|TCU) \d{4} · .+ · Q\. \d+/);

	// Errado, em outro item: a escolhida e a correta ficam destacadas.
	const livre = await acharPost(
		page,
		questoes.filter({ has: page.getByRole('button', { name: 'Errado', exact: true, disabled: false }) })
	);
	const idMe = await livre.getAttribute('data-post-id');
	const me = page.locator(`[data-post-id="${idMe}"]`);
	const errado = me.getByRole('button', { name: /^Errado/ });
	await errado.click();
	await expect(me.getByText(/Você acertou|Você errou — gabarito: (Certo|Errado)$/)).toBeVisible();
	await expect(errado).toHaveClass(/correta|errada/);
	await expect(me.locator('button.correta')).toHaveCount(1);

	const salvo = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), CHAVE_INTERACOES);
	expect(Object.keys(salvo.respostas).sort()).toEqual([idCe, idMe].sort());
	expect(salvo.respostas[idCe!].r).toBe('C');
	expect(salvo.respostas[idMe!].r).toBe('E');

	// Reabrir: a mesma ordem do dia traz os posts de volta, já respondidos.
	await page.reload();
	for (const [id, padrao] of [
		[idCe, /Você acertou|Você errou — gabarito: (Certo|Errado)$/],
		[idMe, /Você acertou|Você errou — gabarito: (Certo|Errado)$/]
	] as const) {
		const post = await acharPost(page, page.locator(`[data-post-id="${id}"]`));
		await expect(post.getByText(padrao)).toBeVisible();
		await expect(post.getByRole('group', { name: 'Responder' }).getByRole('button').first()).toBeDisabled();
	}
});

test('3. story filtra por matéria, "Tudo" desfaz; foco logo depois de "Tudo"', async ({ page }) => {
	await page.goto('/');
	await expect(stories(page).first()).toHaveText(/Tudo/);
	await expect(stories(page).first()).toHaveAttribute('aria-current', 'true');
	const dados = stories(page).nth(1);
	await expect(dados).toHaveAccessibleName(/^Dados — TI: Ciência de Dados/);

	await dados.click();
	await expect(page).toHaveURL('/?materia=ti-ciencia-de-dados');
	await expect(page).toHaveTitle('Dados · Feed · Painel de Concurso');
	await expect(dados).toHaveAttribute('aria-current', 'true');
	await expect.poll(() => itens(page).count()).toBeGreaterThanOrEqual(3);
	const nomes = await itens(page).locator('article h2').allTextContents();
	expect(new Set(nomes)).toEqual(new Set(['TI: Ciência de Dados']));

	await stories(page).first().click();
	await expect(page).toHaveURL('/');
	await expect.poll(async () => new Set(await itens(page).locator('article h2').allTextContents()).size).toBeGreaterThan(1);
});

test('3b. foco escolhido vem logo depois de "Tudo"; matéria toda vista fica com anel cinza', async ({ page }) => {
	const menor = [...materias].sort((a, b) => a.total - b.total)[0];
	const idsMenor = indice.posts.filter((p) => p.m === menor.id).map((p) => p.id);
	await page.addInitScript(
		([chaveFoco, chaveInteracoes, vistos, dia]) => {
			localStorage.setItem(chaveFoco, JSON.stringify({ disciplina: 'direito-constitucional' }));
			localStorage.setItem(
				chaveInteracoes,
				JSON.stringify({ respostas: {}, curtidas: [], salvos: {}, vistos: { [dia]: vistos } })
			);
		},
		[CHAVE_FOCO, CHAVE_INTERACOES, idsMenor, HOJE] as const
	);
	await page.goto('/');
	await expect(stories(page).nth(1)).toHaveAccessibleName(/^Const\. — Direito Constitucional/);
	await expect(stories(page).filter({ hasText: menor.abrev })).toHaveAccessibleName(new RegExp(`${menor.nome}, tudo visto$`));
	await expect(stories(page).filter({ hasText: 'Dados' })).not.toHaveAccessibleName(/tudo visto/);
});

test('4. filtro pequeno rola até o fim sem repetir e mostra a mensagem de fim (FR-010)', async ({ page }) => {
	// A menor matéria com mais de uma página de posts: exercita a paginação e o fim.
	const alvo = [...materias].filter((m) => m.total > 10).sort((a, b) => a.total - b.total)[0];
	await page.goto(`/?materia=${alvo.id}`);
	await expect(itens(page).first()).toBeVisible();
	for (let i = 0; i < 20 && (await carregarMais(page)); i++);

	await expect(page.getByRole('heading', { name: 'Você viu tudo desta matéria' })).toBeVisible();
	const ids = await itens(page).evaluateAll((els) => els.map((el) => el.getAttribute('data-post-id')));
	expect(new Set(ids).size).toBe(ids.length);
	expect(ids).toHaveLength(alvo.total);
});

test('5. carrossel de resumo: seta ›, contador "2/…" e teclado →', async ({ page }) => {
	// Sem animação: a rolagem suave da seta ainda em curso recalcula a tela atual e engole a tecla
	// apertada logo em seguida (corrida do Carrossel, registrada no relatório do WP05).
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/?tipo=resumo');
	const post = await acharPost(page, itens(page).filter({ has: page.getByRole('button', { name: 'Próxima tela' }) }));
	const contador = post.getByText(/^\d+\/\d+$/);
	await expect(contador).toHaveText(/^1\/\d+$/);
	await post.getByRole('button', { name: 'Próxima tela' }).click();
	await expect(contador).toHaveText(/^2\/\d+$/);
	await expect(post.getByRole('button', { name: 'Tela anterior' })).toBeVisible();

	await post.getByRole('button', { name: 'Próxima tela' }).focus();
	await page.keyboard.press('ArrowRight');
	await expect(contador).toHaveText(/^3\/\d+$/);
	await page.keyboard.press('ArrowLeft');
	await expect(contador).toHaveText(/^2\/\d+$/);
});

test('5b. lei seca: nome da norma, artigo e carrossel com posição', async ({ page }) => {
	await page.goto('/?tipo=lei');
	const lei = await acharPost(page, itens(page).filter({ has: page.getByRole('button', { name: 'Próxima tela' }) }));
	await expect(lei.getByRole('article')).toHaveAccessibleName(/Lei seca · /);
	await expect(lei.getByText(/^1\/\d+$/)).toBeVisible();
	await lei.getByRole('button', { name: 'Próxima tela' }).click();
	await expect(lei.getByText(/^2\/\d+$/)).toBeVisible();
});

test('6. flashcard vira e desvira', async ({ page }) => {
	await page.goto('/?tipo=flashcard');
	const post = await acharPost(page, itens(page).filter({ hasText: 'Toque para ver a resposta' }));
	// Os dois lados ficam no DOM (o oculto com aria-hidden): o texto acha o botão nos dois estados.
	const cartao = post.getByRole('button').filter({ hasText: 'Toque para ver a resposta' });
	await expect(cartao).toHaveAttribute('aria-pressed', 'false');
	await cartao.click();
	await expect(cartao).toHaveAttribute('aria-pressed', 'true');
	await expect(cartao).toHaveAccessibleName(/Resposta/);
	await cartao.click();
	await expect(cartao).toHaveAttribute('aria-pressed', 'false');
});

test('8. resumo e flashcard mostram o selo "gerado — a revisar" e a fonte (SC-006)', async ({ page }) => {
	for (const tipo of ['resumo', 'flashcard']) {
		await page.goto(`/?tipo=${tipo}`);
		await expect.poll(() => itens(page).count()).toBeGreaterThanOrEqual(1);
		const n = await itens(page).count();
		for (let i = 0; i < n; i++) {
			const post = itens(page).nth(i);
			await post.scrollIntoViewIfNeeded();
			await expect(post).toHaveAttribute('data-tipo', tipo);
			await expect(post.getByText(/^Fonte:/).last()).toBeVisible();
		}
		// Toda a primeira leva é `conferido: false`; conferido tira o selo, então basta um.
		await expect(itens(page).getByText('gerado — a revisar').first()).toBeAttached();
	}
});

test('9. /escolher leva ao feed (FR-001)', async ({ page }) => {
	await page.goto('/escolher');
	await expect(page).toHaveURL('/');
	await expect(page.getByRole('heading', { level: 1, name: 'Feed de estudo' })).toBeAttached();
});

test('filtro de tipo vindo do painel mostra só aquele tipo e oferece voltar', async ({ page }) => {
	await page.goto('/?tipo=lei');
	await expect(page).toHaveTitle('Lei seca · Feed · Painel de Concurso');
	await expect.poll(() => itens(page).count()).toBeGreaterThanOrEqual(3);
	const tipos = await itens(page).evaluateAll((els) => els.map((el) => el.getAttribute('data-tipo')));
	expect(new Set(tipos)).toEqual(new Set(['lei']));
	await page.getByRole('link', { name: 'Mostrar todos os tipos' }).click();
	await expect(page).toHaveURL('/');
});

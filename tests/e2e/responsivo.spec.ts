import { expect, test, type Page } from '@playwright/test';
import materias from '../../static/conteudo/materias.json' with { type: 'json' };

// NFR-007: sem rolagem horizontal de 360 a 1440 px e alvos de toque de 44 px no celular.
// Missão identidade-visual (NFR-006): os 3 temas a 360 e 1440 px; nas larguras intermediárias, só
// o Aventura. Zoom de texto de 200% e a sombra dura do Aventura sem corte.
const LARGURAS = [360, 390, 768, 1024, 1440];
const CHAVE_INTERACOES = 'painel-concurso:interacoes:v1';
const CHAVE_TEMA = 'painel-concurso:tema:v1';
const TEMAS = ['aventura', 'kindle', 'kindle-escuro'] as const;
type Tema = (typeof TEMAS)[number];
const LARGURAS_TODOS_OS_TEMAS = [360, 1440];
const menor = [...materias].sort((a, b) => a.total - b.total)[0];

async function preparar(page: Page, tema: Tema = 'aventura') {
	await page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'));
	await page.addInitScript(([k, t]) => localStorage.setItem(k, JSON.stringify({ tema: t })), [CHAVE_TEMA, tema] as const);
}

async function esperarPosts(page: Page) {
	await expect(page.getByRole('navigation', { name: 'Matérias' })).toBeVisible();
	await expect(page.locator('[data-post-id]').first()).toBeVisible();
}

const TELAS: { nome: string; abrir: (page: Page) => Promise<void> }[] = [
	{
		nome: '/',
		abrir: async (page) => {
			await page.goto('/');
			await esperarPosts(page);
		}
	},
	{
		// Filtro pequeno: cabe numa página e mostra o fim do feed.
		nome: `/?materia=${menor.id}`,
		abrir: async (page) => {
			await page.goto(`/?materia=${menor.id}`);
			await esperarPosts(page);
			await expect(page.getByRole('heading', { name: 'Você viu tudo desta matéria' })).toBeVisible();
		}
	},
	{
		nome: '/salvos (com um salvo)',
		abrir: async (page) => {
			await page.goto('/?tipo=resumo');
			await esperarPosts(page);
			const id = await page.locator('[data-post-id]').first().getAttribute('data-post-id');
			await page.evaluate(
				([k, id]) =>
					localStorage.setItem(
						k,
						JSON.stringify({ respostas: {}, curtidas: [], salvos: { [id]: '2026-09-30T15:00:00.000Z' }, vistos: {} })
					),
				[CHAVE_INTERACOES, id!] as const
			);
			await page.goto('/salvos');
			await expect(page.locator('[data-post-id]')).toHaveCount(1);
		}
	},
	{
		nome: '/painel',
		abrir: async (page) => {
			await page.goto('/painel');
			await expect(page.getByRole('heading', { level: 1, name: 'Seu Painel de Estudos' })).toBeVisible();
			await expect(page.getByLabel('Disciplina')).toBeEnabled();
		}
	},
	{
		nome: '/ferramenta/questoes-discursivas',
		abrir: async (page) => {
			await page.goto('/ferramenta/questoes-discursivas');
			await expect(page.getByRole('heading', { level: 1, name: 'Questões Discursivas' })).toBeVisible();
		}
	}
];

async function sobraHorizontal(page: Page): Promise<number> {
	return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

/** Controles visíveis com menos de 44 px de altura (descrição curta de cada um). */
async function alvosPequenos(page: Page): Promise<string[]> {
	return page.$$eval('button, a, select, input', (els) =>
		els
			.filter((el) => {
				const r = el.getBoundingClientRect();
				const estilo = getComputedStyle(el);
				const visivel = r.width > 0 && r.height > 0 && estilo.visibility !== 'hidden';
				return visivel && r.height < 44;
			})
			.map((el) => {
				const r = el.getBoundingClientRect();
				const rotulo = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40);
				return `${el.tagName.toLowerCase()} "${rotulo}" ${Math.round(r.height)}px`;
			})
	);
}

for (const tema of TEMAS) {
	const larguras = tema === 'aventura' ? LARGURAS : LARGURAS_TODOS_OS_TEMAS;
	for (const largura of larguras) {
		test.describe(`[${tema}] largura ${largura}px`, () => {
			test.use({ viewport: { width: largura, height: 800 } });

			for (const tela of TELAS) {
				test(`${tela.nome} sem rolagem horizontal`, async ({ page }) => {
					await preparar(page, tema);
					await tela.abrir(page);
					await expect(page.locator('html')).toHaveAttribute('data-tema', tema);
					expect(await sobraHorizontal(page)).toBeLessThanOrEqual(0);
				});
			}
		});
	}
}

/**
 * Posts cujos filhos somam mais altura que o próprio post (texto sobreposto ou cortado).
 * O `[data-post-id]` embrulha o `<article>`; a conta é nos filhos do artigo, com o `gap` da grade.
 * Cada post é trazido à tela antes de medir: fora dela, `content-visibility: auto` dá ao artigo a
 * altura reservada (`contain-intrinsic-size`), e não a real.
 */
async function postsSobrepostos(page: Page): Promise<string[]> {
	return page.evaluate(async () => {
		const quadro = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
		const achados: string[] = [];
		for (const post of document.querySelectorAll('[data-post-id]')) {
			post.scrollIntoView({ block: 'start' });
			await quadro();
			const alvo = post.querySelector('article') ?? post;
			const estilo = getComputedStyle(alvo);
			const gap = parseFloat(estilo.rowGap) || 0;
			const filhos = [...alvo.children].filter((f) => getComputedStyle(f).position !== 'absolute');
			const soma = filhos.reduce((t, f) => t + f.getBoundingClientRect().height, 0) + gap * Math.max(0, filhos.length - 1);
			const r = alvo.getBoundingClientRect();
			const altura =
				r.height - parseFloat(estilo.paddingTop) - parseFloat(estilo.paddingBottom) - parseFloat(estilo.borderTopWidth) - parseFloat(estilo.borderBottomWidth);
			if (soma > altura + 1) achados.push(`${post.getAttribute('data-post-id')}: filhos ${Math.round(soma)}px > post ${Math.round(altura)}px`);
		}
		return achados;
	});
}

test.describe('texto aumentado em 200% (NFR-006)', () => {
	test.use({ viewport: { width: 720, height: 800 } });

	for (const tema of TEMAS) {
		for (const tela of TELAS) {
			test(`[${tema}] ${tela.nome}: sem rolagem horizontal e sem texto sobreposto`, async ({ page }) => {
				await preparar(page, tema);
				await tela.abrir(page);
				await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
				await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
				expect(await sobraHorizontal(page)).toBeLessThanOrEqual(0);
				expect(await postsSobrepostos(page)).toEqual([]);
			});
		}
	}
});

test.describe('sombra dura do Aventura em 360px', () => {
	test.use({ viewport: { width: 360, height: 800 } });

	test('[aventura] a sombra de 4 px do primeiro post cabe na tela', async ({ page }) => {
		await preparar(page, 'aventura');
		await TELAS[0].abrir(page);
		const { direita, largura } = await page.locator('[data-post-id]').first().evaluate((el) => ({
			direita: el.getBoundingClientRect().right,
			largura: window.innerWidth
		}));
		expect(direita + 4).toBeLessThanOrEqual(largura);
	});
});

test.describe('alvos de toque em 360px', () => {
	test.use({ viewport: { width: 360, height: 800 } });

	for (const tela of TELAS) {
		test(`${tela.nome}: todo controle visível tem ao menos 44px de altura`, async ({ page }) => {
			await preparar(page);
			await tela.abrir(page);
			expect(await alvosPequenos(page)).toEqual([]);
		});
	}
});

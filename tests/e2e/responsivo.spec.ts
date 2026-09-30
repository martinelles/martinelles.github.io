import { expect, test, type Page } from '@playwright/test';
import materias from '../../static/conteudo/materias.json' with { type: 'json' };

// NFR-007: sem rolagem horizontal de 360 a 1440 px e alvos de toque de 44 px no celular.
const LARGURAS = [360, 390, 768, 1024, 1440];
const CHAVE_INTERACOES = 'painel-concurso:interacoes:v1';
const menor = [...materias].sort((a, b) => a.total - b.total)[0];

async function preparar(page: Page) {
	await page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'));
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

for (const largura of LARGURAS) {
	test.describe(`largura ${largura}px`, () => {
		test.use({ viewport: { width: largura, height: 800 } });

		for (const tela of TELAS) {
			test(`${tela.nome} sem rolagem horizontal`, async ({ page }) => {
				await preparar(page);
				await tela.abrir(page);
				expect(await sobraHorizontal(page)).toBeLessThanOrEqual(0);
			});
		}
	});
}

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

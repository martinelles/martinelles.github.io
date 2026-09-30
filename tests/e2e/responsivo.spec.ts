import { expect, test, type Page } from '@playwright/test';

// NFR-004: sem rolagem horizontal de 360 a 1440 px e alvos de toque de 44 px no celular.
const CHAVE = 'painel-concurso:preferencias:v1';
const LARGURAS = [360, 390, 768, 1024, 1440];

async function comPreferencia(page: Page) {
	await page.addInitScript(
		([chave, valor]) => localStorage.setItem(chave, valor),
		[CHAVE, JSON.stringify({ concursoId: 'cgu-affc-ti', cargoId: null, disciplina: null })] as const
	);
	await page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'));
}

/** "/escolher" no pior caso: "Ver mais" aberto e as três seções recolhíveis expandidas. */
async function abrirEscolherInteira(page: Page) {
	await page.goto('/escolher');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Qual o concurso dos seus sonhos?');
	const verMais = page.getByRole('button', { name: /^Ver mais/ });
	if (await verMais.count()) await verMais.click();
	for (const titulo of ['Autorizados ou Previstos', 'Por Área', 'Encerrados']) {
		const cabecalho = page.getByRole('button', { name: new RegExp(`^${titulo} \\(`) });
		if ((await cabecalho.getAttribute('aria-expanded')) === 'false') await cabecalho.click();
		await expect(cabecalho).toHaveAttribute('aria-expanded', 'true');
	}
}

const TELAS: { nome: string; abrir: (page: Page) => Promise<void> }[] = [
	{ nome: '/escolher (tudo aberto)', abrir: abrirEscolherInteira },
	{
		nome: '/painel',
		abrir: async (page) => {
			await page.goto('/painel');
			await expect(page.getByRole('heading', { level: 1, name: 'Seu Painel de Estudos' })).toBeVisible();
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
				await comPreferencia(page);
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
			await comPreferencia(page);
			await tela.abrir(page);
			expect(await alvosPequenos(page)).toEqual([]);
		});
	}
});

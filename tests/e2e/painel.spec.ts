import { expect, test, type Page } from '@playwright/test';
import concursos from '../../src/lib/dados/concursos.json' with { type: 'json' };
import ferramentas from '../../src/lib/dados/ferramentas.json' with { type: 'json' };

const CHAVE = 'painel-concurso:preferencias:v1';
const HOJE = '2026-09-30';

interface ConcursoJson {
	id: string;
	nome: string;
	vagas?: number;
	dataProva?: string;
	edital?: string;
	cargos: { id: string; nome: string; disciplinas: string[] }[];
}
const lista = concursos as ConcursoJson[];
const cgu = lista.find((c) => c.id === 'cgu-affc-ti')!;
// Fixtures tiradas do JSON real: se os dados mudarem, o teste acompanha.
const cargoUnicoComData = lista.find((c) => c.cargos.length === 1 && !!c.dataProva && c.dataProva >= HOJE)!;
const semData = lista.find((c) => !c.dataProva)!;
const provaPassada = lista.find((c) => !!c.dataProva && c.dataProva < HOJE)!;

function diasAte(iso: string): number {
	const utc = (s: string) => {
		const [a, m, d] = s.split('-').map(Number);
		return Date.UTC(a, m - 1, d);
	};
	return Math.round((utc(iso) - utc(HOJE)) / 86_400_000);
}

async function prepararTempo(page: Page) {
	await page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'));
}

/** Grava a preferência uma vez por aba, para que recarregar preserve o que a própria tela gravou. */
async function comPreferencia(
	page: Page,
	pref: { concursoId: string; cargoId: string | null; disciplina: string | null }
) {
	await page.addInitScript(
		([chave, valor]) => {
			if (!sessionStorage.getItem('e2e-semeado')) {
				localStorage.setItem(chave, valor);
				sessionStorage.setItem('e2e-semeado', '1');
			}
		},
		[CHAVE, JSON.stringify(pref)] as const
	);
}

test.describe('painel com o CGU escolhido', () => {
	test.beforeEach(async ({ page }) => {
		await prepararTempo(page);
		await comPreferencia(page, { concursoId: 'cgu-affc-ti', cargoId: null, disciplina: null });
	});

	test('mostra cabeçalho, vagas, prazo e edital', async ({ page }) => {
		await page.goto('/painel');
		await expect(page.getByRole('heading', { level: 1, name: 'Seu Painel de Estudos' })).toBeVisible();
		await expect(page.getByText(cgu.nome, { exact: true })).toBeVisible();
		await expect(page.getByText(/banca Cebraspe/)).toBeVisible();
		await expect(page.getByText(`${cgu.vagas} vagas`)).toBeVisible();
		await expect(page.getByText(`Faltam ${diasAte(cgu.dataProva!)} dias`)).toBeVisible();
		await expect(page).toHaveTitle(`${cgu.nome} · Painel de Concurso`);
		const edital = page.getByRole('link', { name: 'Ver edital' });
		if (cgu.edital) {
			await expect(edital).toHaveAttribute('href', cgu.edital);
			await expect(edital).toHaveAttribute('target', '_blank');
		} else {
			await expect(edital).toHaveCount(0);
		}
	});

	test('cargo e disciplina persistem ao recarregar (FR-009)', async ({ page }) => {
		await page.goto('/painel');
		const disciplina = page.getByLabel('Disciplina');
		await expect(disciplina).toBeDisabled();
		await page.getByLabel('Cargo').selectOption({ label: 'Auditor — Tecnologia da Informação' });
		await expect(disciplina).toBeEnabled();
		await expect(disciplina.locator('option', { hasText: 'Ciência de Dados' })).toHaveCount(1);
		await disciplina.selectOption({ label: 'Ciência de Dados' });

		await page.reload();
		await expect(page.getByLabel('Cargo')).toHaveValue('auditor-ti');
		await expect(page.getByLabel('Disciplina')).toHaveValue('Ciência de Dados');
	});

	test('trocar de cargo volta a disciplina ao placeholder', async ({ page }) => {
		await page.goto('/painel');
		await page.getByLabel('Cargo').selectOption('auditor-ti');
		await page.getByLabel('Disciplina').selectOption('Ciência de Dados');
		await page.getByLabel('Cargo').selectOption('auditor-geral');
		const disciplina = page.getByLabel('Disciplina');
		await expect(disciplina).toHaveValue('');
		await expect(disciplina.locator('option:checked')).toHaveText('Selecione uma disciplina');
		const salvo = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), CHAVE);
		expect(salvo).toEqual({ concursoId: 'cgu-affc-ti', cargoId: 'auditor-geral', disciplina: null });
	});

	test('grade tem os dois blocos e as 12 ferramentas', async ({ page }) => {
		await page.goto('/painel');
		await expect(page.getByRole('heading', { level: 2, name: 'Material Teórico' })).toBeVisible();
		await expect(page.getByRole('heading', { level: 2, name: 'Prática & Revisão' })).toBeVisible();
		expect(ferramentas.length).toBe(12);
		await expect(page.locator('a[href^="/ferramenta/"]')).toHaveCount(12);
	});

	test('SC-002: cada ferramenta abre "em breve" e volta ao painel', async ({ page }) => {
		await page.goto('/painel');
		for (const f of ferramentas) {
			await page.locator(`a[href="/ferramenta/${f.id}"]`).click();
			await expect(page).toHaveURL(`/ferramenta/${f.id}`);
			await expect(page.getByRole('heading', { level: 1, name: f.titulo })).toBeVisible();
			await expect(page.getByText('Em breve por aqui.')).toBeVisible();
			await page.getByRole('link', { name: 'Voltar ao painel' }).click();
			await expect(page).toHaveURL('/painel');
			await expect(page.getByRole('heading', { level: 1, name: 'Seu Painel de Estudos' })).toBeVisible();
		}
	});

	test('trocar concurso vai para /escolher sem apagar a preferência', async ({ page }) => {
		await page.goto('/painel');
		await page.getByRole('button', { name: 'Trocar concurso' }).click();
		await expect(page).toHaveURL('/escolher');
		const salvo = await page.evaluate((k) => localStorage.getItem(k), CHAVE);
		expect(salvo).toContain('cgu-affc-ti');
	});

	test('em 360 px nenhum cartão da grade estoura a coluna', async ({ page }) => {
		await page.setViewportSize({ width: 360, height: 780 });
		await page.goto('/painel');
		await expect(page.locator('a[href^="/ferramenta/"]')).toHaveCount(12);
		const estouros = await page.$$eval('a[href^="/ferramenta/"]', (els) =>
			els.filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.getAttribute('href'))
		);
		expect(estouros).toEqual([]);
		const rolagem = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
		expect(rolagem).toBe(false);
	});
});

test.describe('bordas do painel', () => {
	test.beforeEach(async ({ page }) => {
		await prepararTempo(page);
	});

	test(`cargo único (${cargoUnicoComData.id}) vem preenchido e desabilitado`, async ({ page }) => {
		await comPreferencia(page, { concursoId: cargoUnicoComData.id, cargoId: null, disciplina: null });
		await page.goto('/painel');
		const cargo = page.getByLabel('Cargo');
		await expect(cargo).toBeDisabled();
		await expect(cargo).toHaveValue(cargoUnicoComData.cargos[0].id);
		await expect(page.getByLabel('Disciplina')).toBeEnabled();
	});

	test(`sem dataProva (${semData.id}) mostra "Data a definir"`, async ({ page }) => {
		await comPreferencia(page, { concursoId: semData.id, cargoId: null, disciplina: null });
		await page.goto('/painel');
		await expect(page.getByText('Data a definir')).toBeVisible();
	});

	test(`prova passada (${provaPassada.id}) mostra "Prova realizada"`, async ({ page }) => {
		await comPreferencia(page, { concursoId: provaPassada.id, cargoId: null, disciplina: null });
		await page.goto('/painel');
		await expect(page.getByText('Prova realizada')).toBeVisible();
	});

	test('/painel sem preferência redireciona para /escolher', async ({ page }) => {
		await page.goto('/painel');
		await expect(page).toHaveURL('/escolher');
	});

	test('concurso que sumiu redireciona para /escolher', async ({ page }) => {
		await comPreferencia(page, { concursoId: 'concurso-removido', cargoId: null, disciplina: null });
		await page.goto('/painel');
		await expect(page).toHaveURL('/escolher');
	});

	test('/ferramenta/nao-existe mostra "não encontrada" com link', async ({ page }) => {
		await page.goto('/ferramenta/nao-existe');
		await expect(page.getByRole('heading', { level: 1, name: 'Ferramenta não encontrada' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Voltar ao painel' })).toHaveAttribute('href', '/painel');
	});

	test('ferramenta sem concurso escolhido leva a /escolher', async ({ page }) => {
		await page.goto('/ferramenta/simulados');
		await expect(page.getByRole('heading', { level: 1, name: 'Simulados' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Escolher concurso' })).toHaveAttribute('href', '/escolher');
	});
});

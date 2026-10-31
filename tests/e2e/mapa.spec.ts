import { expect, test, type Page } from '@playwright/test';
import missoesCd from '../../static/conteudo/missoes-cd.json' with { type: 'json' };

// Mapas mentais nos subitens da Missão (planos/2026-10-31-mapas-mentais-nas-missoes.md): o
// subitem com mapa ganha o atalho que abre a rota /mapa/<slug>, com o visor de arraste e zoom.
// Dia fixo em que a missão tem subitem mapeado (E2 1.2 → EAG-02).

const HOJE = '2026-10-16';
const dia = missoesCd.plan.find((d) => d.data === HOJE)!;
const mapaDoDia = Object.entries(missoesCd.mapas).find(([cid]) =>
	dia.blocos.some((b) => b.itens?.some((it) => it.cid === cid))
)!;
const slug = mapaDoDia[1];

const missao = (page: Page) => page.getByRole('region', { name: 'Missão de hoje' });

test.beforeEach(async ({ page }) => {
	await page.clock.setFixedTime(new Date(`${HOJE}T09:00:00-03:00`));
});

test('o subitem com mapa ganha o atalho que abre o visor', async ({ page }) => {
	await page.goto('/painel');
	const atalho = missao(page).getByRole('link', { name: 'Mapa mental ↗' }).first();
	await expect(atalho).toBeVisible();
	await expect(atalho).toHaveAttribute('href', `/mapa/${slug}`);

	await atalho.click();
	await expect(page.getByRole('heading', { name: `Mapa mental · ${slug.split('-').slice(-2).join(' ').toUpperCase()}` })).toBeVisible();
	await expect(page.locator('.janela svg')).toBeVisible();
});

test('o visor dá zoom, volta ao início e retorna ao painel', async ({ page }) => {
	await page.goto('/mapa/cd-e2-1.2');
	const mapa = page.locator('.mapa');
	const antes = await mapa.getAttribute('style');

	await page.getByRole('button', { name: 'Aproximar o mapa' }).click();
	await expect.poll(() => mapa.getAttribute('style')).not.toBe(antes);

	await page.getByRole('button', { name: 'Voltar o mapa ao início' }).click();
	await expect.poll(() => mapa.getAttribute('style')).toBe(antes);

	await page.getByRole('link', { name: 'Voltar ao painel' }).click();
	await expect(page).toHaveURL(/\/painel$/);
});

test('endereço sem mapa mostra a página de erro', async ({ page }) => {
	await page.goto('/mapa/nao-existe-9.9');
	await expect(page.getByRole('heading', { name: 'Mapa não encontrado' })).toBeVisible();
});

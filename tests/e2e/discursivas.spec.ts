import { expect, test, type Page } from '@playwright/test';
import missoesCdBruto from '../../static/conteudo/missoes-cd.json' with { type: 'json' };
import { formatarData } from '../../src/lib/datas';
import type { PlanoMissoes } from '../../src/lib/missoes/tipos';

// Lista de todas as discursivas (planos/2026-11-13-lista-de-discursivas.md): a marcação aqui é a
// mesma do bloco no dia dele, então dá para fazer em ordem diferente e marcar de qualquer tela.

const missoesCd = missoesCdBruto as unknown as PlanoMissoes;
const CHAVE = 'missoes-cgu-2026';
const USUARIO = 'painel-concurso:usuario:v1';
const HOJE = '2026-11-13';

const discursivas = missoesCd.plan.flatMap((d) =>
	d.blocos.flatMap((b, i) => (b.tipo === 'disc' ? [{ data: d.data, indice: i, titulo: b.titulo }] : []))
);
const caixaDe = (page: Page, alvo: { data: string; titulo: string }) =>
	page.getByRole('checkbox', { name: `Marcar ${alvo.titulo} de ${formatarData(alvo.data)} como concluída` });
const marcas = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), CHAVE);
const missao = (page: Page) => page.getByRole('region', { name: 'Missão de hoje' });

type Gravado = { valor: string; atualizadoEm: number };

async function simularApi(page: Page) {
	const dados: Record<string, Gravado> = {};
	await page.route('**/api/progresso/**', async (rota) => {
		const req = rota.request();
		const chave = decodeURIComponent(new URL(req.url()).pathname.split('/')[4] ?? '');
		if (req.method() === 'PUT') {
			const novo = req.postDataJSON() as Gravado;
			const gravado = !dados[chave] || novo.atualizadoEm > dados[chave].atualizadoEm;
			if (gravado) dados[chave] = novo;
			return rota.fulfill({ json: { gravado, atual: dados[chave] } });
		}
		return rota.fulfill({ json: dados });
	});
	return dados;
}

test('lista todas as discursivas do plano, na ordem dos dias', async ({ page }) => {
	await page.clock.setFixedTime(new Date(`${HOJE}T09:00:00-03:00`));
	await page.goto('/discursivas');
	await expect(page.getByRole('heading', { level: 1, name: 'Discursivas' })).toBeVisible();
	await expect(page.getByText(`0 de ${discursivas.length} concluídas`)).toBeVisible();
	await expect(page.locator('.item')).toHaveCount(discursivas.length);
	await expect(page.locator('.item').first()).toContainText(discursivas[0].titulo);
	await expect(page.locator('.item').last()).toContainText(discursivas.at(-1)!.titulo);
	// A de hoje aparece com o dia na lista.
	await expect(page.locator('.item.de-hoje')).toHaveCount(1);
});

test('marcar discursiva de outro dia vale para a missão do dia, e o contrário também', async ({ page }) => {
	const dados = await simularApi(page);
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), USUARIO);
	await page.clock.setFixedTime(new Date(`${HOJE}T09:00:00-03:00`));

	const alvo = discursivas.find((d) => d.data > HOJE)!;
	await page.goto('/discursivas');
	await caixaDe(page, alvo).click();
	await expect(caixaDe(page, alvo)).toBeChecked();
	await expect(page.getByText(`1 de ${discursivas.length} concluídas`)).toBeVisible();
	expect(await marcas(page)).toEqual({ [`cd~${alvo.data}~${alvo.indice}`]: true });
	await expect.poll(() => dados[CHAVE]?.valor, { timeout: 8000 }).toBe(JSON.stringify({ [`cd~${alvo.data}~${alvo.indice}`]: true }));

	// No dia dela, a missão de hoje mostra o bloco marcado; desmarcar lá desmarca a lista.
	await page.clock.setFixedTime(new Date(`${alvo.data}T09:00:00-03:00`));
	await page.goto('/painel');
	const bolha = missao(page).getByRole('checkbox', { name: `Marcar ${alvo.titulo} como cumprido` });
	await expect(bolha).toBeChecked();
	await bolha.click();
	await expect(bolha).not.toBeChecked();

	await page.goto('/discursivas');
	await expect(caixaDe(page, alvo)).not.toBeChecked();
});

import { expect, test, type Page } from '@playwright/test';
import missoesCdBruto from '../../static/conteudo/missoes-cd.json' with { type: 'json' };
import missoesAudBruto from '../../static/conteudo/missoes-aud.json' with { type: 'json' };
import mentoriaBruto from '../../src/lib/dados/mentoria.json' with { type: 'json' };
import type { PlanoMissoes } from '../../src/lib/missoes/tipos';
import type { Mentoria } from '../../src/lib/dados/tipos';

// O tipo inferido do JSON é a união dos formatos de item de todos os dias do plano; os tipos
// do app (ItemBloco, AulaMentoria) já cobrem item-aula (subitens), parte/partes e tecExtras.
const missoesCd = missoesCdBruto as unknown as PlanoMissoes;
const missoesAud = missoesAudBruto as unknown as PlanoMissoes;
const mentoria = mentoriaBruto as unknown as Mentoria;

// Missão única (planos/2026-10-14-missao-unica.md, fase 2): o painel mostra o dia do plano de 61 dias
// das Missões, com as mesmas marcações (chave missoes-cgu-2026) e o mesmo login. A API é simulada.

const CHAVE = 'missoes-cgu-2026';
const USUARIO = 'painel-concurso:usuario:v1';
const HOJE = '2026-10-14';
const diaCd = missoesCd.plan.find((d) => d.data === HOJE)!;
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

/** Marca todos os blocos dos dias como cumpridos: o estudo concluído mantém as revisões ativas. */
async function marcarDias(page: Page, cargo: 'cd' | 'aud', datas: string[]) {
	// Mescla (roda a cada navegação: não pode apagar o que o teste marcou).
	await page.addInitScript(
		([k, c, ds]) => {
			const m: Record<string, boolean> = JSON.parse(localStorage.getItem(k) ?? '{}');
			for (const d of ds) for (let i = 0; i < 8; i++) m[`${c}~${d}~${i}`] = true;
			localStorage.setItem(k, JSON.stringify(m));
		},
		[CHAVE, cargo, datas] as const
	);
}

/** Marcações só do dia de hoje: o 13/10 marcado de antemão não entra nas comparações exatas. */
const marcasDeHoje = async (page: Page) =>
	Object.fromEntries(Object.entries(await marcas(page)).filter(([k]) => k.startsWith(`cd~${HOJE}`)));

const missao = (page: Page) => page.getByRole('region', { name: 'Missão de hoje' });
const bolhas = (page: Page) => missao(page).getByRole('checkbox', { name: /como cumprido$/ });
const caixas = (page: Page) => missao(page).getByRole('checkbox', { name: /como estudado$/ });
const marcas = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), CHAVE);

test.beforeEach(async ({ page }) => {
	await page.clock.setFixedTime(new Date(`${HOJE}T09:00:00-03:00`));
});

test('o painel mostra os mesmos blocos e subitens do dia que a página das Missões', async ({ page }) => {
	await marcarDias(page, 'cd', ['2026-10-13']);
	await page.goto('/painel');
	await expect(missao(page)).toContainText(`0 de ${diaCd.blocos.length} blocos feitos`);
	await expect(bolhas(page)).toHaveCount(diaCd.blocos.length);
	for (const b of diaCd.blocos) {
		await expect(missao(page)).toContainText(b.titulo);
		for (const it of b.itens ?? []) await expect(missao(page)).toContainText(it.cod);
	}

	await page.goto('/conteudo/artefatos/missoes.html#cd');
	const hojePagina = page.locator('.day.is-today');
	await expect(hojePagina.locator('.bubble')).toHaveCount(diaCd.blocos.length);
	for (const b of diaCd.blocos) await expect(hojePagina).toContainText(b.titulo);
});

test('logada: marcar no painel aparece na página das Missões, e o contrário também', async ({ page }) => {
	await marcarDias(page, 'cd', ['2026-10-13']);
	const dados = await simularApi(page);
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), USUARIO);

	await page.goto('/painel');
	await bolhas(page).first().click();
	await expect(bolhas(page).first()).toBeChecked();
	expect(await marcasDeHoje(page)).toEqual({ [`cd~${HOJE}~0`]: true });
	await expect
		.poll(
			() => Object.entries(JSON.parse(dados[CHAVE]?.valor ?? '{}')).filter(([k]) => k.startsWith(`cd~${HOJE}`)),
			{ timeout: 8000 }
		)
		.toEqual([[`cd~${HOJE}~0`, true]]);

	await page.goto('/conteudo/artefatos/missoes.html#cd');
	await expect(page.locator(`.bubble[data-k="cd~${HOJE}~0"]`)).toBeChecked();
	await page.locator(`.bubble[data-k="cd~${HOJE}~1"]`).click();

	await page.goto('/painel');
	await expect(bolhas(page).nth(1)).toBeChecked();
	await expect(missao(page)).toContainText(`2 de ${diaCd.blocos.length} blocos feitos`);
});

test('sem login: a bolha abre o popup; "Agora não" não marca e, depois de entrar, o bloco tocado está marcado', async ({ page }) => {
	await marcarDias(page, 'cd', ['2026-10-13']);
	await simularApi(page);
	await page.goto('/painel');
	const popup = page.getByRole('dialog', { name: 'Entre para marcar' });
	await bolhas(page).nth(2).click();
	await expect(popup).toBeVisible();
	await popup.getByRole('button', { name: 'Agora não' }).click();
	await expect(popup).toBeHidden();
	await expect(bolhas(page).nth(2)).not.toBeChecked();
	expect(await marcasDeHoje(page)).toEqual({});

	// Marcar exige login: o popup volta no próximo toque.
	await bolhas(page).nth(2).click();
	await expect(popup).toBeVisible();
	await popup.getByLabel('Seu nome').fill('maria');
	await popup.getByRole('button', { name: 'Entrar' }).click();
	await expect(page).toHaveURL(/\/painel$/);
	await expect(bolhas(page).nth(2)).toBeChecked();
	expect(await marcasDeHoje(page)).toEqual({ [`cd~${HOJE}~2`]: true });
});

test('subitem marcado à parte: o último marca o bloco, e desmarcar o bloco limpa os subitens', async ({ page }) => {
	// planos/2026-10-15-topico-da-missao.md. O bloco 0 de 14/10 tem dois subitens.
	await marcarDias(page, 'cd', ['2026-10-13']);
	await simularApi(page);
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), USUARIO);
	const [a, b] = diaCd.blocos[0].itens!;
	await page.goto('/painel');
	await expect(caixas(page)).toHaveCount(diaCd.blocos.filter((x) => (x.itens?.length ?? 0) > 1).reduce((n, x) => n + x.itens!.length, 0));

	const caixaA = missao(page).getByRole('checkbox', { name: `Marcar ${a.cod} como estudado` }).first();
	const caixaB = missao(page).getByRole('checkbox', { name: `Marcar ${b.cod} como estudado` }).first();
	await caixaA.click();
	await expect(caixaA).toBeChecked();
	await expect(bolhas(page).first()).not.toBeChecked();
	expect(await marcasDeHoje(page)).toEqual({ [`cd~${HOJE}~0~${a.cid}`]: true });

	await caixaB.click();
	await expect(bolhas(page).first()).toBeChecked();
	await expect(missao(page)).toContainText(`1 de ${diaCd.blocos.length} blocos feitos`);

	await bolhas(page).first().click();
	await expect(caixaA).not.toBeChecked();
	await expect(caixaB).not.toBeChecked();
	expect(await marcasDeHoje(page)).toEqual({});
});

test('fora da janela: antes de 13/10 e depois de 12/12', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-10-01T09:00:00-03:00'));
	await page.goto('/painel');
	await expect(missao(page)).toContainText('As missões começam em 13/10/2026.');
	await page.clock.setFixedTime(new Date('2026-12-20T09:00:00-03:00'));
	await page.reload();
	await expect(missao(page)).toContainText('O plano terminou em 12/12/2026.');
});

test('aula feita fora da missão: a nova conclui o dia do plano em que ela estava; a revisão não mexe nele', async ({ page }) => {
	const dados = await simularApi(page);
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), USUARIO);
	await page.goto('/painel');

	// B1·1: estudo novo em 22/11 (bloco 2, sozinha) e revisão em 23/11.
	const aula = mentoria.aulas!.find((a) => a.disciplina === 'B1' && a.titulo.startsWith('1.'))!;
	await missao(page).getByRole('button', { name: 'Registrar aula feita fora da missão' }).click();
	await missao(page).getByRole('button', { name: 'Aula nova' }).click();
	await missao(page).getByRole('button', { name: 'B1', exact: true }).click();
	await missao(page).getByLabel('Escolha a aula').selectOption({ label: aula.titulo });
	await expect(missao(page).getByText('O plano traz esta aula em 22/11/2026')).toBeVisible();
	await missao(page).getByRole('button', { name: 'Adicionar' }).click();

	await expect(missao(page).getByText('Também estudado neste dia, fora da missão')).toBeVisible();
	await expect(missao(page).getByText('B1·1')).toBeVisible();
	const extras = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), 'missoes-extras-cgu-2026');
	expect(extras).toEqual({ [`cd~${HOJE}`]: [{ tipo: 'novo', cid: aula.id, cod: 'B1·1', texto: aula.titulo }] });

	// A aula registrada fora da missão abre as mesmas questões do item de missão dela (a P1 só
	// tem página de revisão: questões principais existem a partir da P2).
	const blocoExtras = missao(page).locator('.extras');
	await expect(blocoExtras.getByRole('link', { name: 'Revisão C/E ↗' })).toHaveAttribute('href', '/questoes/b1-1-rev');

	// Aula nova concluída em 22/11; a revisão de 23/11 segue por conta própria.
	const m = await marcas(page);
	expect(m['cd~2026-11-22~2']).toBe(true);
	expect(Object.keys(m).some((k) => k.startsWith('cd~2026-11-23'))).toBe(false);

	await missao(page).getByLabel('Ver a missão de outro dia').fill('2026-11-22');
	await expect(missao(page)).toContainText('1 de 5 blocos feitos');
	await expect(missao(page)).not.toContainText('Também estudado neste dia');

	// De volta a hoje: a mesma aula como revisão só entra na lista, sem novas marcações.
	await missao(page).getByRole('button', { name: 'Hoje' }).click();
	await missao(page).getByRole('button', { name: 'Registrar aula feita fora da missão' }).click();
	await missao(page).getByRole('button', { name: 'Revisão' }).click();
	await missao(page).getByRole('button', { name: 'B1', exact: true }).click();
	await missao(page).getByLabel('Escolha a aula').selectOption({ label: aula.titulo });
	await missao(page).getByRole('button', { name: 'Adicionar' }).click();
	expect(await marcas(page)).toEqual(m);
	await expect
		.poll(() => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}')['cd~2026-10-14'].length, 'missoes-extras-cgu-2026'))
		.toBe(2);

	// Remover tira da lista e sobe a chave nova para a conta.
	await missao(page).getByRole('button', { name: 'Remover' }).first().click();
	await expect(missao(page).getByText(aula.titulo)).toHaveCount(1);
	await expect.poll(() => dados['missoes-extras-cgu-2026']?.valor, { timeout: 8000 }).toContain('"tipo":"rev"');
});

test('aula nova fora da data: as revisões contam do dia em que ela foi feita', async ({ page }) => {
	await simularApi(page);
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), USUARIO);
	await page.goto('/painel');

	// B1·1: nova em 22/11, revisões previstas em 23/11 (D+1) e 29/11 (D+7), sem D+30 no plano.
	const aula = mentoria.aulas!.find((a) => a.disciplina === 'B1' && a.titulo.startsWith('1.'))!;
	await missao(page).getByRole('button', { name: 'Registrar aula feita fora da missão' }).click();
	await missao(page).getByRole('button', { name: 'Aula nova' }).click();
	await missao(page).getByRole('button', { name: 'B1', exact: true }).click();
	await missao(page).getByLabel('Escolha a aula').selectOption({ label: aula.titulo });
	await missao(page).getByRole('button', { name: 'Adicionar' }).click();
	await expect(missao(page).getByText('Também estudado neste dia, fora da missão')).toBeVisible();

	// A revisão só aparece na data nova; na antiga, nada.
	const seletor = missao(page).getByLabel('Ver a missão de outro dia');
	const itemB1 = () => missao(page).locator('li:not(.bloco)', { hasText: 'B1·1' }).first();
	await seletor.fill('2026-11-23');
	await expect(missao(page).getByText('movida para')).toHaveCount(0);
	await seletor.fill('2026-11-29');
	await expect(missao(page).getByText('movida para')).toHaveCount(0);

	// D+1 no dia seguinte ao real, com o atalho da aula da mentoria, marcável como qualquer
	// subitem, na chave do dia novo (a marcação do estudo previsto em 22/11 veio do registro).
	await seletor.fill('2026-10-15');
	await expect(itemB1()).toContainText('aula feita em 14/10/2026');
	await expect(itemB1().getByRole('link', { name: 'Aula da mentoria ↗' })).toHaveAttribute('href', aula.url);
	await itemB1().getByRole('checkbox', { name: 'Marcar B1·1 como estudado' }).click();
	expect(await marcas(page)).toEqual({
		'cd~2026-11-22~2': true,
		[`cd~2026-11-22~2~${aula.id}`]: true,
		[`cd~2026-10-15~0~${aula.id}`]: true
	});

	// O D+30, que o plano nem trazia (caía após 12/12), volta em 13/11 com a data real.
	await seletor.fill('2026-11-13');
	await expect(itemB1()).toContainText('D+30');
	await expect(itemB1()).toContainText('aula feita em 14/10/2026');
});

test('aula nova que passou o dia sem ser feita desliza para o dia seguinte', async ({ page }) => {
	await simularApi(page);
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), USUARIO);
	// Dias até 17/11 cumpridos; 18/11 ficou em aberto (C1·5 parte 2 e E1·2 parte 1).
	await page.addInitScript(
		([k, fim]) => {
			const m: Record<string, boolean> = {};
			for (const d = new Date('2026-10-13T12:00'); d <= new Date(`${fim}T12:00`); d.setDate(d.getDate() + 1)) {
				const dia = d.toISOString().slice(0, 10);
				for (let i = 0; i < 6; i++) m[`cd~${dia}~${i}`] = true;
			}
			localStorage.setItem(k, JSON.stringify(m));
		},
		[CHAVE, '2026-11-17'] as const
	);
	await page.clock.setFixedTime(new Date('2026-11-19T09:00:00-03:00'));
	await page.goto('/painel');

	const aulaC15 = mentoria.aulas!.find((a) => a.disciplina === 'C1' && a.titulo.startsWith('5.'))!;
	const itemC15 = () => missao(page).locator('li:not(.bloco)', { hasText: 'C1·5' }).first();
	const adiadas = () => missao(page).locator('li.bloco', { hasText: 'Aulas atrasadas' });

	// As aulas de 18/11 chegam hoje, no bloco Aulas atrasadas; a missão de hoje conta ele. A D+1
	// da C1·5, cuja aula não foi concluída, suspende: não aparece e não conta. O contador do
	// cabeçalho acompanha a marcação da chegada.
	await expect(missao(page)).toContainText('0 de 6 blocos feitos');
	await expect(page.locator('.prazo small')).toHaveText('8/68 aulas da mentoria · 3 aulas por dia até a prova');
	await expect(missao(page).getByText('revisão suspensa')).toHaveCount(0);
	await expect(adiadas()).toBeVisible();
	await expect(adiadas().locator('li', { hasText: 'C1·5' })).toContainText('parte 2 de 2');
	await expect(adiadas().locator('li', { hasText: 'E1·2' })).toContainText('parte 1 de 2');

	// Marcar a C1·5 na chave do dia em que chegou: ela continua no bloco, riscada com a data.
	await adiadas().getByRole('checkbox', { name: 'Marcar C1·5 como estudado' }).click();
	const m = await marcas(page);
	expect(m[`cd~2026-11-19~5~${aulaC15.id}`]).toBe(true);
	await expect(adiadas().locator('li', { hasText: 'C1·5' })).toContainText('aula feita em 19/11/2026');
	await expect(page.locator('.prazo small')).toHaveText('9/68 aulas da mentoria · 3 aulas por dia até a prova');
	// A E1·2 segue atrasada; a D+1 da C1·5 foi para 20/11 (não aparece mais aqui, só lá).
	await expect(adiadas().locator('li', { hasText: 'E1·2' })).toBeVisible();
	await expect(missao(page).getByText('movida para')).toHaveCount(0);
	const seletor2 = missao(page).getByLabel('Ver a missão de outro dia');
	await seletor2.fill('2026-11-20');
	await expect(itemC15()).toContainText('aula feita em 19/11/2026');

	const seletor = missao(page).getByLabel('Ver a missão de outro dia');
	await seletor.fill('2026-11-20');
	await expect(itemC15()).toContainText('aula feita em 19/11/2026');
	// No dia previsto, a nota do dia em que a aula acabou sendo feita, e o bloco conta como cumprido.
	await seletor.fill('2026-11-18');
	await expect(itemC15()).toContainText('aula feita em 19/11/2026');
	await expect(missao(page).locator('li.bloco', { hasText: 'C1·5' }).getByRole('checkbox')).toBeChecked();

	// De volta a hoje: riscada, a aula marcada na chegada segue com a caixa para poder desmarcar.
	await missao(page).getByRole('button', { name: 'Hoje' }).click();
	const caixaC15 = adiadas().getByRole('checkbox', { name: 'Marcar C1·5 como estudado' });
	await expect(caixaC15).toBeChecked();
	await caixaC15.click();
	const depois = await marcas(page);
	expect(depois[`cd~2026-11-19~5~${aulaC15.id}`]).toBeUndefined();
	// Sem a marcação, a aula volta a estar atrasada em aberto (nem riscada, nem ponteiro) e o
	// contador do cabeçalho devolve a conclusão.
	await expect(adiadas().locator('li', { hasText: 'C1·5' })).not.toContainText('aula feita em');
	await expect(page.locator('.prazo small')).toHaveText('8/68 aulas da mentoria · 3 aulas por dia até a prova');
});

test('conteúdo em aberto cuja aula não está no plano vira tarefa de recuperação', async ({ page }) => {
	await simularApi(page);
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), USUARIO);
	// Tudo cumprido até 17/11, menos o estudo de E2 1.1 (13-14/10): fica em aberto, e a aula que o
	// cobre (E2·1) nem está no plano — o gerador a tirou porque o tópico "já tinha passado".
	await page.addInitScript(
		([k, fim]) => {
			const m: Record<string, boolean> = {};
			for (const d = new Date('2026-10-13T12:00'); d <= new Date(`${fim}T12:00`); d.setDate(d.getDate() + 1)) {
				const dia = d.toISOString().slice(0, 10);
				for (let i = 0; i < 8; i++) m[`cd~${dia}~${i}`] = true;
			}
			// O estudo novo de E2 1.1 fica em aberto (13/10 blocos 1 e 3; 14/10 bloco 1).
			delete m['cd~2026-10-13~1'];
			delete m['cd~2026-10-13~3'];
			delete m['cd~2026-10-14~1'];
			localStorage.setItem(k, JSON.stringify(m));
		},
		[CHAVE, '2026-11-17'] as const
	);
	await page.clock.setFixedTime(new Date('2026-11-19T09:00:00-03:00'));
	await page.goto('/painel');

	const aulaE21 = mentoria.aulas!.find((a) => a.disciplina === 'CD:E2' && a.titulo.startsWith('1.'))!;
	const itemE21 = () => missao(page).locator('li:not(.bloco)', { hasText: 'E2·1' }).first();
	const adiadas = () => missao(page).locator('li.bloco', { hasText: 'Aulas atrasadas' });

	// A aula do catálogo chega como recuperação, cobrindo o tópico em aberto, com o link dela.
	await expect(adiadas()).toBeVisible();
	await expect(itemE21()).toContainText('1. Modelagem e arquiteturas');
	await expect(itemE21()).toContainText('conteúdo que passou em aberto');
	await expect(itemE21()).toContainText('subitens E2 1.1');
	await expect(itemE21().getByRole('link', { name: 'Aula da mentoria ↗' })).toHaveAttribute('href', aulaE21.url);

	// A D+30 de E2 1.1 (13/11) está suspensa com o estudo em aberto: não aparece. Marcada a
	// recuperação hoje, a D+1 conta de hoje e vai para 20/11.
	const seletor = missao(page).getByLabel('Ver a missão de outro dia');
	await seletor.fill('2026-11-13');
	await expect(missao(page).getByText('E2 1.1')).toHaveCount(0);
	await missao(page).getByRole('button', { name: 'Hoje' }).click();
	await itemE21().getByRole('checkbox', { name: 'Marcar E2·1 como estudado' }).click();
	const m = await marcas(page);
	expect(m[`cd~2026-11-19~5~${aulaE21.id}`]).toBe(true);
	await seletor.fill('2026-11-20');
	await expect(missao(page).locator('li:not(.bloco)', { hasText: 'E2 1.1' })).toContainText('aula feita em 19/11/2026');
});

test('Auditoria troca o plano do dia', async ({ page }) => {
	await marcarDias(page, 'aud', ['2026-10-13']);
	await page.addInitScript(() =>
		localStorage.setItem('painel-concurso:preferencias:v2', JSON.stringify({ especialidade: 'auditoria' }))
	);
	await page.goto('/painel');
	const diaAud = missoesAud.plan.find((d) => d.data === HOJE)!;
	await expect(bolhas(page)).toHaveCount(diaAud.blocos.length);
	for (const b of diaAud.blocos) for (const it of b.itens ?? []) await expect(missao(page)).toContainText(it.cod);
	await expect(page.getByRole('link', { name: /Abrir nas Missões/ })).toHaveAttribute('href', '/artefato/missoes#aud');
});

test('o atalho do subitem abre o feed só com as questões do tópico', async ({ page }) => {
	await page.goto('/painel');
	const atalho = missao(page).getByRole('link', { name: /questões? deste tópico/ }).first();
	await expect(atalho).toBeVisible();
	const href = (await atalho.getAttribute('href'))!;
	expect(href).toMatch(/^\/\?topico=[A-Z]{3}-\d{2}&tipo=questao$/);
	await atalho.click();
	await expect(page).toHaveURL(href);
	await expect(page.locator('[data-post-id]').first()).toBeVisible();
});

test('o subitem aberto na aula da mentoria fica destacado na volta, até marcar ou dispensar', async ({ page, context }) => {
	await marcarDias(page, 'cd', ['2026-10-13']);
	await simularApi(page);
	await context.route('**/*plataformatutory.com.br/**', (rota) => rota.fulfill({ body: 'Mentoria' }));
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), USUARIO);
	await page.goto('/painel');
	const lembrete = missao(page).getByText('Você parou aqui');
	await expect(lembrete).toHaveCount(0);

	const [aula] = await Promise.all([context.waitForEvent('page'), missao(page).getByRole('link', { name: 'Aula da mentoria ↗' }).first().click()]);
	await aula.close();
	await page.reload();
	await expect(lembrete).toHaveCount(1);
	await expect(missao(page).locator('li.em-andamento')).toContainText(diaCd.blocos.flatMap((b) => (b.itens ?? []) as { cod: string }[])[0].cod);

	await missao(page).getByRole('button', { name: 'Terminei, marcar' }).click();
	await expect(lembrete).toHaveCount(0);
	expect(Object.keys(await marcas(page)).length).toBeGreaterThan(0);
	expect(await page.evaluate(() => localStorage.getItem('painel-concurso:missoes:em-andamento:v1'))).toBeNull();

	const [aula2] = await Promise.all([context.waitForEvent('page'), missao(page).getByRole('link', { name: 'Aula da mentoria ↗' }).last().click()]);
	await aula2.close();
	await expect(lembrete).toHaveCount(1);
	await missao(page).getByRole('button', { name: 'Dispensar' }).click();
	await expect(lembrete).toHaveCount(0);
});

test('"Seu plano" conta dias, blocos e horas das marcações', async ({ page }) => {
	await page.addInitScript(
		([k, dias]) => {
			const m: Record<string, boolean> = JSON.parse(localStorage.getItem(k) ?? '{}');
			for (const dia of dias) for (let i = 0; i < 8; i++) m[`cd~${dia}~${i}`] = true;
			localStorage.setItem(k, JSON.stringify(m));
		},
		[CHAVE, ['2026-10-13', HOJE]] as const
	);
	await page.goto('/painel');
	const resumo = page.getByRole('region', { name: 'Seu plano' });
	const blocos = missoesCd.plan.reduce((n, d) => n + d.blocos.length, 0);
	await expect(resumo).not.toContainText('dias cumpridos');
	await expect(resumo).toContainText(`blocos feitos${missoesCd.plan[0].blocos.length + diaCd.blocos.length} de ${blocos}`);
	await expect(resumo).not.toContainText('horas feitas');
	await expect(missao(page)).toContainText('Missão cumprida');
});

test('feed: a chamada fica acima dos stories, leva ao painel e não tira o 1º post da tela em 360 px', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 780 });
	await page.addInitScript(
		([k, ontem, dia]) => {
			const m: Record<string, boolean> = JSON.parse(localStorage.getItem(k) ?? '{}');
			for (let i = 0; i < 8; i++) m[`cd~${ontem}~${i}`] = true;
			m[`cd~${dia}~0`] = true;
			localStorage.setItem(k, JSON.stringify(m));
		},
		[CHAVE, '2026-10-13', HOJE] as const
	);
	await page.goto('/');
	const chamada = page.getByRole('region', { name: 'Missão de hoje' });
	await expect(chamada).toContainText(`1 de ${diaCd.blocos.length} blocos feitos`);
	const stories = page.getByRole('navigation', { name: 'Matérias' });
	await expect(stories).toBeVisible();
	const [c, st] = await Promise.all([chamada.boundingBox(), stories.boundingBox()]);
	expect(c!.y).toBeLessThan(st!.y);
	const primeiro = page.locator('[data-post-id]').first();
	await expect(primeiro).toBeVisible();
	expect((await primeiro.boundingBox())!.y).toBeLessThan(780);
	await chamada.getByRole('link', { name: 'Abrir' }).click();
	await expect(page).toHaveURL(/\/painel$/);
});

test('feed: missão cumprida vira um aviso discreto; fora da janela, sem chamada', async ({ page }) => {
	await page.addInitScript(
		([k, ontem, dia, n]) => {
			const m: Record<string, boolean> = {};
			for (let i = 0; i < n + 4; i++) m[`cd~${ontem}~${i}`] = true;
			for (let i = 0; i < n; i++) m[`cd~${dia}~${i}`] = true;
			localStorage.setItem(k, JSON.stringify(m));
		},
		[CHAVE, '2026-10-13', HOJE, diaCd.blocos.length] as const
	);
	await page.goto('/');
	await expect(page.getByRole('region', { name: 'Missão de hoje' }).getByRole('link', { name: 'Missão cumprida' })).toBeVisible();
	await page.clock.setFixedTime(new Date('2026-12-20T09:00:00-03:00'));
	await page.reload();
	await expect(page.getByRole('navigation', { name: 'Matérias' })).toBeVisible();
	await expect(page.getByRole('region', { name: 'Missão de hoje' })).toHaveCount(0);
});

test('página das Missões: o quadrado clicado na régua e o card do dia ficam destacados', async ({ page }) => {
	await page.goto('/conteudo/artefatos/missoes.html#cd');
	const regua = page.locator('#ruler button');
	await regua.nth(20).click();
	await expect(regua.nth(20)).toHaveClass(/\bsel\b/);
	await expect(regua.nth(20)).toHaveAttribute('aria-current', 'true');
	await expect(page.locator(`#d-${missoesCd.plan[20].data}`)).toHaveClass(/\bis-sel\b/);
	await regua.nth(30).click();
	await expect(page.locator('#ruler button.sel')).toHaveCount(1);
	await expect(regua.nth(30)).toBeFocused();
	await expect(page.locator('.day.is-sel')).toHaveAttribute('id', `d-${missoesCd.plan[30].data}`);
});

test('página das Missões: a régua acompanha Hoje, Esta semana e Os 61 dias', async ({ page }) => {
	await page.goto('/conteudo/artefatos/missoes.html#cd');
	const regua = page.locator('#ruler button');
	const acesos = page.locator('#ruler button:not(.fora)');
	await regua.nth(20).click();
	await expect(acesos).toHaveCount(61);

	await page.locator('#v-hoje').click();
	await expect(acesos).toHaveCount(1);
	await expect(acesos.first()).toHaveClass(/\btoday\b/);
	await expect(page.locator('#ruler button.sel')).toHaveCount(0);

	// 14/10 está na semana 1 do plano, de 13/10 a 18/10.
	await page.locator('#v-semana').click();
	const semana = missoesCd.plan.filter((d) => d.data <= '2026-10-18').length;
	await expect(acesos).toHaveCount(semana);

	await page.locator('#v-tudo').click();
	await expect(acesos).toHaveCount(61);
});

test('página das Missões: subitem marcado à parte, com as mesmas chaves e regras do painel', async ({ page }) => {
	// planos/2026-10-15-topico-da-missao.md. O bloco 0 de 14/10 tem dois subitens.
	await marcarDias(page, 'cd', ['2026-10-13']);
	await simularApi(page);
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), USUARIO);
	const [a, b] = diaCd.blocos[0].itens!;
	await page.goto('/conteudo/artefatos/missoes.html#cd');
	await page.locator('#v-hoje').click();
	const hojePagina = page.locator('.day.is-today');
	const caixaA = hojePagina.locator(`input.sub[data-i="cd~${HOJE}~0~${a.cid}"]`);
	const caixaB = hojePagina.locator(`input.sub[data-i="cd~${HOJE}~0~${b.cid}"]`);
	const bolha = hojePagina.locator(`.bubble[data-k="cd~${HOJE}~0"]`);

	await caixaA.click();
	await expect(caixaA).toBeChecked();
	await expect(bolha).not.toBeChecked();
	expect(await marcasDeHoje(page)).toEqual({ [`cd~${HOJE}~0~${a.cid}`]: true });

	await caixaB.click();
	await expect(bolha).toBeChecked();

	// O painel lê a mesma chave.
	await page.goto('/painel');
	await expect(missao(page).getByRole('checkbox', { name: `Marcar ${a.cod} como estudado` }).first()).toBeChecked();
	await expect(bolhas(page).first()).toBeChecked();

	await page.goto('/conteudo/artefatos/missoes.html#cd');
	await page.locator(`.day.is-today .bubble[data-k="cd~${HOJE}~0"]`).click();
	await expect(page.locator(`.day.is-today input.sub[data-b="cd~${HOJE}~0"]:checked`)).toHaveCount(0);
	expect(await marcasDeHoje(page)).toEqual({});
});

test('página das Missões: o lembrete gravado pelo painel destaca o subitem, e marcar aqui vale no painel', async ({ page }) => {
	await marcarDias(page, 'cd', ['2026-10-13']);
	await simularApi(page);
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), USUARIO);
	const [a] = diaCd.blocos[0].itens!;
	// O "Você parou aqui" agora nasce no painel, ao abrir a aula da mentoria do subitem; a página
	// só consome a mesma chave (o gatilho era o clique no link do Qconcursos, que saiu).
	await page.addInitScript(
		([k, cargo, dia, cid]) => localStorage.setItem(k, JSON.stringify({ cargo, data: dia, bloco: 0, cid })),
		['painel-concurso:missoes:em-andamento:v1', 'cd', HOJE, a.cid] as const
	);
	await page.goto('/conteudo/artefatos/missoes.html#cd');
	await page.locator('#v-hoje').click();
	const itemA = page.locator(`.day.is-today li[data-c="${a.cid}"][data-j="0"]`);
	await expect(itemA).toHaveClass(/em-andamento/);
	await expect(itemA).toContainText('Você parou aqui');

	await itemA.getByRole('button', { name: 'Terminei, marcar' }).click();
	await expect(page.locator(`.day.is-today input.sub[data-i="cd~${HOJE}~0~${a.cid}"]`)).toBeChecked();
	await expect(page.locator('li.em-andamento')).toHaveCount(0);
	expect(await page.evaluate(() => localStorage.getItem('painel-concurso:missoes:em-andamento:v1'))).toBeNull();

	// Recarregar não traz o lembrete de volta: o subitem já está marcado.
	await page.reload();
	await page.locator('#v-hoje').click();
	await expect(page.locator('li.em-andamento')).toHaveCount(0);
});

test('subitem com aula da mentoria mostra o atalho da aula que o cobre', async ({ page }) => {
	// Dia com C1 1.1 e E2 1.2 na missão (o padrão do arquivo é 14/10, sem eles). O atalho abre
	// a aula específica do catálogo (planos/2026-11-08-catalogo-de-aulas-da-mentoria.md).
	await page.clock.setFixedTime(new Date('2026-10-16T09:00:00-03:00'));
	await page.goto('/painel');
	const item = (cod: string) => missao(page).locator('li:not(.bloco)', { hasText: cod }).first();
	const aulaDe = (chave: string) => mentoria.aulas!.find((a) => a.subitens.includes(chave))!;
	await expect(item('C1 1.1').getByRole('link', { name: 'Aula da mentoria ↗' })).toHaveAttribute(
		'href',
		aulaDe('C1-1.1').url
	);
	await expect(item('E2 1.2').getByRole('link', { name: 'Aula da mentoria ↗' })).toHaveAttribute(
		'href',
		aulaDe('CD:E2-1.2').url
	);
});

test('a partir de 09/11 o estudo novo é por aula da mentoria, com atalho de aula e do TEC', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-11-09T09:00:00-03:00'));
	await page.goto('/painel');
	const dia = missoesCd.plan.find((d) => d.data === '2026-11-09')!;
	const itemAula = dia.blocos.flatMap((b) => (b.itens ?? []) as { cid: string; subitens?: unknown[] }[]).find((i) => i.subitens)!;
	const aula = mentoria.aulas!.find((a) => a.id === itemAula.cid)!;
	const item = missao(page).locator('li:not(.bloco)').filter({ hasText: aula.titulo }).first();
	await expect(item).toBeVisible();
	await expect(item).toContainText(`subitens ${(itemAula as { subitens: { cod: string }[] }).subitens.map((s) => s.cod).join(' · ')}`);
	await expect(item.getByRole('link', { name: 'Aula da mentoria ↗' })).toHaveAttribute('href', aula.url);
	if (aula.tec) await expect(item.getByRole('link', { name: 'Questões no TEC ↗' })).toHaveAttribute('href', aula.tec);
});

test('aula maior que o dia mostra "parte k de n" e continua no dia seguinte', async ({ page }) => {
	const aulaLonga = missoesCd.plan
		.flatMap((d) => d.blocos.flatMap((b) => (b.itens ?? []) as { partes?: number }[]))
		.find((i) => (i.partes ?? 0) > 1) as unknown as { cid: string; cod: string; partes: number; parte: number };
	expect(aulaLonga).toBeTruthy();
	const primeiroDia = missoesCd.plan.find((d) =>
		d.blocos.some((b) => (b.itens ?? []).some((i) => i.cid === aulaLonga.cid && i.parte === 1))
	)!;
	await page.clock.setFixedTime(new Date(`${primeiroDia.data}T09:00:00-03:00`));
	await page.goto('/painel');
	const item = missao(page).locator('li:not(.bloco)', { hasText: aulaLonga.cod }).first();
	await expect(item).toContainText(`parte 1 de ${aulaLonga.partes}`);
	await expect(item).toContainText('continua');
});

test('aula com cadernos extras mostra os extras do TEC com a contagem', async ({ page }) => {
	const alvo = missoesCd.plan
		.map((d) => ({ d, it: d.blocos.flatMap((b) => b.itens ?? []).find((i) => i.subitens && mentoria.aulas!.find((a) => a.id === i.cid)?.tecExtras?.length) }))
		.find((x) => x.it)!;
	await page.clock.setFixedTime(new Date(`${alvo.d.data}T09:00:00-03:00`));
	await page.goto('/painel');
	const extras = mentoria.aulas!.find((a) => a.id === alvo.it!.cid)!.tecExtras!;
	const item = missao(page).locator('li:not(.bloco)').filter({ hasText: alvo.it!.texto.slice(0, 20) }).first();
	await expect(item.getByRole('link', { name: `${extras[0].rotulo} (${extras[0].questoes}) ↗` })).toHaveAttribute('href', extras[0].url);
});

test('abrir o caderno do TEC também vira o lembrete "Você parou aqui"', async ({ page, context }) => {
	await simularApi(page);
	await context.route('**/*tecconcursos.com.br/**', (rota) => rota.fulfill({ body: 'TEC' }));
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), USUARIO);
	const alvo = missoesCd.plan
		.map((d) => ({ d, it: d.blocos.flatMap((b) => b.itens ?? []).find((i) => i.subitens && mentoria.aulas!.find((a) => a.id === i.cid)?.tec) }))
		.find((x) => x.it)!;
	await page.clock.setFixedTime(new Date(`${alvo.d.data}T09:00:00-03:00`));
	await page.goto('/painel');
	const item = missao(page).locator('li:not(.bloco)').filter({ hasText: alvo.it!.texto.slice(0, 20) }).first();
	const [aba] = await Promise.all([context.waitForEvent('page'), item.getByRole('link', { name: 'Questões no TEC ↗' }).click()]);
	await aba.close();
	await page.reload();
	await expect(missao(page).locator('li.em-andamento')).toHaveCount(1);
	await expect(missao(page).locator('li.em-andamento')).toContainText('Você parou aqui');
});

test('a linha "A seguir" mostra as próximas aulas depois do dia em vista', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-11-09T09:00:00-03:00'));
	await page.goto('/painel');
	const aSeguir = missao(page).locator('p.a-seguir');
	await expect(aSeguir).toBeVisible();
	const proxima = missoesCd.plan
		.flatMap((d) => d.blocos.flatMap((b) => (b.itens ?? []) as { cod: string; subitens?: unknown[] }[]).map((i) => ({ d, i })))
		.find((x) => x.d.data > '2026-11-09' && x.i.subitens)!;
	await expect(aSeguir).toContainText(proxima.i.cod);
});

test('o seletor de dia mostra a missão de qualquer data e volta para hoje', async ({ page }) => {
	await page.goto('/painel');
	const secao = missao(page);
	const seletor = secao.getByLabel('Ver a missão de outro dia');
	await expect(secao).toContainText('14/10/2026');
	await expect(secao).not.toContainText('E2 1.2');

	await seletor.fill('2026-10-16');
	await expect(secao).toContainText('16/10/2026');
	await expect(secao).toContainText('E2 1.2');
	await expect(secao.getByRole('button', { name: 'Hoje' })).toBeVisible();

	await secao.getByRole('button', { name: 'Hoje' }).click();
	await expect(secao).toContainText('14/10/2026');
	await expect(secao).not.toContainText('E2 1.2');
});

test('a revisão movida só aparece na data nova, sem ponteiro na antiga', async ({ page }) => {
	await simularApi(page);
	await page.addInitScript((k) => localStorage.setItem(k, 'maria'), USUARIO);
	// E2·5 feita em 22/11: a D+1 (prevista para 24/11, hoje) vai para 23/11 — e some daqui.
	await page.addInitScript(
		([k, cid]) =>
			localStorage.setItem(
				k,
				JSON.stringify({ 'cd~2026-11-22': [{ tipo: 'novo', cid, cod: 'E2·5', texto: '5. Qualidade e rastreabilidade' }] })
			),
		['missoes-extras-cgu-2026', '5e202dbd-f4b9-4fef-8361-a549e3825c8c'] as const
	);
	await page.clock.setFixedTime(new Date('2026-11-24T09:00:00-03:00'));
	await page.goto('/painel');

	// Na data antiga (24/11), nada de E2·5 D+1: nem ponteiro, nem "movida para".
	await expect(missao(page).getByText('movida para')).toHaveCount(0);
	await expect(missao(page).locator('li').filter({ hasText: 'E2·5' }).filter({ hasText: 'D+1' })).toHaveCount(0);

	// Na data nova (23/11), a revisão está lá com a nota da data real, marcável pela bolha.
	await missao(page).getByLabel('Ver a missão de outro dia').fill('2026-11-23');
	const alvo = missao(page).locator('ul.itens li').filter({ hasText: 'E2·5' }).filter({ hasText: 'D+1' });
	await expect(alvo).toContainText('aula feita em 22/11/2026');
	await missao(page).locator('li.bloco.t-rev', { hasText: 'aula feita em 22/11/2026' }).locator('input[type=checkbox]').first().click();
	const m = await marcas(page);
	expect(m['cd~2026-11-23~0']).toBe(true);
});

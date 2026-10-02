import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import plano from '../../static/conteudo/plano.json' with { type: 'json' };

// Plano de estudos, Cenários 1–4 da spec, contra o plano.json real e com relógio fixo.
// Janela 01/10–20/12/2026 (81 dias, 3 h/dia, 243 h). Emenda D4: cada tópico gera Leitura (25 min)
// e, logo depois, Questões (20 min) ⇒ a missão limpa de 3 h tem 8 tarefas (4 tópicos inteiros).

const CHAVE_PLANO = 'painel-concurso:plano:v1';
const fila = plano.tarefas;
const [t1, t2] = fila;
const folha = (topico: string) => topico.split('›').pop()!.trim();
const MODO = { leitura: 'Leitura', questoes: 'Questões' } as const;
const BLOCO = { basicos: 'Básicos', especificos: 'Específicos', especializados: 'Especializados' } as const;
const FAZER = {
	leitura: 'Leitura, 25 min: estudar o tópico e anotar dúvidas',
	questoes: 'Questões, 20 min: 10 itens C/E do tópico'
} as const;
/** Rota da tarefa (o id tem `:`, que sai codificado). */
const rota = (t: { id: string }) => `/tarefa/${encodeURIComponent(t.id)}`;
const pctMissao = (n: number, de: number) => new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 0 }).format(n / de);

/** Instante em Brasília (o fuso do projeto do Playwright). */
const em = (dia: string, hora = '09:00') => new Date(`${dia}T${hora}:00-03:00`);

const missao = (page: Page) => page.getByRole('region', { name: 'Missão de hoje' });
const resumo = (page: Page) => page.getByRole('region', { name: 'Seu plano' });
const dia = (page: Page, rotulo: string) =>
	resumo(page).locator('dt', { hasText: rotulo }).locator('xpath=following-sibling::dd[1]');
const itens = (page: Page) => missao(page).getByRole('listitem');
const timer = (page: Page) => page.getByRole('timer', { name: 'Tempo estudado nesta tarefa' });

async function dias(page: Page) {
	const n = async (r: string) => Number(await dia(page, r).textContent());
	return { noPlano: await n('dias no plano'), concluidos: await n('concluídos'), emAberto: await n('em aberto'), restantes: await n('restantes') };
}

/** Os quatro números fecham (Definições): concluídos + em aberto + restantes = no plano. */
async function conferirIdentidade(page: Page) {
	const d = await dias(page);
	expect(d.noPlano).toBe(81);
	expect(d.concluidos + d.emAberto + d.restantes).toBe(d.noPlano);
	return d;
}

async function abrirPainel(page: Page) {
	await page.goto('/painel');
	await expect(missao(page).getByText(/estimadas\./).or(missao(page).getByText(/primeira missão|terminou|Plano cumprido/))).toBeVisible();
}

/** Conclui a tarefa aberta (sem ou com questões) e espera voltar ao painel. */
async function concluir(page: Page, q?: { feitas: number; certas: number }) {
	if (q) {
		await page.getByLabel('Questões feitas').fill(String(q.feitas));
		await page.getByLabel('Questões certas').fill(String(q.certas));
	}
	await page.getByRole('button', { name: 'Concluir tarefa' }).click();
	await expect(page).toHaveURL('/painel');
}

/**
 * Conclui a tarefa que fecha a missão de hoje (emenda D5): a tela fica aberta com "Missão cumprida"
 * e "Continuar estudando", em vez de voltar ao painel.
 */
async function concluirCumprindo(page: Page) {
	const url = page.url();
	await page.getByRole('button', { name: 'Concluir tarefa' }).click();
	await expect(page.getByRole('status').filter({ hasText: 'Missão cumprida' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Continuar estudando' })).toBeVisible();
	expect(page.url()).toBe(url);
}

test.beforeEach(async ({ context }) => {
	await context.clearCookies();
});

test('Cenário 1: sem estudo, os números saem zerados e a missão tem 8 tarefas com modo e bloco', async ({ page }) => {
	await page.clock.setFixedTime(em('2026-10-01'));
	await abrirPainel(page);

	await expect(resumo(page).getByText('0 h', { exact: true })).toBeVisible();
	await expect(resumo(page).getByText('de 243 h estudadas')).toBeVisible();
	await expect(resumo(page).getByText(`0% do plano concluído, 0 de ${fila.length} tarefas.`)).toBeVisible();
	const barra = resumo(page).getByRole('progressbar');
	await expect(barra).toHaveAttribute('aria-label', 'Plano concluído: 0%');
	await expect(barra).toHaveJSProperty('value', 0);
	expect(await conferirIdentidade(page)).toEqual({ noPlano: 81, concluidos: 0, emAberto: 0, restantes: 81 });

	// Cenário 2.1 e 2.2: quantidade, tempo, % feita; disciplina, bloco, tópico, modo, tempo e o que fazer.
	const hoje = fila.slice(0, 8);
	expect(hoje.map((t) => t.modo)).toEqual(['leitura', 'questoes', 'leitura', 'questoes', 'leitura', 'questoes', 'leitura', 'questoes']);
	await expect(missao(page).getByText('8 tarefas, 3 h estimadas.')).toBeVisible();
	await expect(missao(page).getByText('0 de 8 feitas (0%).')).toBeVisible();
	await expect(itens(page)).toHaveCount(8);
	for (const [i, t] of hoje.entries()) {
		const item = itens(page).nth(i);
		await expect(item).toContainText(`${t.disciplina} · ${BLOCO[t.bloco as keyof typeof BLOCO]}`);
		await expect(item).toContainText(folha(t.topico));
		await expect(item).toContainText(FAZER[t.modo as keyof typeof FAZER]);
		await expect(item.getByRole('link')).toHaveAttribute('href', rota(t));
	}
	await expect(missao(page).getByRole('button', { name: 'Iniciar estudos' })).toBeVisible();

	// A foto do dia foi gravada na primeira exibição.
	const gravado = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), CHAVE_PLANO);
	expect(gravado.fotos).toEqual({ '2026-10-01': hoje.map((t) => t.id) });
});

test('Cenário 3: Leitura 30 min, pausa ⇒ 0,5 h; conclui sem questões; Questões 10/7 ⇒ missão e plano sobem', async ({ page }) => {
	expect([t1.modo, t2.modo, t2.topicoId]).toEqual(['leitura', 'questoes', t1.topicoId]);
	await page.clock.setFixedTime(em('2026-10-01', '10:00'));
	await abrirPainel(page);

	// Um toque em "Iniciar estudos" abre a primeira pendente com o cronômetro correndo (SC-002).
	await missao(page).getByRole('button', { name: 'Iniciar estudos' }).click();
	await expect(page).toHaveURL(rota(t1));
	await expect(page.getByRole('heading', { level: 1, name: folha(t1.topico) })).toBeVisible();
	await expect(page.getByText(`${t1.disciplina}, tópico ${t1.topicoId}`)).toBeVisible();
	// Modo e bloco em texto (FR-014).
	await expect(page.getByText(`Leitura · 25 min · Bloco: ${BLOCO[t1.bloco as keyof typeof BLOCO]}`)).toBeVisible();
	await expect(timer(page)).toContainText('00:00');
	await expect(page.locator('#cronometro-estado')).toContainText('Correndo');

	// Leitura: o que fazer é estudar e anotar dúvidas; o atalho leva à lei seca e aos resumos da matéria.
	const fazer = page.getByRole('region', { name: 'O que fazer' });
	await expect(fazer).toContainText('Estude o tópico acima');
	await expect(fazer).toContainText('Anote as dúvidas');
	await expect(fazer).not.toContainText('itens C/E');
	await expect(page.getByRole('link', { name: 'Lei seca e resumos desta matéria' })).toHaveAttribute('href', `/?materia=${t1.materia}`);
	await expect(page.getByRole('link', { name: 'Questões desta matéria' })).toHaveCount(0);
	// Leitura não pede questões.
	await expect(page.getByLabel('Questões feitas')).toHaveCount(0);
	await expect(page.getByLabel('Questões certas')).toHaveCount(0);

	await page.clock.setFixedTime(em('2026-10-01', '10:30'));
	await expect(timer(page)).toContainText('30:00');
	await page.getByRole('button', { name: 'Pausar' }).click();
	await expect(page.locator('#cronometro-estado')).toContainText('Pausado');
	await expect(page.getByRole('status').filter({ hasText: 'Cronômetro pausado em 30 minutos' })).toBeAttached();

	// Pausado, o tempo não corre.
	await page.clock.setFixedTime(em('2026-10-01', '11:00'));
	await page.getByRole('link', { name: 'Voltar à missão' }).click();
	await expect(resumo(page).getByText('0,5 h', { exact: true })).toBeVisible();
	await expect(missao(page).getByRole('button', { name: 'Continuar estudos' })).toBeVisible();

	// Retoma e conclui a Leitura, sem questões.
	await itens(page).first().getByRole('link').click();
	await page.getByRole('button', { name: 'Retomar' }).click();
	await expect(page.locator('#cronometro-estado')).toContainText('Correndo');
	await page.clock.setFixedTime(em('2026-10-01', '11:15'));
	await concluir(page);

	await expect(missao(page).getByText(`1 de 8 feitas (${pctMissao(1, 8)}).`)).toBeVisible();
	await expect(itens(page).first()).toContainText('concluída');
	await expect(resumo(page).getByText('0,7 h', { exact: true })).toBeVisible(); // 30 + 15 min

	// A próxima pendente é a Questões do mesmo tópico.
	await missao(page).getByRole('button', { name: 'Iniciar estudos' }).click();
	await expect(page).toHaveURL(rota(t2));
	await expect(page.getByRole('heading', { level: 1, name: folha(t2.topico) })).toBeVisible();
	await expect(page.getByText(`Questões · 20 min · Bloco: ${BLOCO[t2.bloco as keyof typeof BLOCO]}`)).toBeVisible();
	const fazerQ = page.getByRole('region', { name: 'O que fazer' });
	await expect(fazerQ).toContainText('Resolva 10 itens C/E do próprio tópico.');
	await expect(fazerQ).toContainText('Lance abaixo quantos fez e quantos acertou.');
	await expect(page.getByRole('link', { name: 'Questões desta matéria' })).toHaveAttribute(
		'href',
		`/?materia=${t2.materia}&tipo=questao`
	);
	await expect(page.getByRole('link', { name: 'Lei seca e resumos desta matéria' })).toHaveCount(0);

	// Valida as questões e conclui com 10 feitas e 7 certas.
	await page.getByLabel('Questões feitas').fill('7');
	await page.getByLabel('Questões certas').fill('10');
	await page.getByRole('button', { name: 'Concluir tarefa' }).click();
	await expect(page.getByRole('alert')).toHaveText('Certas não pode passar de feitas.');
	await page.getByLabel('Questões feitas').fill('10');
	await page.getByLabel('Questões certas').fill('');
	await page.getByRole('button', { name: 'Concluir tarefa' }).click();
	await expect(page.getByRole('alert')).toHaveText('Preencha as duas quantidades ou deixe as duas em branco.');
	await page.clock.setFixedTime(em('2026-10-01', '11:30'));
	await concluir(page, { feitas: 10, certas: 7 });

	await expect(missao(page).getByText(`2 de 8 feitas (${pctMissao(2, 8)}).`)).toBeVisible();
	await expect(resumo(page).getByText('1 h', { exact: true })).toBeVisible(); // 30 + 15 + 15 min
	await expect(resumo(page).getByText(`0,4% do plano concluído, 2 de ${fila.length} tarefas.`)).toBeVisible();
	await expect(resumo(page).getByRole('progressbar')).toHaveJSProperty('value', 2 / fila.length);

	// O atalho da Questões leva ao feed filtrado em questões da matéria.
	await page.goto(rota(t2));
	await page.getByRole('link', { name: 'Questões desta matéria' }).click();
	await expect(page).toHaveURL(`/?materia=${t2.materia}&tipo=questao`);
	await expect(page.getByText('Só questões')).toBeVisible();

	// As tarefas concluídas mostram o resumo, sem cronômetro nem formulário.
	await page.goto(rota(t1));
	await expect(page.getByText('Concluída em 01/10/2026, 45 min cronometrados.')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Concluir tarefa' })).toHaveCount(0);
	await page.goto(rota(t2));
	await expect(page.getByText('Concluída em 01/10/2026, 15 min cronometrados, 7 de 10 questões certas.')).toBeVisible();
});

test('fechar e reabrir no meio do cronômetro não perde tempo (SC-004)', async ({ page, context }) => {
	await page.clock.setFixedTime(em('2026-10-01', '14:00'));
	await abrirPainel(page);
	await missao(page).getByRole('button', { name: 'Iniciar estudos' }).click();
	await expect(timer(page)).toContainText('00:00');
	await page.close();

	const outra = await context.newPage();
	await outra.clock.setFixedTime(em('2026-10-01', '14:20'));
	await outra.goto(rota(t1));
	await expect(timer(outra)).toContainText('20:00');
	await expect(outra.locator('#cronometro-estado')).toContainText('Correndo');
	await outra.getByRole('button', { name: 'Pausar' }).click();
	await outra.getByRole('link', { name: 'Voltar à missão' }).click();
	await expect(resumo(outra).getByText('0,3 h', { exact: true })).toBeVisible();
});

test('virada do dia: pendente de ontem abre a missão; dia passado incompleto fica em aberto', async ({ page }) => {
	await page.clock.setFixedTime(em('2026-10-01'));
	await abrirPainel(page);
	await page.goto(rota(t1));
	await concluir(page);
	await expect(missao(page).getByText(`1 de 8 feitas (${pctMissao(1, 8)}).`)).toBeVisible();

	// Hoje começa pela Questões que ficou de ontem: 20 + 3×(25 + 20) + 25 = 180 min ⇒ 8 tarefas, e a
	// missão termina numa Leitura cuja Questões abre a de amanhã (borda da emenda D4).
	await page.clock.setFixedTime(em('2026-10-02'));
	await abrirPainel(page);
	const hoje = fila.slice(1, 9);
	expect([hoje[0].modo, hoje[7].modo]).toEqual(['questoes', 'leitura']);
	await expect(itens(page)).toHaveCount(8);
	for (const [i, t] of hoje.entries()) {
		await expect(itens(page).nth(i)).toContainText(folha(t.topico));
		await expect(itens(page).nth(i)).toContainText(FAZER[t.modo as keyof typeof FAZER]);
	}
	await expect(missao(page).getByText('8 tarefas, 3 h estimadas.')).toBeVisible();
	await expect(missao(page).getByText('0 de 8 feitas (0%).')).toBeVisible();
	expect(await conferirIdentidade(page)).toEqual({ noPlano: 81, concluidos: 0, emAberto: 1, restantes: 80 });

	// Cumprir a missão de hoje: o dia conta como concluído e sai dos restantes.
	for (const t of hoje.slice(0, -1)) {
		await page.goto(rota(t));
		await concluir(page);
	}
	await page.goto(rota(hoje[7]));
	await concluirCumprindo(page);
	await abrirPainel(page);
	await expect(missao(page).getByText('Missão cumprida')).toBeVisible();
	await expect(missao(page).getByRole('button', { name: /estudos$/ })).toHaveCount(0);
	await expect(missao(page).getByRole('button', { name: 'Continuar estudando' })).toBeVisible();
	expect(await conferirIdentidade(page)).toEqual({ noPlano: 81, concluidos: 1, emAberto: 1, restantes: 79 });

	// No dia seguinte, os dois dias ficam para trás: um concluído, um em aberto.
	await page.clock.setFixedTime(em('2026-10-03'));
	await abrirPainel(page);
	expect(await conferirIdentidade(page)).toEqual({ noPlano: 81, concluidos: 1, emAberto: 1, restantes: 79 });
	await expect(itens(page).first()).toContainText(folha(fila[9].topico));
	await expect(itens(page).first()).toContainText(FAZER.questoes);
});

test('Cenário 4: "Exportar progresso" baixa o CSV com uma linha por tópico', async ({ page }) => {
	await page.clock.setFixedTime(em('2026-10-01', '10:00'));
	await abrirPainel(page);
	await expect(resumo(page).getByText('Nenhuma tarefa concluída ainda.', { exact: false })).toBeVisible();

	/** Clica "Exportar progresso" e devolve o arquivo baixado. */
	async function exportar() {
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			resumo(page).getByRole('button', { name: 'Exportar progresso' }).click()
		]);
		expect(download.suggestedFilename()).toBe('progresso-plano-2026-10-01.csv');
		return readFileSync((await download.path())!, 'utf8');
	}
	const CABECALHO = '﻿id,ultima_sessao,minutos,questoes_feitas,questoes_certas,status_sugerido\r\n';

	// Só a Leitura feita: o tópico sai sem questões e sem status sugerido.
	await missao(page).getByRole('button', { name: 'Iniciar estudos' }).click();
	await expect(timer(page)).toContainText('00:00');
	await page.clock.setFixedTime(em('2026-10-01', '10:30'));
	await concluir(page);
	await expect(resumo(page).getByText('1 tópico com tarefa concluída para lançar no ESTUDO.csv.')).toBeVisible();
	expect(await exportar()).toBe(CABECALHO + `${t1.topicoId},2026-10-01,30,,,\r\n`);

	// Com a Questões do mesmo tópico: ainda uma linha, minutos somados, questões dela e "estudado".
	await missao(page).getByRole('button', { name: 'Iniciar estudos' }).click();
	await expect(page).toHaveURL(rota(t2));
	await page.clock.setFixedTime(em('2026-10-01', '10:50'));
	await concluir(page, { feitas: 10, certas: 7 });
	await expect(resumo(page).getByText('1 tópico com tarefa concluída para lançar no ESTUDO.csv.')).toBeVisible();
	expect(await exportar()).toBe(CABECALHO + `${t1.topicoId},2026-10-01,50,10,7,estudado\r\n`);
});

test('feed: chamada da missão acima dos stories, sem tirar o 1º post da tela em 360 px', async ({ page }) => {
	await page.setViewportSize({ width: 360, height: 780 });
	await page.clock.setFixedTime(em('2026-10-01'));
	await page.goto('/');
	const chamada = page.getByRole('region', { name: 'Missão de hoje' });
	await expect(chamada).toContainText('0 de 8 feitas, faltam 3 h');
	await expect(page.locator('[data-post-id]').first()).toBeInViewport();
	const [c, s] = await Promise.all([
		chamada.boundingBox(),
		page.getByRole('navigation', { name: 'Matérias' }).boundingBox()
	]);
	expect(c!.y).toBeLessThan(s!.y);

	await chamada.getByRole('button', { name: 'Iniciar' }).click();
	await expect(page).toHaveURL(rota(t1));
	await expect(page.locator('#cronometro-estado')).toContainText('Correndo');
	await concluir(page);
	await page.goto('/');
	await expect(chamada).toContainText('1 de 8 feitas, faltam 2 h 35 min');
	await expect(chamada.getByRole('button', { name: 'Continuar' })).toHaveCount(0);
	await expect(chamada.getByRole('button', { name: 'Iniciar' })).toBeVisible();

	for (const t of fila.slice(1, 7)) {
		await page.goto(rota(t));
		await concluir(page);
	}
	await page.goto(rota(fila[7]));
	await concluirCumprindo(page);
	await page.goto('/');
	// Emenda D5: "Missão cumprida · Continuar".
	await expect(chamada.getByRole('link', { name: 'Missão cumprida' })).toBeVisible();
	await expect(chamada.getByRole('button')).toHaveCount(1);
	await expect(chamada.getByRole('button', { name: 'Continuar' })).toBeVisible();
	await expect(page.locator('[data-post-id]').first()).toBeInViewport();
});

test('emenda D5: missão cumprida ⇒ "Continuar estudando" abre a 9ª da fila; extras contam e amanhã começa na 10ª', async ({ page }) => {
	await page.clock.setFixedTime(em('2026-10-01', '09:00'));
	await abrirPainel(page);
	const hoje = fila.slice(0, 8);
	const [nona, decima] = [fila[8], fila[9]];

	// Cumpre a missão (8 tarefas); a 8ª fica na tela com "Continuar estudando".
	for (const t of hoje.slice(0, -1)) {
		await page.goto(rota(t));
		await concluir(page);
	}
	await page.goto(rota(hoje[7]));
	await concluirCumprindo(page);

	// Continuar ⇒ a 9ª da fila (fora da missão), com o cronômetro correndo.
	await page.getByRole('button', { name: 'Continuar estudando' }).click();
	await expect(page).toHaveURL(rota(nona));
	await expect(page.getByRole('heading', { level: 1, name: folha(nona.topico) })).toBeVisible();
	await expect(page.locator('#cronometro-estado')).toContainText('Correndo');
	// A tela reaproveitada não carrega o estado da tarefa anterior.
	await expect(page.getByRole('button', { name: 'Continuar estudando' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Concluir tarefa' })).toBeVisible();

	await page.clock.setFixedTime(em('2026-10-01', '09:25'));
	await concluir(page);

	// Extras de hoje, % do plano, foto e identidade intactas.
	await expect(missao(page).getByText('Missão cumprida')).toBeVisible();
	await expect(missao(page).getByText('8 de 8 feitas (100%).')).toBeVisible();
	await expect(itens(page)).toHaveCount(8);
	await expect(missao(page).getByText('Extras de hoje: 1 tarefa · 25 min')).toBeVisible();
	await expect(resumo(page).getByText(new RegExp(`do plano concluído, 9 de ${fila.length} tarefas\\.`))).toBeVisible();
	await expect(resumo(page).getByRole('progressbar')).toHaveJSProperty('value', 9 / fila.length);
	const gravado = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), CHAVE_PLANO);
	expect(gravado.fotos).toEqual({ '2026-10-01': hoje.map((t) => t.id) });
	expect(await conferirIdentidade(page)).toEqual({ noPlano: 81, concluidos: 1, emAberto: 0, restantes: 80 });

	// No feed: "Missão cumprida · Continuar" abre a 10ª.
	await page.goto('/');
	const chamada = page.getByRole('region', { name: 'Missão de hoje' });
	await expect(chamada.getByRole('link', { name: 'Missão cumprida' })).toBeVisible();
	await chamada.getByRole('button', { name: 'Continuar' }).click();
	await expect(page).toHaveURL(rota(decima));
	await expect(page.locator('#cronometro-estado')).toContainText('Correndo');

	// Extra pausada: "Continuar estudando" retoma ela.
	await page.clock.setFixedTime(em('2026-10-01', '09:35'));
	await page.getByRole('button', { name: 'Pausar' }).click();
	await expect(page.locator('#cronometro-estado')).toContainText('Pausado');
	await page.getByRole('link', { name: 'Voltar à missão' }).click();
	await missao(page).getByRole('button', { name: 'Continuar estudando' }).click();
	await expect(page).toHaveURL(rota(decima));
	await expect(page.locator('#cronometro-estado')).toContainText('Correndo');
	await expect(timer(page)).toContainText('10:00');
	await page.getByRole('button', { name: 'Pausar' }).click();

	// Dia seguinte: a missão começa na 10ª (depois da extra feita); o dia de ontem segue concluído.
	await page.clock.setFixedTime(em('2026-10-02'));
	await abrirPainel(page);
	await expect(itens(page).first()).toContainText(folha(decima.topico));
	await expect(itens(page).first()).toContainText(FAZER[decima.modo as keyof typeof FAZER]);
	await expect(missao(page).getByText(/^Extras de hoje/)).toHaveCount(0);
	expect(await conferirIdentidade(page)).toEqual({ noPlano: 81, concluidos: 1, emAberto: 0, restantes: 80 });
	const depois = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), CHAVE_PLANO);
	expect(depois.fotos['2026-10-01']).toEqual(hoje.map((t) => t.id));
	expect(depois.fotos['2026-10-02'][0]).toBe(decima.id);
});

test('fora da janela: antes "ainda não começou", depois "encerrado"; feed sem chamada', async ({ page }) => {
	await page.clock.setFixedTime(em('2026-09-30'));
	await abrirPainel(page);
	await expect(resumo(page).getByText(/Plano ainda não começou/)).toBeVisible();
	await expect(missao(page).getByText('A primeira missão sai em 01/10/2026, quando o plano começa.')).toBeVisible();
	expect(await conferirIdentidade(page)).toEqual({ noPlano: 81, concluidos: 0, emAberto: 0, restantes: 81 });
	await page.goto('/');
	await expect(page.locator('[data-post-id]').first()).toBeVisible();
	await expect(page.getByRole('region', { name: 'Missão de hoje' })).toHaveCount(0);

	await page.clock.setFixedTime(em('2026-12-21'));
	await abrirPainel(page);
	await expect(resumo(page).getByText('Plano encerrado em 20/12/2026.')).toBeVisible();
	expect(await conferirIdentidade(page)).toEqual({ noPlano: 81, concluidos: 0, emAberto: 81, restantes: 0 });
});

test('fila esgotada: "Plano cumprido — revise" e o dia conta como concluído', async ({ page }) => {
	const ontem = new Date('2026-10-04T12:00:00-03:00').toISOString();
	await page.addInitScript(
		([k, ids, quando]) => {
			if (localStorage.getItem(k)) return;
			const registros = Object.fromEntries(
				ids.map((id) => [id, { dia: '2026-10-04', intervalos: [], rodandoDesde: null, concluidaEm: quando, questoes: null, certas: null }])
			);
			localStorage.setItem(k, JSON.stringify({ registros, fotos: {} }));
		},
		[CHAVE_PLANO, fila.map((t) => t.id), ontem] as const
	);
	await page.clock.setFixedTime(em('2026-10-05'));
	await abrirPainel(page);
	await expect(missao(page).getByText('Plano cumprido — revise')).toBeVisible();
	await expect(resumo(page).getByText(`100% do plano concluído, ${fila.length} de ${fila.length} tarefas.`)).toBeVisible();
	expect(await conferirIdentidade(page)).toEqual({ noPlano: 81, concluidos: 1, emAberto: 4, restantes: 76 });
	await page.goto('/');
	await expect(page.getByRole('region', { name: 'Missão de hoje' }).getByRole('link', { name: 'Plano cumprido — revise' })).toBeVisible();
});

test('/tarefa/<id inexistente> mostra "não encontrada" com volta ao painel', async ({ page }) => {
	await page.clock.setFixedTime(em('2026-10-01'));
	await page.goto('/tarefa/NAO-EXISTE');
	await expect(page.getByRole('heading', { level: 1, name: 'Tarefa não encontrada' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Voltar ao painel' })).toHaveAttribute('href', '/painel');
});

test('na tela da tarefa, a aba inferior destacada é Painel', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-10-01T09:00:00-03:00'));
	await page.goto(rota(fila[0]));
	await expect(page.locator('a.aba[aria-current="page"]')).toHaveAttribute('href', '/painel');
});

import { expect, test } from '@playwright/test';

// Questões de certo/errado extraídas do material da aula (PDF do vault →
// /conteudo/questoes-aula/e4-1.json), com gabarito comentado abrindo ao responder.

test('uma questão por vez, com teclas C, E, Enter e setas; respostas ficam na conta', async ({ page }) => {
	const CHAVE_Q = 'painel-concurso:questoes-aula:v1';
	await page.addInitScript(() => localStorage.setItem('painel-concurso:usuario:v1', 'marte'));
	await page.goto('/questoes/e4-1');
	await expect(page.getByRole('heading', { level: 1, name: /Questões de certo ou errado · 1\. Ciclo de vida e MLOps/ })).toBeVisible();

	// Uma por vez: só o cartão da atual, com a contagem no topo.
	const cartao = page.locator('.cartao');
	await expect(page.locator('.ponto')).toHaveCount(12);
	await expect(cartao).toContainText('Questão 1 de 12');
	await expect(page.getByRole('button', { name: /Certo/ })).toHaveCount(1);

	// Tecla C responde (gabarito da 1 é C): veredito explícito e avança para a 2.
	await page.keyboard.press('c');
	await expect(page.getByText('1 de 1 certos', { exact: false })).toBeVisible();
	await expect(cartao).toContainText('Questão 2 de 12');
	await page.keyboard.press('ArrowLeft');
	await expect(cartao.locator('.veredito')).toHaveText('Você acertou');
	await expect(cartao.locator('button.acertou')).toHaveCount(1);

	// Volta para a 2 e erra por tecla (gabarito C): veredito de erro com o certo indicado.
	await page.keyboard.press('ArrowRight');
	await page.keyboard.press('e');
	await expect(cartao).toContainText('Questão 3 de 12');
	await page.keyboard.press('ArrowLeft');
	await expect(cartao.locator('.veredito')).toHaveText('Você errou — o certo era Certo');
	await expect(page.getByRole('button', { name: /Refazer/ })).toHaveCount(1);

	// Enter, na respondida em vista, avança de novo.
	await page.keyboard.press('Enter');
	await expect(cartao).toContainText('Questão 3 de 12');
	await expect(page.getByRole('button', { name: /Refazer/ })).toHaveCount(0);

	// Refazer limpa a resposta da questão em vista (a 1, navegando de volta).
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('ArrowLeft');
	await expect(cartao).toContainText('Questão 1 de 12');
	await page.getByRole('button', { name: /Refazer/ }).click();
	await expect(page.getByText('Gabarito:')).toHaveCount(0);

	// A resposta gravada sobrevive ao recarregar (chave da conta, aula~número).
	await page.keyboard.press('e');
	const gravado = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), CHAVE_Q);
	expect(gravado['e4-1~2']).toBe('E');
	await page.reload();
	await expect(cartao).toContainText('Questão 1 de 12');
	await page.keyboard.press('ArrowRight');
	await expect(cartao.locator('.veredito')).toHaveText('Você errou — o certo era Certo');
});

test('sem login: responder abre o popup; "Agora não" não guarda nada', async ({ page }) => {
	await page.goto('/questoes/e4-3');
	const popup = page.getByRole('dialog', { name: 'Entre para guardar suas respostas' });
	await expect(page.getByText('Questão 1 de 12')).toBeVisible();
	await page.keyboard.press('e');
	await expect(popup).toBeVisible();
	await expect(page.locator('.veredito')).toHaveCount(0);
	await popup.getByRole('button', { name: 'Agora não' }).click();
	await expect(popup).toBeHidden();
	expect(await page.evaluate(() => localStorage.getItem('painel-concurso:questoes-aula:v1'))).toBeNull();
});

test('slug desconhecido mostra a página de não encontrado', async ({ page }) => {
	await page.goto('/questoes/nao-existe');
	await expect(page.getByText('Questões não encontradas')).toBeVisible();
});

test('a missão traz o atalho de questões na aula que tem', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-11-21T09:00:00-03:00'));
	await page.goto('/painel');
	// E4·1 é estudo novo em 21/11; o índice liga o cod E4·1 à rota.
	const atalho = page.getByRole('link', { name: 'Questões C/E ↗' }).first();
	await expect(atalho).toHaveAttribute('href', '/questoes/e4-1');
	await atalho.click();
	await expect(page).toHaveURL(/\/questoes\/e4-1$/);
});

test('a página da aula E4·3 corrige e comenta o gabarito', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('painel-concurso:usuario:v1', 'marte'));
	await page.goto('/questoes/e4-3');
	await expect(page.getByRole('heading', { level: 1, name: /Questões de certo ou errado · 3\. Governança e responsabilidade/ })).toBeVisible();
	await expect(page.locator('.ponto')).toHaveCount(12);

	// Questão 1 (gabarito E): a tecla responde e avança; voltar mostra o comentário da norma.
	await page.keyboard.press('e');
	const cartao = page.locator('.cartao');
	await expect(cartao).toContainText('Questão 2 de 12');
	await page.keyboard.press('ArrowLeft');
	await expect(cartao.locator('.veredito')).toHaveText('Você acertou');
	await expect(cartao.locator('.gabarito p')).toContainText('Resolução CD/ANPD 18/2024');
});

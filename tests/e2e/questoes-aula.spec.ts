import { expect, test } from '@playwright/test';

// Questões de certo/errado extraídas do material da aula (PDF do vault →
// /conteudo/questoes-aula/e4-1.json), com gabarito comentado abrindo ao responder.

test('uma questão por vez, com teclas C, E, Enter e setas; respostas ficam na conta', async ({ page }) => {
	const CHAVE_Q = 'painel-concurso:questoes-aula:v1';
	await page.addInitScript(() => localStorage.setItem('painel-concurso:usuario:v1', 'marte'));
	await page.goto('/questoes/e4-1');
	await expect(page.getByRole('heading', { level: 1, name: /Questões de certo ou errado · 1\. Ciclo de vida e MLOps/ })).toBeVisible();

	// Uma por vez: só o cartão da atual, com a contagem no topo — e sem entregar o gabarito.
	const cartao = page.locator('.cartao');
	await expect(page.locator('.ponto')).toHaveCount(12);
	await expect(cartao).toContainText('Questão 1 de 12');
	await expect(page.getByRole('button', { name: /Certo/ })).toHaveCount(1);
	await expect(page.locator('button.correta')).toHaveCount(0);

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
	// Depois de errar, o botão do gabarito certo fica contornado em verde.
	await expect(cartao.locator('button.correta')).toHaveCount(1);

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

test('a página da aula E2·5 corrige e comenta o gabarito', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('painel-concurso:usuario:v1', 'marte'));
	await page.goto('/questoes/e2-5');
	await expect(page.getByRole('heading', { level: 1, name: /Questões de certo ou errado · 5\. Qualidade e rastreabilidade/ })).toBeVisible();
	await expect(page.locator('.ponto')).toHaveCount(12);

	// Questão 1 (gabarito E): acertar por tecla e voltar mostra o comentário.
	await page.keyboard.press('e');
	const cartao = page.locator('.cartao');
	await expect(cartao).toContainText('Questão 2 de 12');
	await page.keyboard.press('ArrowLeft');
	await expect(cartao.locator('.veredito')).toHaveText('Você acertou');
	await expect(cartao.locator('.gabarito p')).toContainText('metadados');
});

test('a missão de 23/11 traz o atalho de questões da E2·5', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-11-23T09:00:00-03:00'));
	await page.goto('/painel');
	await expect(page.locator('a.topico[href="/questoes/e2-5"]')).toHaveCount(1);
});

test('a página da aula E2·6 corrige e comenta o gabarito', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('painel-concurso:usuario:v1', 'marte'));
	await page.goto('/questoes/e2-6');
	await expect(page.getByRole('heading', { level: 1, name: /Questões de certo ou errado · 6\. Compartilhamento e proteção/ })).toBeVisible();
	await expect(page.locator('.ponto')).toHaveCount(13);

	// Questão 1 (gabarito C): acertar por tecla e voltar mostra o comentário.
	await page.keyboard.press('c');
	const cartao = page.locator('.cartao');
	await expect(cartao).toContainText('Questão 2 de 13');
	await page.keyboard.press('ArrowLeft');
	await expect(cartao.locator('.veredito')).toHaveText('Você acertou');
	await expect(cartao.locator('.gabarito p')).toContainText('compatibilidade');
});

test('a missão de 30/11 traz o atalho de questões da E2·6', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-11-30T09:00:00-03:00'));
	await page.goto('/painel');
	await expect(page.locator('a.topico[href="/questoes/e2-6"]')).toHaveCount(1);
});

test('a página da aula E2·4 corrige e comenta o gabarito', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('painel-concurso:usuario:v1', 'marte'));
	await page.goto('/questoes/e2-4');
	await expect(page.getByRole('heading', { level: 1, name: /Questões de certo ou errado · 4\. Processamento distribuído/ })).toBeVisible();
	await expect(page.locator('.ponto')).toHaveCount(15);

	// Questão 1 (gabarito E): acertar por tecla e voltar mostra o comentário.
	await page.keyboard.press('e');
	const cartao = page.locator('.cartao');
	await expect(cartao).toContainText('Questão 2 de 15');
	await page.keyboard.press('ArrowLeft');
	await expect(cartao.locator('.veredito')).toHaveText('Você acertou');
	await expect(cartao.locator('.gabarito p')).toContainText('escalabilidade');
});

test('a missão de 19/11 traz o atalho de questões da E2·4', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-11-19T09:00:00-03:00'));
	await page.goto('/painel');
	// No dia em vista há aulas com o atalho (E1·2 em atrasadas, E2·4 no estudo novo).
	await expect(page.locator('a.topico[href="/questoes/e2-4"]')).toHaveCount(1);
});

test('a página da aula C3·1 corrige e comenta o gabarito', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('painel-concurso:usuario:v1', 'marte'));
	await page.goto('/questoes/c3-1');
	await expect(page.getByRole('heading', { level: 1, name: /Questões de certo ou errado · 1\. Decisão administrativa/ })).toBeVisible();
	await expect(page.locator('.ponto')).toHaveCount(11);

	// Questão 1 (gabarito C): acertar por tecla e voltar mostra o comentário com o trecho da norma.
	await page.keyboard.press('c');
	const cartao = page.locator('.cartao');
	await expect(cartao).toContainText('Questão 2 de 11');
	await page.keyboard.press('ArrowLeft');
	await expect(cartao.locator('.veredito')).toHaveText('Você acertou');
	await expect(cartao.locator('.gabarito p')).toContainText('Lei 9.784/1999, art. 2º');
});

test('a missão de 25/11 traz o atalho de questões da C3·1', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-11-25T09:00:00-03:00'));
	await page.goto('/painel');
	// C3·1 é estudo novo em 25/11; o índice liga o cod C3·1 à rota.
	await expect(page.locator('a.topico[href="/questoes/c3-1"]')).toHaveCount(1);
});

test('a página de revisão da C4·2 traz as pegadinhas da banca', async ({ page }) => {
	await page.addInitScript(() => localStorage.setItem('painel-concurso:usuario:v1', 'marte'));
	await page.goto('/questoes/c4-2-rev');
	await expect(page.getByRole('heading', { level: 1, name: /Questões de certo ou errado · 2\. Leitura de dados e indicadores · revisão/ })).toBeVisible();
	await expect(page.locator('.ponto')).toHaveCount(14);

	// Questão 1 (gabarito C): responder e voltar mostra o comentário com a correção da pegadinha.
	await page.keyboard.press('c');
	const cartao = page.locator('.cartao');
	await expect(cartao).toContainText('Questão 2 de 14');
	await page.keyboard.press('ArrowLeft');
	await expect(cartao.locator('.veredito')).toHaveText('Você acertou');
	await expect(cartao.locator('.gabarito p')).toContainText('pontos percentuais');
});

test('a missão de 26/11 traz o atalho de revisão C/E da C3·1 no bloco de revisão', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-11-26T09:00:00-03:00'));
	await page.goto('/painel');
	// C3·1 é revisão (D+1) em 26/11; o índice-rev liga o cod à página de pegadinhas, ao lado da
	// página de literais.
	await expect(page.locator('a.topico[href="/questoes/c3-1-rev"]')).toHaveCount(1);
	await expect(page.locator('a.topico[href="/questoes/c3-1"]')).toHaveCount(1);
});

test('todas as aulas extraídas abrem com a contagem certa', async ({ page }) => {
	const aulas = [
	['E1·1', '1. Exploração e descrição', 16],
	['E1·2', '2. Probabilidade e inferência', 16],
	['E1·3', '3. Relações entre variáveis', 16],
	['E1·4', '4. Programação para análise', 14],
	['E1·5', '5. Preparação e transformação', 14],
	['E2·1', '1. Modelagem e arquiteturas', 14],
	['E2·2', '2. SQL e consultas analíticas', 16],
	['E2·3', '3. Ingestão e integração', 14],
	['E2·4', '4. Processamento distribuído', 15],
	['E2·5', '5. Qualidade e rastreabilidade', 12],
	['E2·6', '6. Compartilhamento e proteção', 13],
	['E3·1', '1. Seleção e construção de modelos', 16],
	['E3·2', '2. Validação e generalização', 15],
	['E3·3', '3. Métricas e efeitos das decisões', 16],
	['E3·4', '4. Redes neurais', 15],
	['E3·5', '5. Linguagem natural e modelos generativos', 15],
	['E3·6', '6. Agentes e uso seguro de ferramentas', 14],
	['E4·1', '1. Ciclo de vida e MLOps', 12],
	['E4·2', '2. Sustentação de soluções analíticas', 12],
	['E4·3', '3. Governança e responsabilidade', 12],
	['E4·4', '4. Gestão de produtos de dados', 14],
	['E4·5', '5. Contratação e controle de soluções', 14],
	['C1·1', '1. Governança e responsabilidades', 10],
	['C1·2', '2. Riscos e controles essenciais', 16],
	['C1·3', '3. Integridade pública', 7],
	['C1·4', '4. Integridade privada', 7],
	['C1·5', '5. Prevenção e melhoria institucional', 4],
	['C2·1', '1. Acesso à informação', 13],
	['C2·2', '2. Transparência e proteção de dados', 10],
	['C2·3', '3. Ouvidoria e proteção das pessoas', 9],
	['C2·4', '4. Participação e melhoria de serviços', 10],
	['C2·5', '5. Integridade da informação e comunicação', 10],
	['C3·1', '1. Decisão administrativa', 11],
	['C3·2', '2. Processo e garantias', 9],
	['C3·3', '3. Funções de controle e melhoria da gestão', 9],
	['C3·4', '4. Responsabilização em nível introdutório', 7],
	['C3·5', '5. Proteção e encaminhamento', 6],
	['C4·1', '1. Perguntas e fontes', 11],
	['C4·2', '2. Leitura de dados e indicadores', 9],
	['C4·3', '3. Inferências e erros de raciocínio', 7],
	['C4·4', '4. Integridade da evidência e proteção', 5],
	['C4·5', '5. Uso responsável de inteligência artificial', 11],
	['C5·1', '1. Propósito, serviços e papéis', 10],
	['C5·2', '2. Ciclo do trabalho', 9],
	['C5·3', '3. Evidência e conclusão', 11],
	['C5·4', '4. Comunicação e acompanhamento', 9],
	['C5·5', '5. Integração entre funções da CGU', 5]
	] as const;
	for (const [cod, titulo, n] of aulas) {
		const slug = cod.replace('·', '-').toLowerCase();
		await page.goto(`/questoes/${slug}`);
		const h1 = page.getByRole('heading', { level: 1 });
		await expect(h1).toContainText(titulo);
		await expect(page.locator('.ponto')).toHaveCount(n);
	}
});

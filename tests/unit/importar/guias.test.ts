import { describe, expect, it } from 'vitest';
import { disciplinaDoPost } from '../../../scripts/importar/disciplinas.mjs';
import { emTelas, importarGuia, textoPlano } from '../../../scripts/importar/guias.mjs';

const GUIA = 'GUIA CGU 2026 AFFC Infraestrutura P3.md';

const texto = `# Guia

### E3 Cibersegurança

#### E3 · 6.4 — Prioridade alta

**(A) Texto original do edital.** Objetivos de recuperação de tempo e de ponto.

**(B) O que estudar.**
- RTO (*recovery time objective*): tempo para retomar o serviço.
- RPO: perda de dados tolerada; ver [IN GSI/PR 3/2021](https://www.gov.br/gsi).
  - Conta: \`COUNT(*)\` não muda.

**(C) Fontes recomendadas.**
- Normas: **IN GSI/PR 3/2021**, art. 23.

**(D) Como a banca erra o item.**
- *Afirmação errada:* O RTO indica a perda de dados tolerada. → *Certo:* isso é o RPO.
- *Afirmação errada:* O RTO é fixado pela TI. → *Certo:* deriva da BIA.

**(E) Prioridade alta.** Par de conceitos que a banca inverte.

### E4 Operação

#### E4 · 1.1 — Prioridade média

**(A) Texto original do edital.** Logs, métricas e rastreamento distribuído.

**(B) O que estudar.**
\`\`\`sql
SELECT 1;
\`\`\`

**(E) Prioridade média.** Conceitual.
`;

describe('guia da P3 no feed', () => {
	it('textoPlano tira link, negrito e itálico e mantém o código', () => {
		expect(textoPlano('ver [IN 3](https://x.gov.br), **forte**, *it*, `COUNT(*)`')).toBe('ver IN 3, forte, it, COUNT(*)');
	});

	it('emTelas respeita 600 caracteres e não parte o bloco de código', () => {
		const longo = Array.from({ length: 30 }, (_, i) => `- item ${i} ${'x'.repeat(40)}`).join('\n');
		const telas = emTelas(`${longo}\n- consulta:\n\`\`\`sql\nSELECT a\nFROM b;\n\`\`\``);
		for (const t of telas) expect(t.length).toBeLessThanOrEqual(600);
		expect(telas.some((t) => t.includes('SELECT a\nFROM b;'))).toBe(true);
	});

	it('um resumo e um flashcard Certo/Errado por pegadinha, todos não conferidos', () => {
		const { posts, avisos } = importarGuia(GUIA, texto);
		expect(avisos).toEqual([]);
		const resumo = posts.find((p) => p.id === 'r:guia-infra:E3-6.4');
		expect(resumo.titulo).toBe('E3 6.4 · Objetivos de recuperação de tempo e de ponto.');
		expect(resumo.subtopico).toBe('E3 6.4 · Prioridade alta');
		expect(resumo.telas.map((t: { titulo: string }) => t.titulo)).toEqual(['O que estudar', 'Fontes', 'Prioridade alta']);
		expect(resumo.telas[0].texto).toContain('RTO (recovery time objective)');
		expect(resumo.telas[0].texto).toContain('COUNT(*)');
		expect(resumo.telas[1].texto).toBe('- Normas: IN GSI/PR 3/2021, art. 23.');
		const cartoes = posts.filter((p) => p.tipo === 'flashcard');
		expect(cartoes.map((p) => p.id)).toEqual(['f:guia-infra:E3-6.4:1', 'f:guia-infra:E3-6.4:2']);
		expect(cartoes[0].pergunta).toBe('Certo ou errado? O RTO indica a perda de dados tolerada.');
		expect(cartoes[0].resposta).toBe('Errado. Isso é o RPO.');
		expect(posts.every((p) => p.conferido === false && p.fonte.arquivo === GUIA)).toBe(true);
		// Sem (C): a tela do edital completa o mínimo de três.
		const semFontes = posts.find((p) => p.id === 'r:guia-infra:E4-1.1');
		expect(semFontes.telas.map((t: { titulo: string }) => t.titulo)).toEqual(['Texto do edital', 'O que estudar', 'Prioridade média']);
		expect(semFontes.telas[1].texto).toBe('SELECT 1;');
	});

	it('o post do guia vai à disciplina da P3 pelo código do subitem', () => {
		const { posts } = importarGuia(GUIA, texto);
		expect(posts.map((p) => disciplinaDoPost(p))).toEqual(['infra-e3', 'infra-e3', 'infra-e3', 'infra-e4']);
	});
});

import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { afterAll, describe, expect, it } from 'vitest';
import { formatarRelatorio, importar, lerArgumentos } from '../../../scripts/importar/index.mjs';
import { violacoes } from './esquema';

const VAULT = fileURLToPath(new URL('./fixtures/vault', import.meta.url));
const raiz = mkdtempSync(join(tmpdir(), 'painel-importar-'));
afterAll(() => rmSync(raiz, { recursive: true, force: true }));

const lerJson = (dir: string, arq: string) => JSON.parse(readFileSync(join(dir, arq), 'utf8'));
const bytes = (dir: string) =>
	Object.fromEntries(readdirSync(dir).sort().map((f) => [f, readFileSync(join(dir, f), 'utf8')]));

describe('importação de ponta a ponta (vault de fixture)', () => {
	const saida = join(raiz, 'a');
	const rel = importar({ vault: VAULT, saida });
	const indice = lerJson(saida, 'indice.json');
	const materias = lerJson(saida, 'materias.json');
	const lotes = Object.values(indice.lotes as Record<string, string>);
	const posts = lotes.flatMap((arq) => lerJson(saida, arq));

	it('totais por tipo: 8 questões (4 de múltipla escolha viram 18 itens C/E ⇒ 22 posts), 7+12 artigos (Art. 9º da 12.813 em 3 redações vira 1), 1 resumo, 2+5 flashcards', () => {
		expect(rel.totais).toEqual({ questao: 22, lei: 19, resumo: 1, flashcard: 7 });
		expect(rel.convertidas).toEqual({ questoes: 4, itens: 18 });
		expect(rel.descartes).toMatchObject({
			'questão anulada': 1,
			'questão sem gabarito': 1,
			'artigo revogado/vetado': 4,
			'redação anterior substituída': 2
		});
		expect(rel.recusados).toEqual([]);
		expect(rel.pulados).toEqual([]);
	});

	it('todo post casa com contracts/conteudo-importado.schema.json', () => {
		for (const p of posts) expect(violacoes(p), p.id).toEqual([]);
	});

	it('contagem do relatório = entradas do índice = posts nos lotes', () => {
		const total = Object.values(rel.totais).reduce((a, b) => a + b, 0);
		expect(indice.posts).toHaveLength(total);
		expect(rel.entradasIndice).toBe(total);
		expect(posts).toHaveLength(total);
		const noLote = new Map<string, string>();
		for (const [chave, arq] of Object.entries(indice.lotes as Record<string, string>))
			for (const p of lerJson(saida, arq)) noLote.set(p.id, chave);
		for (const e of indice.posts) {
			expect(noLote.get(e.id)).toBe(e.l);
			expect(e.t).toBe(posts.find((p) => p.id === e.id).tipo[0]);
		}
	});

	it('entrada de questão com tópico ganha tp; as demais seguem com id, t, m, l', () => {
		const comTp = indice.posts.filter((e: { tp?: string }) => e.tp !== undefined);
		expect(comTp).toHaveLength(22);
		expect(rel.topicos).toEqual({ questoes: 8, distintos: 8 });
		for (const e of indice.posts) {
			const p = posts.find((x) => x.id === e.id);
			if (e.t === 'q') expect(e.tp).toBe(p.topicoEstudo);
			const chaves = e.tp === undefined ? ['id', 't', 'm', 'l'] : ['id', 't', 'm', 'l', 'tp'];
			expect(Object.keys(e)).toEqual(chaves);
		}
		expect(indice.posts.find((e: { id: string }) => e.id === 'q:TCU2026-AUFC-TI-113').tp).toBe('CDA-11');
		expect(formatarRelatorio(rel)).toContain('questões com tópico de estudo: 8 (8 tópicos distintos)');
	});

	it('índice e matérias no formato do contrato', () => {
		expect(indice.versao).toBe(1);
		expect(indice.geradoEm).toMatch(/^\d{4}-\d{2}-\d{2}T/);
		for (const m of materias) expect(Object.keys(m)).toEqual(['id', 'nome', 'abrev', 'ordem', 'total']);
		expect(materias[0]).toMatchObject({ id: 'ti-ciencia-de-dados', ordem: 1, total: 5 });
		expect(materias.find((m: { id: string }) => m.id === 'outros-ramos-do-direito').total).toBe(27);
	});

	it('nenhum lote passa de 150 KB gzip', () => {
		for (const arq of lotes) {
			expect(arq).toMatch(/^lote-[a-z0-9-]+-\d+\.json$/);
			expect(gzipSync(readFileSync(join(saida, arq))).length).toBeLessThanOrEqual(150 * 1024);
		}
	});

	it('duas execuções geram bytes idênticos', () => {
		const outra = join(raiz, 'b');
		importar({ vault: VAULT, saida: outra });
		expect(bytes(outra)).toEqual(bytes(saida));
	});

	it('relatório formatado traz totais, descartes e maior lote', () => {
		const texto = formatarRelatorio(rel);
		expect(texto).toContain('questao: 22');
		expect(texto).toContain('múltipla escolha convertida em Certo/Errado: 4 questões → 18 itens');
		expect(texto).toContain('questão anulada: 1');
		expect(texto).toMatch(/maior: lote-.+ KB gzip/);
		expect(texto).toContain('Arquivos recusados: 0');
	});
});

describe('importação: falhas', () => {
	it('arquivo inválido é recusado e listado; os demais seguem', () => {
		const vault = join(raiz, 'vault-ruim');
		cpSync(VAULT, vault, { recursive: true });
		writeFileSync(
			join(vault, 'feed-conteudo', 'resumos', 'inventado.md'),
			'---\ntipo: resumo\nmateria: Outros Ramos do Direito\nfonte: "leis-secas/06-Lei-12527-2011-LAI.md"\nconferido: false\n---\n# T\n## A\nArt. 300 diz x.\n## B\ny\n## C\nz\n'
		);
		const rel = importar({ vault, saida: join(raiz, 'c') });
		expect(rel.recusados).toEqual([
			{ arquivo: 'feed-conteudo/resumos/inventado.md', motivo: expect.stringContaining('Art. 300') }
		]);
		expect(rel.totais.resumo).toBe(1);
	});

	it('sem feed-conteudo/ segue com aviso', () => {
		const vault = join(raiz, 'vault-sem-feed');
		cpSync(VAULT, vault, { recursive: true });
		rmSync(join(vault, 'feed-conteudo'), { recursive: true });
		const rel = importar({ vault, saida: join(raiz, 'd') });
		expect(rel.totais).toMatchObject({ resumo: 0, flashcard: 5 });
		expect(rel.avisos.join('\n')).toContain('feed-conteudo/ ainda não existe');
	});

	it('sem vault: erro fatal e a saída anterior fica intacta', () => {
		const saida = join(raiz, 'e');
		importar({ vault: VAULT, saida });
		const antes = bytes(saida);
		expect(() => importar({ vault: join(raiz, 'nao-existe'), saida })).toThrow(/vault não encontrado/);
		expect(bytes(saida)).toEqual(antes);
		expect(readdirSync(raiz).some((f) => f.includes('.tmp-'))).toBe(false);
	});

	it('saída dentro do vault é recusada', () => {
		expect(() => importar({ vault: VAULT, saida: join(VAULT, 'saida') })).toThrow(/dentro do vault/);
		expect(existsSync(join(VAULT, 'saida'))).toBe(false);
	});

	it('argumentos: --vault > PAINEL_VAULT > padrão', () => {
		const antes = process.env.PAINEL_VAULT;
		process.env.PAINEL_VAULT = '/env';
		try {
			expect(lerArgumentos([])).toEqual({ vault: '/env', saida: 'static/conteudo' });
			expect(lerArgumentos(['--vault', '/x', '--saida', '/y'])).toEqual({ vault: '/x', saida: '/y' });
		} finally {
			if (antes === undefined) delete process.env.PAINEL_VAULT;
			else process.env.PAINEL_VAULT = antes;
		}
		expect(() => lerArgumentos(['--nada'])).toThrow(/desconhecido/);
	});
});

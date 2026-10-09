import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { lerCsv } from '../../../scripts/importar/csv.mjs';
import {
	lerAlternativas,
	lerProva,
	importarQuestoes,
	lerTopicoEstudo,
	converterEmItens,
	romanosDaAlternativa,
	separarTextoBase
} from '../../../scripts/importar/questoes.mjs';

const csv = fileURLToPath(new URL('./fixtures/vault/catalogo-questoes/questoes.csv', import.meta.url));
const linhas = () => lerCsv(readFileSync(csv, 'utf8')) as Record<string, string>[];

describe('lerProva', () => {
	it('órgão, ano e cargo legível para ids reais', () => {
		const avisos: string[] = [];
		expect(lerProva('CGU2022-AFFC-TI', avisos)).toEqual({ orgao: 'CGU', ano: 2022, cargo: 'AFFC TI', banca: 'FGV' });
		expect(lerProva('CGU2012-P3-TI-DES', avisos).cargo).toBe('Prova 3 · TI Desenv.');
		expect(lerProva('CGU2022-TFFC', avisos).cargo).toBe('TFFC');
		expect(lerProva('TCU2026-AUFC-TI', avisos)).toMatchObject({ orgao: 'TCU', ano: 2026, banca: 'Cebraspe' });
		expect(avisos).toEqual([]);
	});

	it('id desconhecido usa o rótulo cru e avisa', () => {
		const avisos: string[] = [];
		expect(lerProva('CGU2030-NOVA-X', avisos)).toEqual({ orgao: 'CGU', ano: 2030, cargo: 'NOVA-X' });
		expect(avisos[0]).toContain('CGU2030-NOVA-X');
	});

	it('id fora do padrão é erro', () => {
		expect(() => lerProva('XYZ-1', [])).toThrow(/fora do padrão/);
	});
});

describe('separarTextoBase', () => {
	it('tira o colchete inicial, com colchete aninhado', () => {
		expect(separarTextoBase("[Sabendo que X'y = [20; 10], julgue.] Item.")).toEqual({
			textoBase: "Sabendo que X'y = [20; 10], julgue.",
			enunciado: 'Item.'
		});
	});
	it('sem colchete inicial é só enunciado', () => {
		expect(separarTextoBase('Enunciado [com colchete no meio].')).toEqual({
			enunciado: 'Enunciado [com colchete no meio].'
		});
	});
});

describe('lerTopicoEstudo', () => {
	it('só id de tópico do ESTUDO.csv', () => {
		expect(lerTopicoEstudo('FAG-02')).toBe('FAG-02');
		expect(lerTopicoEstudo('CDA-41')).toBe('CDA-41');
		expect(lerTopicoEstudo('')).toBeUndefined();
		expect(lerTopicoEstudo(undefined)).toBeUndefined();
		expect(lerTopicoEstudo('sem-topico')).toBeUndefined();
		expect(lerTopicoEstudo('FAG-02a')).toBeUndefined();
		expect(lerTopicoEstudo('FAG')).toBeUndefined();
	});
});

describe('lerAlternativas', () => {
	it('não parte em | que não abre alternativa', () => {
		const alts = lerAlternativas('(A) a || b | (B) x | y | (C) c | (D) d | (E) e');
		expect(alts.map((a) => a.letra)).toEqual(['A', 'B', 'C', 'D', 'E']);
		expect(alts[0].texto).toBe('a || b');
		expect(alts[1].texto).toBe('x | y');
	});
	it('sem prefixo é erro', () => {
		expect(() => lerAlternativas('texto solto')).toThrow(/sem prefixo/);
	});
});

describe('importarQuestoes (fixture com linhas reais)', () => {
	const r = importarQuestoes(linhas());
	const porId = new Map(r.posts.map((p) => [p.id, p]));

	it('descarta anulada e sem gabarito, contando por motivo', () => {
		expect(r.descartes).toEqual({ anulada: 1, 'sem gabarito': 1, 'fora do edital': 0 });
		expect(r.posts).toHaveLength(22);
		expect(porId.has('q:TCU2026-AUFC-TI-1')).toBe(false);
		expect(porId.has('q:TCU2026-AUFC-TI-101')).toBe(false);
	});

	it('gabarito igual ao catálogo em 100% das questões (NFR-008)', () => {
		for (const l of linhas()) {
			const p = porId.get(`q:${l.id}`);
			if (p) expect(p.gabarito).toBe(l.gabarito);
		}
	});

	it('C/E fica como está; múltipla escolha vira um item C/E por alternativa', () => {
		expect(porId.get('q:TCU2026-AUFC-TI-113')).toMatchObject({ formato: 'ce', gabarito: 'C' });
		expect(porId.get('q:TCU2026-AUFC-TI-114')).toMatchObject({ formato: 'ce', gabarito: 'E' });
		expect(r.posts.every((p) => p.formato === 'ce' && !('alternativas' in p))).toBe(true);
		expect(porId.has('q:CGU2012-P3-TI-DES-12')).toBe(false);
		const itens = ['A', 'B', 'C', 'D', 'E'].map((l) => porId.get(`q:CGU2012-P3-TI-DES-12:${l}`));
		expect(itens.map((p) => p.gabarito)).toEqual(['E', 'E', 'C', 'E', 'E']);
		expect(itens[0].enunciado).toContain('Alternativa A: ');
		expect(itens[0].enunciado).toContain('|| significa “OU” lógico.');
		expect(itens[0].enunciado).toMatch(/Certo se esta alternativa responde ao comando\.$/);
		expect(itens[2]).toMatchObject({ numero: 12, topicoEstudo: 'DES-20', materia: itens[0].materia });
		expect(r.convertidas).toEqual({ questoes: 4, itens: 18 });
	});

	it('afirmativas romanas viram um item por afirmativa, com o gabarito da alternativa certa', () => {
		// CGU2022-AFFC-TI-61, gabarito E = "II e III".
		expect(['I', 'II', 'III'].map((r) => porId.get(`q:CGU2022-AFFC-TI-61:${r}`)?.gabarito)).toEqual(['E', 'C', 'C']);
		expect(porId.has('q:CGU2022-AFFC-TI-61:A')).toBe(false);
		expect(romanosDaAlternativa('somente I e III')).toEqual(['I', 'III']);
		expect(romanosDaAlternativa('I, II e III.')).toEqual(['I', 'II', 'III']);
		expect(romanosDaAlternativa('Todas estão corretas')).toBe('todas');
		expect(romanosDaAlternativa('Nenhuma')).toEqual([]);
		expect(romanosDaAlternativa('apenas I e II estão incorretas')).toBeNull();
		const base = { id: 'q:X', tipo: 'questao', materia: 'm', enunciado: 'Estão certas:', formato: 'me', situacao: 'valida' };
		const alts = (...t: string[]) => t.map((texto, i) => ({ letra: 'ABCDE'[i], texto }));
		const todas = converterEmItens({ ...base, gabarito: 'C', alternativas: alts('somente I', 'somente II', 'Todas') });
		expect(todas.map((p: { id: string; gabarito: string }) => `${p.id}=${p.gabarito}`)).toEqual(['q:X:I=C', 'q:X:II=C']);
		// Uma alternativa que não é só romano ⇒ volta ao item por alternativa.
		const misto = converterEmItens({ ...base, gabarito: 'B', alternativas: alts('somente I', 'outra coisa') });
		expect(misto.map((p: { id: string; gabarito: string }) => `${p.id}=${p.gabarito}`)).toEqual(['q:X:A=E', 'q:X:B=C']);
		expect(() => converterEmItens({ ...base, gabarito: 'D', alternativas: alts('a', 'b') })).toThrow(/não é letra/);
	});

	it('texto-base, matéria, prova, número e situação', () => {
		const q = porId.get('q:TCU2026-AUFC-TI-113');
		expect(q.textoBase).toBeTruthy();
		expect(q.enunciado.startsWith('[')).toBe(false);
		expect(q.materia).toBe('ti-ciencia-de-dados');
		expect(q.prova).toEqual({ orgao: 'TCU', ano: 2026, cargo: 'AUFC TI', banca: 'Cebraspe' });
		expect(q.numero).toBe(113);
		expect(porId.get('q:TCU2015-BAS-91').textoBase).toContain('[20; 10; 10]');
		expect(porId.get('q:CGU2022-AFFC-TI-29:D').situacao).toBe('alterada');
	});

	it('topicoEstudo vem de topico_estudo; relatório conta questões e tópicos distintos', () => {
		expect(porId.get('q:TCU2026-AUFC-TI-113').topicoEstudo).toBe('CDA-11');
		expect(porId.get('q:CGU2022-AFFC-TI-29:A').topicoEstudo).toBe('AFO-05');
		expect(r.topicos).toEqual({ questoes: 8, distintos: 8 });
	});

	it('sem-topico sai do feed (fora do edital); vazio ou fora do padrão ⇒ sem o campo; fora do padrão avisa', () => {
		const base = linhas().find((l) => l.id === 'TCU2026-AUFC-TI-113')!;
		const rr = importarQuestoes([
			{ ...base, id: 'X-1', topico_estudo: '' },
			{ ...base, id: 'X-2', topico_estudo: 'sem-topico' },
			{ ...base, id: 'X-3', topico_estudo: 'fag-2' },
			{ ...base, id: 'X-4', topico_estudo: ' FAG-02 ' },
			{ ...base, id: 'X-5', topico_estudo: 'FAG-02' }
		]);
		expect(rr.posts.map((p) => p.id)).not.toContain('q:X-2');
		expect(rr.descartes['fora do edital']).toBe(1);
		const [vazio, fora, comEspaco, ok] = rr.posts;
		expect('topicoEstudo' in vazio).toBe(false);
		expect('topicoEstudo' in fora).toBe(false);
		expect(comEspaco.topicoEstudo).toBe('FAG-02');
		expect(ok.topicoEstudo).toBe('FAG-02');
		expect(rr.topicos).toEqual({ questoes: 2, distintos: 1 });
		expect(rr.avisos).toEqual(['questão X-3: topico_estudo fora do padrão ("fag-2") — ficou sem tópico']);
	});

	it('questão descartada não conta tópico', () => {
		const anulada = linhas().find((l) => l.situacao === 'anulada')!;
		const rr = importarQuestoes([{ ...anulada, topico_estudo: 'INF-01' }]);
		expect(rr.topicos).toEqual({ questoes: 0, distintos: 0 });
	});

	it('matéria desconhecida é erro claro', () => {
		const l = { ...linhas()[2], materia: 'Astrologia' };
		expect(() => importarQuestoes([l])).toThrow(/Matéria desconhecida: "Astrologia"/);
	});
});

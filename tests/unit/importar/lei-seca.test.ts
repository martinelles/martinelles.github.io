import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
	emendarLinhas,
	importarLei,
	montarTelas,
	numeroDaNorma,
	partirLinha,
	removerCabecalhosPdf,
	segmentarParagrafosAnexo,
	ultimaRedacao
} from '../../../scripts/importar/lei-seca.mjs';

const fixture = (nome: string) =>
	readFileSync(fileURLToPath(new URL(`./fixtures/vault/leis-secas/${nome}.md`, import.meta.url)), 'utf8');

/** Trechos reais do vault (leis-secas), fora do vault de fixture de ponta a ponta. */
const trecho = (nome: string) =>
	readFileSync(fileURLToPath(new URL(`./fixtures/leis/${nome}.md`, import.meta.url)), 'utf8');

const CAB = '# Lei no 1.234/2020 - Teste\n\n> Fonte oficial: https://www.planalto.gov.br/x.htm\n> Baixado em: 2026-09-18\n\n---\n\n';

describe('importarLei — LAI (trecho real)', () => {
	const r = importarLei('06-Lei-12527-2011-LAI', fixture('06-Lei-12527-2011-LAI'), 'outros-ramos-do-direito');
	const porId = new Map(r.posts.map((p) => [p.id, p]));

	it('um post por artigo, com id e rótulo estáveis; vetado inteiro é descartado', () => {
		expect(r.posts.map((p) => p.artigo)).toEqual(['Art. 1º', 'Art. 2º', 'Art. 3º', 'Art. 4º', 'Art. 5º', 'Art. 6º', 'Art. 7º']);
		expect(r.descartados).toBe(1);
		expect(porId.has('l:06-Lei-12527-2011-LAI:art-7')).toBe(true);
		expect([...r.chaves].sort()).toEqual(['1', '2', '3', '4', '5', '6', '7']);
	});

	it('norma, fonte oficial e matéria', () => {
		const p = porId.get('l:06-Lei-12527-2011-LAI:art-1');
		expect(p.norma).toEqual({
			arquivo: 'leis-secas/06-Lei-12527-2011-LAI.md',
			titulo: 'Lei no 12.527/2011 - Acesso a Informacao (LAI)',
			numero: '12.527/2011'
		});
		expect(p.fonte.url).toBe('https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm');
		expect(p.materia).toBe('outros-ramos-do-direito');
	});

	it('artigo termina antes do cabeçalho seguinte (não leva "## CAPÍTULO II")', () => {
		const art5 = porId.get('l:06-Lei-12527-2011-LAI:art-5');
		expect(art5.telas.join('\n')).not.toMatch(/CAPÍTULO|DO ACESSO A INFORMAÇÕES/);
	});

	it('artigo longo vira carrossel ≤ 700 por tela, sem perder texto; inciso vetado fica marcado', () => {
		const art7 = porId.get('l:06-Lei-12527-2011-LAI:art-7');
		expect(art7.telas.length).toBeGreaterThan(1);
		for (const t of art7.telas) expect(t.length).toBeLessThanOrEqual(700);
		const linhas = art7.telas.join('\n').split('\n');
		const fonte = fixture('06-Lei-12527-2011-LAI');
		for (const l of linhas) expect(fonte).toContain(l);
		expect(linhas[0]).toMatch(/^Art\. 7º O acesso/);
		expect(linhas.at(-1)).toMatch(/^§ 6º/);
		expect(art7.revogados).toHaveLength(1);
		expect(linhas[art7.revogados[0]]).toMatch(/^VIII\b.*\(VETADO\)/);
	});
});

describe('importarLei — Lei 12.813 (arquivo real inteiro)', () => {
	const r = importarLei('09-Lei-12813-2013-Conflito-de-Interesses', fixture('09-Lei-12813-2013-Conflito-de-Interesses'), 'outros-ramos-do-direito');
	it('descarta os vetados e o último artigo não leva assinatura nem rodapé', () => {
		expect(r.descartados).toBe(3);
		const ultimo = r.posts.at(-1);
		expect(ultimo.telas.join('\n')).not.toMatch(/Brasília|Este texto não substitui|DILMA/);
		for (const p of r.posts) expect(p.id).toMatch(/^l:09-Lei-12813-2013-Conflito-de-Interesses:art-\d+/);
	});
});

describe('importarLei — redação vigente (planalto sem tachado)', () => {
	it('Lei 8.112, Art. 67 (trecho real): redação antiga e depois a revogada → o artigo sai inteiro', () => {
		const r = importarLei('02-Lei-8112-1990-Regime-Juridico', trecho('8112-art-64-a-69'), 'direito-administrativo');
		expect(r.posts.map((p) => p.artigo)).toEqual(['Art. 64', 'Art. 65', 'Art. 66', 'Art. 68', 'Art. 69']);
		expect(r.posts.some((p) => p.id.endsWith(':art-67'))).toBe(false);
		expect(r.posts.map((p) => p.telas.join('\n')).join('\n')).not.toContain('adicional por tempo de serviço');
		expect(r.descartados).toBe(1);
		// Art. 67 antigo + Art. 68 antigo
		expect(r.substituidos).toBe(2);
		expect(r.posts.find((p) => p.artigo === 'Art. 68').telas[0]).toMatch(/^Art\. 68\. .*\(Redação dada/);
		// sem post de redação substituída (antes: art-67, art-68-2…)
		expect(r.posts.map((p) => p.id.split(':')[2])).toEqual(['art-64', 'art-65', 'art-66', 'art-68', 'art-69']);
	});

	it('Lei 12.813, Art. 9º (arquivo real): três redações, fica a última, que é a vigente', () => {
		const r = importarLei(
			'09-Lei-12813-2013-Conflito-de-Interesses',
			fixture('09-Lei-12813-2013-Conflito-de-Interesses'),
			'outros-ramos-do-direito'
		);
		const art9 = r.posts.filter((p) => p.artigo === 'Art. 9º');
		expect(art9).toHaveLength(1);
		expect(art9[0].id).toBe('l:09-Lei-12813-2013-Conflito-de-Interesses:art-9');
		const linhas = art9[0].telas.join('\n').split('\n');
		expect(linhas[0]).toMatch(/^Art\. 9º .*inclusive aqueles que se encontram em gozo de licença/);
		expect(linhas.slice(1).map((l: string) => l.split(' ')[0])).toEqual(['I', 'II', 'Parágrafo']);
		expect(r.substituidos).toBe(2);
	});

	it('LGPD (trechos reais): 55-B revogado na última redação sai; Art. 65 reescrito duas vezes fica a última; "Art. 5 7." não substitui o Art. 5º', () => {
		const r = importarLei('07-Lei-13709-2018-LGPD', trecho('lgpd-trechos'), 'outros-ramos-do-direito');
		expect(r.posts.map((p) => p.artigo)).toEqual(['Art. 5º', 'Art. 55-A', 'Art. 65']);
		const art5 = r.posts[0];
		expect(art5.id).toBe('l:07-Lei-13709-2018-LGPD:art-5');
		expect(art5.telas[0]).toMatch(/^Art\. 5º Para os fins desta Lei, considera-se:/);
		expect(art5.telas.join('\n')).not.toContain('VETADO');
		expect(r.avisos).toEqual(['07-Lei-13709-2018-LGPD: rótulo de artigo malformado ignorado: "Art. 5 7. (VETADO)."']);
		const art65 = r.posts[2].telas.join('\n');
		expect(art65).toMatch(/^Art\. 65\. Esta Lei entra em vigor: \(Redação dada pela Lei nº 13\.853, de 2019\)/);
		expect(art65).not.toMatch(/18 \(dezoito\) meses de sua|Redação dada pela Medida Provisória nº 869/);
		// o fecho "Brasília , 14 de agosto…" (com espaço antes da vírgula) não entra no último artigo
		expect(art65).not.toMatch(/Brasília|TEMER/);
		expect([...r.chaves]).toEqual(['5', '55-A', '65']);
		// 55-B (revogado na última redação) + 56 (vetado)
		expect(r.descartados).toBe(2);
		// 55-B antigo + duas redações anteriores do Art. 65
		expect(r.substituidos).toBe(3);
	});

	it('ultimaRedacao mantém a ordem da última ocorrência e separa escopos', () => {
		const t = (chave: string, escopo = '') => ({ rotulo: chave, chave, escopo, linhas: [chave + escopo] });
		const { vigentes, substituidos } = ultimaRedacao([t('1'), t('2'), t('1', 'ADCT'), t('2'), t('3')]);
		expect(vigentes.map((v) => v.linhas[0])).toEqual(['1', '1ADCT', '2', '3']);
		expect(substituidos).toBe(1);
	});
});

describe('importarLei — casos de rótulo', () => {
	it('Art. 10., Art. 1°-A, Art.246.; rótulo repetido é nova redação (fica só a última, sem sufixo -2)', () => {
		const texto =
			CAB +
			'Art. 1° Primeiro.\n\nArt. 1°-A Inserido.\n\nArt. 10. Décimo.\n\nArt.246. Colado.\n\nArt. 246. Nova redação.\n';
		const r = importarLei('99-Teste', texto, 'outras');
		expect(r.posts.map((p) => [p.id, p.artigo])).toEqual([
			['l:99-Teste:art-1', 'Art. 1º'],
			['l:99-Teste:art-1-a', 'Art. 1º-A'],
			['l:99-Teste:art-10', 'Art. 10'],
			['l:99-Teste:art-246', 'Art. 246']
		]);
		expect(r.posts[3].telas).toEqual(['Art. 246. Nova redação.']);
		expect(r.substituidos).toBe(1);
		expect([...r.chaves]).toEqual(['1', '1-A', '10', '246']);
	});

	it('mesmo número no corpo, no ADCT e no anexo são artigos diferentes (não se substituem)', () => {
		const texto =
			CAB +
			'Art. 1º Corpo.\n\nEste texto não substitui o publicado no DOU.\n\nATO DAS DISPOSIÇÕES CONSTITUCIONAIS TRANSITÓRIAS\n\nArt. 1º ADCT.\n\n## ANEXO I\n\nArt. 1º Anexo.\n';
		const r = importarLei('99-Teste', texto, 'outras');
		expect(r.posts.map((p) => p.artigo)).toEqual(['Art. 1º', 'ADCT Art. 1º', 'Anexo I Art. 1º']);
		expect(r.substituidos).toBe(0);
	});

	it('depois de "Este texto não substitui…" vem outro ato: "Art. 37 ......" não substitui o vigente', () => {
		const texto =
			CAB +
			'Art. 37. Vigente.\n\nEste texto não substitui o publicado no DOU.\n\nPartes vetadas mantidas pelo Congresso Nacional\n\nArt. 37 ..........................\n\n§ 2º Parte promulgada.\n';
		const r = importarLei('99-Teste', texto, 'outras');
		expect(r.posts.map((p) => p.telas)).toEqual([['Art. 37. Vigente.']]);
		expect(r.avisos.join('\n')).toMatch(/1 artigo\(s\) depois de "Este texto não substitui/);
	});

	it('depois do ADCT o rótulo ganha "ADCT"; revogado inteiro sai; revogado dentro fica', () => {
		const texto =
			CAB +
			'Art. 1º Vigente.\n\n§ 1º (Revogado pela Lei nº 2, de 2020)\n\n§ 2º Vigente.\n\nArt. 2º (Revogado pela Lei nº 3, de 2021)\n\nBrasília, 5 de outubro de 1988.\n\nFulano\n\nATO DAS DISPOSIÇÕES CONSTITUCIONAIS TRANSITÓRIAS\n\nArt. 1º. Transitório.\n';
		const r = importarLei('99-Teste', texto, 'outras');
		expect(r.descartados).toBe(1);
		expect(r.posts.map((p) => p.artigo)).toEqual(['Art. 1º', 'ADCT Art. 1º']);
		expect(r.posts[0].revogados).toEqual([1]);
		expect(r.posts[1].id).toBe('l:99-Teste:adct-art-1');
		expect(r.posts[1].telas).toEqual(['Art. 1º. Transitório.']);
	});

	it('dentro de anexo o rótulo ganha "Anexo N"', () => {
		const texto = CAB + 'Art. 1º Aprova o anexo.\n\n## ANEXO I\n\nArt. 1º Primeiro do anexo.\n';
		const r = importarLei('99-Teste', texto, 'outras');
		expect(r.posts.map((p) => p.id)).toEqual(['l:99-Teste:art-1', 'l:99-Teste:anexo-i-art-1']);
	});
});

describe('importarLei — normas sem "Art."', () => {
	const cabPdf =
		'# Manual\n\n> Fonte: https://www.gov.br/manual.pdf\n> Baixado em: 2026-09-18\n> PDF oficial salvo ao lado; o .md e a extracao de texto dele.\n\n---\n\n';

	it('trechos por item numerado, ignorando sumário e nota de rodapé; linhas de PDF emendadas', () => {
		const itens = ['1 PRIMEIRO', '1.1 Sub um', '1.2 Sub dois', '2 SEGUNDO', '2.1 A', '2.2 B', '2.2.1 C', '3 TERCEIRO', '3.1 D', '3.2 E'];
		const corpo = [
			'1 PRIMEIRO .......................... 3',
			'1.1 Sub um ........................ 4',
			...itens.flatMap((t, i) => [t, `Texto do item ${i} quebrado`, 'na linha seguinte.', i === 3 ? '2 BOYNTON, William C. Auditoria. p. 31.' : '7']),
			'REFERÊNCIAS',
			'ANDERSON, U. Internal Auditing.'
		];
		const r = importarLei('19-Manual', cabPdf + corpo.join('\n\n') + '\n', 'fundamentos-de-auditoria-governamental');
		expect(r.pulado).toBeUndefined();
		expect(r.posts.map((p) => p.artigo)).toEqual(itens.map((t) => `Item ${t.split(' ')[0]}`));
		expect(r.posts[0].telas).toEqual(['1 PRIMEIRO\nTexto do item 0 quebrado na linha seguinte.']);
		expect(r.posts[1].id).toBe('l:19-Manual:item-1-1');
		expect(r.posts.at(-1).telas.join('\n')).not.toContain('ANDERSON');
	});

	it('menos de 10 itens: arquivo pulado com aviso', () => {
		const r = importarLei('20-Curto', cabPdf + '1 UM\n\nTexto.\n\n2 DOIS\n\nTexto.\n', 'outras');
		expect(r.posts).toEqual([]);
		expect(r.pulado).toMatch(/só 2 itens/);
	});
});

describe('importarLei — PDF e anexos em prosa (trechos reais)', () => {
	it('MOT 2017: cabeçalho de página repetido sai antes da emenda e nunca cai no meio da frase', () => {
		const texto = trecho('mot-2017-inicio');
		expect(texto.match(/^Brasília, dez\. 2017$/gm)?.length).toBeGreaterThanOrEqual(10);
		const r = importarLei('19-MOT-CGU-2017-Auditoria-Interna', texto, 'fundamentos-de-auditoria-governamental');
		expect(r.pulado).toBeUndefined();
		expect(r.posts.length).toBeGreaterThanOrEqual(10);
		const tudo = r.posts.map((p) => p.telas.join('\n')).join('\n');
		expect(tudo).not.toMatch(/Ministério da Transparência e Controladoria-Geral da União|Brasília, dez\. 2017/);
		const item = r.posts.find((p) => p.artigo === 'Item 1.1.1.3');
		expect(item.telas.join(' ')).toContain('sem prejuízo do encaminhamento às demais partes interessadas');
		expect(r.avisos[0]).toMatch(/cabeçalho\/rodapé de página removido: "Brasília, dez\. 2017"/);
	});

	it('removerCabecalhosPdf: só linha curta, repetida ≥ 10 vezes, que não abre dispositivo nem fecha frase', () => {
		const linhas = [
			...Array.from({ length: 10 }, () => ['Cabeçalho Corrido', 'I - inciso', 'trabalho.']).flat(),
			'Cabeçalho raro'
		];
		const r = removerCabecalhosPdf(linhas);
		expect(r.removidas).toEqual(['Cabeçalho Corrido']);
		expect(r.linhas).toHaveLength(21);
	});

	it('IN SFC 3/2017: artigos da IN e o Referencial Técnico do anexo, um post por parágrafo numerado', () => {
		const r = importarLei(
			'20-IN-SFC-CGU-3-2017-Referencial-Auditoria',
			trecho('in-sfc-3-2017-trechos'),
			'fundamentos-de-auditoria-governamental'
		);
		const rotulos = r.posts.map((p) => p.artigo);
		expect(rotulos.slice(0, 4)).toEqual(['Art. 1º', 'Art. 2º', 'Art. 3º', 'Art. 4º']);
		// item 5 revogado sai; 20 e 26 aparecem em duas redações e fica a última
		expect(rotulos.slice(4)).toEqual(
			Array.from({ length: 26 }, (_, i) => i + 1)
				.filter((n) => n !== 5)
				.map((n) => `Referencial item ${n}`)
		);
		expect(r.posts[4].id).toBe('l:20-IN-SFC-CGU-3-2017-Referencial-Auditoria:referencial-item-1');
		expect(new Set(r.posts.map((p) => p.id)).size).toBe(r.posts.length);
		const item20 = r.posts.find((p) => p.artigo === 'Referencial item 20').telas.join('\n');
		expect(item20).toMatch(/^20\. No âmbito da terceira linha de defesa, a SFC, as Ciset e as unidades setoriais exercem a função/);
		expect(item20).toContain('(Redação dada pela Instrução Normativa SFC nº 07, de 2017)');
		expect(r.substituidos).toBe(2);
		expect(r.descartados).toBe(1);
		// parágrafo termina antes do título seguinte e o glossário não entra
		const tudo = r.posts.map((p) => p.telas.join('\n')).join('\n');
		expect(tudo).not.toMatch(/CAPÍTULO|Seção I|GLOSSÁRIO|Accountability:/);
		// parágrafo do anexo não vira chave de artigo (C-004)
		expect([...r.chaves]).toEqual(['1', '2', '3', '4']);
		expect(r.avisos).toEqual([]);
	});

	it('IN SFC 3/2017: subtítulo de seção sem # fecha o item e não entra em nenhum (itens 54–59 e 99–103 reais)', () => {
		// dois trechos reais do Referencial; os itens que faltam na sequência são preenchidos
		const [a, b] = trecho('in-sfc-3-2017-subtitulos')
			.split('[corte]')
			.map((t) =>
				t
					.split(/\r?\n/)
					.map((l) => l.trim())
					.filter((l) => l !== '' && !/^\d{1,4}$/.test(l))
			);
		const enche = (de: number, ate: number) =>
			Array.from({ length: ate - de + 1 }, (_, i) => `${de + i}. Parágrafo de enchimento.`);
		const itens = (linhas: string[]) => {
			const { trechos } = segmentarParagrafosAnexo(linhas, 'Referencial');
			return new Map(trechos.map((t) => [t.chave, emendarLinhas(t.linhas).join('\n')]));
		};
		const subtitulos = [
			'Sigilo Profissional',
			'Proficiência e Zelo Profissional',
			'Gerenciamento de Recursos',
			'Políticas, Procedimentos e Coordenação',
			'Reporte para a Alta Administração e o Conselho'
		];
		const r = itens([...enche(1, 53), ...a, ...enche(60, 98), ...b]);
		expect([...r.keys()]).toEqual(Array.from({ length: 103 }, (_, i) => String(i + 1)));
		const tudo = [...r.values()].join('\n');
		for (const s of subtitulos) expect(tudo).not.toContain(s);
		// antes, itens 99 e 102 terminavam com o subtítulo colado na mesma linha
		expect(r.get('99')).toMatch(/às respectivas Unidades Auditadas\. \(Redação dada pela Instrução Normativa SFC nº 07, de 2017\)$/);
		expect(r.get('102')).toMatch(/patrimônio público\. \(Redação dada pela Instrução Normativa SFC nº 07, de 2017\)$/);
		expect(r.get('100')).toMatch(/c\) eficazmente aplicados: utilizados de forma a atingir os objetivos do trabalho\.$/);
		expect(r.get('54')).toMatch(/critérios e evidências adequados e suficientes\.$/);
		// item 57 termina sem ponto na própria fonte: continua inteiro
		expect(r.get('57')).toMatch(/sem prévia anuência da autoridade competente$/);
		expect(r.get('58')).toMatch(/objeto da avaliação\.$/);

		// dois subtítulos seguidos (seção e subseção): os dois saem
		const i = a.indexOf('Proficiência e Zelo Profissional');
		const dois = [...a.slice(0, i + 1), 'Proficiência', ...a.slice(i + 1)];
		const r2 = itens([...enche(1, 53), ...dois]);
		expect(r2.get('58')).toMatch(/objeto da avaliação\.$/);
		expect(r2.get('59')).toMatch(/^59\. Proficiência e zelo profissional estão associados/);
		expect([...r2.values()].join('\n')).not.toMatch(/^Proficiência/m);
	});

	it('Decreto 1.171 (arquivo real): Código de Ética vira um post por inciso romano; revogados saem', () => {
		const r = importarLei('08-Decreto-1171-1994-Codigo-de-Etica', trecho('1171-codigo-de-etica'), 'outros-ramos-do-direito');
		const incisos = r.posts
			.filter((p) => p.artigo.startsWith('Código de Ética inciso '))
			.map((p) => p.artigo.split(' ').at(-1));
		expect(incisos).toEqual([
			'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVIII', 'XXII', 'XXIV'
		]);
		const xiv = r.posts.find((p) => p.artigo === 'Código de Ética inciso XIV').telas.join('\n').split('\n');
		expect(xiv[0]).toMatch(/^XIV - São deveres fundamentais/);
		expect(xiv.at(-1)).toMatch(/^v\) divulgar e informar/);
		expect(r.posts.find((p) => p.artigo === 'Código de Ética inciso XV').telas.join('\n')).not.toMatch(/Seção|COMISSÕES/);
		expect(r.avisos).toEqual([]);
	});
});

describe('telas', () => {
	it('quebra só entre linhas, cada tela ≤ 700', () => {
		const linhas = Array.from({ length: 10 }, (_, i) => `${'I'.repeat(i + 1)} - ${'x'.repeat(150)};`);
		const { telas } = montarTelas(linhas);
		for (const t of telas) expect(t.length).toBeLessThanOrEqual(700);
		expect(telas.join('\n').split('\n')).toEqual(linhas);
	});

	it('linha única > 700 quebra em fim de frase', () => {
		const frase = `${'palavra '.repeat(30).trim()}.`;
		const linha = Array.from({ length: 6 }, () => frase).join(' ');
		const partes = partirLinha(linha);
		expect(partes.length).toBeGreaterThan(1);
		for (const p of partes) {
			expect(p.length).toBeLessThanOrEqual(700);
			expect(p.endsWith('.')).toBe(true);
		}
		expect(partes.join(' ')).toBe(linha);
	});

	it('emendarLinhas junta linha quebrada de PDF mas não junta dispositivo novo', () => {
		expect(emendarLinhas(['Art. 1º Texto que', 'continua aqui.', 'I - inciso', 'Parágrafo único. Fim'])).toEqual([
			'Art. 1º Texto que continua aqui.',
			'I - inciso',
			'Parágrafo único. Fim'
		]);
	});

	it('numeroDaNorma', () => {
		expect(numeroDaNorma('Lei no 12.527/2011 - LAI')).toBe('12.527/2011');
		expect(numeroDaNorma('Instrucao Normativa SGD/ME no 94/2022 - x')).toBe('94/2022');
		expect(numeroDaNorma('Constituicao Federal de 1988')).toBeUndefined();
	});
});

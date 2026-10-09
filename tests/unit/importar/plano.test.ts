import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { formatarRelatorio, importar } from '../../../scripts/importar/index.mjs';
import { lerCsv } from '../../../scripts/importar/csv.mjs';
import { materiaPorId } from '../../../scripts/importar/materias.mjs';
import {
	DISCIPLINA_PARA_BLOCO,
	DISCIPLINA_PARA_MATERIA,
	PARAMETROS_PADRAO,
	importarPlano,
	lerParametros,
	serializarPlano
} from '../../../scripts/importar/plano.mjs';

const FIX = fileURLToPath(new URL('./fixtures/plano', import.meta.url));
const VAULT = fileURLToPath(new URL('./fixtures/vault', import.meta.url));
const ler = (arq: string) => readFileSync(join(FIX, arq), 'utf8');
const CSV = ler('ESTUDO.csv');
const MTIME = Date.UTC(2026, 8, 30, 22, 29, 20, 65);
const raiz = mkdtempSync(join(tmpdir(), 'painel-plano-'));
afterAll(() => rmSync(raiz, { recursive: true, force: true }));

/** Checagem própria (sem Ajv) de contracts/plano.schema.json. */
type Obj = Record<string, unknown>;
const ehObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const DATA = /^\d{4}-\d{2}-\d{2}$/;
function violacoesPlano(p: unknown): string[] {
	const erros: string[] = [];
	if (!ehObj(p)) return ['plano não é objeto'];
	const chaves = ['versao', 'geradoEm', 'inicio', 'fim', 'horasPorDia', 'minutosLeitura', 'minutosQuestoes', 'tarefas'];
	for (const k of Object.keys(p)) if (!chaves.includes(k)) erros.push(`${k} não permitido`);
	for (const k of chaves) if (!(k in p)) erros.push(`${k} ausente`);
	if (p.versao !== 1) erros.push('versao ≠ 1');
	if (typeof p.geradoEm !== 'string') erros.push('geradoEm não é texto');
	for (const k of ['inicio', 'fim']) if (typeof p[k] !== 'string' || !DATA.test(p[k] as string)) erros.push(`${k} inválido`);
	if (typeof p.horasPorDia !== 'number' || !(p.horasPorDia > 0)) erros.push('horasPorDia inválido');
	for (const k of ['minutosLeitura', 'minutosQuestoes'])
		if (!Number.isInteger(p[k]) || (p[k] as number) < 1) erros.push(`${k} inválido`);
	if (!Array.isArray(p.tarefas)) return [...erros, 'tarefas não é lista'];
	const campos = ['id', 'topicoId', 'modo', 'bloco', 'disciplina', 'materia', 'topico', 'minutos', 'prioridade', 'status'];
	for (const t of p.tarefas) {
		if (!ehObj(t)) {
			erros.push('tarefa não é objeto');
			continue;
		}
		const id = String(t.id);
		for (const k of Object.keys(t)) if (!campos.includes(k)) erros.push(`${id}.${k} não permitido`);
		for (const k of campos) if (!(k in t)) erros.push(`${id}.${k} ausente`);
		if (typeof t.id !== 'string' || !/^[A-Z]+-\d+:[LQ]$/.test(t.id)) erros.push(`${id}: id inválido`);
		if (typeof t.topicoId !== 'string' || !/^[A-Z]+-\d+$/.test(t.topicoId)) erros.push(`${id}: topicoId inválido`);
		if (!['leitura', 'questoes'].includes(t.modo as string)) erros.push(`${id}: modo inválido`);
		if (!['basicos', 'complementares', 'especificos'].includes(t.bloco as string)) erros.push(`${id}: bloco inválido`);
		if (typeof t.disciplina !== 'string') erros.push(`${id}: disciplina não é texto`);
		if (!(t.materia === null || typeof t.materia === 'string')) erros.push(`${id}: materia inválida`);
		if (typeof t.topico !== 'string' || t.topico.length < 1) erros.push(`${id}: topico vazio`);
		if (!Number.isInteger(t.minutos) || (t.minutos as number) < 1) erros.push(`${id}: minutos inválido`);
		if (typeof t.prioridade !== 'number') erros.push(`${id}: prioridade não é número`);
		if (!['nao_iniciado', 'estudado', 'revisado', 'travado'].includes(t.status as string)) erros.push(`${id}: status inválido`);
	}
	return erros;
}

describe('plano: fila', () => {
	const { plano, relatorio } = importarPlano({ csvTexto: CSV, parametros: null, mtime: MTIME });
	const ids = plano.tarefas.map((t) => t.id);
	const topicos = plano.tarefas.filter((t) => t.modo === 'leitura').map((t) => t.topicoId);

	it('exclui dominado e cortado (obs iniciada por CORTADO) e conta cada um', () => {
		expect(relatorio).toMatchObject({ linhas: 16, topicos: 14, tarefas: 28, excluidas: { dominado: 1, cortado: 1 } });
		expect(topicos).not.toContain('EPA-02');
		expect(topicos).not.toContain('OGS-22');
	});

	it('cada tópico gera :L e :Q consecutivas, nessa ordem (D4, FR-013)', () => {
		expect(ids).toEqual(topicos.flatMap((id) => [`${id}:L`, `${id}:Q`]));
		for (let i = 0; i < plano.tarefas.length; i += 2) {
			const [l, q] = [plano.tarefas[i], plano.tarefas[i + 1]];
			expect([l.modo, q.modo]).toEqual(['leitura', 'questoes']);
			expect([l.minutos, q.minutos]).toEqual([25, 20]);
			const semModo = (t: typeof l) => ({ ...t, id: t.topicoId, modo: null, minutos: null });
			expect(semModo(q)).toEqual(semModo(l));
		}
	});

	it('ordena tópicos por prioridade desc e, no empate, por id asc', () => {
		expect(topicos).toEqual([
			'AMI-01', 'EAG-01', 'EPA-01', 'OGS-01',
			'AGI-01', 'DPC-01', 'EDI-01', 'GRI-01', 'TOP-01',
			'ADP-01', 'EDC-01', 'EDC-02', 'EPR-01', 'SBD-01'
		]);
	});

	it('tarefa leva disciplina e tópico literais, bloco, status do CSV, prioridade numérica e minutos do modo', () => {
		const comum = {
			topicoId: 'EDC-02',
			bloco: 'basicos',
			disciplina: 'P1 · Estado, Democracia, Direitos e Ciência Política',
			materia: 'direito-constitucional',
			topico:
				'2 Democracia e representação. › 2.1 Representação e participação; responsabilização democrática; relações entre Executivo, Legislativo e Judiciário; governabilidade e controles recíprocos.',
			prioridade: 1,
			status: 'estudado'
		};
		const i = ids.indexOf('EDC-02:L');
		expect(plano.tarefas[i]).toEqual({ id: 'EDC-02:L', modo: 'leitura', ...comum, minutos: 25 });
		expect(plano.tarefas[i + 1]).toEqual({ id: 'EDC-02:Q', modo: 'questoes', ...comum, minutos: 20 });
		expect(Object.keys(plano.tarefas[i])).toEqual([
			'id', 'topicoId', 'modo', 'bloco', 'disciplina', 'materia', 'topico', 'minutos', 'prioridade', 'status'
		]);
	});

	it('bloco por disciplina = prova objetiva do edital (P1 básicos, P2 complementares, P3 específicos)', () => {
		for (const [d, b] of Object.entries(DISCIPLINA_PARA_BLOCO))
			expect(b, d).toBe({ P1: 'basicos', P2: 'complementares', P3: 'especificos' }[d.slice(0, 2)]);
		for (const t of plano.tarefas) expect(t.bloco, t.id).toBe(DISCIPLINA_PARA_BLOCO[t.disciplina]);
		expect(relatorio.porBloco).toEqual({ basicos: 10, complementares: 10, especificos: 8 });
	});

	it('as 13 disciplinas reais (fixture copiada do ESTUDO.csv) têm matéria existente no feed', () => {
		const reais = [...new Set((lerCsv(CSV) as Record<string, string>[]).map((l) => l.disciplina))];
		expect(reais).toHaveLength(13);
		expect(Object.keys(DISCIPLINA_PARA_MATERIA).sort()).toEqual([...reais].sort());
		expect(Object.keys(DISCIPLINA_PARA_BLOCO).sort()).toEqual([...reais].sort());
		for (const d of reais) expect(materiaPorId(DISCIPLINA_PARA_MATERIA[d]), d).toBeDefined();
		expect(DISCIPLINA_PARA_MATERIA['P3 · Aprendizado de Máquina e Inteligência Artificial']).toBe('ti-ciencia-de-dados');
		expect(DISCIPLINA_PARA_MATERIA['P2 · Fundamentos de Auditoria Governamental e Atuação Integrada da CGU']).toBe(
			'fundamentos-de-auditoria-governamental'
		);
		expect(relatorio.semMateria).toEqual([]);
		expect(relatorio.avisos).toEqual([]);
	});

	it('disciplina sem bloco é erro claro (D4)', () => {
		const csv = CSV.replace(/\n$/, '') + '\nXYZ-01,Disciplina Nova,Tópico x,1,nao_iniciado,0,0,,,2026-10-01,,,,9.00,\n';
		expect(() => importarPlano({ csvTexto: csv, mtime: MTIME })).toThrow(
			/\(XYZ-01\): disciplina "Disciplina Nova" sem bloco em DISCIPLINA_PARA_BLOCO/
		);
	});

	it('linha ruim é erro claro (status desconhecido, prioridade vazia, id repetido)', () => {
		const base = CSV.replace(/\n$/, '');
		expect(() => importarPlano({ csvTexto: `${base}\nXYZ-01,P1 · Ética Pública e Responsabilidade Profissional,T,1,lendo,0,0,,,,,,,1,\n`, mtime: 0 })).toThrow(/status desconhecido "lendo"/);
		expect(() => importarPlano({ csvTexto: `${base}\nXYZ-01,P1 · Ética Pública e Responsabilidade Profissional,T,1,nao_iniciado,0,0,,,,,,,,\n`, mtime: 0 })).toThrow(/prioridade não numérica/);
		expect(() => importarPlano({ csvTexto: `${base}\nEDC-01,D,T,1,nao_iniciado,0,0,,,,,,,1,\n`, mtime: 0 })).toThrow(/id repetido EDC-01/);
	});

	it('saída casa com contracts/plano.schema.json e geradoEm = mtime truncado ao segundo', () => {
		expect(violacoesPlano(JSON.parse(serializarPlano(plano)))).toEqual([]);
		expect(plano.geradoEm).toBe('2026-09-30T22:29:20.000Z');
	});

	it('determinístico: mesma entrada, mesmos bytes; uma tarefa por linha', () => {
		const outra = importarPlano({ csvTexto: CSV, parametros: null, mtime: MTIME }).plano;
		const texto = serializarPlano(plano);
		expect(serializarPlano(outra)).toBe(texto);
		expect(texto.split('\n')).toHaveLength(28 + 3);
		expect(JSON.parse(texto)).toEqual(plano);
	});
});

describe('plano: parâmetros', () => {
	it('sem arquivo: padrão de D2', () => {
		const r = lerParametros(null);
		expect(r.parametros).toEqual({
			inicio: '2026-10-09',
			fim: '2026-12-12',
			horasPorDia: 3,
			minutosLeitura: 25,
			minutosQuestoes: 20
		});
		expect(r.parametros).toEqual(PARAMETROS_PADRAO);
		expect(Object.values(r.origem)).toEqual(['padrão', 'padrão', 'padrão', 'padrão', 'padrão']);
	});

	it('do arquivo: todos os campos, e minutos das tarefas seguem minutos_leitura / minutos_questoes', () => {
		const { plano, relatorio } = importarPlano({ csvTexto: CSV, parametros: ler('plano.md'), mtime: MTIME });
		expect(plano).toMatchObject({
			inicio: '2026-11-02',
			fim: '2027-01-31',
			horasPorDia: 2.5,
			minutosLeitura: 30,
			minutosQuestoes: 15
		});
		expect(plano.tarefas.every((t) => t.minutos === (t.modo === 'leitura' ? 30 : 15))).toBe(true);
		expect(Object.values(relatorio.origemParametros)).toEqual(['arquivo', 'arquivo', 'arquivo', 'arquivo', 'arquivo']);
		expect(relatorio.avisos).toEqual([]);
	});

	it('minutos_por_tarefa (pré-D4) é ignorada com aviso, sem mexer nos minutos', () => {
		const r = lerParametros('---\nminutos_por_tarefa: 45\nminutos_questoes: 10\n---\n');
		expect(r.parametros).toEqual({ ...PARAMETROS_PADRAO, minutosQuestoes: 10 });
		expect(r.avisos).toEqual([expect.stringMatching(/chave "minutos_por_tarefa" ignorada: deixou de existir na emenda D4/)]);
	});

	it('arquivo parcial: chave ausente fica no padrão; chave desconhecida vira aviso', () => {
		const r = lerParametros(ler('plano-parcial.md'));
		expect(r.parametros).toEqual({ ...PARAMETROS_PADRAO, fim: '2027-02-15' });
		expect(r.origem).toEqual({
			inicio: 'padrão',
			fim: 'arquivo',
			horasPorDia: 'padrão',
			minutosLeitura: 'padrão',
			minutosQuestoes: 'padrão'
		});
		expect(r.avisos).toEqual([expect.stringContaining('chave "atualizado" ignorada')]);
	});

	it.each([
		['inicio: 2026-02-30', /inicio deve ser uma data real/],
		['fim: 20/12/2026', /fim deve ser uma data real/],
		['inicio: 2026-12-13', /inicio \(2026-12-13\) depois de fim \(2026-12-12\)/],
		['horas_por_dia: 0', /horas_por_dia deve ser um número maior que zero/],
		['horas_por_dia: "3"', /horas_por_dia deve ser um número maior que zero/],
		['minutos_leitura: 25.5', /minutos_leitura deve ser um inteiro maior que zero/],
		['minutos_leitura: 0', /minutos_leitura deve ser um inteiro maior que zero/],
		['minutos_questoes: -1', /minutos_questoes deve ser um inteiro maior que zero/],
		['minutos_questoes: "20"', /minutos_questoes deve ser um inteiro maior que zero/]
	])('inválido é erro fatal com mensagem clara: %s', (linha, msg) => {
		const texto = `---\n${linha}\n---\n`;
		expect(() => lerParametros(texto)).toThrow(/^feed-conteudo\/plano\.md: /);
		expect(() => importarPlano({ csvTexto: CSV, parametros: texto, mtime: 0 })).toThrow(msg);
	});
});

describe('plano: importação completa (index.mjs)', () => {
	const bytes = (dir: string) =>
		Object.fromEntries(readdirSync(dir).sort().map((f) => [f, readFileSync(join(dir, f), 'utf8')]));
	const vault = join(raiz, 'vault');
	cpSync(VAULT, vault, { recursive: true });
	cpSync(join(FIX, 'ESTUDO.csv'), join(vault, 'ESTUDO.csv'));
	writeFileSync(join(vault, 'feed-conteudo', 'plano.md'), ler('plano.md'));

	it('escreve plano.json sem mudar os demais arquivos nem o geradoEm do índice', () => {
		const sem = join(raiz, 'sem');
		const com = join(raiz, 'com');
		const relSem = importar({ vault: VAULT, saida: sem });
		const rel = importar({ vault, saida: com });
		const { 'plano.json': plano, ...resto } = bytes(com);
		expect(resto).toEqual(bytes(sem));
		expect(violacoesPlano(JSON.parse(plano))).toEqual([]);
		expect(JSON.parse(plano).tarefas).toHaveLength(28);
		expect(relSem.plano).toBeNull();
		expect(relSem.avisos).toContain('ESTUDO.csv ausente: plano.json não gerado');
		expect(rel.plano).toMatchObject({ tarefas: 28, topicos: 14, excluidas: { dominado: 1, cortado: 1 }, semMateria: [] });
		const texto = formatarRelatorio(rel);
		expect(texto).toContain('Plano: 28 tarefas (leitura + questões) de 14 tópicos na fila, 16 no ESTUDO.csv');
		expect(texto).toContain('por bloco: básicos 10, complementares 10, específicos 8');
		expect(texto).toContain('excluídas: dominado 1, cortado 1');
		expect(texto).toContain('sem matéria: 0');
		expect(texto).toContain('parâmetros: 2026-11-02 a 2027-01-31, 2.5 h/dia, leitura 30 min, questões 15 min');
		expect(formatarRelatorio(relSem)).toContain('Plano: não gerado (sem ESTUDO.csv)');
	});

	it('duas execuções geram bytes idênticos', () => {
		const a = join(raiz, 'x');
		const b = join(raiz, 'y');
		importar({ vault, saida: a });
		importar({ vault, saida: b });
		expect(bytes(b)).toEqual(bytes(a));
	});

	it('parâmetro inválido: erro fatal e a saída anterior fica intacta', () => {
		const saida = join(raiz, 'z');
		importar({ vault, saida });
		const antes = bytes(saida);
		const ruim = join(raiz, 'vault-ruim');
		cpSync(vault, ruim, { recursive: true });
		writeFileSync(join(ruim, 'feed-conteudo', 'plano.md'), '---\nfim: 2026-13-01\n---\n');
		expect(() => importar({ vault: ruim, saida })).toThrow(/plano\.md: fim deve ser uma data real/);
		expect(bytes(saida)).toEqual(antes);
		expect(existsSync(join(saida, 'plano.json'))).toBe(true);
	});
});

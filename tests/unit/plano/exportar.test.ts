import { describe, expect, it } from 'vitest';
import { exportarCsv, nomeArquivoExportacao } from '$lib/plano/exportar';
import type { RegistroTarefa } from '$lib/plano/tipos';
import { dadosVazios, L, local, planoTeste, Q } from './apoio';

const MIN = 60_000;
const CAB = 'id,ultima_sessao,minutos,questoes_feitas,questoes_certas,status_sugerido';

/** Registro concluído em `fim` depois de `ms` cronometrados. */
const feito = (fim: number, ms: number, q: [number, number] | null = null): RegistroTarefa => ({
	dia: new Date(fim).toISOString().slice(0, 10),
	intervalos: ms > 0 ? [[fim - ms, fim]] : [],
	rodandoDesde: null,
	concluidaEm: new Date(fim).toISOString(),
	questoes: q?.[0] ?? null,
	certas: q?.[1] ?? null
});

describe('exportarCsv (emenda D4: uma linha por tópico)', () => {
	it('byte a byte: BOM, cabeçalho, CRLF, soma :L + :Q, questões da :Q, estudado só com as duas, ordem pela 1ª conclusão', () => {
		const dados = dadosVazios();
		// Tópico 2: :L em 01/10 22:00 (24 min 31 s), :Q em 02/10 21:10 (25 min 29 s, 12/9) ⇒ 50 min, estudado.
		dados.registros[Q(2)] = feito(local('2026-10-02', 21, 10), 25 * MIN + 29_000, [12, 9]);
		dados.registros[L(2)] = feito(local('2026-10-01', 22, 0), 24 * MIN + 31_000);
		// Tópico 1: só a :L concluída (primeira conclusão do arquivo) ⇒ sem questões, sem status.
		dados.registros[L(1)] = feito(local('2026-10-01', 21, 0), 25 * MIN);
		// Tópico 3: :Q concluída antes da :L, que está em andamento ⇒ minutos só da :Q, sem status.
		dados.registros[Q(3)] = feito(local('2026-10-02', 8, 0), 20 * MIN, [0, 0]);
		dados.registros[L(3)] = { dia: '2026-10-02', intervalos: [[0, MIN]], rodandoDesde: local('2026-10-02', 9), concluidaEm: null, questoes: null, certas: null };
		// Tópico 4: nada concluído ⇒ fora do arquivo.
		dados.registros[L(4)] = { dia: '2026-10-02', intervalos: [[0, 30 * MIN]], rodandoDesde: null, concluidaEm: null, questoes: null, certas: null };
		// Tópico que sumiu do plano numa nova importação: continua exportado.
		dados.registros['SUMIU-01:L'] = feito(local('2026-10-02', 10, 0), 25 * MIN);
		dados.registros['SUMIU-01:Q'] = feito(local('2026-10-02', 10, 30), 20 * MIN, [5, 5]);
		const csv = exportarCsv(planoTeste(), dados);
		expect(csv).toBe(
			'﻿' +
				CAB +
				'\r\n' +
				'TST-01,2026-10-01,25,,,\r\n' +
				'TST-02,2026-10-02,50,12,9,estudado\r\n' +
				'TST-03,2026-10-02,20,0,0,\r\n' +
				'SUMIU-01,2026-10-02,45,5,5,estudado\r\n'
		);
		expect(new TextEncoder().encode(csv).slice(0, 3)).toEqual(new Uint8Array([0xef, 0xbb, 0xbf]));
	});

	it('uma linha por tópico, sem :L/:Q no id; empate de primeira conclusão pelo topicoId', () => {
		const dados = dadosVazios();
		const t = local('2026-10-05', 20);
		dados.registros[L(9)] = feito(t, 0);
		dados.registros[Q(9)] = feito(t + MIN, 0);
		dados.registros[L(8)] = feito(t, 0);
		const linhas = exportarCsv(planoTeste(), dados).split('\r\n');
		expect(linhas.slice(1, -1)).toEqual(['TST-08,2026-10-05,0,,,', 'TST-09,2026-10-05,0,,,estudado']);
		expect(linhas.at(-1)).toBe('');
	});

	it('sem tarefa concluída: só o cabeçalho', () => {
		expect(exportarCsv(planoTeste(), dadosVazios())).toBe('﻿' + CAB + '\r\n');
	});

	it('aspas quando o campo tem vírgula ou aspas', () => {
		const dados = dadosVazios();
		dados.registros['A,"B:L'] = feito(local('2026-10-01'), 0);
		expect(exportarCsv(planoTeste(), dados).split('\r\n')[1]).toBe('"A,""B",2026-10-01,0,,,');
	});

	it('nome do arquivo', () => {
		expect(nomeArquivoExportacao('2026-10-01')).toBe('progresso-plano-2026-10-01.csv');
	});
});

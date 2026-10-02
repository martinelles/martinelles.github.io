import { describe, expect, it } from 'vitest';
import {
	concluidasNaMissao,
	minutosEstimados,
	missaoDoDia,
	percentualMissao,
	percentualPlano,
	primeiraPendente,
	tarefasConcluidas
} from '$lib/plano/missao';
import { concluir, dadosVazios, isoLocal, L, planoTeste, Q, tarefa, topico } from './apoio';

const ids = (ts: { id: string }[]) => ts.map((t) => t.id);
/** Ids `:L`, `:Q` dos tópicos `ns`, na ordem da fila. */
const pares = (...ns: number[]) => ns.flatMap((n) => [L(n), Q(n)]);

describe('missaoDoDia', () => {
	it('sem foto: as próximas pendentes que cabem em 3 h — 4 tópicos inteiros (8 × 25/20 min)', () => {
		const m = missaoDoDia(planoTeste(), dadosVazios(), '2026-10-01');
		expect(ids(m)).toEqual(pares(1, 2, 3, 4));
		expect(m.map((t) => t.modo)).toEqual(['leitura', 'questoes', 'leitura', 'questoes', 'leitura', 'questoes', 'leitura', 'questoes']);
		expect(minutosEstimados(m)).toBe(180);
	});

	it('rolagem: dia 1 incompleto ⇒ dia 2 começa pela pendente (FR-006)', () => {
		const plano = planoTeste();
		const dados = dadosVazios();
		dados.fotos['2026-10-01'] = ids(missaoDoDia(plano, dados, '2026-10-01'));
		concluir(dados, pares(1, 2), isoLocal('2026-10-01', 20));
		expect(percentualMissao(missaoDoDia(plano, dados, '2026-10-01'), dados)).toBe(0.5);
		const dia2 = missaoDoDia(plano, dados, '2026-10-02');
		expect(ids(dia2)).toEqual(pares(3, 4, 5, 6));
		expect(primeiraPendente(dia2, dados)?.id).toBe(L(3));
	});

	it('borda (D4): par que cabe nunca é cortado; se a :L cabe e a :Q não, a :Q abre a missão seguinte', () => {
		const plano = planoTeste();
		const dados = dadosVazios();
		// Dia 1: fez tudo menos a :Q do tópico 4 ⇒ dia 2 começa por ela (20 min) e sobram 160 min.
		dados.fotos['2026-10-01'] = ids(missaoDoDia(plano, dados, '2026-10-01'));
		concluir(dados, [...pares(1, 2, 3), L(4)], isoLocal('2026-10-01', 21));
		const dia2 = missaoDoDia(plano, dados, '2026-10-02');
		// 20 + 3·45 = 155; a :L do tópico 8 (25) ainda cabe (180), a :Q dele (20) não.
		expect(ids(dia2)).toEqual([Q(4), ...pares(5, 6, 7), L(8)]);
		expect(minutosEstimados(dia2)).toBe(180);
		dados.fotos['2026-10-02'] = ids(dia2);
		concluir(dados, ids(dia2), isoLocal('2026-10-02', 21));
		// Dia 3: a :Q que ficou para fora abre a missão, colada à :L da véspera na fila.
		const dia3 = missaoDoDia(plano, dados, '2026-10-03');
		expect(ids(dia3)[0]).toBe(Q(8));
		expect(primeiraPendente(dia3, dados)?.id).toBe(Q(8));
	});

	it('borda (D4): nenhuma missão sem foto separa um par que caberia inteiro', () => {
		// Qualquer ponto de partida na fila: se :L entra e :L+:Q cabe no que sobra, :Q entra junto.
		const plano = planoTeste(30);
		for (let feitas = 0; feitas < 20; feitas++) {
			const dados = concluir(dadosVazios(), ids(plano.tarefas.slice(0, feitas)), isoLocal('2026-10-01'));
			const m = missaoDoDia(plano, dados, '2026-10-02');
			const ultima = m[m.length - 1];
			if (ultima.modo === 'leitura') expect(minutosEstimados(m) + 20).toBeGreaterThan(180);
			expect(minutosEstimados(m)).toBeLessThanOrEqual(180);
		}
	});

	it('foto estável depois de concluir tarefa extra', () => {
		const plano = planoTeste();
		const dados = dadosVazios();
		dados.fotos['2026-10-01'] = ids(missaoDoDia(plano, dados, '2026-10-01'));
		concluir(dados, [...pares(1, 2, 3, 4), L(5)], isoLocal('2026-10-01', 21));
		const m = missaoDoDia(plano, dados, '2026-10-01');
		expect(ids(m)).toEqual(pares(1, 2, 3, 4));
		expect(concluidasNaMissao(m, dados)).toBe(8);
		expect(percentualMissao(m, dados)).toBe(1);
		expect(primeiraPendente(m, dados)).toBeNull();
		expect(ids(missaoDoDia(plano, dados, '2026-10-02'))).toEqual([Q(5), ...pares(6, 7, 8), L(9)]);
	});

	it('tarefa em andamento (sem concluidaEm) continua pendente', () => {
		const dados = dadosVazios();
		dados.registros[L(1)] = { dia: '2026-10-01', intervalos: [[0, 60_000]], rodandoDesde: null, concluidaEm: null, questoes: null, certas: null };
		expect(ids(missaoDoDia(planoTeste(), dados, '2026-10-02'))[0]).toBe(L(1));
	});

	it('mínimo 1: tarefa maior que o dia entra sozinha', () => {
		expect(ids(missaoDoDia(planoTeste(5, { horasPorDia: 0.25 }), dadosVazios(), '2026-10-01'))).toEqual([L(1)]);
	});

	it('segue a ordem da fila: para na primeira que não cabe, sem pular', () => {
		const plano = planoTeste(0, { tarefas: [...topico(1, 60, 30), tarefa(2, 'leitura', 120), tarefa(2, 'questoes', 10)] });
		expect(ids(missaoDoDia(plano, dadosVazios(), '2026-10-01'))).toEqual(pares(1));
		const exato = planoTeste(0, { tarefas: [...topico(1, 90, 90), ...topico(2, 1, 1)] });
		expect(ids(missaoDoDia(exato, dadosVazios(), '2026-10-01'))).toEqual(pares(1));
	});

	it('fila esgotada ⇒ [], 0 % e nada para iniciar', () => {
		const plano = planoTeste(3);
		const dados = concluir(dadosVazios(), pares(1, 2, 3), isoLocal('2026-10-01'));
		const m = missaoDoDia(plano, dados, '2026-10-02');
		expect(m).toEqual([]);
		expect(percentualMissao(m, dados)).toBe(0);
		expect(minutosEstimados(m)).toBe(0);
		expect(primeiraPendente(m, dados)).toBeNull();
		expect(missaoDoDia(planoTeste(0), dadosVazios(), '2026-10-01')).toEqual([]);
	});

	it('foto com tópico que sumiu do plano: omitido da missão', () => {
		const dados = dadosVazios();
		dados.fotos['2026-10-01'] = ['SUMIU-01:L', 'SUMIU-01:Q', L(1)];
		expect(ids(missaoDoDia(planoTeste(), dados, '2026-10-01'))).toEqual([L(1)]);
	});
});

describe('percentualPlano', () => {
	it('concluídas ÷ tarefas da fila (L e Q contam cada uma); zero sem registro; ignora tarefa fora do plano', () => {
		const plano = planoTeste(4);
		expect(percentualPlano(plano, dadosVazios())).toBe(0);
		const dados = concluir(dadosVazios(), [L(1), Q(1), 'SUMIU-01:L'], isoLocal('2026-10-01'));
		expect(tarefasConcluidas(plano, dados)).toBe(2);
		expect(percentualPlano(plano, dados)).toBe(0.25);
		expect(percentualPlano(planoTeste(0), dados)).toBe(0);
	});
});

describe('foto obsoleta (ids de antes da emenda D4)', () => {
	it('foto só com ids que sumiram do plano é ignorada: a missão é recalculada', async () => {
		const { missaoDoDia, fotoObsoleta, filaEsgotada } = await import('$lib/plano/missao');
		const { planoTeste } = await import('./apoio');
		const plano = planoTeste(6);
		const dados = { registros: {}, fotos: { '2026-10-02': ['TST-01', 'TST-02', 'TST-03'] } };
		expect(fotoObsoleta(plano, dados, '2026-10-02')).toBe(true);
		const missao = missaoDoDia(plano, dados, '2026-10-02');
		expect(missao.length).toBeGreaterThan(0);
		expect(missao[0].id).toBe(plano.tarefas[0].id);
		expect(filaEsgotada(plano, dados)).toBe(false);
	});

	it('foto vazia de propósito (fila esgotada) não é obsoleta; foto com algum id válido é mantida', async () => {
		const { fotoObsoleta } = await import('$lib/plano/missao');
		const { planoTeste } = await import('./apoio');
		const plano = planoTeste(2);
		expect(fotoObsoleta(plano, { registros: {}, fotos: { d: [] } }, 'd')).toBe(false);
		expect(fotoObsoleta(plano, { registros: {}, fotos: { d: ['TST-01', plano.tarefas[0].id] } }, 'd')).toBe(false);
		expect(fotoObsoleta(plano, { registros: {}, fotos: {} }, 'd')).toBe(false);
	});
});

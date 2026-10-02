import { beforeEach, describe, expect, it } from 'vitest';
import { CHAVE_PLANO, carregarRegistro, registro } from '$lib/plano/registro.svelte';
import { minutosEstudados, horasEstudadas } from '$lib/plano/horas';
import { local, StorageFalso, StorageQueLanca, StorageSoLeitura } from './apoio';

const S = 1_000;
const MIN = 60 * S;
const H = 60 * MIN;
const T0 = Date.UTC(2026, 9, 1, 13, 0, 0);

let arm: StorageFalso;
const gravado = () => arm.getItem(CHAVE_PLANO);
/** "Fecha o app" e reabre: estado novo lido do armazenamento. */
const reabrir = () => carregarRegistro(arm);

beforeEach(() => {
	arm = new StorageFalso();
	carregarRegistro(arm);
});

describe('registro — formato e transições', () => {
	it('chave e formato byte a byte do contrato', () => {
		registro.iniciar('CDA-01:Q', '2026-10-01', T0);
		registro.pausar('CDA-01:Q', T0 + 10 * MIN);
		registro.concluir('CDA-01:Q', { questoes: 10, certas: 7 }, T0 + 20 * MIN);
		registro.gravarFoto('2026-10-01', ['CDA-01:Q', 'CDA-02:L']);
		expect(arm.length).toBe(1);
		expect(arm.key(0)).toBe('painel-concurso:plano:v1');
		expect(gravado()).toBe(
			'{"registros":{"CDA-01:Q":{"dia":"2026-10-01","intervalos":[[' +
				T0 +
				',' +
				(T0 + 10 * MIN) +
				']],"rodandoDesde":null,"concluidaEm":"2026-10-01T13:20:00.000Z","questoes":10,"certas":7}},' +
				'"fotos":{"2026-10-01":["CDA-01:Q","CDA-02:L"]}}'
		);
	});

	it('iniciar → pausar → retomar → concluir acumula o tempo; concluir fecha o intervalo aberto', () => {
		registro.iniciar('A:Q', '2026-10-01', T0);
		expect(registro.rodando()).toBe('A:Q');
		registro.pausar('A:Q', T0 + 10 * MIN);
		expect(registro.rodando()).toBeNull();
		registro.retomar('A:Q', T0 + 30 * MIN);
		registro.concluir('A:Q', undefined, T0 + 45 * MIN);
		const r = registro.doTarefa('A:Q')!;
		expect(r.intervalos).toEqual([
			[T0, T0 + 10 * MIN],
			[T0 + 30 * MIN, T0 + 45 * MIN]
		]);
		expect(r.rodandoDesde).toBeNull();
		expect(r.concluidaEm).toBe(new Date(T0 + 45 * MIN).toISOString());
		expect(r.questoes).toBeNull();
		expect(minutosEstudados(r, T0 + 99 * H)).toBe(25);
		expect(registro.rodando()).toBeNull();
	});

	it('iniciar outra tarefa pausa a primeira (um só cronômetro)', () => {
		registro.iniciar('A:Q', '2026-10-01', T0);
		registro.iniciar('B', '2026-10-01', T0 + 5 * MIN);
		expect(registro.rodando()).toBe('B');
		expect(registro.doTarefa('A:Q')).toMatchObject({ rodandoDesde: null, intervalos: [[T0, T0 + 5 * MIN]] });
		registro.retomar('A:Q', T0 + 8 * MIN);
		expect(registro.rodando()).toBe('A:Q');
		expect(registro.doTarefa('B')).toMatchObject({ rodandoDesde: null, intervalos: [[T0 + 5 * MIN, T0 + 8 * MIN]] });
		expect(horasEstudadas(registro.dados(), T0 + 10 * MIN) * 60).toBeCloseTo(10, 9);
	});

	it('iniciar de novo uma tarefa pausada retoma, sem trocar o dia', () => {
		registro.iniciar('A:Q', '2026-10-01', T0);
		registro.pausar('A:Q', T0 + MIN);
		registro.iniciar('A:Q', '2026-10-05', T0 + 2 * MIN);
		expect(registro.doTarefa('A:Q')).toMatchObject({ dia: '2026-10-01', rodandoDesde: T0 + 2 * MIN });
	});

	it('transições inválidas não mudam nada nem gravam', () => {
		registro.pausar('X', T0);
		registro.retomar('X', T0);
		expect(registro.doTarefa('X')).toBeNull();
		registro.iniciar('A:Q', '2026-10-01', T0);
		const escritas = arm.escritas;
		registro.iniciar('A:Q', '2026-10-01', T0 + MIN); // já rodando
		registro.retomar('A:Q', T0 + MIN); // já rodando
		expect(arm.escritas).toBe(escritas);
		registro.concluir('A:Q', undefined, T0 + 2 * MIN);
		const depois = gravado();
		registro.iniciar('A:Q', '2026-10-02', T0 + 3 * MIN);
		registro.retomar('A:Q', T0 + 3 * MIN);
		registro.pausar('A:Q', T0 + 3 * MIN);
		registro.concluir('A:Q', { questoes: 5, certas: 5 }, T0 + 4 * MIN); // concluir é definitivo
		expect(gravado()).toBe(depois);
	});

	it('certas ≤ questões (e inteiros ≥ 0): inválido lança sem mudar o estado', () => {
		registro.iniciar('A:Q', '2026-10-01', T0);
		const antes = gravado();
		expect(() => registro.concluir('A:Q', { questoes: 3, certas: 4 }, T0 + MIN)).toThrow(RangeError);
		expect(() => registro.concluir('A:Q', { questoes: -1, certas: 0 }, T0 + MIN)).toThrow(RangeError);
		expect(() => registro.concluir('A:Q', { questoes: 2.5, certas: 1 }, T0 + MIN)).toThrow(RangeError);
		expect(gravado()).toBe(antes);
		expect(registro.rodando()).toBe('A:Q');
		registro.concluir('A:Q', { questoes: 4, certas: 4 }, T0 + MIN);
		expect(registro.doTarefa('A:Q')).toMatchObject({ questoes: 4, certas: 4 });
	});

	it('emenda D4: questões só na tarefa :Q — em :L (ou id sem sufixo) lança RangeError sem mudar nada', () => {
		registro.iniciar('CDA-01:L', '2026-10-01', T0);
		const antes = gravado();
		expect(() => registro.concluir('CDA-01:L', { questoes: 10, certas: 7 }, T0 + MIN)).toThrow(RangeError);
		expect(() => registro.concluir('CDA-01:L', { questoes: 0, certas: 0 }, T0 + MIN)).toThrow(/tarefa de Questões/);
		expect(() => registro.concluir('CDA-01', { questoes: 1, certas: 1 }, T0 + MIN)).toThrow(RangeError);
		expect(gravado()).toBe(antes);
		expect(registro.rodando()).toBe('CDA-01:L');
		expect(registro.doTarefa('CDA-01')).toBeNull();
		registro.concluir('CDA-01:L', undefined, T0 + 25 * MIN);
		expect(registro.doTarefa('CDA-01:L')).toMatchObject({ questoes: null, certas: null, rodandoDesde: null });
		registro.concluir('CDA-01:Q', { questoes: 10, certas: 7 }, T0 + 45 * MIN);
		expect(registro.doTarefa('CDA-01:Q')).toMatchObject({ questoes: 10, certas: 7 });
	});

	it('concluir sem ter cronometrado cria o registro com o dia local de agora e zero minutos', () => {
		registro.concluir('A:Q', { questoes: 0, certas: 0 }, local('2026-10-02', 8));
		expect(registro.doTarefa('A:Q')).toMatchObject({ dia: '2026-10-02', intervalos: [], questoes: 0, certas: 0 });
	});

	it('virada de dia com cronômetro correndo: o tempo conta para o dia em que começou', () => {
		registro.iniciar('A:Q', '2026-10-01', local('2026-10-01', 23, 30));
		registro.concluir('A:Q', undefined, local('2026-10-02', 0, 30));
		const r = registro.doTarefa('A:Q')!;
		expect(r.dia).toBe('2026-10-01');
		expect(minutosEstudados(r, 0)).toBe(60);
	});

	it('gravarFoto é idempotente: a primeira vale', () => {
		expect(registro.foto('2026-10-01')).toBeNull();
		registro.gravarFoto('2026-10-01', ['A:Q', 'B']);
		const escritas = arm.escritas;
		registro.gravarFoto('2026-10-01', ['C']);
		expect(registro.foto('2026-10-01')).toEqual(['A:Q', 'B']);
		expect(arm.escritas).toBe(escritas);
		registro.gravarFoto('2026-10-02', []);
		expect(registro.foto('2026-10-02')).toEqual([]);
	});

	it('escrita só nas transições; leituras nunca gravam', () => {
		registro.iniciar('A:Q', '2026-10-01', T0);
		registro.pausar('A:Q', T0 + MIN);
		registro.retomar('A:Q', T0 + 2 * MIN);
		registro.concluir('A:Q', undefined, T0 + 3 * MIN);
		registro.gravarFoto('2026-10-01', ['A:Q']);
		expect(arm.escritas).toBe(5);
		registro.doTarefa('A:Q');
		registro.rodando();
		registro.foto('2026-10-01');
		registro.dados();
		expect(arm.escritas).toBe(5);
	});

	it('cópias devolvidas não alteram o estado', () => {
		registro.iniciar('A:Q', '2026-10-01', T0);
		registro.doTarefa('A:Q')!.intervalos.push([0, 1]);
		registro.dados().registros['A:Q'].rodandoDesde = null;
		registro.gravarFoto('2026-10-01', ['A:Q']);
		registro.foto('2026-10-01')!.push('Z');
		expect(registro.doTarefa('A:Q')).toMatchObject({ intervalos: [], rodandoDesde: T0 });
		expect(registro.foto('2026-10-01')).toEqual(['A:Q']);
	});
});

describe('registro — fechar e reabrir (FR-010, NFR-002)', () => {
	it('cronômetro correndo sobrevive a fechar o app: 1 h depois marca 60 min (erro ≤ 1 s/h)', () => {
		registro.iniciar('A:Q', '2026-10-01', T0);
		carregarRegistro(new StorageFalso()); // outro "app" sem nada
		expect(registro.rodando()).toBeNull();
		reabrir();
		expect(registro.rodando()).toBe('A:Q');
		const ms = minutosEstudados(registro.doTarefa('A:Q'), T0 + H) * MIN;
		expect(Math.abs(ms - H)).toBeLessThanOrEqual(1 * S);
		registro.pausar('A:Q', T0 + H);
		reabrir();
		expect(minutosEstudados(registro.doTarefa('A:Q'), T0 + 5 * H)).toBe(60);
	});

	it('várias sessões com fechamentos no meio somam exato ao longo de 10 h', () => {
		let t = T0;
		let esperado = 0;
		for (let i = 0; i < 10; i++) {
			registro.iniciar('A:Q', '2026-10-01', t);
			reabrir();
			const dur = H - i * 7 * S + 333; // durações quebradas, ms
			t += dur;
			esperado += dur;
			registro.pausar('A:Q', t);
			reabrir();
			t += 13 * MIN; // pausa não conta
		}
		const ms = minutosEstudados(registro.doTarefa('A:Q'), t) * MIN;
		expect(Math.abs(ms - esperado)).toBeLessThanOrEqual(10 * S * 0.001); // muito abaixo de 1 s/h
	});

	it('reabrir é idempotente e JSON inválido vira estado vazio (persistindo segue true)', () => {
		registro.iniciar('A:Q', '2026-10-01', T0);
		reabrir();
		reabrir();
		expect(registro.doTarefa('A:Q')?.rodandoDesde).toBe(T0);
		arm.setItem(CHAVE_PLANO, '{quebrado');
		reabrir();
		expect(registro.dados()).toEqual({ registros: {}, fotos: {} });
		expect(registro.persistindo).toBe(true);
	});

	it('saneia o gravado: descarta lixo e deixa um só cronômetro rodando (o mais recente)', () => {
		arm.setItem(
			CHAVE_PLANO,
			JSON.stringify({
				registros: {
					'A:Q': { dia: '2026-10-01', intervalos: [[1, 2], [5, 3], 'x'], rodandoDesde: 100, concluidaEm: null, questoes: 3, certas: 9 },
					B: { dia: '2026-10-01', intervalos: [], rodandoDesde: 200, concluidaEm: null, questoes: null, certas: null },
					C: { dia: 'ontem', intervalos: [] },
					'D:Q': { dia: '2026-10-01', intervalos: [], rodandoDesde: 50, concluidaEm: '2026-10-01T10:00:00.000Z', questoes: 2, certas: 1 },
					'E:L': { dia: '2026-10-01', intervalos: [], rodandoDesde: null, concluidaEm: '2026-10-01T10:00:00.000Z', questoes: 2, certas: 1 }
				},
				fotos: { '2026-10-01': ['A:Q', 'A:Q', 7, 'B'], lixo: ['A:Q'] }
			})
		);
		reabrir();
		expect(registro.rodando()).toBe('B');
		expect(registro.doTarefa('A:Q')).toEqual({ dia: '2026-10-01', intervalos: [[1, 2], [100, 200]], rodandoDesde: null, concluidaEm: null, questoes: null, certas: null });
		expect(registro.doTarefa('C')).toBeNull();
		expect(registro.doTarefa('D:Q')).toMatchObject({ rodandoDesde: null, questoes: 2, certas: 1 });
		// Emenda D4: questões gravadas numa :L são descartadas na leitura.
		expect(registro.doTarefa('E:L')).toMatchObject({ concluidaEm: '2026-10-01T10:00:00.000Z', questoes: null, certas: null });
		expect(registro.dados().fotos).toEqual({ '2026-10-01': ['A:Q', 'B'] });
	});
});

describe('registro — armazenamento indisponível', () => {
	it('storage que lança: funciona em memória e persistindo = false', () => {
		carregarRegistro(new StorageQueLanca());
		expect(registro.persistindo).toBe(false);
		registro.iniciar('A:Q', '2026-10-01', T0);
		registro.concluir('A:Q', { questoes: 2, certas: 1 }, T0 + 30 * MIN);
		registro.gravarFoto('2026-10-01', ['A:Q']);
		expect(minutosEstudados(registro.doTarefa('A:Q'), T0 + H)).toBe(30);
		expect(registro.foto('2026-10-01')).toEqual(['A:Q']);
	});

	it('cota esgotada: lê, mas a primeira escrita derruba persistindo e o estado segue em memória', () => {
		const soLeitura = new StorageSoLeitura();
		carregarRegistro(soLeitura);
		expect(registro.persistindo).toBe(true);
		registro.iniciar('A:Q', '2026-10-01', T0);
		expect(registro.persistindo).toBe(false);
		expect(registro.rodando()).toBe('A:Q');
	});

	it('sem armazenamento (null): só memória', () => {
		carregarRegistro(null);
		expect(registro.persistindo).toBe(false);
		registro.iniciar('A:Q', '2026-10-01', T0);
		expect(registro.rodando()).toBe('A:Q');
	});
});

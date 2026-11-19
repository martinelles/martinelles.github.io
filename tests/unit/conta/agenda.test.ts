import { describe, expect, it } from 'vitest';
import {
	CARGO_DA_ESPECIALIDADE,
	agoraEmSaoPaulo,
	lerEspecialidade,
	lerExtras,
	lerMarcas,
	lembreteDoDia
} from '../../../worker/agenda';
import { cronDoDia, type DependenciasCron } from '../../../worker/index';
import { ESPECIALIDADES } from '$lib/feed/foco.svelte';
import { lerExtras as lerExtrasDoApp } from '$lib/missoes/extras.svelte';
import { lerMarcas as lerMarcasDoApp } from '$lib/missoes/marcas.svelte';
import type { Extras, Marcas, PlanoMissoes } from '$lib/missoes/tipos';

describe('agenda do lembrete', () => {
	it('a hora de Brasília de um instante UTC', () => {
		expect(agoraEmSaoPaulo(new Date('2026-10-14T12:00:00Z'))).toEqual({ data: '2026-10-14', hora: 9 });
		expect(agoraEmSaoPaulo(new Date('2026-10-14T02:30:00Z'))).toEqual({ data: '2026-10-13', hora: 23 });
	});

	it('o mapa especialidade → cargo bate com as âncoras do app; sem plano é indefinido', () => {
		for (const e of ESPECIALIDADES) expect(CARGO_DA_ESPECIALIDADE[e.id]).toBe(e.ancora);
		expect(CARGO_DA_ESPECIALIDADE.infraestrutura).toBeUndefined();
	});

	it('as leituras de marcações, extras e especialidade batem com as do app', () => {
		const marcas = '{"cd~2026-10-13~0":true,"cd#2026-10-13#1":true,"x":false,"lixo"}';
		expect(lerMarcas(marcas)).toEqual(lerMarcasDoApp(marcas));
		const extras = '{"cd~2026-10-16":[{"tipo":"novo","cid":"4e7","cod":"E1·1","texto":"Aula"},"x"]}';
		expect(lerExtras(extras)).toEqual(lerExtrasDoApp(extras));
		expect(lerEspecialidade('{"especialidade":"auditoria"}')).toBe('auditoria');
		expect(lerEspecialidade('{"disciplina":"cd-e1"}')).toBe('ciencia-de-dados');
		expect(lerEspecialidade('corrompido')).toBe('ciencia-de-dados');
	});

	const dia = (data: string, blocos: any[]) => ({ data, dow: 'x', fase: 'Base', blocos });
	const aula = (cid: string, min: number) => ({ cid, cod: 'E1·1', texto: `Aula ${cid}`, min, subitens: [{ cid: 'EAG-02', cod: 'E1 2.1' }] });
	const HOJE = '2026-10-18';
	const plano: PlanoMissoes = {
		gerado: '2026-10-13',
		cortes: [],
		mapas: {},
		plan: [
			dia('2026-10-16', [{ tipo: 'novo', titulo: 'N', min: 40, itens: [aula('4e7', 40)] }]),
			dia(HOJE, [
				{ tipo: 'novo', titulo: 'N', min: 50, itens: [aula('qq', 50)] },
				{ tipo: 'q', titulo: 'Q', min: 20 }
			])
		]
	};

	it('o corpo traz os blocos que faltam e o tempo deles', () => {
		const marcas: Marcas = { 'cd~2026-10-16~0': true };
		expect(lembreteDoDia(plano, marcas, {}, 'cd', HOJE)).toEqual({
			titulo: 'Missão de hoje',
			corpo: 'Faltam 2 de 2 blocos (1 h 10 min)',
			url: '/painel'
		});
	});

	it('aula adiada pendente entra no aviso, e dia cumprido não gera lembrete', () => {
		// 4e7 (16/10) sem marcação desliza para hoje: o bloco adiadas conta no que falta.
		const semMarcas = lembreteDoDia(plano, {}, {}, 'cd', HOJE)!;
		expect(semMarcas.corpo).toBe('Faltam 3 de 3 blocos (1 h 50 min) · 1 aula atrasada');
		// Cumprido, com as atrasadas marcadas no dia em que chegaram: nada a avisar.
		const cumprido: Marcas = { [`cd~${HOJE}~2~4e7`]: true, [`cd~${HOJE}~0~qq`]: true, [`cd~${HOJE}~0`]: true, [`cd~${HOJE}~1`]: true };
		expect(lembreteDoDia(plano, cumprido, {}, 'cd', HOJE)).toBeNull();
	});

	it('fora da janela do plano, não há lembrete', () => {
		expect(lembreteDoDia(plano, {}, {}, 'cd', '2026-10-15')).toBeNull();
		expect(lembreteDoDia(plano, {}, {}, 'cd', '2026-10-19')).toBeNull();
	});
});

describe('cron do lembrete', () => {
	const plano: PlanoMissoes = {
		gerado: '2026-10-13',
		cortes: [],
		mapas: {},
		plan: [
			{ data: '2026-10-16', dow: 'qui', fase: 'Base', blocos: [{ tipo: 'novo', titulo: 'N', min: 40, itens: [{ cid: '4e7', cod: 'E1·1', texto: 'Aula', min: 40, subitens: [{ cid: 'EAG-02', cod: 'E1 2.1' }] }] }] },
			{ data: '2026-10-18', dow: 'sáb', fase: 'Base', blocos: [{ tipo: 'q', titulo: 'Q', min: 20 }] }
		]
	};
	const inscricao = { usuario: 'maria', endpoint: 'https://fcm.googleapis.com/f/1', p256dh: 'a', auth: 'b', hora: 9, ultimoEnvio: null };

	function deps({ status = 201, progresso = {} }: { status?: number; progresso?: Record<string, string> } = {}) {
		const enviados: { usuario: string; corpo: string }[] = [];
		const marcados: string[] = [];
		const apagados: string[] = [];
		const d: DependenciasCron = {
			inscritosDaHora: async () => [inscricao],
			marcarEnvio: async (endpoint) => {
				marcados.push(endpoint);
			},
			apagarInscricao: async (endpoint) => {
				apagados.push(endpoint);
			},
			progresso: async () => progresso,
			plano: async () => plano,
			enviar: async (i, lembrete) => {
				enviados.push({ usuario: i.usuario, corpo: lembrete.corpo });
				return status;
			}
		};
		return { d, enviados, marcados, apagados };
	}

	it('envia o lembrete com as aulas atrasadas e marca o envio', async () => {
		const { d, enviados, marcados } = deps();
		await cronDoDia(d, '2026-10-18', 9);
		expect(enviados).toHaveLength(1);
		expect(enviados[0].corpo).toBe('Faltam 2 de 2 blocos (1 h) · 1 aula atrasada');
		expect(marcados).toEqual([inscricao.endpoint]);
	});

	it('inscrição morta (410) sai do banco', async () => {
		const { d, apagados, marcados } = deps({ status: 410 });
		await cronDoDia(d, '2026-10-18', 9);
		expect(apagados).toEqual([inscricao.endpoint]);
		expect(marcados).toEqual([]);
	});

	it('dia cumprido não envia, só marca; sem plano, o mesmo', async () => {
		const cumprido = { 'missoes-cgu-2026': JSON.stringify({ 'cd~2026-10-16~0': true, 'cd~2026-10-18~0': true }) };
		const ok = deps({ progresso: cumprido });
		await cronDoDia(ok.d, '2026-10-18', 9);
		expect(ok.enviados).toEqual([]);
		expect(ok.marcados).toEqual([inscricao.endpoint]);
		const semPlano = deps({ progresso: { 'painel-concurso:preferencias:v2': JSON.stringify({ especialidade: 'infraestrutura' }) } });
		await cronDoDia(semPlano.d, '2026-10-18', 9);
		expect(semPlano.enviados).toEqual([]);
	});
});

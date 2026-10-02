import { describe, expect, it } from 'vitest';
import { contarDias, diaConcluido, diasDoPlano, fasePlano, somarDias } from '$lib/plano/dias';
import { missaoDoDia } from '$lib/plano/missao';
import type { DadosPlano } from '$lib/plano/tipos';
import { concluir, dadosVazios, isoLocal, L, planoTeste, prng, Q } from './apoio';

const PLANO = planoTeste(400);

/** Simula uso real de `inicio` até `ate`: em cada dia, com probabilidade, abre o app (foto) e conclui 0..10 tarefas (missão cheia = 8). */
function usoAleatorio(semente: number, ate: string): DadosPlano {
	const r = prng(semente);
	const dados = dadosVazios();
	for (let d = PLANO.inicio; d <= ate && d <= PLANO.fim; d = somarDias(d, 1)) {
		if (r() < 0.2) continue; // não abriu o app
		const missao = missaoDoDia(PLANO, dados, d);
		dados.fotos[d] = missao.map((t) => t.id);
		const n = Math.floor(r() * 11);
		const pendentes = PLANO.tarefas.filter((t) => !dados.registros[t.id]?.concluidaEm).slice(0, n);
		// algumas conclusões caem no dia seguinte (atrasadas)
		const quando = r() < 0.15 ? isoLocal(somarDias(d, 1), 9) : isoLocal(d, 22);
		concluir(dados, pendentes.map((t) => t.id), quando, d);
	}
	return dados;
}

describe('contarDias', () => {
	it('janela D2: 81 dias no plano', () => {
		expect(diasDoPlano(PLANO)).toHaveLength(81);
		expect(PLANO.tarefas).toHaveLength(800); // 400 tópicos × (:L + :Q)
		expect(contarDias(PLANO, dadosVazios(), '2026-10-01')).toEqual({ noPlano: 81, concluidos: 0, emAberto: 0, restantes: 81 });
	});

	it('identidade concluídos + em aberto + restantes = no plano em 20 datas aleatórias (antes, durante e depois)', () => {
		const r = prng(20261001);
		const base = '2026-09-01';
		const vistas = { antes: 0, durante: 0, depois: 0 };
		let comConcluido = 0;
		let comAberto = 0;
		for (let i = 0; i < 20; i++) {
			const hoje = somarDias(base, Math.floor(r() * 160)); // 01/09/2026 .. 07/02/2027
			const dados = usoAleatorio(i + 1, hoje);
			const c = contarDias(PLANO, dados, hoje);
			expect(c.noPlano).toBe(81);
			expect(c.concluidos + c.emAberto + c.restantes).toBe(c.noPlano);
			expect(Math.min(c.concluidos, c.emAberto, c.restantes)).toBeGreaterThanOrEqual(0);
			vistas[fasePlano(PLANO, hoje)]++;
			if (c.concluidos > 0) comConcluido++;
			if (c.emAberto > 0) comAberto++;
		}
		// o histórico aleatório produz as três classes (o teste não é vazio)
		expect(comConcluido).toBeGreaterThan(0);
		expect(comAberto).toBeGreaterThan(0);
		// as três fases foram exercitadas
		expect(vistas.antes).toBeGreaterThan(0);
		expect(vistas.durante).toBeGreaterThan(0);
		expect(vistas.depois).toBeGreaterThan(0);
	});

	it('identidade em todas as datas de 30/09 a 21/12 com o mesmo histórico', () => {
		const dados = usoAleatorio(42, PLANO.fim);
		for (let hoje = '2026-09-25'; hoje <= '2026-12-25'; hoje = somarDias(hoje, 1)) {
			const c = contarDias(PLANO, dados, hoje);
			expect(c.concluidos + c.emAberto + c.restantes).toBe(81);
		}
	});

	it('antes do início: tudo restante; depois do fim: restantes 0, sem negativos', () => {
		expect(contarDias(PLANO, dadosVazios(), '2026-09-15')).toEqual({ noPlano: 81, concluidos: 0, emAberto: 0, restantes: 81 });
		expect(contarDias(PLANO, dadosVazios(), '2027-01-10')).toEqual({ noPlano: 81, concluidos: 0, emAberto: 81, restantes: 0 });
		expect(contarDias(PLANO, dadosVazios(), '2026-12-20')).toEqual({ noPlano: 81, concluidos: 0, emAberto: 80, restantes: 1 });
		expect(fasePlano(PLANO, '2026-09-30')).toBe('antes');
		expect(fasePlano(PLANO, '2026-10-01')).toBe('durante');
		expect(fasePlano(PLANO, '2026-12-20')).toBe('durante');
		expect(fasePlano(PLANO, '2026-12-21')).toBe('depois');
	});

	it('regra das Definições: concluído no prazo, atrasado fica em aberto, hoje cumprido sai dos restantes', () => {
		const dados = dadosVazios();
		dados.fotos['2026-10-01'] = [L(1), Q(1)];
		dados.fotos['2026-10-02'] = [L(2), Q(2)];
		dados.fotos['2026-10-03'] = [L(3)];
		concluir(dados, [L(1), Q(1)], isoLocal('2026-10-01', 23, 59));
		concluir(dados, [L(2)], isoLocal('2026-10-02', 22));
		concluir(dados, [Q(2)], isoLocal('2026-10-03', 0, 5)); // a :Q passou da meia-noite
		expect(contarDias(PLANO, dados, '2026-10-03')).toEqual({ noPlano: 81, concluidos: 1, emAberto: 1, restantes: 79 });
		concluir(dados, [L(3)], isoLocal('2026-10-03', 10));
		expect(contarDias(PLANO, dados, '2026-10-03')).toEqual({ noPlano: 81, concluidos: 2, emAberto: 1, restantes: 78 });
	});

	it('dia sem foto não conta como concluído; foto vazia (fila esgotada) conta', () => {
		const dados = concluir(dadosVazios(), [L(1)], isoLocal('2026-10-01'));
		expect(diaConcluido(dados, '2026-10-01')).toBe(false);
		dados.fotos['2026-10-02'] = [];
		expect(diaConcluido(dados, '2026-10-02')).toBe(true);
	});

	it('fotos fora da janela são ignoradas', () => {
		const dados = dadosVazios();
		dados.fotos['2026-09-30'] = [];
		dados.fotos['2026-12-21'] = [];
		expect(contarDias(PLANO, dados, '2026-10-01').concluidos).toBe(0);
	});
});

describe('somarDias', () => {
	it('atravessa mês, ano e horário de verão', () => {
		expect(somarDias('2026-10-31', 1)).toBe('2026-11-01');
		expect(somarDias('2026-12-31', 1)).toBe('2027-01-01');
		expect(somarDias('2026-11-01', -1)).toBe('2026-10-31');
	});
});

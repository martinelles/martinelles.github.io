import { beforeEach, describe, expect, it } from 'vitest';
import { carregarPlano, esquecerPlano, URL_PLANO, validarPlano } from '$lib/plano/carregar';
import { planoTeste, topico } from './apoio';

beforeEach(() => esquecerPlano());

describe('carregarPlano', () => {
	it('busca /conteudo/plano.json uma vez só (cache)', async () => {
		const urls: string[] = [];
		const buscar = async (url: string) => {
			urls.push(url);
			return planoTeste(3);
		};
		const [a, b] = await Promise.all([carregarPlano(buscar), carregarPlano(buscar)]);
		expect(await carregarPlano(buscar)).toBe(a);
		expect(b).toBe(a);
		expect(urls).toEqual(['/conteudo/plano.json']);
		expect(URL_PLANO).toBe('/conteudo/plano.json');
		expect(a.tarefas).toHaveLength(6);
	});

	it('falha de rede: erro claro e nova tentativa na próxima chamada', async () => {
		let falhar = true;
		const buscar = async () => {
			if (falhar) throw new Error('HTTP 404 em /conteudo/plano.json');
			return planoTeste(1);
		};
		await expect(carregarPlano(buscar)).rejects.toThrow(/Não foi possível carregar o plano de estudos.*HTTP 404/);
		falhar = false;
		await expect(carregarPlano(buscar)).resolves.toMatchObject({ versao: 1 });
	});

	it('arquivo inválido: tenta de novo sem cache e só então dá erro claro', async () => {
		const velho = async () => ({ versao: 2 });
		await expect(carregarPlano(velho, velho)).rejects.toThrow(/Plano de estudos inválido: versão 2/);
		expect(() => validarPlano(null)).toThrow(/não é um objeto/);
		expect(() => validarPlano({ ...planoTeste(1), inicio: '2026-12-21' })).toThrow(/depois de fim/);
		expect(() => validarPlano({ ...planoTeste(1), horasPorDia: 0 })).toThrow(/horasPorDia/);
		expect(() => validarPlano({ ...planoTeste(1), tarefas: [{ id: 'X-1' }] })).toThrow(/tarefa malformada/);
	});

	it('cópia velha do service worker (anterior à D4): a recarga sem cache resolve', async () => {
		const { minutosLeitura: _l, minutosQuestoes: _q, ...anteriorD4 } = planoTeste(2);
		const pedidos: string[] = [];
		const plano = await carregarPlano(
			async (url) => (pedidos.push(`cache ${url}`), { ...anteriorD4, minutosPorTarefa: 45 }),
			async (url) => (pedidos.push(`reload ${url}`), planoTeste(2))
		);
		expect(plano.minutosLeitura).toBe(25);
		expect(pedidos).toEqual(['cache /conteudo/plano.json', 'reload /conteudo/plano.json']);
	});

	it('emenda D4: minutosLeitura/minutosQuestoes, id `<topicoId>:L|Q` coerente com o modo, bloco e id único', () => {
		expect(validarPlano(planoTeste(2)).tarefas.map((t) => t.id)).toEqual(['TST-01:L', 'TST-01:Q', 'TST-02:L', 'TST-02:Q']);
		const { minutosLeitura: _l, ...semLeitura } = planoTeste(1);
		expect(() => validarPlano(semLeitura)).toThrow(/minutosLeitura/);
		expect(() => validarPlano({ ...planoTeste(1), minutosQuestoes: 0 })).toThrow(/minutosQuestoes/);
		expect(() => validarPlano({ ...planoTeste(1), minutosQuestoes: 2.5 })).toThrow(/minutosQuestoes/);
		const [l, q] = topico(1);
		const mal = (t: object) => () => validarPlano({ ...planoTeste(0), tarefas: [t] });
		expect(mal({ ...l, modo: 'questoes' })).toThrow(/tarefa malformada/); // id :L com modo questões
		expect(mal({ ...q, id: 'TST-01' })).toThrow(/tarefa malformada/); // sem sufixo
		expect(mal({ ...q, topicoId: 'TST-02' })).toThrow(/tarefa malformada/);
		expect(mal({ ...l, modo: 'revisao', id: 'TST-01:R' })).toThrow(/tarefa malformada/);
		expect(mal({ ...l, bloco: 'gerais' })).toThrow(/tarefa malformada/);
		expect(mal({ ...l, minutos: 0 })).toThrow(/tarefa malformada/);
		expect(() => validarPlano({ ...planoTeste(0), tarefas: [l, q, l] })).toThrow(/tarefa repetida: TST-01:L/);
	});
});

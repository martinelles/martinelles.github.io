import { describe, expect, it } from 'vitest';
import { armazenamentoSincronizado, CHAVE_SINC, type Gravado } from '$lib/conta/armazenamento';
import { CHAVES_SINCRONIZADAS } from '$lib/conta/regras';
import { StorageFalso, StorageSoLeitura } from '../feed/apoio';

const [K1, K2] = CHAVES_SINCRONIZADAS;

/** Servidor falso com a mesma regra do Worker; `fora` simula rede caída. */
function servidor() {
	const dados: Record<string, Gravado> = {};
	const s = {
		dados,
		fora: false,
		puts: 0,
		fetch: (async (url: string, init?: RequestInit) => {
			if (s.fora) throw new TypeError('Failed to fetch');
			const chave = decodeURIComponent(String(url).split('/')[4] ?? '');
			if (init?.method === 'PUT') {
				s.puts++;
				const novo = JSON.parse(String(init.body)) as Gravado;
				const gravado = !dados[chave] || novo.atualizadoEm > dados[chave].atualizadoEm;
				if (gravado) dados[chave] = novo;
				return Response.json({ gravado, atual: dados[chave] });
			}
			return Response.json(dados);
		}) as typeof fetch
	};
	return s;
}

/** Relógio e agenda controlados pelo teste. */
function montar(local: Storage = new StorageFalso(), srv = servidor()) {
	let t = 1000;
	const fila: (() => void)[] = [];
	const arm = armazenamentoSincronizado({
		usuario: 'maria',
		local,
		fetch: srv.fetch,
		agora: () => t,
		agendar: (fn) => fila.push(fn),
		cancelar: () => fila.splice(0)
	});
	return {
		arm,
		local,
		srv,
		avancar: (ms: number) => (t += ms),
		disparar: async () => {
			fila.splice(0).forEach((fn) => fn());
			await arm.enviarPendentes();
		}
	};
}

const carimbos = (local: Storage) => JSON.parse(local.getItem(CHAVE_SINC) ?? '{}');

describe('armazenamento sincronizado', () => {
	it('grava local na hora e sobe no disparo da espera', async () => {
		const m = montar();
		m.arm.setItem(K1, '{"a":1}');
		expect(m.local.getItem(K1)).toBe('{"a":1}');
		expect(m.srv.puts).toBe(0);
		await m.disparar();
		expect(m.srv.dados[K1]).toEqual({ valor: '{"a":1}', atualizadoEm: 1000 });
		expect(carimbos(m.local)[K1]).toEqual({ em: 1000, pendente: false });
	});

	it('gravações seguidas viram um envio só, com o último valor', async () => {
		const m = montar();
		m.arm.setItem(K1, '1');
		m.arm.setItem(K1, '2');
		m.arm.setItem(K1, '3');
		await m.disparar();
		expect(m.srv.puts).toBe(1);
		expect(m.srv.dados[K1].valor).toBe('3');
	});

	it('carimbo sempre cresce, mesmo no mesmo milissegundo', async () => {
		const m = montar();
		m.arm.setItem(K1, '1');
		await m.disparar();
		m.arm.setItem(K1, '2'); // relógio parado em 1000
		await m.disparar();
		expect(m.srv.dados[K1]).toEqual({ valor: '2', atualizadoEm: 1001 });
	});

	it('chave fora da lista fica só local', async () => {
		const m = montar();
		m.arm.setItem('outra', 'x');
		await m.disparar();
		expect(m.local.getItem('outra')).toBe('x');
		expect(m.srv.puts).toBe(0);
	});

	it('sem rede a chave fica pendente e sobe no próximo envio', async () => {
		const m = montar();
		m.srv.fora = true;
		m.arm.setItem(K1, '1');
		await m.disparar();
		expect(carimbos(m.local)[K1].pendente).toBe(true);
		m.srv.fora = false;
		await m.arm.enviarPendentes();
		expect(m.srv.dados[K1].valor).toBe('1');
		expect(carimbos(m.local)[K1].pendente).toBe(false);
	});

	it('erro do localStorage sobe a quem chamou e nada vai ao servidor', async () => {
		const m = montar(new StorageSoLeitura());
		expect(() => m.arm.setItem(K1, '1')).toThrow();
		await m.disparar();
		expect(m.srv.puts).toBe(0);
	});

	describe('trazer', () => {
		it('servidor vazio: o progresso local sobe', async () => {
			const local = new StorageFalso();
			local.setItem(K1, '"antes do login"');
			const m = montar(local);
			expect(await m.arm.trazer()).toEqual([]);
			expect(m.srv.dados[K1]).toEqual({ valor: '"antes do login"', atualizadoEm: 1000 });
		});

		it('servidor com dado e aparelho nunca sincronizado: vale o servidor', async () => {
			const local = new StorageFalso();
			local.setItem(K1, '"local"');
			const srv = servidor();
			srv.dados[K1] = { valor: '"servidor"', atualizadoEm: 5 };
			const m = montar(local, srv);
			expect(await m.arm.trazer()).toEqual([K1]);
			expect(local.getItem(K1)).toBe('"servidor"');
			expect(srv.puts).toBe(0);
		});

		it('servidor mais novo que o carimbo local: vale o servidor', async () => {
			const m = montar();
			m.arm.setItem(K1, '"velho"');
			await m.disparar();
			m.srv.dados[K1] = { valor: '"de outro aparelho"', atualizadoEm: 5000 };
			expect(await m.arm.trazer()).toEqual([K1]);
			expect(m.local.getItem(K1)).toBe('"de outro aparelho"');
			expect(carimbos(m.local)[K1]).toEqual({ em: 5000, pendente: false });
		});

		it('local mais novo (feito offline): sobe e não muda nada aqui', async () => {
			const m = montar();
			m.srv.dados[K1] = { valor: '"servidor"', atualizadoEm: 500 };
			m.srv.fora = true;
			m.arm.setItem(K1, '"offline"');
			await m.disparar();
			m.srv.fora = false;
			expect(await m.arm.trazer()).toEqual([]);
			expect(m.srv.dados[K1]).toEqual({ valor: '"offline"', atualizadoEm: 1000 });
		});

		it('chaves são decididas uma a uma', async () => {
			const m = montar();
			m.avancar(9000);
			m.arm.setItem(K2, '"meu K2"');
			m.srv.dados[K1] = { valor: '"K1 do servidor"', atualizadoEm: 7 };
			expect(await m.arm.trazer()).toEqual([K1]);
			expect(m.local.getItem(K1)).toBe('"K1 do servidor"');
			expect(m.srv.dados[K2].valor).toBe('"meu K2"');
		});

		it('sem rede, lança e não mexe no aparelho', async () => {
			const local = new StorageFalso();
			local.setItem(K1, '"local"');
			const m = montar(local);
			m.srv.fora = true;
			await expect(m.arm.trazer()).rejects.toThrow();
			expect(local.getItem(K1)).toBe('"local"');
		});

		it('endereço sem API (resposta HTML do GitHub Pages): lança', async () => {
			const arm = armazenamentoSincronizado({
				usuario: 'maria',
				local: new StorageFalso(),
				fetch: (async () => new Response('<!doctype html>', { status: 404, headers: { 'content-type': 'text/html' } })) as typeof fetch
			});
			await expect(arm.trazer()).rejects.toThrow('404');
		});
	});
});

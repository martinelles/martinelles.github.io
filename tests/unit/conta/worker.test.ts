import { describe, expect, it } from 'vitest';
import { tratarApi, type Banco, type Gravado } from '../../../worker/progresso';
import { CHAVES_SINCRONIZADAS, LIMITE_VALOR } from '$lib/conta/regras';

/** Mesma regra do SQL do Worker: só grava se o carimbo for mais novo. */
function bancoEmMemoria(): Banco & { linhas: Map<string, Gravado> } {
	const linhas = new Map<string, Gravado>();
	return {
		linhas,
		async ler(usuario) {
			const r: Record<string, Gravado> = {};
			for (const [k, v] of linhas) if (k.startsWith(`${usuario}|`)) r[k.slice(usuario.length + 1)] = v;
			return r;
		},
		async gravar(usuario, chave, novo) {
			const k = `${usuario}|${chave}`;
			const antes = linhas.get(k);
			const gravado = !antes || novo.atualizadoEm > antes.atualizadoEm;
			if (gravado) linhas.set(k, novo);
			return { gravado, atual: linhas.get(k)! };
		}
	};
}

const BASE = 'https://cgu.exemplo.dev';
const CHAVE = CHAVES_SINCRONIZADAS[0];
const get = (caminho: string) => new Request(BASE + caminho);
const put = (caminho: string, corpo: unknown) =>
	new Request(BASE + caminho, { method: 'PUT', body: typeof corpo === 'string' ? corpo : JSON.stringify(corpo) });
const caminhoChave = (usuario: string, chave = CHAVE) => `/api/progresso/${usuario}/${encodeURIComponent(chave)}`;

async function corpo(r: Response | null) {
	expect(r).not.toBeNull();
	return { status: r!.status, json: await r!.json() };
}

describe('API de progresso', () => {
	it('fora de /api/ devolve null (o Worker entrega aos assets)', async () => {
		expect(await tratarApi(get('/painel'), bancoEmMemoria())).toBeNull();
		expect(await tratarApi(get('/'), bancoEmMemoria())).toBeNull();
	});

	it('usuário novo lê objeto vazio', async () => {
		expect(await corpo(await tratarApi(get('/api/progresso/maria'), bancoEmMemoria()))).toEqual({ status: 200, json: {} });
	});

	it('grava e lê de volta', async () => {
		const banco = bancoEmMemoria();
		const r = await corpo(await tratarApi(put(caminhoChave('maria'), { valor: '{"a":1}', atualizadoEm: 10 }), banco));
		expect(r).toEqual({ status: 200, json: { gravado: true, atual: { valor: '{"a":1}', atualizadoEm: 10 } } });
		expect((await corpo(await tratarApi(get('/api/progresso/maria'), banco))).json).toEqual({
			[CHAVE]: { valor: '{"a":1}', atualizadoEm: 10 }
		});
	});

	it('gravação mais velha ou do mesmo instante é ignorada e devolve o que ficou', async () => {
		const banco = bancoEmMemoria();
		await tratarApi(put(caminhoChave('maria'), { valor: '"novo"', atualizadoEm: 20 }), banco);
		for (const em of [19, 20]) {
			const r = await corpo(await tratarApi(put(caminhoChave('maria'), { valor: '"velho"', atualizadoEm: em }), banco));
			expect(r.json).toEqual({ gravado: false, atual: { valor: '"novo"', atualizadoEm: 20 } });
		}
	});

	it('usuários não se misturam', async () => {
		const banco = bancoEmMemoria();
		await tratarApi(put(caminhoChave('maria'), { valor: '1', atualizadoEm: 1 }), banco);
		expect((await corpo(await tratarApi(get('/api/progresso/joao'), banco))).json).toEqual({});
	});

	it.each(['ab', 'Maria', 'maria silva', '-maria', 'maria-', 'a'.repeat(31), 'jo%C3%A3o'])('nome inválido %s: 400', async (nome) => {
		expect((await corpo(await tratarApi(get(`/api/progresso/${nome}`), bancoEmMemoria()))).status).toBe(400);
	});

	it('chave fora da lista: 400', async () => {
		const r = await tratarApi(put(caminhoChave('maria', 'outra:chave'), { valor: '1', atualizadoEm: 1 }), bancoEmMemoria());
		expect((await corpo(r)).status).toBe(400);
	});

	it.each([
		['corpo que não é JSON', 'x'],
		['valor que não é texto', { valor: 1, atualizadoEm: 1 }],
		['valor que não é JSON', { valor: '{', atualizadoEm: 1 }],
		['carimbo fracionário', { valor: '1', atualizadoEm: 1.5 }],
		['carimbo negativo', { valor: '1', atualizadoEm: -1 }],
		['valor grande demais', { valor: JSON.stringify('x'.repeat(LIMITE_VALOR)), atualizadoEm: 1 }]
	])('%s: 400 e nada gravado', async (_, c) => {
		const banco = bancoEmMemoria();
		expect((await corpo(await tratarApi(put(caminhoChave('maria'), c), banco))).status).toBe(400);
		expect(banco.linhas.size).toBe(0);
	});

	it('rota e método errados', async () => {
		const banco = bancoEmMemoria();
		expect((await corpo(await tratarApi(get('/api/outra'), banco))).status).toBe(404);
		expect((await corpo(await tratarApi(get('/api/progresso/maria/a/b'), banco))).status).toBe(404);
		expect((await corpo(await tratarApi(put('/api/progresso/maria', {}), banco))).status).toBe(405);
		expect((await corpo(await tratarApi(get(caminhoChave('maria')), banco))).status).toBe(405);
	});
});

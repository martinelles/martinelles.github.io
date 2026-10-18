import { describe, expect, it } from 'vitest';
import { endpointValido, tratarLembrete, type BancoLembretes, type InscricaoGravada } from '../../../worker/lembrete';
import { tratarApi, type Banco } from '../../../worker/progresso';

/** Mesmas regras do SQL do Worker (`lembretesD1`). */
function bancoEmMemoria(): BancoLembretes & { linhas: Map<string, InscricaoGravada> } {
	const linhas = new Map<string, InscricaoGravada>();
	return {
		linhas,
		async gravar(i) {
			linhas.set(i.endpoint, { ...i, ultimoEnvio: linhas.get(i.endpoint)?.ultimoEnvio ?? null });
		},
		async apagar(endpoint, usuario) {
			if (!usuario || linhas.get(endpoint)?.usuario === usuario) linhas.delete(endpoint);
		},
		async daHora(hora, data) {
			return [...linhas.values()].filter((l) => l.hora === hora && l.ultimoEnvio !== data);
		},
		async marcarEnvio(endpoint, data) {
			const l = linhas.get(endpoint);
			if (l) l.ultimoEnvio = data;
		}
	};
}

const BASE = 'https://cgu.exemplo.dev';
const CHAVE = 'BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8';
const ENDPOINT = 'https://fcm.googleapis.com/fcm/send/abc123';
const KEYS = {
	p256dh: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4',
	auth: 'BTBZMqHH6r4Tts7J_aSIgg'
};
const pedido = (metodo: string, caminho: string, corpo?: unknown) =>
	new Request(BASE + caminho, { method: metodo, body: corpo === undefined ? undefined : typeof corpo === 'string' ? corpo : JSON.stringify(corpo) });
const inscrever = (corpo: Record<string, unknown> = {}) => pedido('PUT', '/api/lembrete/maria', { endpoint: ENDPOINT, keys: KEYS, hora: 9, ...corpo });

async function resposta(r: Response | null) {
	expect(r).not.toBeNull();
	return { status: r!.status, json: await r!.json() };
}

describe('API do lembrete', () => {
	it('caminho fora de /api/lembrete não é desta API', async () => {
		const b = bancoEmMemoria();
		for (const c of ['/painel', '/api/progresso/maria', '/api/lembretes', '/api/lembretex/maria'])
			expect(await tratarLembrete(pedido('GET', c), b, CHAVE)).toBeNull();
	});

	it('GET devolve a chave pública; sem chave configurada, 503', async () => {
		expect(await resposta(await tratarLembrete(pedido('GET', '/api/lembrete'), bancoEmMemoria(), CHAVE))).toEqual({
			status: 200,
			json: { chave: CHAVE }
		});
		expect((await resposta(await tratarLembrete(pedido('GET', '/api/lembrete'), bancoEmMemoria(), undefined))).status).toBe(503);
		expect((await resposta(await tratarLembrete(pedido('POST', '/api/lembrete'), bancoEmMemoria(), CHAVE))).status).toBe(405);
	});

	it('PUT grava; PUT de novo troca a hora sem duplicar e mantém o último envio', async () => {
		const b = bancoEmMemoria();
		expect(await resposta(await tratarLembrete(inscrever(), b, CHAVE))).toEqual({ status: 200, json: { ok: true } });
		expect(b.linhas.get(ENDPOINT)).toEqual({ usuario: 'maria', endpoint: ENDPOINT, ...KEYS, hora: 9, ultimoEnvio: null });
		await b.marcarEnvio(ENDPOINT, '2026-10-14');
		await tratarLembrete(inscrever({ hora: 20 }), b, CHAVE);
		expect(b.linhas.size).toBe(1);
		expect(b.linhas.get(ENDPOINT)).toMatchObject({ hora: 20, ultimoEnvio: '2026-10-14' });
	});

	it('recusa hora fora de 6 a 23, chaves com tamanho errado, endpoint fora da lista e nome inválido', async () => {
		const b = bancoEmMemoria();
		const casos: Request[] = [
			inscrever({ hora: 5 }),
			inscrever({ hora: 24 }),
			inscrever({ hora: 9.5 }),
			inscrever({ hora: '9' }),
			inscrever({ keys: { ...KEYS, p256dh: KEYS.auth } }),
			inscrever({ keys: { ...KEYS, auth: KEYS.p256dh } }),
			inscrever({ keys: { ...KEYS, auth: 'não base64' } }),
			inscrever({ keys: undefined }),
			inscrever({ endpoint: 'https://exemplo.com/push' }),
			inscrever({ endpoint: 'http://fcm.googleapis.com/fcm/send/x' }),
			inscrever({ endpoint: 'https://fcm.googleapis.com.exemplo.com/x' }),
			pedido('PUT', '/api/lembrete/maria', '{'),
			pedido('PUT', '/api/lembrete/maria', '[]'),
			pedido('PUT', '/api/lembrete/Maria', { endpoint: ENDPOINT, keys: KEYS, hora: 9 }),
			pedido('PUT', '/api/lembrete/maria', 'x'.repeat(5000))
		];
		for (const req of casos) expect((await resposta(await tratarLembrete(req, b, CHAVE))).status).toBe(400);
		expect(b.linhas.size).toBe(0);
		expect((await resposta(await tratarLembrete(pedido('GET', '/api/lembrete/maria'), b, CHAVE))).status).toBe(405);
		expect((await resposta(await tratarLembrete(pedido('GET', '/api/lembrete/maria/x'), b, CHAVE))).status).toBe(404);
	});

	it('DELETE apaga só a inscrição do próprio usuário', async () => {
		const b = bancoEmMemoria();
		await tratarLembrete(inscrever(), b, CHAVE);
		await tratarLembrete(pedido('DELETE', '/api/lembrete/joao', { endpoint: ENDPOINT }), b, CHAVE);
		expect(b.linhas.size).toBe(1);
		expect(await resposta(await tratarLembrete(pedido('DELETE', '/api/lembrete/maria', { endpoint: ENDPOINT }), b, CHAVE))).toEqual({
			status: 200,
			json: { ok: true }
		});
		expect(b.linhas.size).toBe(0);
		expect((await resposta(await tratarLembrete(pedido('DELETE', '/api/lembrete/maria', {}), b, CHAVE))).status).toBe(400);
	});

	it('serviços de push aceitos', () => {
		for (const ok of [
			'https://fcm.googleapis.com/fcm/send/x',
			'https://updates.push.services.mozilla.com/wpush/v2/x',
			'https://web.push.apple.com/QAbc',
			'https://wns2-bl2p.notify.windows.com/w/?token=x'
		])
			expect(endpointValido(ok)).toBe(true);
		for (const nao of ['https://evilpush.apple.com.exemplo.com/x', 'https://fcm.googleapis.com:8443/x', 'ftp://fcm.googleapis.com/x', 42])
			expect(endpointValido(nao)).toBe(false);
	});

	it('a API de progresso continua respondendo 404 fora de /api/progresso', async () => {
		const banco: Banco = { ler: async () => ({}), gravar: async () => ({ gravado: false, atual: { valor: '{}', atualizadoEm: 0 } }) };
		expect((await tratarApi(pedido('GET', '/api/lembrete'), banco))!.status).toBe(404);
	});
});

/**
 * API do lembrete de estudo (planos/2026-10-17-notificacoes-de-estudo.md, fase 1): a inscrição de
 * push de cada aparelho, ligada ao nome do login. Como `progresso.ts`, sem nada do Cloudflare:
 * recebe um `BancoLembretes` e devolve a resposta, ou `null` quando o caminho não é desta API.
 *
 *   GET    /api/lembrete            → { chave }   (a chave pública VAPID, `applicationServerKey`)
 *   PUT    /api/lembrete/:usuario   { endpoint, keys: { p256dh, auth }, hora } → { ok }
 *   DELETE /api/lembrete/:usuario   { endpoint } → { ok }
 */
import { nomeValido } from '../src/lib/conta/regras';
import { deB64url, type Inscricao } from './push';
import { erro, json } from './progresso';

export interface InscricaoNova extends Inscricao {
	usuario: string;
	/** Hora do lembrete no fuso de Brasília, de `HORA_MIN` a `HORA_MAX`. */
	hora: number;
}

export interface InscricaoGravada extends InscricaoNova {
	/** Último dia (AAAA-MM-DD) em que o cron tratou a inscrição; impede envio duplicado. */
	ultimoEnvio: string | null;
}

export interface BancoLembretes {
	/** Grava ou atualiza pelo endpoint (o aparelho pode ter trocado de conta ou de hora). */
	gravar(i: InscricaoNova): Promise<void>;
	/** Com `usuario`, só apaga se a inscrição for dele; sem, apaga pelo endpoint (o cron, num 404/410). */
	apagar(endpoint: string, usuario?: string): Promise<void>;
	/** As inscrições desta hora que ainda não foram tratadas em `data`. */
	daHora(hora: number, data: string): Promise<InscricaoGravada[]>;
	marcarEnvio(endpoint: string, data: string): Promise<void>;
}

export const HORA_MIN = 6;
export const HORA_MAX = 23;
const LIMITE_CORPO = 4096;

/**
 * Serviços de push aceitos. Sem a lista, o Worker faria POST para qualquer URL cadastrada.
 * Chrome, Edge (antigo) e Samsung usam o FCM; Firefox, o da Mozilla; Safari, o da Apple; Edge no
 * Windows, o WNS.
 */
const HOSTS_PUSH = [/^fcm\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /(^|\.)push\.apple\.com$/, /(^|\.)notify\.windows\.com$/];

export function endpointValido(endpoint: unknown): endpoint is string {
	if (typeof endpoint !== 'string' || endpoint.length > 2048) return false;
	try {
		const u = new URL(endpoint);
		return u.protocol === 'https:' && !u.port && HOSTS_PUSH.some((h) => h.test(u.hostname));
	} catch {
		return false;
	}
}

function chaveCom(t: unknown, bytes: number): t is string {
	if (typeof t !== 'string' || t.length > 128) return false;
	try {
		return deB64url(t).length === bytes;
	} catch {
		return false;
	}
}

async function lerCorpo(req: Request): Promise<Record<string, unknown> | string> {
	const t = await req.text();
	if (t.length > LIMITE_CORPO) return 'corpo grande demais';
	try {
		const b: unknown = JSON.parse(t);
		return b && typeof b === 'object' && !Array.isArray(b) ? (b as Record<string, unknown>) : 'corpo deveria ser objeto';
	} catch {
		return 'corpo não é JSON';
	}
}

function inscricaoDoCorpo(usuario: string, c: Record<string, unknown>): InscricaoNova | string {
	const { endpoint, keys, hora } = c;
	if (!endpointValido(endpoint)) return 'endpoint fora dos serviços de push aceitos';
	const k = keys && typeof keys === 'object' ? (keys as Record<string, unknown>) : {};
	if (!chaveCom(k.p256dh, 65)) return 'keys.p256dh deveria ter 65 bytes em base64url';
	if (!chaveCom(k.auth, 16)) return 'keys.auth deveria ter 16 bytes em base64url';
	if (typeof hora !== 'number' || !Number.isInteger(hora) || hora < HORA_MIN || hora > HORA_MAX)
		return `hora deveria ser inteira, de ${HORA_MIN} a ${HORA_MAX}`;
	return { usuario, endpoint, p256dh: k.p256dh, auth: k.auth, hora };
}

export async function tratarLembrete(req: Request, banco: BancoLembretes, chavePublica: string | undefined): Promise<Response | null> {
	const { pathname } = new URL(req.url);
	if (pathname !== '/api/lembrete' && !pathname.startsWith('/api/lembrete/')) return null;
	let partes: string[];
	try {
		partes = pathname.slice('/api/'.length).split('/').map(decodeURIComponent);
	} catch {
		return erro(404, 'rota inexistente');
	}

	if (partes.length === 1) {
		if (req.method !== 'GET') return erro(405, 'use GET');
		if (!chavePublica) return erro(503, 'lembrete não configurado');
		return json({ chave: chavePublica });
	}
	if (partes.length !== 2) return erro(404, 'rota inexistente');
	const usuario = partes[1];
	if (!nomeValido(usuario)) return erro(400, 'nome inválido');
	if (req.method !== 'PUT' && req.method !== 'DELETE') return erro(405, 'use PUT ou DELETE');

	const corpo = await lerCorpo(req);
	if (typeof corpo === 'string') return erro(400, corpo);
	if (req.method === 'DELETE') {
		if (!endpointValido(corpo.endpoint)) return erro(400, 'endpoint fora dos serviços de push aceitos');
		await banco.apagar(corpo.endpoint, usuario);
		return json({ ok: true });
	}
	const nova = inscricaoDoCorpo(usuario, corpo);
	if (typeof nova === 'string') return erro(400, nova);
	await banco.gravar(nova);
	return json({ ok: true });
}

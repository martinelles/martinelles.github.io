/**
 * Web Push sem dependência, só WebCrypto (planos/2026-10-17-notificacoes-de-estudo.md, fase 1): o
 * `web-push` do npm usa o `crypto` do Node e não roda no Worker. Monta o `Request` pronto para o
 * serviço de push do aparelho:
 *
 * - corpo cifrado em `aes128gcm` (RFC 8188 + RFC 8291), um registro só, com o delimitador 0x02;
 * - `Authorization: vapid` com JWT ES256 (RFC 8292).
 *
 * Testado com o vetor do apêndice A da RFC 8291 (tests/unit/conta/push.test.ts).
 */

export interface Inscricao {
	endpoint: string;
	/** Chave pública P-256 do aparelho, sem compressão (65 bytes), em base64url. */
	p256dh: string;
	/** Segredo de autenticação do aparelho (16 bytes), em base64url. */
	auth: string;
}

export interface Vapid {
	/** Chave pública do servidor (65 bytes), em base64url: a `applicationServerKey` do app. */
	publica: string;
	/** Chave privada do servidor, em JWK (`kty: EC`, `crv: P-256`, com `d`, `x` e `y`). */
	privada: JsonWebKey;
	/** `sub` do JWT: URL ou `mailto:` de contato para o serviço de push. */
	assunto: string;
}

/** Só para o teste com o vetor da RFC; fora dele, a chave efêmera e o salt são sorteados. */
export interface OpcoesCifra {
	chaveEfemera?: CryptoKeyPair;
	salt?: Uint8Array;
}

/** Tamanho de registro anunciado no cabeçalho: a carga cabe num registro só. */
const RS = 4096;
/** Validade do JWT; o RFC 8292 aceita até 24 h. */
const VALIDADE_JWT_S = 12 * 3600;
/** Lembrete que chegaria mais de 4 h atrasado é descartado pelo serviço de push. */
const TTL_S = 4 * 3600;

const texto = new TextEncoder();

type Bytes = Uint8Array<ArrayBuffer>;

export function b64url(bytes: Uint8Array): string {
	let s = '';
	for (const b of bytes) s += String.fromCharCode(b);
	return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Lança se não for base64url. */
export function deB64url(t: string): Bytes {
	if (!/^[A-Za-z0-9_-]*$/.test(t)) throw new Error('não é base64url');
	const s = atob(t.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (t.length % 4)) % 4));
	return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

function juntar(...partes: Uint8Array[]): Bytes {
	const r = new Uint8Array(partes.reduce((n, p) => n + p.length, 0));
	let i = 0;
	for (const p of partes) {
		r.set(p, i);
		i += p.length;
	}
	return r;
}

async function hmac(chave: Bytes, dados: Bytes): Promise<Bytes> {
	const k = await crypto.subtle.importKey('raw', chave, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
	return new Uint8Array(await crypto.subtle.sign('HMAC', k, dados));
}

/** HKDF (RFC 5869) em duas etapas, para os valores intermediários baterem com os da RFC 8291. */
export const hkdfExtrair = (salt: Bytes, ikm: Bytes): Promise<Bytes> => hmac(salt, ikm);
export async function hkdfExpandir(prk: Bytes, info: Bytes, tamanho: number): Promise<Bytes> {
	return (await hmac(prk, juntar(info, new Uint8Array([1])))).slice(0, tamanho);
}

/** CEK e nonce do corpo; exportada para o teste conferir os intermediários do apêndice A. */
export async function derivarChaves(
	ecdh: Bytes,
	auth: Bytes,
	uaPublica: Bytes,
	asPublica: Bytes,
	salt: Bytes
): Promise<{ prkChave: Bytes; ikm: Bytes; prk: Bytes; cek: Bytes; nonce: Bytes }> {
	const prkChave = await hkdfExtrair(auth, ecdh);
	const ikm = await hkdfExpandir(prkChave, juntar(texto.encode('WebPush: info\0'), uaPublica, asPublica), 32);
	const prk = await hkdfExtrair(salt, ikm);
	const cek = await hkdfExpandir(prk, texto.encode('Content-Encoding: aes128gcm\0'), 16);
	const nonce = await hkdfExpandir(prk, texto.encode('Content-Encoding: nonce\0'), 12);
	return { prkChave, ikm, prk, cek, nonce };
}

/** Corpo `aes128gcm`: cabeçalho (salt, rs, idlen, chave pública efêmera) e o texto cifrado. */
export async function cifrar(carga: string | Uint8Array, inscricao: Pick<Inscricao, 'p256dh' | 'auth'>, opcoes: OpcoesCifra = {}): Promise<Bytes> {
	const uaPublica = deB64url(inscricao.p256dh);
	const auth = deB64url(inscricao.auth);
	const efemera =
		opcoes.chaveEfemera ??
		((await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])) as CryptoKeyPair);
	const salt = opcoes.salt ? new Uint8Array(opcoes.salt) : crypto.getRandomValues(new Uint8Array(16));
	const asPublica = new Uint8Array(await crypto.subtle.exportKey('raw', efemera.publicKey));
	const chaveUa = await crypto.subtle.importKey('raw', uaPublica, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
	const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: chaveUa }, efemera.privateKey, 256));
	const { cek, nonce } = await derivarChaves(ecdh, auth, uaPublica, asPublica, salt);

	const claro = juntar(typeof carga === 'string' ? texto.encode(carga) : carga, new Uint8Array([2]));
	const chave = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
	const cifrado = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, chave, claro));

	const rs = new Uint8Array(4);
	new DataView(rs.buffer).setUint32(0, RS);
	return juntar(salt, rs, new Uint8Array([asPublica.length]), asPublica, cifrado);
}

/** JWT do VAPID: `aud` é a origem do serviço de push. */
export async function assinarVapid(audiencia: string, assunto: string, privada: JsonWebKey, agora = Date.now()): Promise<string> {
	const json = (o: unknown) => b64url(texto.encode(JSON.stringify(o)));
	const dados = `${json({ typ: 'JWT', alg: 'ES256' })}.${json({ aud: audiencia, exp: Math.floor(agora / 1000) + VALIDADE_JWT_S, sub: assunto })}`;
	const chave = await crypto.subtle.importKey('jwk', privada, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
	// O WebCrypto devolve a assinatura como r||s (64 bytes), que já é o formato do JWS.
	const assinatura = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, chave, texto.encode(dados)));
	return `${dados}.${b64url(assinatura)}`;
}

/** O POST para o serviço de push, com a carga cifrada para o aparelho. */
export async function montarEnvio(inscricao: Inscricao, carga: string, vapid: Vapid, agora = Date.now()): Promise<Request> {
	const jwt = await assinarVapid(new URL(inscricao.endpoint).origin, vapid.assunto, vapid.privada, agora);
	return new Request(inscricao.endpoint, {
		method: 'POST',
		headers: {
			'content-encoding': 'aes128gcm',
			'content-type': 'application/octet-stream',
			ttl: String(TTL_S),
			urgency: 'normal',
			authorization: `vapid t=${jwt}, k=${vapid.publica}`
		},
		body: await cifrar(carga, inscricao)
	});
}

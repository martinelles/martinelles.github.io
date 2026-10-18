import { describe, expect, it } from 'vitest';
import { assinarVapid, b64url, cifrar, deB64url, derivarChaves, montarEnvio } from '../../../worker/push';

// RFC 8291, apêndice A: entradas e intermediários do exemplo da seção 5.
const RFC = {
	texto: 'When I grow up, I want to be a watermelon',
	asPublica: 'BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8',
	asPrivada: 'yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw',
	uaPublica: 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4',
	uaPrivada: 'q1dXpw3UpT5VOmu_cf_v6ih07Aems3njxI-JWgLcM94',
	salt: 'DGv6ra1nlYgDCS1FRnbzlw',
	auth: 'BTBZMqHH6r4Tts7J_aSIgg',
	ecdh: 'kyrL1jIIOHEzg3sM2ZWRHDRB62YACZhhSlknJ672kSs',
	prkChave: 'Snr3JMxaHVDXHWJn5wdC52WjpCtd2EIEGBykDcZW32k',
	ikm: 'S4lYMb_L0FxCeq0WhDx813KgSYqU26kOyzWUdsXYyrg',
	prk: '09_eUZGrsvxChDCGRCdkLiDXrReGOEVeSCdCcPBSJSc',
	cek: 'oIhVW04MRdy2XN9CiKLxTg',
	nonce: '4h_95klXJ5E_qnoN',
	cabecalho:
		'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8',
	cifrado: '8pfeW0KbunFT06SuDKoJH9Ql87S1QUrdirN6GcG7sFz1y1sqLgVi1VhjVkHsUoEsbI_0LpXMuGvnzQ'
};

/** JWK de uma chave P-256 a partir do `d` e da pública sem compressão (0x04 || x || y). */
function jwk(d: string, publica: string): JsonWebKey {
	const p = deB64url(publica);
	return { kty: 'EC', crv: 'P-256', d, x: b64url(p.slice(1, 33)), y: b64url(p.slice(33)), ext: true };
}

async function parEcdh(d: string, publica: string): Promise<CryptoKeyPair> {
	const alg = { name: 'ECDH', namedCurve: 'P-256' };
	return {
		privateKey: await crypto.subtle.importKey('jwk', jwk(d, publica), alg, true, ['deriveBits']),
		publicKey: await crypto.subtle.importKey('raw', deB64url(publica), alg, true, [])
	};
}

/** O lado do aparelho: decifra o corpo com a chave privada dele. */
async function decifrar(corpo: Uint8Array, uaPrivada: string, uaPublica: string, auth: string): Promise<string> {
	const salt = corpo.slice(0, 16);
	const idlen = corpo[20];
	const asPublica = corpo.slice(21, 21 + idlen);
	const ua = await parEcdh(uaPrivada, uaPublica);
	const chaveAs = await crypto.subtle.importKey('raw', asPublica, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
	const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: chaveAs }, ua.privateKey, 256));
	const { cek, nonce } = await derivarChaves(ecdh, deB64url(auth), deB64url(uaPublica), asPublica, salt);
	const chave = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt']);
	const claro = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, chave, corpo.slice(21 + idlen)));
	expect(claro[claro.length - 1]).toBe(2);
	return new TextDecoder().decode(claro.slice(0, -1));
}

describe('Web Push: cifra aes128gcm (RFC 8291)', () => {
	it('base64url ida e volta', () => {
		const b = Uint8Array.from([0, 1, 250, 251, 252, 253, 254, 255]);
		expect(deB64url(b64url(b))).toEqual(b);
		expect(() => deB64url('não+é')).toThrow();
	});

	it('intermediários do apêndice A', async () => {
		const r = await derivarChaves(deB64url(RFC.ecdh), deB64url(RFC.auth), deB64url(RFC.uaPublica), deB64url(RFC.asPublica), deB64url(RFC.salt));
		expect(b64url(r.prkChave)).toBe(RFC.prkChave);
		expect(b64url(r.ikm)).toBe(RFC.ikm);
		expect(b64url(r.prk)).toBe(RFC.prk);
		expect(b64url(r.cek)).toBe(RFC.cek);
		expect(b64url(r.nonce)).toBe(RFC.nonce);
	});

	it('com a chave efêmera e o salt da RFC, o corpo é o do apêndice A, byte a byte', async () => {
		const corpo = await cifrar(
			RFC.texto,
			{ p256dh: RFC.uaPublica, auth: RFC.auth },
			{ chaveEfemera: await parEcdh(RFC.asPrivada, RFC.asPublica), salt: deB64url(RFC.salt) }
		);
		expect(corpo.length).toBe(86 + deB64url(RFC.cifrado).length);
		expect(b64url(corpo.slice(0, 86))).toBe(RFC.cabecalho);
		expect(b64url(corpo.slice(86))).toBe(RFC.cifrado);
	});

	it('com chave e salt sorteados, o aparelho decifra a carga', async () => {
		const carga = JSON.stringify({ titulo: 'Missão de hoje', corpo: 'Faltam 2 de 4 blocos (1 h 30 min)' });
		const corpo = await cifrar(carga, { p256dh: RFC.uaPublica, auth: RFC.auth });
		expect(await decifrar(corpo, RFC.uaPrivada, RFC.uaPublica, RFC.auth)).toBe(carga);
	});
});

describe('Web Push: VAPID (RFC 8292) e o envio', () => {
	async function chavesVapid() {
		const par = (await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])) as CryptoKeyPair;
		return {
			par,
			privada: await crypto.subtle.exportKey('jwk', par.privateKey),
			publica: b64url(new Uint8Array(await crypto.subtle.exportKey('raw', par.publicKey)))
		};
	}
	const decodificar = (parte: string) => JSON.parse(new TextDecoder().decode(deB64url(parte)));

	it('JWT ES256 com aud, exp em 12 h e sub, e a assinatura verifica com a chave pública', async () => {
		const { par, privada } = await chavesVapid();
		const agora = Date.UTC(2026, 9, 14, 12);
		const jwt = await assinarVapid('https://fcm.googleapis.com', 'https://cgu.solarpunk.workers.dev', privada, agora);
		const [cab, claims, assinatura] = jwt.split('.');
		expect(decodificar(cab)).toEqual({ typ: 'JWT', alg: 'ES256' });
		const c = decodificar(claims);
		expect(c).toEqual({ aud: 'https://fcm.googleapis.com', exp: agora / 1000 + 12 * 3600, sub: 'https://cgu.solarpunk.workers.dev' });
		expect(c.exp - agora / 1000).toBeLessThanOrEqual(24 * 3600);
		const ok = await crypto.subtle.verify(
			{ name: 'ECDSA', hash: 'SHA-256' },
			par.publicKey,
			deB64url(assinatura),
			new TextEncoder().encode(`${cab}.${claims}`)
		);
		expect(ok).toBe(true);
	});

	it('montarEnvio: POST ao endpoint, cabeçalhos do push e corpo que o aparelho decifra', async () => {
		const { publica, privada } = await chavesVapid();
		const endpoint = 'https://fcm.googleapis.com/fcm/send/abc123';
		const req = await montarEnvio(
			{ endpoint, p256dh: RFC.uaPublica, auth: RFC.auth },
			'{"titulo":"oi"}',
			{ publica, privada, assunto: 'https://cgu.solarpunk.workers.dev' }
		);
		expect(req.method).toBe('POST');
		expect(req.url).toBe(endpoint);
		expect(req.headers.get('content-encoding')).toBe('aes128gcm');
		expect(req.headers.get('ttl')).toBe('14400');
		const auth = req.headers.get('authorization')!;
		expect(auth).toMatch(new RegExp(`^vapid t=[\\w-]+\\.[\\w-]+\\.[\\w-]+, k=${publica}$`));
		expect(decodificar(auth.slice('vapid t='.length).split('.')[1]).aud).toBe('https://fcm.googleapis.com');
		const corpo = new Uint8Array(await req.arrayBuffer());
		expect(await decifrar(corpo, RFC.uaPrivada, RFC.uaPublica, RFC.auth)).toBe('{"titulo":"oi"}');
	});
});

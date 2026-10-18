/**
 * API de progresso, sem nada do Cloudflare: recebe um `Banco` e devolve a resposta, ou `null`
 * quando o caminho não é da API (o Worker entrega aos assets). Testada com um banco em memória.
 *
 *   GET /api/progresso/:usuario         → { [chave]: { valor, atualizadoEm } }
 *   PUT /api/progresso/:usuario/:chave  { valor, atualizadoEm } → { gravado, atual }
 *
 * Vale a gravação mais nova, chave por chave (decisão 3 do plano).
 */
import { LIMITE_VALOR, chaveSincronizada, nomeValido } from '../src/lib/conta/regras';

export interface Gravado {
	valor: string;
	atualizadoEm: number;
}

export interface Banco {
	ler(usuario: string): Promise<Record<string, Gravado>>;
	/** Grava só se `atualizadoEm` for maior que o guardado; devolve se gravou e o que ficou. */
	gravar(usuario: string, chave: string, novo: Gravado): Promise<{ gravado: boolean; atual: Gravado }>;
}

const PREFIXO = '/api/';

export const json = (corpo: unknown, status = 200): Response =>
	new Response(JSON.stringify(corpo), {
		status,
		headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
	});

export const erro =(status: number, mensagem: string): Response => json({ erro: mensagem }, status);

function segmentos(caminho: string): string[] | null {
	try {
		return caminho.slice(PREFIXO.length).split('/').map(decodeURIComponent);
	} catch {
		return null;
	}
}

async function corpoDoPut(req: Request): Promise<Gravado | string> {
	const texto = await req.text();
	if (texto.length > LIMITE_VALOR + 1024) return 'corpo grande demais';
	let bruto: unknown;
	try {
		bruto = JSON.parse(texto);
	} catch {
		return 'corpo não é JSON';
	}
	if (!bruto || typeof bruto !== 'object') return 'corpo deveria ser objeto';
	const { valor, atualizadoEm } = bruto as Record<string, unknown>;
	if (typeof valor !== 'string') return 'valor deveria ser texto';
	if (valor.length > LIMITE_VALOR) return 'valor grande demais';
	try {
		JSON.parse(valor);
	} catch {
		return 'valor não é JSON';
	}
	if (typeof atualizadoEm !== 'number' || !Number.isSafeInteger(atualizadoEm) || atualizadoEm < 0)
		return 'atualizadoEm deveria ser inteiro ≥ 0';
	return { valor, atualizadoEm };
}

export async function tratarApi(req: Request, banco: Banco): Promise<Response | null> {
	const url = new URL(req.url);
	if (!url.pathname.startsWith(PREFIXO)) return null;

	const partes = segmentos(url.pathname);
	if (!partes || partes[0] !== 'progresso' || partes.length < 2 || partes.length > 3) return erro(404, 'rota inexistente');
	const [, usuario, chave] = partes;
	if (!nomeValido(usuario)) return erro(400, 'nome inválido');

	if (partes.length === 2) {
		if (req.method !== 'GET') return erro(405, 'use GET');
		return json(await banco.ler(usuario));
	}

	if (req.method !== 'PUT') return erro(405, 'use PUT');
	if (!chaveSincronizada(chave)) return erro(400, 'chave fora da lista');
	const novo = await corpoDoPut(req);
	if (typeof novo === 'string') return erro(400, novo);
	return json(await banco.gravar(usuario, chave, novo));
}

/**
 * `Storage` que sincroniza as chaves de progresso com o servidor (fase 2 do plano
 * planos/2026-10-13-login-por-nome-backend-cloudflare.md). Os stores recebem este objeto no
 * lugar do `localStorage` e não sabem da diferença: tudo é lido e gravado local primeiro; as
 * quatro chaves de `CHAVES_SINCRONIZADAS` ganham um carimbo e sobem por PUT, com espera curta
 * para juntar gravações seguidas. Falha de rede deixa a chave pendente para o próximo envio.
 *
 * Erro do `localStorage` (cota, bloqueio) sobe a quem chamou, como hoje: é por ele que os
 * stores sabem que não estão persistindo.
 */
import { chaveSincronizada, CHAVES_SINCRONIZADAS } from './regras';

/** `{ [chave]: { em, pendente } }`: quando a chave mudou neste aparelho e se falta subir. */
export const CHAVE_SINC = 'painel-concurso:sinc:v1';

interface Carimbo {
	em: number;
	pendente: boolean;
}
type Carimbos = Record<string, Carimbo>;

export interface Gravado {
	valor: string;
	atualizadoEm: number;
}

export interface OpcoesSinc {
	usuario: string;
	local: Storage;
	fetch: typeof globalThis.fetch;
	agora?: () => number;
	/** Espera antes de subir, para juntar gravações seguidas (ms). */
	espera?: number;
	agendar?: (fn: () => void, ms: number) => unknown;
	cancelar?: (id: unknown) => void;
}

export interface StorageSincronizado extends Storage {
	/** Sobe tudo que está pendente; nunca lança. */
	enviarPendentes(): Promise<void>;
	/** Traz do servidor o que lá é mais novo; devolve as chaves que mudaram aqui. Lança se a API não responder. */
	trazer(): Promise<string[]>;
}

export const urlProgresso = (usuario: string, chave?: string) =>
	`/api/progresso/${encodeURIComponent(usuario)}` + (chave ? `/${encodeURIComponent(chave)}` : '');

/** GET do progresso; lança `ApiIndisponivel` se o endereço não tem a API (GitHub Pages) ou a rede falha. */
export async function lerServidor(usuario: string, f: typeof globalThis.fetch): Promise<Record<string, Gravado>> {
	let r: Response;
	try {
		r = await f(urlProgresso(usuario), { cache: 'no-store' });
	} catch (e) {
		throw new ApiIndisponivel('sem rede', { cause: e });
	}
	if (!r.ok || !(r.headers.get('content-type') ?? '').includes('application/json'))
		throw new ApiIndisponivel(`a API respondeu ${r.status}`);
	return (await r.json()) as Record<string, Gravado>;
}

export class ApiIndisponivel extends Error {}

export function armazenamentoSincronizado(op: OpcoesSinc): StorageSincronizado {
	const { usuario, local } = op;
	const agora = op.agora ?? Date.now;
	const espera = op.espera ?? 2000;
	const agendar = op.agendar ?? ((fn, ms) => setTimeout(fn, ms));
	const cancelar = op.cancelar ?? ((id) => clearTimeout(id as ReturnType<typeof setTimeout>));
	let timer: unknown = null;
	let enviando: Promise<void> | null = null;

	function carimbos(): Carimbos {
		try {
			const bruto: unknown = JSON.parse(local.getItem(CHAVE_SINC) ?? 'null');
			return bruto && typeof bruto === 'object' && !Array.isArray(bruto) ? (bruto as Carimbos) : {};
		} catch {
			return {};
		}
	}
	function gravarCarimbos(c: Carimbos): void {
		try {
			local.setItem(CHAVE_SINC, JSON.stringify(c));
		} catch {
			// Sem onde guardar o carimbo: a chave sobe nesta sessão, mas não sobrevive a recarga.
		}
	}
	function carimbar(chave: string, carimbo: Carimbo): void {
		gravarCarimbos({ ...carimbos(), [chave]: carimbo });
	}

	function agendarEnvio(): void {
		if (timer !== null) cancelar(timer);
		timer = agendar(() => {
			timer = null;
			void enviarPendentes();
		}, espera);
	}

	async function enviarUma(chave: string, c: Carimbo): Promise<void> {
		const valor = local.getItem(chave);
		if (valor === null) return carimbar(chave, { ...c, pendente: false });
		let r: Response;
		try {
			r = await op.fetch(urlProgresso(usuario, chave), {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ valor, atualizadoEm: c.em })
			});
		} catch {
			return; // sem rede: fica pendente
		}
		if (r.status >= 500) return; // servidor com problema: tenta de novo depois
		// 2xx: gravou, ou o servidor já tinha algo mais novo (que chega no próximo `trazer`).
		// 4xx: o servidor nunca vai aceitar este valor; insistir não adianta.
		const atual = carimbos()[chave];
		if (atual && atual.em === c.em) carimbar(chave, { ...atual, pendente: false });
	}

	async function enviarPendentes(): Promise<void> {
		if (enviando) await enviando;
		enviando = (async () => {
			const pend = Object.entries(carimbos()).filter(([k, c]) => chaveSincronizada(k) && c?.pendente);
			for (const [k, c] of pend) await enviarUma(k, c);
		})().finally(() => (enviando = null));
		return enviando;
	}

	async function trazer(): Promise<string[]> {
		const servidor = await lerServidor(usuario, op.fetch);
		const c = carimbos();
		const mudaram: string[] = [];
		let algoPendente = false;
		for (const chave of CHAVES_SINCRONIZADAS) {
			const s = servidor[chave];
			const meu = c[chave];
			const valorLocal = local.getItem(chave);
			if (s && (!meu || s.atualizadoEm > meu.em)) {
				// Servidor mais novo (ou o aparelho nunca sincronizou esta chave): vale o servidor.
				if (valorLocal !== s.valor) {
					local.setItem(chave, s.valor);
					mudaram.push(chave);
				}
				c[chave] = { em: s.atualizadoEm, pendente: false };
			} else if (valorLocal !== null && (!s || meu!.em > s.atualizadoEm)) {
				// Só aqui, ou aqui é mais novo: sobe.
				c[chave] = { em: meu?.em ?? agora(), pendente: true };
				algoPendente = true;
			}
		}
		gravarCarimbos(c);
		if (algoPendente) await enviarPendentes();
		return mudaram;
	}

	return {
		get length() {
			return local.length;
		},
		key: (i) => local.key(i),
		getItem: (k) => local.getItem(k),
		clear: () => local.clear(),
		removeItem: (k) => local.removeItem(k),
		setItem(k, v) {
			local.setItem(k, v);
			if (!chaveSincronizada(k)) return;
			// Sempre cresce: o servidor só aceita carimbo maior que o guardado, e duas gravações no
			// mesmo milissegundo perderiam a segunda.
			const anterior = carimbos()[k]?.em ?? 0;
			carimbar(k, { em: Math.max(agora(), anterior + 1), pendente: true });
			agendarEnvio();
		},
		enviarPendentes,
		trazer
	};
}

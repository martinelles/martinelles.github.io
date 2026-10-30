/**
 * Caderno de erros: questão errada no feed entra aqui e sai depois de 2 acertos de re-treino.
 * Chave `painel-concurso:erros:v1`, JSON `{ [id]: { acertos, tentativas, em } }`.
 * O re-treino não mexe nas interações (a primeira resposta lá continua valendo): só este
 * estado conta as tentativas novas. Sem login, o caderno vive só no aparelho, como o resto.
 */
import { hojeLocal } from '$lib/datas';
import { CHAVE_INTERACOES } from './interacoes.svelte';

export const CHAVE_ERROS = 'painel-concurso:erros:v1';
/** Acertos de re-treino para a questão sair do caderno. */
export const ACERTOS_PARA_DOMINAR = 2;

export interface ErroNoCaderno {
	acertos: number;
	tentativas: number;
	em: string;
}

type Estado = Record<string, ErroNoCaderno>;

let estado = $state<Estado>({});
let persistindo = $state(false);
let armazenamento: Storage | null = null;

const ehObjeto = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

function saneado(bruto: unknown): Estado {
	if (!ehObjeto(bruto)) return {};
	const d: Estado = {};
	for (const [id, v] of Object.entries(bruto)) {
		if (
			ehObjeto(v) &&
			typeof v.acertos === 'number' &&
			typeof v.tentativas === 'number' &&
			Number.isInteger(v.acertos) &&
			Number.isInteger(v.tentativas) &&
			v.acertos >= 0 &&
			v.tentativas >= 1 &&
			typeof v.em === 'string'
		) {
			d[id] = { acertos: v.acertos, tentativas: v.tentativas, em: v.em };
		}
	}
	return d;
}

function gravar(): void {
	const copia = $state.snapshot(estado);
	if (!armazenamento) return;
	try {
		armazenamento.setItem(CHAVE_ERROS, JSON.stringify(copia));
	} catch {
		persistindo = false;
	}
}

function tentarLocalStorage(): Storage | null {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
}

/** Lê o que está gravado (idempotente). JSON inválido ⇒ estado vazio. */
export function carregarErros(arm: Storage | null = tentarLocalStorage()): void {
	armazenamento = arm;
	persistindo = arm !== null;
	try {
		estado = saneado(JSON.parse(arm?.getItem(CHAVE_ERROS) ?? 'null'));
	} catch (e) {
		// SyntaxError = conteúdo corrompido (o armazenamento funciona); outro erro = armazenamento bloqueado.
		if (!(e instanceof SyntaxError)) persistindo = false;
		estado = {};
	}
}

/**
 * Primeira visita (a chave ainda não existe no armazenamento): o caderno nasce das questões
 * que ela já errou nas interações. Depois disso a chave existe — questão dominada não volta.
 */
export function semearErros(arm: Storage | null = tentarLocalStorage()): void {
	if (!arm) return;
	try {
		if (arm.getItem(CHAVE_ERROS) !== null) return;
		const interacoes: unknown = JSON.parse(arm.getItem(CHAVE_INTERACOES) ?? 'null');
		if (!ehObjeto(interacoes) || !ehObjeto(interacoes.respostas)) return;
		for (const [id, r] of Object.entries(interacoes.respostas)) {
			if (ehObjeto(r) && r.ok === false) estado[id] = { acertos: 0, tentativas: 1, em: String(r.em) };
		}
		gravar();
	} catch {
		// Corrompido ou bloqueado: sem semente, o caderno começa vazio.
	}
}

/** Cópia do estado para cálculos puros dentro de `$derived`. */
export function dadosErros(): Estado {
	return $state.snapshot(estado);
}

export const erros = {
	registrado(id: string): ErroNoCaderno | null {
		const e = estado[id];
		return e ? { ...e } : null;
	},
	/** Ids no caderno, da tentativa mais recente para a mais antiga. */
	registrados(): string[] {
		return Object.entries(estado)
			.reverse() // empate de dia: quem entrou por último vem primeiro
			.sort((a, b) => (a[1].em < b[1].em ? 1 : a[1].em > b[1].em ? -1 : 0))
			.map(([id]) => id);
	},
	/** Questão errada no feed: entra no caderno (idempotente). */
	registrar(id: string, dia: string = hojeLocal()): void {
		if (estado[id]) return;
		estado[id] = { acertos: 0, tentativas: 1, em: dia };
		gravar();
	},
	/**
	 * Re-treino no caderno: conta a tentativa e, no 2º acerto, a questão sai. Id de fora do
	 * caderno é ignorado — o caderno só por erro no feed.
	 */
	reponder(id: string, ok: boolean, dia: string = hojeLocal()): void {
		const e = estado[id];
		if (!e) return;
		const acertos = e.acertos + (ok ? 1 : 0);
		if (acertos >= ACERTOS_PARA_DOMINAR) {
			delete estado[id];
		} else {
			estado[id] = { acertos, tentativas: e.tentativas + 1, em: dia };
		}
		gravar();
	},
	get persistindo(): boolean {
		return persistindo;
	}
};

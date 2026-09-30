/**
 * Interações no aparelho — contrato em kitty-specs/feed-estudo-cgu-01M3S6H8/contracts/interacoes.md.
 * Chave `painel-concurso:interacoes:v1`, JSON `{ respostas, curtidas, salvos, vistos }`.
 * Toda leitura e escrita do armazenamento fica em try/catch: se falhar, o estado vive só em memória
 * e `persistindo` vira false (a tela mostra o aviso uma vez).
 */
import { hojeLocal } from '$lib/datas';

export const CHAVE_INTERACOES = 'painel-concurso:interacoes:v1';
export const DIAS_VISTOS = 7;

export interface Resposta {
	r: string;
	ok: boolean;
	em: string;
}

export interface DadosInteracoes {
	respostas: Record<string, Resposta>;
	curtidas: string[];
	salvos: Record<string, string>;
	vistos: Record<string, string[]>;
}

const vazio = (): DadosInteracoes => ({ respostas: {}, curtidas: [], salvos: {}, vistos: {} });

let estado = $state<DadosInteracoes>(vazio());
let persistindo = $state(false);
let armazenamento: Storage | null = null;

const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;
const ehObjeto = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const textos = (v: unknown): string[] => (Array.isArray(v) ? [...new Set(v.filter((x) => typeof x === 'string'))] : []);

function saneado(bruto: unknown): DadosInteracoes {
	if (!ehObjeto(bruto)) return vazio();
	const d = vazio();
	if (ehObjeto(bruto.respostas)) {
		for (const [id, v] of Object.entries(bruto.respostas)) {
			if (ehObjeto(v) && typeof v.r === 'string' && typeof v.ok === 'boolean' && typeof v.em === 'string') {
				d.respostas[id] = { r: v.r, ok: v.ok, em: v.em };
			}
		}
	}
	d.curtidas = textos(bruto.curtidas);
	if (ehObjeto(bruto.salvos)) {
		for (const [id, v] of Object.entries(bruto.salvos)) if (typeof v === 'string') d.salvos[id] = v;
	}
	if (ehObjeto(bruto.vistos)) {
		for (const [dia, ids] of Object.entries(bruto.vistos)) if (DIA_RE.test(dia)) d.vistos[dia] = textos(ids);
	}
	return d;
}

/** 'AAAA-MM-DD' menos n dias de calendário (aritmética em UTC, sem ler o relógio). */
function diaMenos(dia: string, n: number): string {
	const [a, m, d] = dia.split('-').map(Number);
	return new Date(Date.UTC(a, m - 1, d - n)).toISOString().slice(0, 10);
}

/** Mantém só os últimos 7 dias, contados a partir do dia mais recente registrado. */
function podarVistos(vistos: Record<string, string[]>): Record<string, string[]> {
	const dias = Object.keys(vistos).sort();
	if (dias.length === 0) return {};
	const corte = diaMenos(dias[dias.length - 1], DIAS_VISTOS - 1);
	const podado: Record<string, string[]> = {};
	for (const dia of dias) if (dia >= corte) podado[dia] = vistos[dia];
	return podado;
}

function gravar(): void {
	estado.vistos = podarVistos(estado.vistos);
	const { respostas, curtidas, salvos, vistos } = $state.snapshot(estado);
	if (!armazenamento) return;
	try {
		armazenamento.setItem(CHAVE_INTERACOES, JSON.stringify({ respostas, curtidas, salvos, vistos }));
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
export function carregarInteracoes(arm: Storage | null = tentarLocalStorage()): void {
	armazenamento = arm;
	persistindo = arm !== null;
	try {
		estado = saneado(JSON.parse(arm?.getItem(CHAVE_INTERACOES) ?? 'null'));
	} catch (e) {
		// SyntaxError = conteúdo corrompido (o armazenamento funciona); outro erro = armazenamento bloqueado.
		if (!(e instanceof SyntaxError)) persistindo = false;
		estado = vazio();
	}
}

/** Cópia simples do estado para cálculos puros (ex.: `estatisticas`). Lida dentro de `$derived`, é reativa. */
export function dadosInteracoes(): DadosInteracoes {
	return $state.snapshot(estado);
}

export const interacoes = {
	resposta(id: string): Resposta | null {
		const r = estado.respostas[id];
		return r ? { r: r.r, ok: r.ok, em: r.em } : null;
	},
	/** Primeira resposta vale: ignora se já respondida. `dia` só existe para teste; a tela omite. */
	responder(id: string, r: string, gabarito: string, dia: string = hojeLocal()): void {
		if (estado.respostas[id]) return;
		estado.respostas[id] = { r, ok: r === gabarito, em: dia };
		gravar();
	},
	curtido(id: string): boolean {
		return estado.curtidas.includes(id);
	},
	alternarCurtida(id: string): void {
		estado.curtidas = estado.curtidas.includes(id) ? estado.curtidas.filter((x) => x !== id) : [...estado.curtidas, id];
		gravar();
	},
	salvo(id: string): boolean {
		return id in estado.salvos;
	},
	/** `agora` só existe para teste; a tela omite. */
	alternarSalvo(id: string, agora: Date = new Date()): void {
		if (id in estado.salvos) delete estado.salvos[id];
		else estado.salvos[id] = agora.toISOString();
		gravar();
	},
	/** Mais recente primeiro; empate de horário: o salvo depois vem antes. */
	salvosOrdenados(): string[] {
		return Object.entries(estado.salvos)
			.reverse()
			.sort((a, b) => (a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0))
			.map(([id]) => id);
	},
	marcarVisto(id: string, dia: string): void {
		if (!DIA_RE.test(dia)) return;
		const doDia = estado.vistos[dia];
		if (doDia?.includes(id)) return;
		estado.vistos[dia] = doDia ? [...doDia, id] : [id];
		gravar();
	},
	vistosNoDia(dia: string): Set<string> {
		return new Set(estado.vistos[dia] ?? []);
	},
	get persistindo(): boolean {
		return persistindo;
	}
};

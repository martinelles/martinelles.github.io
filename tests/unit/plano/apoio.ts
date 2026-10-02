/** Apoio dos testes do motor do plano: plano sintético, gerador pseudoaleatório e Storages falsos. */
import type { DadosPlano, ModoTarefa, Plano, Tarefa } from '$lib/plano/tipos';

/** Instante local (fuso do aparelho) — os testes não dependem do fuso da máquina. */
export const local = (dia: string, hora = 12, minuto = 0, segundo = 0): number => {
	const [a, m, d] = dia.split('-').map(Number);
	return new Date(a, m - 1, d, hora, minuto, segundo).getTime();
};
export const isoLocal = (dia: string, hora = 12, minuto = 0): string => new Date(local(dia, hora, minuto)).toISOString();

export const MIN_LEITURA = 25;
export const MIN_QUESTOES = 20;

/** Id do tópico sintético `n` (`TST-01`). */
export const topicoId = (n: number): string => `TST-${String(n).padStart(2, '0')}`;
/** Ids das tarefas do tópico `n`: `TST-01:L`, `TST-01:Q`. */
export const L = (n: number): string => `${topicoId(n)}:L`;
export const Q = (n: number): string => `${topicoId(n)}:Q`;

/** Uma tarefa do tópico `n` no modo dado (emenda D4). */
export function tarefa(n: number, modo: ModoTarefa = 'leitura', minutos = modo === 'leitura' ? MIN_LEITURA : MIN_QUESTOES): Tarefa {
	return {
		id: modo === 'leitura' ? L(n) : Q(n),
		topicoId: topicoId(n),
		modo,
		bloco: 'especializados',
		disciplina: 'Teste',
		materia: 'ti-ciencia-de-dados',
		topico: `Tópico ${n}`,
		minutos,
		prioridade: 100 - n,
		status: 'nao_iniciado'
	};
}

/** As duas tarefas do tópico `n`, `:L` e logo depois `:Q`, como o importador gera. */
export function topico(n: number, minLeitura = MIN_LEITURA, minQuestoes = MIN_QUESTOES): Tarefa[] {
	return [tarefa(n, 'leitura', minLeitura), tarefa(n, 'questoes', minQuestoes)];
}

/** Janela real (D2): 01/10 a 20/12/2026, 3 h/dia, 25 + 20 min; `n` tópicos TST-01.. ⇒ 2n tarefas. */
export function planoTeste(n = 12, extra: Partial<Plano> = {}): Plano {
	return {
		versao: 1,
		geradoEm: '2026-09-30',
		inicio: '2026-10-01',
		fim: '2026-12-20',
		horasPorDia: 3,
		minutosLeitura: MIN_LEITURA,
		minutosQuestoes: MIN_QUESTOES,
		tarefas: Array.from({ length: n }, (_, i) => topico(i + 1)).flat(),
		...extra
	};
}

export const dadosVazios = (): DadosPlano => ({ registros: {}, fotos: {} });

/** Marca `ids` como concluídos em `concluidaEm` (dados construídos à mão, sem o módulo de registro). */
export function concluir(dados: DadosPlano, ids: string[], concluidaEm: string, dia = concluidaEm.slice(0, 10)): DadosPlano {
	for (const id of ids) dados.registros[id] = { dia, intervalos: [], rodandoDesde: null, concluidaEm, questoes: null, certas: null };
	return dados;
}

/** PRNG determinístico (mulberry32). */
export function prng(semente: number): () => number {
	let a = semente >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Storage em memória que conta as escritas. */
export class StorageFalso implements Storage {
	private mapa = new Map<string, string>();
	escritas = 0;
	get length() {
		return this.mapa.size;
	}
	clear() {
		this.mapa.clear();
	}
	getItem(k: string) {
		return this.mapa.get(k) ?? null;
	}
	key(i: number) {
		return [...this.mapa.keys()][i] ?? null;
	}
	removeItem(k: string) {
		this.mapa.delete(k);
	}
	setItem(k: string, v: string) {
		this.escritas++;
		this.mapa.set(k, String(v));
	}
}

/** Storage que lança em toda chamada (janela privada). */
export class StorageQueLanca implements Storage {
	get length(): number {
		throw new Error('bloqueado');
	}
	clear(): void {
		throw new Error('bloqueado');
	}
	getItem(): string | null {
		throw new Error('bloqueado');
	}
	key(): string | null {
		throw new Error('bloqueado');
	}
	removeItem(): void {
		throw new Error('bloqueado');
	}
	setItem(): void {
		throw new Error('bloqueado');
	}
}

/** Lê normalmente mas falha ao gravar (cota esgotada). */
export class StorageSoLeitura extends StorageFalso {
	setItem(): void {
		throw new Error('QuotaExceededError');
	}
}

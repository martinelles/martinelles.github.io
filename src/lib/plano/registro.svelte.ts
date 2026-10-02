/**
 * Registro do plano no aparelho — contrato em kitty-specs/plano-de-estudos-01M3WPZ6/contracts/registro.md.
 * Chave `painel-concurso:plano:v1`, JSON `{ registros, fotos }` (data-model.md).
 * Cronômetro por timestamps (research R3): guarda `rodandoDesde` e intervalos fechados; o tempo
 * exibido é calculado (`minutosEstudados`), então fechar o app não perde o trecho em curso.
 * Escrita só nas transições (iniciar, pausar, retomar, concluir) e ao gravar foto — nunca por segundo.
 * Toda leitura e escrita em try/catch: se falhar, o estado vive em memória e `persistindo` vira false.
 */
import { hojeLocal } from '$lib/datas';
import { aceitaQuestoes } from './ids';
import type { DadosPlano, Intervalo, RegistroTarefa } from './tipos';

export const CHAVE_PLANO = 'painel-concurso:plano:v1';

const vazio = (): DadosPlano => ({ registros: {}, fotos: {} });

let estado = $state<DadosPlano>(vazio());
let persistindo = $state(false);
let armazenamento: Storage | null = null;

const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;
const ehObjeto = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const numero = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const contagem = (v: unknown): number | null => (numero(v) && Number.isInteger(v) && v >= 0 ? v : null);

function registroSaneado(v: unknown): RegistroTarefa | null {
	if (!ehObjeto(v) || typeof v.dia !== 'string' || !DIA_RE.test(v.dia)) return null;
	const intervalos: Intervalo[] = Array.isArray(v.intervalos)
		? v.intervalos.filter((i): i is Intervalo => Array.isArray(i) && i.length === 2 && numero(i[0]) && numero(i[1]) && i[1] >= i[0])
		: [];
	const concluidaEm = typeof v.concluidaEm === 'string' && !Number.isNaN(Date.parse(v.concluidaEm)) ? v.concluidaEm : null;
	let questoes = contagem(v.questoes);
	let certas = contagem(v.certas);
	if (questoes === null || certas === null || certas > questoes) questoes = certas = null;
	return {
		dia: v.dia,
		intervalos: intervalos.map(([a, b]) => [a, b]),
		rodandoDesde: concluidaEm === null && numero(v.rodandoDesde) ? v.rodandoDesde : null,
		concluidaEm,
		questoes,
		certas
	};
}

function saneado(bruto: unknown): DadosPlano {
	const d = vazio();
	if (!ehObjeto(bruto)) return d;
	if (ehObjeto(bruto.registros)) {
		for (const [id, v] of Object.entries(bruto.registros)) {
			const r = registroSaneado(v);
			if (!r) continue;
			// Emenda D4: questões só em tarefa `:Q`.
			if (!aceitaQuestoes(id)) r.questoes = r.certas = null;
			d.registros[id] = r;
		}
	}
	if (ehObjeto(bruto.fotos)) {
		for (const [dia, ids] of Object.entries(bruto.fotos)) {
			if (DIA_RE.test(dia) && Array.isArray(ids)) d.fotos[dia] = [...new Set(ids.filter((x): x is string => typeof x === 'string'))];
		}
	}
	// Um só cronômetro: se o gravado tiver mais de um rodando, fica o mais recente; os outros fecham
	// no instante em que ele começou.
	const rodando = Object.entries(d.registros)
		.filter(([, r]) => r.rodandoDesde !== null)
		.sort((a, b) => b[1].rodandoDesde! - a[1].rodandoDesde!);
	for (const [, r] of rodando.slice(1)) fechar(r, rodando[0][1].rodandoDesde!);
	return d;
}

/** Fecha o trecho em curso de `r` em `agora` (relógio que voltou não gera intervalo negativo). */
function fechar(r: RegistroTarefa, agora: number): void {
	if (r.rodandoDesde === null) return;
	r.intervalos.push([r.rodandoDesde, Math.max(agora, r.rodandoDesde)]);
	r.rodandoDesde = null;
}

function gravar(): void {
	if (!armazenamento) return;
	try {
		armazenamento.setItem(CHAVE_PLANO, JSON.stringify($state.snapshot(estado)));
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
export function carregarRegistro(arm: Storage | null = tentarLocalStorage()): void {
	armazenamento = arm;
	persistindo = arm !== null;
	try {
		estado = saneado(JSON.parse(arm?.getItem(CHAVE_PLANO) ?? 'null'));
	} catch (e) {
		// SyntaxError = conteúdo corrompido (o armazenamento funciona); outro erro = armazenamento bloqueado.
		if (!(e instanceof SyntaxError)) persistindo = false;
		estado = vazio();
	}
}

function idRodando(): string | null {
	for (const [id, r] of Object.entries(estado.registros)) if (r.rodandoDesde !== null) return id;
	return null;
}

/** Pausa o cronômetro que estiver rodando em outra tarefa (sem gravar; quem chama grava). */
function pausarOutra(id: string, agora: number): void {
	const outra = idRodando();
	if (outra !== null && outra !== id) fechar(estado.registros[outra], agora);
}

function copia(r: RegistroTarefa): RegistroTarefa {
	return { ...r, intervalos: r.intervalos.map(([a, b]) => [a, b]) };
}

export const registro = {
	get persistindo(): boolean {
		return persistindo;
	},
	doTarefa(id: string): RegistroTarefa | null {
		const r = estado.registros[id];
		return r ? copia(r) : null;
	},
	/** Id da tarefa com cronômetro ativo. */
	rodando(): string | null {
		return idRodando();
	},
	/**
	 * Começa (ou retoma) a tarefa com o cronômetro correndo; pausa a que estiver rodando.
	 * `dia` só é usado na primeira vez: o tempo conta para o dia em que a tarefa começou.
	 * Tarefa concluída ou já rodando: nada muda.
	 */
	iniciar(id: string, dia: string, agora: number = Date.now()): void {
		const r = estado.registros[id];
		if (r && (r.concluidaEm !== null || r.rodandoDesde !== null)) return;
		pausarOutra(id, agora);
		if (r) r.rodandoDesde = agora;
		else estado.registros[id] = { dia, intervalos: [], rodandoDesde: agora, concluidaEm: null, questoes: null, certas: null };
		gravar();
	},
	pausar(id: string, agora: number = Date.now()): void {
		const r = estado.registros[id];
		if (!r || r.rodandoDesde === null) return;
		fechar(r, agora);
		gravar();
	},
	/** Retoma uma tarefa pausada (pausa a que estiver rodando). Sem registro ou concluída: nada muda. */
	retomar(id: string, agora: number = Date.now()): void {
		const r = estado.registros[id];
		if (!r || r.concluidaEm !== null || r.rodandoDesde !== null) return;
		pausarOutra(id, agora);
		r.rodandoDesde = agora;
		gravar();
	},
	/**
	 * Conclui (definitivo): fecha o trecho em curso, marca `concluidaEm` e guarda as questões, se
	 * lançadas. Questões só em tarefa de Questões (id `…:Q`, emenda D4/FR-014) e com
	 * `certas ≤ questoes`, ambos inteiros ≥ 0 — senão lança RangeError sem mudar nada.
	 * Já concluída: nada muda. Sem registro (concluída sem cronômetro): cria um, com o dia de `agora`.
	 */
	concluir(id: string, q?: { questoes: number; certas: number }, agora: number = Date.now()): void {
		if (q) {
			if (!aceitaQuestoes(id)) {
				throw new RangeError(`Questões só se lançam na tarefa de Questões (…:Q); ${id} não é.`);
			}
			const { questoes, certas } = q;
			if (contagem(questoes) === null || contagem(certas) === null || certas > questoes) {
				throw new RangeError(`Questões inválidas: ${certas} certas de ${questoes} (inteiros ≥ 0, certas ≤ feitas).`);
			}
		}
		let r = estado.registros[id];
		if (r?.concluidaEm) return;
		if (!r) {
			estado.registros[id] = { dia: hojeLocal(new Date(agora)), intervalos: [], rodandoDesde: null, concluidaEm: null, questoes: null, certas: null };
			r = estado.registros[id];
		}
		fechar(r, agora);
		r.concluidaEm = new Date(agora).toISOString();
		if (q) {
			r.questoes = q.questoes;
			r.certas = q.certas;
		}
		gravar();
	},
	foto(dia: string): string[] | null {
		const f = estado.fotos[dia];
		return f ? [...f] : null;
	},
	/** Grava a missão do dia só se ainda não existe foto dele (idempotente). */
	gravarFoto(dia: string, ids: string[]): void {
		if (!DIA_RE.test(dia) || estado.fotos[dia]) return;
		estado.fotos[dia] = [...new Set(ids)];
		gravar();
	},
	/**
	 * Substitui a foto do dia. Só para foto obsoleta (`fotoObsoleta`): ids de um formato de plano
	 * que não existe mais. Fora disso, a foto do dia não muda (`gravarFoto` é idempotente).
	 */
	trocarFoto(dia: string, ids: string[]): void {
		if (!DIA_RE.test(dia)) return;
		estado.fotos[dia] = [...new Set(ids)];
		gravar();
	},
	/** Cópia simples do estado para as funções puras. Lida dentro de `$derived`, é reativa. */
	dados(): DadosPlano {
		return $state.snapshot(estado);
	}
};

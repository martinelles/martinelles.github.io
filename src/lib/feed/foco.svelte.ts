/**
 * Foco de estudo — contrato em kitty-specs/feed-estudo-cgu-01M3S6H8/contracts/interacoes.md (seção Foco).
 * Chave `painel-concurso:preferencias:v2`, JSON `{ disciplina, especialidade }`. A v1 é ignorada: não é
 * lida, migrada nem apagada. Gravação sem `especialidade` (anterior à escolha) vale Ciência de Dados.
 * Toda leitura e escrita do armazenamento fica em try/catch: se falhar, o foco vive só em memória.
 *
 * A especialidade decide o conteúdo: o plano de estudos, as matérias do feed e o cargo no cabeçalho.
 * As matérias são as disciplinas do Edital CGU 1/2026 (scripts/importar/disciplinas.mjs): B1–B4 e
 * C1–C5 comuns aos cargos, e a P3 de cada um (`cd-e1`…`cd-e4`, `aud-e1`…`aud-e5`, `infra-e1`…`infra-e4`).
 */
import { armazenamentoAtual } from '$lib/conta/sessao.svelte';
import type { Cargo } from '$lib/missoes/tipos';

export const CHAVE_FOCO = 'painel-concurso:preferencias:v2';

export type IdEspecialidade = 'ciencia-de-dados' | 'auditoria' | 'infraestrutura';

export interface Especialidade {
	id: IdEspecialidade;
	/** Rótulo curto da opção. */
	nome: string;
	/** Cargo no edital CGU 1/2026, para o cabeçalho. */
	cargo: string;
	/**
	 * Âncora que as Missões e as Prioridades do edital entendem (`#cd`, `#aud`); também escolhe o
	 * plano das Missões do painel (`/conteudo/missoes-<ancora>.json`). Ausente: o cargo ainda não
	 * tem plano nas Missões (Infraestrutura).
	 */
	ancora?: Cargo;
	/** Disciplina de foco ao escolher a especialidade. */
	disciplinaPadrao: string;
	/** Matérias do feed que não são cobradas nesta especialidade. */
	fora: (materia: string) => boolean;
}

/** P1 e P2 são comuns aos cargos; a P3 (`<prefixo>-e<n>`) é de cada um. */
const P3 = /^(cd|aud|infra)-/;
const foraDaP3 = (prefixo: string) => (materia: string) => P3.test(materia) && !materia.startsWith(`${prefixo}-`);

export const ESPECIALIDADES: readonly Especialidade[] = [
	{
		id: 'ciencia-de-dados',
		nome: 'Ciência de Dados',
		cargo: 'TI — Ciência de Dados',
		ancora: 'cd',
		disciplinaPadrao: 'cd-e1',
		fora: foraDaP3('cd')
	},
	{
		id: 'auditoria',
		nome: 'Auditoria',
		cargo: 'Auditoria',
		ancora: 'aud',
		disciplinaPadrao: 'c5',
		fora: foraDaP3('aud')
	},
	{
		// Cargo 3, sem plano nas Missões; a P3 vem do guia (planos/2026-10-15-especialidade-infraestrutura.md
		// e planos/2026-10-15-guia-infraestrutura-no-feed.md).
		id: 'infraestrutura',
		nome: 'Infraestrutura',
		cargo: 'TI — Infraestrutura',
		disciplinaPadrao: 'infra-e1',
		fora: foraDaP3('infra')
	}
];

export const ESPECIALIDADE_PADRAO: IdEspecialidade = 'ciencia-de-dados';
export const DISCIPLINA_PADRAO = 'cd-e1';

/** Id de disciplina do edital; a gravada antes da divisão pelo edital (ex.: `ti-ciencia-de-dados`) volta ao padrão. */
const DISCIPLINA = /^(b[1-4]|c[1-5]|cd-e[1-4]|aud-e[1-5]|infra-e[1-4])$/;
const valida = (v: unknown): v is string => typeof v === 'string' && DISCIPLINA.test(v);
const especialidadeValida = (v: unknown): v is IdEspecialidade => ESPECIALIDADES.some((e) => e.id === v);
export const especialidadePorId = (id: IdEspecialidade): Especialidade => ESPECIALIDADES.find((e) => e.id === id)!;

let disciplina = $state(DISCIPLINA_PADRAO);
let especialidade = $state<IdEspecialidade>(ESPECIALIDADE_PADRAO);
let armazenamento: Storage | null = null;
let carregado = false;

function tentarLocalStorage(): Storage | null {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
}

function gravar(): void {
	try {
		armazenamento?.setItem(CHAVE_FOCO, JSON.stringify({ disciplina, especialidade }));
	} catch {
		// Armazenamento cheio ou bloqueado: o foco segue em memória nesta sessão.
	}
}

/** Lê o que está gravado (idempotente). Ausente, corrompido ou inválido ⇒ padrão. */
export function carregarFoco(arm: Storage | null = tentarLocalStorage()): void {
	carregado = true;
	armazenamento = arm;
	try {
		const bruto: unknown = JSON.parse(arm?.getItem(CHAVE_FOCO) ?? 'null');
		const obj = bruto && typeof bruto === 'object' ? (bruto as Record<string, unknown>) : {};
		especialidade = especialidadeValida(obj.especialidade) ? obj.especialidade : ESPECIALIDADE_PADRAO;
		const atual = especialidadePorId(especialidade);
		const d = obj.disciplina;
		disciplina = valida(d) && !atual.fora(d) ? d : atual.disciplinaPadrao;
	} catch {
		especialidade = ESPECIALIDADE_PADRAO;
		disciplina = DISCIPLINA_PADRAO;
	}
}

/** Lê o foco só se ninguém leu ainda nesta aba (sem armazenamento, reler apagaria a escolha). */
export function garantirFoco(): void {
	if (!carregado) carregarFoco(armazenamentoAtual());
}

export const foco = {
	get disciplina(): string {
		return disciplina;
	},
	get especialidade(): Especialidade {
		return especialidadePorId(especialidade);
	},
	/** Id de disciplina do edital. Valor que não é disciplina ou que está fora da especialidade é ignorado. */
	escolherDisciplina(id: string): void {
		if (!valida(id) || especialidadePorId(especialidade).fora(id)) return;
		disciplina = id;
		gravar();
	},
	/**
	 * Troca a especialidade. A disciplina de foco acompanha quando era a padrão da anterior ou
	 * quando ficou fora da nova; uma escolha própria que continua valendo é mantida.
	 */
	escolherEspecialidade(id: string): void {
		if (!especialidadeValida(id) || id === especialidade) return;
		const anterior = especialidadePorId(especialidade);
		const nova = especialidadePorId(id);
		especialidade = id;
		if (disciplina === anterior.disciplinaPadrao || nova.fora(disciplina)) disciplina = nova.disciplinaPadrao;
		gravar();
	}
};

/**
 * Foco de estudo — contrato em kitty-specs/feed-estudo-cgu-01M3S6H8/contracts/interacoes.md (seção Foco).
 * Chave `painel-concurso:preferencias:v2`, JSON `{ disciplina, especialidade }`. A v1 é ignorada: não é
 * lida, migrada nem apagada. Gravação sem `especialidade` (anterior à escolha) vale Ciência de Dados.
 * Toda leitura e escrita do armazenamento fica em try/catch: se falhar, o foco vive só em memória.
 *
 * A especialidade decide o conteúdo: o plano de estudos, as matérias do feed e o cargo no cabeçalho.
 */
export const CHAVE_FOCO = 'painel-concurso:preferencias:v2';

export type IdEspecialidade = 'ciencia-de-dados' | 'auditoria';

export interface Especialidade {
	id: IdEspecialidade;
	/** Rótulo curto da opção. */
	nome: string;
	/** Cargo no edital CGU 1/2026, para o cabeçalho. */
	cargo: string;
	/** Arquivo do plano em `/conteudo/` (gerado pelo importador). */
	plano: string;
	/** Âncora que as Missões e as Prioridades do edital entendem (`#cd`, `#aud`). */
	ancora: string;
	/** Disciplina de foco ao escolher a especialidade. */
	disciplinaPadrao: string;
	/** Matérias do feed que não são cobradas nesta especialidade. */
	fora: (materia: string) => boolean;
}

export const ESPECIALIDADES: readonly Especialidade[] = [
	{
		id: 'ciencia-de-dados',
		nome: 'Ciência de Dados',
		cargo: 'TI — Ciência de Dados',
		plano: 'plano.json',
		ancora: 'cd',
		disciplinaPadrao: 'ti-ciencia-de-dados',
		fora: () => false
	},
	{
		id: 'auditoria',
		nome: 'Auditoria',
		cargo: 'Auditoria',
		plano: 'plano-auditoria.json',
		ancora: 'aud',
		disciplinaPadrao: 'fundamentos-de-auditoria-governamental',
		// A P3 de Auditoria não cobra TI; P1 e P2 são comuns aos cargos.
		fora: (materia) => materia.startsWith('ti-')
	}
];

export const ESPECIALIDADE_PADRAO: IdEspecialidade = 'ciencia-de-dados';
export const DISCIPLINA_PADRAO = 'ti-ciencia-de-dados';

const SLUG = /^[a-z0-9-]+$/;
const valida = (v: unknown): v is string => typeof v === 'string' && SLUG.test(v);
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
	if (!carregado) carregarFoco();
}

export const foco = {
	get disciplina(): string {
		return disciplina;
	},
	get especialidade(): Especialidade {
		return especialidadePorId(especialidade);
	},
	/** Id de matéria (slug). Valor que não é slug ou que está fora da especialidade é ignorado. */
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

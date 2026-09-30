/**
 * Disciplina de foco — contrato em kitty-specs/feed-estudo-cgu-01M3S6H8/contracts/interacoes.md (seção Foco).
 * Chave `painel-concurso:preferencias:v2`, JSON `{ disciplina }`. A v1 é ignorada: não é lida, migrada nem apagada.
 * Toda leitura e escrita do armazenamento fica em try/catch: se falhar, o foco vive só em memória.
 */
export const CHAVE_FOCO = 'painel-concurso:preferencias:v2';
export const DISCIPLINA_PADRAO = 'ti-ciencia-de-dados';

const SLUG = /^[a-z0-9-]+$/;
const valida = (v: unknown): v is string => typeof v === 'string' && SLUG.test(v);

let disciplina = $state(DISCIPLINA_PADRAO);
let armazenamento: Storage | null = null;

function tentarLocalStorage(): Storage | null {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
}

/** Lê o que está gravado (idempotente). Ausente, corrompido ou inválido ⇒ padrão. */
export function carregarFoco(arm: Storage | null = tentarLocalStorage()): void {
	armazenamento = arm;
	try {
		const bruto: unknown = JSON.parse(arm?.getItem(CHAVE_FOCO) ?? 'null');
		const d = bruto && typeof bruto === 'object' ? (bruto as Record<string, unknown>).disciplina : undefined;
		disciplina = valida(d) ? d : DISCIPLINA_PADRAO;
	} catch {
		disciplina = DISCIPLINA_PADRAO;
	}
}

export const foco = {
	get disciplina(): string {
		return disciplina;
	},
	/** Id de matéria (slug). Valor que não é slug é ignorado. */
	escolherDisciplina(id: string): void {
		if (!valida(id)) return;
		disciplina = id;
		try {
			armazenamento?.setItem(CHAVE_FOCO, JSON.stringify({ disciplina }));
		} catch {
			// Armazenamento cheio ou bloqueado: o foco segue em memória nesta sessão.
		}
	}
};

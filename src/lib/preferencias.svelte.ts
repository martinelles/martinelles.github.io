/**
 * Preferências gravadas no aparelho — contrato em kitty-specs/.../contracts/preferencias.md.
 * Chave `painel-concurso:preferencias:v1`, JSON `{ concursoId, cargoId, disciplina }`.
 * Toda leitura e escrita do armazenamento fica em try/catch: se falhar, o estado vive só em memória.
 */
import { buscarConcurso, type Concurso } from '$lib/dados';

const CHAVE = 'painel-concurso:preferencias:v1';

interface Estado {
	concursoId: string | null;
	cargoId: string | null;
	disciplina: string | null;
}

const vazio = (): Estado => ({ concursoId: null, cargoId: null, disciplina: null });

let estado = $state<Estado>(vazio());
let armazenamento: Storage | null = null;

const texto = (v: unknown): string | null => (typeof v === 'string' ? v : null);
const cargoUnico = (c: Concurso): string | null => (c.cargos.length === 1 ? c.cargos[0].id : null);

/** Aplica a cascata: concurso inexistente zera tudo; cargo fora do concurso zera cargo e disciplina; disciplina fora do cargo vira null. */
function saneado(bruto: unknown): Estado {
	if (!bruto || typeof bruto !== 'object') return vazio();
	const b = bruto as Record<string, unknown>;
	const concurso = buscarConcurso(texto(b.concursoId));
	if (!concurso) return vazio();

	const cargo = concurso.cargos.find((c) => c.id === texto(b.cargoId));
	if (!cargo) return { concursoId: concurso.id, cargoId: cargoUnico(concurso), disciplina: null };

	const disciplina = texto(b.disciplina);
	return {
		concursoId: concurso.id,
		cargoId: cargo.id,
		disciplina: disciplina !== null && cargo.disciplinas.includes(disciplina) ? disciplina : null
	};
}

function gravar() {
	const { concursoId, cargoId, disciplina } = estado;
	try {
		armazenamento?.setItem(CHAVE, JSON.stringify({ concursoId, cargoId, disciplina }));
	} catch {
		// Silencioso: armazenamento cheio ou bloqueado; o estado continua em memória na sessão.
	}
}

function tentarLocalStorage(): Storage | null {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
}

/** Lê o que está gravado (idempotente). As telas chamam no topo do `<script>`. */
export function carregar(arm: Storage | null = tentarLocalStorage()): void {
	armazenamento = arm;
	try {
		estado = saneado(JSON.parse(arm?.getItem(CHAVE) ?? 'null'));
	} catch {
		estado = vazio();
	}
}

export const preferencias = {
	get concursoId(): string | null {
		return estado.concursoId;
	},
	get cargoId(): string | null {
		return estado.cargoId;
	},
	get disciplina(): string | null {
		return estado.disciplina;
	},
	/** Mesmo id preserva cargo e disciplina; id novo define o cargo se houver só um. Id inexistente é ignorado. */
	escolherConcurso(id: string): void {
		const concurso = buscarConcurso(id);
		if (!concurso || concurso.id === estado.concursoId) return;
		estado = { concursoId: concurso.id, cargoId: cargoUnico(concurso), disciplina: null };
		gravar();
	},
	/** Limpa a disciplina. Cargo fora do concurso atual é ignorado. */
	escolherCargo(id: string): void {
		const concurso = buscarConcurso(estado.concursoId);
		if (!concurso?.cargos.some((c) => c.id === id)) return;
		estado.cargoId = id;
		estado.disciplina = null;
		gravar();
	},
	/** Disciplina fora do cargo atual é ignorada. */
	escolherDisciplina(nome: string): void {
		const cargo = buscarConcurso(estado.concursoId)?.cargos.find((c) => c.id === estado.cargoId);
		if (!cargo?.disciplinas.includes(nome)) return;
		estado.disciplina = nome;
		gravar();
	}
};

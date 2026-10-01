/**
 * Tema do app (Aventura, Kindle, Kindle escuro) — fonte única; o script inline de src/app.html aplica a mesma regra antes da pintura.
 * Contrato: kitty-specs/identidade-visual-aventura-kindle-01M3T7H9/contracts/tema.md (§2 chave, §3 regra, §4 API).
 * Chave `painel-concurso:tema:v1`, JSON `{ tema }`. Toda leitura e escrita em try/catch: se falhar, a escolha vive só em memória.
 */
export type Tema = 'aventura' | 'kindle' | 'kindle-escuro';
export type PreferenciaTema = 'sistema' | Tema;

/** Onde o tema é aplicado; injetável para teste em ambiente node. */
export interface AlvoTema {
	definir(t: Tema): void;
}

export const CHAVE_TEMA = 'painel-concurso:tema:v1';

/** Ordem do seletor. */
export const TEMAS = [
	{ id: 'aventura', nome: 'Aventura' },
	{ id: 'kindle', nome: 'Kindle' },
	{ id: 'kindle-escuro', nome: 'Kindle escuro' }
] as const satisfies readonly { id: Tema; nome: string }[];

const PREFERENCIAS: readonly string[] = ['sistema', ...TEMAS.map((t) => t.id)];
const valida = (v: unknown): v is PreferenciaTema => typeof v === 'string' && PREFERENCIAS.includes(v);

let preferencia = $state<PreferenciaTema>('sistema');
let escuroAparelho = $state(false);

let armazenamento: Storage | null = null;
let alvoAtual: AlvoTema | null = null;
// Ouvinte de prefers-color-scheme em vigor, para trocar sem duplicar (HMR, nova chamada).
let ouvinte: { mq: MediaQueryList; fn: (e: MediaQueryListEvent) => void } | null = null;

/** Regra do contrato §3 (a mesma do script inline). */
function resolver(): Tema {
	return preferencia !== 'sistema' ? preferencia : escuroAparelho ? 'kindle-escuro' : 'aventura';
}

function aplicar(): void {
	alvoAtual?.definir(resolver());
}

function tentarLocalStorage(): Storage | null {
	try {
		return globalThis.localStorage ?? null;
	} catch {
		return null;
	}
}

function tentarMatchMedia(): MediaQueryList | null {
	try {
		return globalThis.matchMedia?.('(prefers-color-scheme: dark)') ?? null;
	} catch {
		return null;
	}
}

/** <html data-tema> e <meta name="theme-color">; `null` fora do navegador. */
function alvoDocumento(): AlvoTema | null {
	if (typeof document === 'undefined') return null;
	return {
		definir(t) {
			const raiz = document.documentElement;
			// Mesmo valor que o script inline já pôs: não reescreve (nenhuma mutação na carga).
			if (raiz.dataset.tema !== t) raiz.dataset.tema = t;
			// Cor lida depois de trocar o atributo, dos tokens do CSS; nada de cor duplicada aqui.
			const cor = getComputedStyle(raiz).getPropertyValue('--cor-fundo').trim();
			const meta = document.querySelector('meta[name="theme-color"]');
			if (meta && cor && meta.getAttribute('content') !== cor) meta.setAttribute('content', cor);
		}
	};
}

/** Lê a preferência, liga o ouvinte do aparelho e aplica (idempotente). */
export function carregarTema(
	arm: Storage | null = tentarLocalStorage(),
	mq: MediaQueryList | null = tentarMatchMedia(),
	alvo: AlvoTema | null = alvoDocumento()
): void {
	armazenamento = arm;
	alvoAtual = alvo;
	try {
		const bruto: unknown = JSON.parse(arm?.getItem(CHAVE_TEMA) ?? 'null');
		const t = bruto && typeof bruto === 'object' ? (bruto as Record<string, unknown>).tema : undefined;
		// Inválido ou ausente vale como `sistema`, sem apagar nem reescrever (contrato §2).
		preferencia = valida(t) ? t : 'sistema';
	} catch {
		preferencia = 'sistema';
	}

	if (ouvinte) ouvinte.mq.removeEventListener('change', ouvinte.fn);
	ouvinte = null;
	escuroAparelho = mq?.matches ?? false;
	if (mq) {
		// Sempre acompanha o aparelho; só muda o que aparece quando a preferência é `sistema`.
		const fn = (e: MediaQueryListEvent) => {
			escuroAparelho = e.matches;
			aplicar();
		};
		mq.addEventListener('change', fn);
		ouvinte = { mq, fn };
	}

	aplicar();
}

export const tema = {
	get preferencia(): PreferenciaTema {
		return preferencia;
	},
	get ativo(): Tema {
		return resolver();
	},
	/** Valor fora da lista é ignorado. Aplica na hora e grava. */
	escolher(p: PreferenciaTema): void {
		if (!valida(p)) return;
		preferencia = p;
		aplicar();
		try {
			armazenamento?.setItem(CHAVE_TEMA, JSON.stringify({ tema: p }));
		} catch {
			// Armazenamento cheio ou bloqueado: a escolha segue em memória nesta sessão.
		}
	}
};

/**
 * Podcasts das aulas: o catálogo vem de `/conteudo/audios.json` (gerado do vault pelo importador,
 * chaveado pelo id da aula no catálogo da mentoria) e a marcação de ouvido fica na chave
 * `painel-concurso:audios:v1` da conta, como as marcações das Missões.
 */
import { CHAVE_AUDIOS } from '$lib/conta/regras';

export interface AudioDaAula {
	titulo: string;
	/** Caminho do MP3 em `/conteudo/audios/…`, servido pelo próprio painel. */
	arquivo: string;
	/** Infográfico do capítulo (PNG do vault), para ouvir olhando. */
	infografico?: string;
}

/** O que cada aula tem na pasta do NotebookLM: a capa geral e os podcasts por capítulo. */
export interface AudiosDaAula {
	/** Infográfico geral da aula (sem "Cap"). */
	capa?: string;
	audios: AudioDaAula[];
}

/** Catálogo: id da aula → audios. `null` enquanto carrega; `{}` sem catálogo. */
let catalogo = $state<Record<string, AudiosDaAula> | null>(null);
let carregar: Promise<void> | null = null;

/** Lê o catálogo uma vez por carga do app (idempotente; falha de rede deixa como está). */
export function carregarAudios(buscar: typeof fetch = fetch): Promise<void> {
	carregar ??= buscar('/conteudo/audios.json', { cache: 'no-cache' })
		.then(
			(r) => r.ok ? (r.json() as Promise<Record<string, AudiosDaAula>>) : ({} as Record<string, AudiosDaAula>),
			() => ({}) as Record<string, AudiosDaAula>
		)
		.then((d) => {
			if (!d || typeof d !== 'object') {
				catalogo = {};
				return;
			}
			// Formato antigo (lista de audios, sem capa/infográfico) entra como { audios }.
			const normalizado: Record<string, AudiosDaAula> = {};
			for (const [id, valor] of Object.entries(d)) {
				if (Array.isArray(valor)) normalizado[id] = { audios: valor };
				else if (valor && typeof valor === 'object' && Array.isArray(valor.audios)) normalizado[id] = valor;
			}
			catalogo = normalizado;
		});
	return carregar;
}

let ouvidos = $state<Record<string, true>>({});
let armazenamento: Storage | null = null;

/** Lê o que está gravado, aceitando só chave de audio com valor verdadeiro. */
export function lerOuvidos(texto: string | null): Record<string, true> {
	const d: Record<string, true> = {};
	try {
		const bruto: unknown = JSON.parse(texto ?? '{}');
		if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return d;
		for (const [k, v] of Object.entries(bruto)) if (v && k.includes('/')) d[k] = true;
	} catch {
		// Corrompido: nada ouvido.
	}
	return d;
}

/** Lê o que está gravado (idempotente). */
export function carregarOuvidos(arm: Storage | null): void {
	armazenamento = arm;
	try {
		ouvidos = lerOuvidos(arm?.getItem(CHAVE_AUDIOS) ?? null);
	} catch {
		ouvidos = {};
	}
}

function gravar(novos: Record<string, true>): void {
	ouvidos = novos;
	try {
		if (Object.keys(novos).length) armazenamento?.setItem(CHAVE_AUDIOS, JSON.stringify(novos));
		else armazenamento?.removeItem(CHAVE_AUDIOS);
	} catch {
		// Armazenamento cheio ou bloqueado: a marca fica em memória nesta aba.
	}
}

export const audiosMissoes = {
	/** Os audios da aula, quando o catálogo já carregou e ela tem. */
	daAula(id: string): AudiosDaAula | null {
		return catalogo?.[id] ?? null;
	},
	ouvido(arquivo: string): boolean {
		return !!ouvidos[arquivo];
	},
	/** Marca (ou desmarca) um audio como ouvido; o fim da reprodução também marca. */
	marcar(arquivo: string, feito: boolean): void {
		const novos = { ...ouvidos };
		if (feito) novos[arquivo] = true;
		else delete novos[arquivo];
		gravar(novos);
	}
};

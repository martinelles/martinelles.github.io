/**
 * Cola entre as telas e o motor do plano (`$lib/plano`): carga do plano, relógio da tela,
 * registro carregado uma vez por aba, "Iniciar estudos" e o download do CSV.
 * Nada de número guardado aqui (C-003): tudo sai do motor a cada leitura.
 */
import { untrack } from 'svelte';
import { goto } from '$app/navigation';
import { hojeLocal } from '$lib/datas';
import { carregarPlano } from '$lib/plano/carregar';
import { fasePlano, type FasePlano } from '$lib/plano/dias';
import { exportarCsv, nomeArquivoExportacao } from '$lib/plano/exportar';
import { carregarRegistro, registro } from '$lib/plano/registro.svelte';
import {
	concluidasNaMissao,
	filaEsgotada,
	fotoObsoleta,
	minutosEstimados,
	missaoDoDia,
	percentualMissao,
	primeiraPendente
} from '$lib/plano/missao';
import type { DadosPlano, Plano, Tarefa } from '$lib/plano/tipos';
import { extrasDoDia, proximaDaFila } from './continuar';

let registroCarregado = false;

/**
 * Lê o registro gravado na primeira tela da aba que o usa. Só na primeira: com o armazenamento
 * indisponível o registro vive em memória, e ler de novo ao navegar apagaria o que a sessão fez.
 */
export function garantirRegistro(): void {
	if (registroCarregado) return;
	carregarRegistro();
	registroCarregado = true;
}

/** Plano importado, carregado em segundo plano; `erro` com a mensagem se a busca falhar. */
export function usarPlano(): { readonly plano: Plano | null; readonly erro: string | null } {
	let plano = $state.raw<Plano | null>(null);
	let erro = $state<string | null>(null);
	carregarPlano().then(
		(p) => (plano = p),
		(e: unknown) => (erro = e instanceof Error ? e.message : String(e))
	);
	return {
		get plano() {
			return plano;
		},
		get erro() {
			return erro;
		}
	};
}

/**
 * Relógio da tela: `agora` em ms, atualizado a cada segundo enquanto há cronômetro rodando e a
 * cada 30 s fora disso (o bastante para virar o dia com a tela aberta). Só para exibição: o tempo
 * registrado vem dos timestamps do registro, não da soma dos tiques.
 */
export function usarAgora(): { readonly ms: number; readonly hoje: string } {
	let ms = $state(Date.now());
	$effect(() => {
		const rapido = registro.rodando() !== null;
		const id = setInterval(() => (ms = Date.now()), rapido ? 1000 : 30_000);
		ms = Date.now();
		return () => clearInterval(id);
	});
	return {
		get ms() {
			return ms;
		},
		get hoje() {
			return hojeLocal(new Date(ms));
		}
	};
}

/**
 * "Iniciar estudos" (FR-007, SC-002): abre a tarefa com o cronômetro já correndo.
 * Sem registro, começa (o tempo conta para `dia`); pausada, retoma; rodando, só abre.
 */
export async function iniciarEstudos(tarefa: Tarefa, dia: string): Promise<void> {
	const r = registro.doTarefa(tarefa.id);
	if (!r) registro.iniciar(tarefa.id, dia);
	else if (r.concluidaEm === null && r.rodandoDesde === null) registro.retomar(tarefa.id);
	await goto(`/tarefa/${encodeURIComponent(tarefa.id)}`);
}

/** Baixa o CSV do motor (FR-011) com o nome `progresso-plano-AAAA-MM-DD.csv`. */
export function baixarProgresso(plano: Plano, dia: string): void {
	const blob = new Blob([exportarCsv(plano, registro.dados())], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = nomeArquivoExportacao(dia);
	document.body.append(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 0);
}

export interface VisaoMissao {
	/** `null` enquanto o plano carrega. */
	readonly fase: FasePlano | null;
	readonly dados: DadosPlano;
	/** Tarefas de hoje; vazia fora da janela do plano ou com a fila esgotada. */
	readonly tarefas: Tarefa[];
	readonly concluidas: number;
	/** Fração 0–1. */
	readonly percentual: number;
	readonly minutos: number;
	readonly primeira: Tarefa | null;
	/** Todas as tarefas de hoje feitas. */
	readonly cumprida: boolean;
	/** Dia do plano sem tarefa: a fila acabou ("Plano cumprido — revise"). */
	readonly esgotada: boolean;
	/**
	 * Emenda D5: com a missão cumprida, alvo de "Continuar estudando" (extra pausada ou a próxima
	 * pendente da fila); `null` com a missão em aberto ou a fila esgotada.
	 */
	readonly proxima: Tarefa | null;
	/** Tarefas extras (fora da foto) concluídas hoje e os minutos delas — calculado, nada guardado. */
	readonly extras: { tarefas: number; minutos: number };
}

/**
 * Missão de hoje a partir do motor. Na primeira vez que ela aparece no dia, grava a foto
 * (`registro.gravarFoto`): é a foto que fixa a missão do dia e decide se o dia foi concluído.
 * Fora da janela do plano não há missão nem foto.
 */
export function usarMissao(fonte: { readonly plano: Plano | null }, relogio: { readonly hoje: string }): VisaoMissao {
	const dados = $derived(registro.dados());
	const fase = $derived(fonte.plano ? fasePlano(fonte.plano, relogio.hoje) : null);
	const tarefas = $derived(fonte.plano && fase === 'durante' ? missaoDoDia(fonte.plano, dados, relogio.hoje) : []);

	$effect(() => {
		if (!fonte.plano || fase !== 'durante') return;
		const dia = relogio.hoje;
		const ids = tarefas.map((t) => t.id);
		const plano = fonte.plano;
		untrack(() => {
			// Foto com ids de um formato antigo do plano (ex.: antes da emenda D4) é refeita.
			if (fotoObsoleta(plano, registro.dados(), dia)) registro.trocarFoto(dia, ids);
			else registro.gravarFoto(dia, ids);
		});
	});

	return {
		get fase() {
			return fase;
		},
		get dados() {
			return dados;
		},
		get tarefas() {
			return tarefas;
		},
		get concluidas() {
			return concluidasNaMissao(tarefas, dados);
		},
		get percentual() {
			return percentualMissao(tarefas, dados);
		},
		get minutos() {
			return minutosEstimados(tarefas);
		},
		get primeira() {
			return primeiraPendente(tarefas, dados);
		},
		get cumprida() {
			return tarefas.length > 0 && concluidasNaMissao(tarefas, dados) === tarefas.length;
		},
		get esgotada() {
			// Pela fila inteira, não pela missão: missão vazia por outro motivo não é "Plano cumprido".
			return fase === 'durante' && !!fonte.plano && filaEsgotada(fonte.plano, dados);
		},
		get proxima() {
			const cumprida = tarefas.length > 0 && concluidasNaMissao(tarefas, dados) === tarefas.length;
			return fonte.plano && cumprida ? proximaDaFila(fonte.plano, dados, relogio.hoje) : null;
		},
		get extras() {
			return fonte.plano && fase === 'durante' ? extrasDoDia(fonte.plano, dados, relogio.hoje) : { tarefas: 0, minutos: 0 };
		}
	};
}

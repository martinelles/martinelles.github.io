<script lang="ts">
	// Cronômetro da tarefa (FR-007, NFR-002, NFR-003). O tempo vem do registro (timestamps), não
	// de tiques somados: fechar e reabrir a tela mostra o tempo certo. O `role="timer"` não fala a
	// cada segundo; só as transições (iniciar, pausar, retomar) são anunciadas.
	import Icone from '$lib/componentes/Icone.svelte';
	import { minutosEstudados } from '$lib/plano/horas';
	import type { RegistroTarefa } from '$lib/plano/tipos';
	import { duracao, relogio, relogioFalado } from './formato';

	let {
		registro,
		agora,
		estimado,
		oniniciar,
		onpausar,
		onretomar
	}: {
		registro: RegistroTarefa | null;
		agora: number;
		/** Minutos estimados da tarefa. */
		estimado: number;
		oniniciar: () => void;
		onpausar: () => void;
		onretomar: () => void;
	} = $props();

	const ms = $derived(minutosEstudados(registro, agora) * 60_000);
	const rodando = $derived(registro?.rodandoDesde != null);
	const concluida = $derived(!!registro?.concluidaEm);
	const passou = $derived(ms > estimado * 60_000);

	let anuncio = $state('');

	function acao(fn: () => void, texto: string) {
		fn();
		anuncio = texto;
	}
</script>

<div class="cronometro" class:rodando>
	<p class="mostrador" role="timer" aria-label="Tempo estudado nesta tarefa" aria-describedby="cronometro-estado">
		<span aria-hidden="true">{relogio(ms)}</span>
		<span class="so-leitor">{relogioFalado(ms)}</span>
	</p>
	<p class="estado" id="cronometro-estado">
		{#if concluida}
			Tarefa concluída
		{:else if rodando}
			Correndo
		{:else if registro}
			Pausado
		{:else}
			Parado
		{/if}
		<span class="estimado">de {duracao(estimado)} estimados{passou ? ', tempo estimado passou' : ''}</span>
	</p>

	{#if !concluida}
		<div class="botoes">
			{#if !registro}
				<button type="button" class="principal" onclick={() => acao(oniniciar, 'Cronômetro iniciado')}>
					<Icone nome="cronometro" tamanho={22} /> Iniciar
				</button>
			{:else if rodando}
				<button type="button" class="principal" onclick={() => acao(onpausar, `Cronômetro pausado em ${relogioFalado(ms)}`)}>
					<span class="icone-pausa" aria-hidden="true"></span> Pausar
				</button>
			{:else}
				<button type="button" class="principal" onclick={() => acao(onretomar, 'Cronômetro retomado')}>
					<Icone nome="cronometro" tamanho={22} /> Retomar
				</button>
			{/if}
		</div>
	{/if}
	<p class="so-leitor" role="status">{anuncio}</p>
</div>

<style>
	.cronometro {
		display: grid;
		justify-items: center;
		gap: 4px;
		text-align: center;
	}

	/* O mostrador é o protagonista da tela: algarismos grandes, de largura fixa, sem saltar. */
	.mostrador {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: clamp(3.5rem, 18vw, 5.5rem);
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.02em;
		font-variant-numeric: tabular-nums;
	}

	.estado {
		margin: 0;
		font-weight: 700;
	}

	.estimado {
		display: block;
		color: var(--cor-texto-suave);
		font-weight: 400;
		font-size: 0.9375rem;
	}

	.botoes {
		margin-top: 12px;
	}

	.principal {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		min-width: 11rem;
		min-height: 52px;
		padding: 0 24px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
		box-shadow: var(--sombra);
		font-size: 1.0625rem;
		font-weight: 800;
		cursor: pointer;
	}

	/* Rodando, o botão vira "Pausar" em contorno: a cor forte fica para começar, não para parar. */
	.rodando .principal {
		background: var(--cor-superficie);
		color: var(--cor-texto);
	}

	.icone-pausa {
		width: 14px;
		height: 16px;
		border-inline: 5px solid currentColor;
	}
</style>

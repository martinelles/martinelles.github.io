<script lang="ts">
	// Chamada curta da missão no feed (FR-012): uma faixa de uma linha acima dos stories, para
	// não empurrar o primeiro post para fora da tela em 360 px. Fora da janela do plano, some.
	// Emenda D5: missão cumprida com a fila ainda em aberto ⇒ "Missão cumprida · Continuar".
	import Icone from '$lib/componentes/Icone.svelte';
	import type { Tarefa } from '$lib/plano/tipos';
	import type { VisaoMissao } from './estado.svelte';
	import { duracao } from './formato';

	let { missao, oniniciar }: { missao: VisaoMissao; oniniciar: (t: Tarefa) => void } = $props();

	/** "Continuar" quando a próxima pendente já tem tempo; o mesmo critério do painel. */
	const comecou = $derived(missao.primeira ? !!missao.dados.registros[missao.primeira.id] : false);
	/** Tempo que ainda falta das tarefas pendentes. */
	const falta = $derived(
		missao.tarefas.filter((t) => !missao.dados.registros[t.id]?.concluidaEm).reduce((s, t) => s + t.minutos, 0)
	);
</script>

{#if missao.fase === 'durante'}
	<section class="chamada" aria-label="Missão de hoje">
		{#if missao.esgotada}
			<a class="discreta" href="/painel"><Icone nome="check" tamanho={18} /> Plano cumprido — revise</a>
		{:else if missao.cumprida && missao.proxima}
			<!-- Emenda D5: "Missão cumprida · Continuar" abre a próxima da fila com o cronômetro. -->
			{@const alvo = missao.proxima}
			<a class="discreta" href="/painel"><Icone nome="check" tamanho={18} /> Missão cumprida</a>
			<button type="button" onclick={() => oniniciar(alvo)}>Continuar</button>
		{:else if missao.cumprida}
			<a class="discreta" href="/painel"><Icone nome="check" tamanho={18} /> Plano cumprido — revise</a>
		{:else if missao.primeira}
			{@const alvo = missao.primeira}
			<a class="texto" href="/painel">
				<strong>Missão de hoje</strong>
				<span>{missao.concluidas} de {missao.tarefas.length} feitas, faltam {duracao(falta)}</span>
			</a>
			<button type="button" onclick={() => oniniciar(alvo)}>{comecou ? 'Continuar' : 'Iniciar'}</button>
		{/if}
	</section>
{/if}

<style>
	.chamada {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin: 8px 0 0;
		padding: 6px 6px 6px 14px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-superficie);
	}

	.texto {
		display: grid;
		min-width: 0;
		min-height: 44px;
		align-content: center;
		color: inherit;
		text-decoration: none;
		line-height: 1.25;
	}

	.texto strong {
		font-family: var(--fonte-titulo);
		font-size: 1rem;
	}

	.texto span {
		color: var(--cor-texto-suave);
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
	}

	button {
		flex-shrink: 0;
		min-height: 44px;
		padding: 0 18px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
		font-weight: 800;
		cursor: pointer;
	}

	.discreta {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		color: var(--cor-texto-suave);
		font-weight: 600;
		text-decoration: none;
	}
</style>

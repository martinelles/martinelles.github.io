<script lang="ts">
	// Chamada da missão no feed (planos/2026-10-14-missao-unica.md): uma faixa de uma linha acima dos
	// stories, com os blocos de hoje do plano das Missões, que leva ao painel. Fora da janela do
	// plano, ou enquanto ele carrega, some.
	import Icone from '$lib/componentes/Icone.svelte';
	import { diaDeHoje, progressoDoDia } from '$lib/missoes/calculos';
	import type { Cargo, Marcas, PlanoMissoes } from '$lib/missoes/tipos';

	let { plano, cargo, hoje, marcas }: { plano: PlanoMissoes | null; cargo: Cargo; hoje: string; marcas: Marcas } = $props();

	const dia = $derived(plano ? diaDeHoje(plano, hoje).dia : null);
	const p = $derived(dia ? progressoDoDia(marcas, cargo, dia) : null);
	const falta = $derived(dia ? dia.blocos.reduce((s, b, i) => s + (marcas[`${cargo}~${dia.data}~${i}`] ? 0 : b.min), 0) : 0);
	const duracao = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}` : `${min} min`);
</script>

{#if dia && p}
	<section class="chamada" aria-label="Missão de hoje">
		{#if p.feitos === p.total}
			<a class="discreta" href="/painel"><Icone nome="check" tamanho={18} /> Missão cumprida</a>
		{:else}
			<a class="texto" href="/painel">
				<strong>Missão de hoje</strong>
				<span>{p.feitos} de {p.total} blocos feitos{falta ? `, faltam ${duracao(falta)}` : ''}</span>
			</a>
			<a class="abrir" href="/painel">Abrir</a>
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

	.abrir {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 18px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
		font-weight: 800;
		text-decoration: none;
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

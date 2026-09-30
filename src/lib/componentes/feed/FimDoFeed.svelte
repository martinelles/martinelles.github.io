<script lang="ts">
	// Fim do conteúdo do filtro: em vez de repetir posts, avisa e oferece voltar a "Tudo".
	import Icone from '$lib/componentes/Icone.svelte';
	import type { Materia } from '$lib/feed/tipos';

	let {
		materia
	}: {
		/** Matéria filtrada; ausente = filtro "Tudo". */
		materia?: Materia | null;
	} = $props();
</script>

<section class="fim" aria-live="polite">
	<span class="marca" aria-hidden="true"><Icone nome="check" tamanho={28} /></span>
	{#if materia}
		<h2>Você viu tudo desta matéria</h2>
		<p>Os posts de {materia.nome} voltam amanhã, em outra ordem.</p>
		<a class="acao" href="/">Ver tudo</a>
	{:else}
		<h2>Você viu tudo por hoje</h2>
		<p>Amanhã o feed volta com outra ordem.</p>
	{/if}
</section>

<style>
	.fim {
		display: grid;
		justify-items: center;
		gap: 8px;
		padding: 40px var(--espaco) 48px;
		text-align: center;
	}

	.marca {
		width: 56px;
		height: 56px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		border: 2px solid var(--cor-acerto);
		color: var(--cor-acerto);
	}

	h2 {
		margin: 8px 0 0;
		font-size: 1.125rem;
	}

	p {
		margin: 0;
		color: var(--cor-texto-suave);
		max-width: 32ch;
	}

	.acao {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		margin-top: 8px;
		padding: 0 20px;
		border-radius: 999px;
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
		font-weight: 700;
		text-decoration: none;
	}
</style>

<script lang="ts">
	import Icone from '$lib/componentes/Icone.svelte';
	import MapaMental from '$lib/componentes/mapas/MapaMental.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Mapa mental · {data.rotulo} · Painel de Concurso</title>
</svelte:head>

<article class="pagina-mapa">
	<header>
		<h1>Mapa mental · {data.rotulo}</h1>
		<a class="voltar botao" href="/painel">
			<Icone nome="voltar" tamanho={20} />
			Voltar ao painel
		</a>
	</header>
	<MapaMental svg={data.svg} rotulo={data.rotulo} />
</article>

<style>
	.pagina-mapa {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-height: 100dvh;
		padding: var(--espaco);
	}

	header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
	}

	h1 {
		margin: 0;
		flex: 1;
		font-family: var(--fonte-titulo);
		font-size: 1.375rem;
		line-height: 1.2;
	}

	.pagina-mapa > :global(.janela) {
		flex: 1;
		min-height: 60dvh;
	}

	.voltar {
		gap: 6px;
		padding: 8px 16px;
	}
</style>

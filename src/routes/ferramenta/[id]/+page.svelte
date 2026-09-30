<script lang="ts">
	import Icone from '$lib/componentes/Icone.svelte';
	import type { NomeIcone } from '$lib/dados';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const ferramenta = $derived(data.ferramenta);
</script>

<svelte:head>
	<title>{ferramenta.titulo} · Painel de Concurso</title>
</svelte:head>

<article class="em-breve">
	<span class="icone"><Icone nome={ferramenta.icone as NomeIcone} tamanho={56} /></span>
	<h1>{ferramenta.titulo}</h1>
	<p class="destaque">Em breve por aqui.</p>
	<p class="suave">Esta ferramenta ainda está em construção.</p>
	<a class="voltar" href="/painel">
		<Icone nome="voltar" tamanho={20} />
		Voltar ao painel
	</a>
</article>

<style>
	.em-breve {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		margin-top: calc(var(--espaco) * 3);
		padding: calc(var(--espaco) * 2) var(--espaco);
		border: 1px solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-superficie);
		text-align: center;
		overflow-wrap: anywhere;
	}

	.icone {
		color: var(--cor-primaria);
	}

	h1 {
		margin: 8px 0 0;
		font-size: 1.5rem;
		line-height: 1.25;
	}

	p {
		margin: 0;
	}

	.destaque {
		font-weight: 700;
		font-size: 1.125rem;
	}

	.suave {
		color: var(--cor-texto-suave);
	}

	.voltar {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		margin-top: var(--espaco);
		padding: 10px 18px;
		border-radius: 999px;
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
		font-weight: 700;
		text-decoration: none;
	}
</style>

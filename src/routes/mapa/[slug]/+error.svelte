<script lang="ts">
	import { page } from '$app/state';
	import Icone from '$lib/componentes/Icone.svelte';
</script>

<svelte:head>
	<title>Mapa não encontrado · Painel de Concurso</title>
</svelte:head>

<article class="erro">
	<h1>{page.status === 404 ? 'Mapa não encontrado' : 'Algo deu errado'}</h1>
	<p>{page.status === 404 ? 'Esse endereço não corresponde a nenhum mapa mental.' : page.error?.message}</p>
	<a class="voltar" href="/painel">
		<Icone nome="voltar" tamanho={20} />
		Voltar ao painel
	</a>
</article>

<style>
	.erro {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		margin-top: calc(var(--espaco) * 3);
		padding: 0 var(--espaco);
		text-align: center;
	}

	h1 {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.375rem;
	}

	p {
		margin: 0;
		color: var(--cor-texto-suave);
	}

	.voltar {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		margin-top: 8px;
		padding: 8px 16px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		color: var(--cor-texto);
		font-weight: 700;
		text-decoration: none;
	}
</style>

<script lang="ts">
	import { page } from '$app/state';
	import Icone from '$lib/componentes/Icone.svelte';
</script>

<svelte:head>
	<title>Ferramenta não encontrada · Painel de Concurso</title>
</svelte:head>

<article class="erro">
	<h1>{page.status === 404 ? 'Ferramenta não encontrada' : 'Algo deu errado'}</h1>
	<p>{page.status === 404 ? 'Esse endereço não corresponde a nenhuma ferramenta.' : page.error?.message}</p>
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
		padding: calc(var(--espaco) * 2) var(--espaco);
		border: 1px solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-superficie);
		text-align: center;
		overflow-wrap: anywhere;
	}

	h1 {
		margin: 0;
		font-size: 1.375rem;
	}

	p {
		margin: 0;
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

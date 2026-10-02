<script lang="ts">
	import { page } from '$app/state';
	import Icone from '$lib/componentes/Icone.svelte';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Tarefa não encontrada' : 'Algo deu errado'} · Painel de Concurso</title>
</svelte:head>

<article class="erro">
	<h1>{page.status === 404 ? 'Tarefa não encontrada' : 'Algo deu errado'}</h1>
	<p>{page.status === 404 ? 'Esse endereço não corresponde a nenhuma tarefa do plano.' : page.error?.message}</p>
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
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-superficie);
		text-align: center;
		overflow-wrap: anywhere;
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

	/* Botão primário do sistema (igual em todo o app). */
	.voltar {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		margin-top: var(--espaco);
		padding: 10px 18px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
		box-shadow: var(--sombra);
		font-weight: 700;
		text-decoration: none;
	}
</style>

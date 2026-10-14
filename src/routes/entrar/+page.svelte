<script lang="ts">
	// Login só com o nome (plano planos/2026-10-13-login-por-nome-backend-cloudflare.md, fase 3).
	// O formulário é o mesmo do popup que o feed abre ao responder sem login.
	import FormEntrar from '$lib/componentes/FormEntrar.svelte';
	import Icone from '$lib/componentes/Icone.svelte';
	import { conta } from '$lib/conta/sessao.svelte';
</script>

<svelte:head>
	<title>Entrar · Painel de Concurso</title>
</svelte:head>

<div class="entrar">
	<a class="voltar" href="/painel/ajustes"><Icone nome="voltar" tamanho={20} /> Voltar aos ajustes</a>
	<h1>Entrar</h1>

	{#if conta.usuario}
		<p>Você já entrou como <strong>{conta.usuario}</strong>. Para trocar, saia nos Ajustes.</p>
	{:else}
		<FormEntrar />
	{/if}
</div>

<style>
	.entrar {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: calc(var(--espaco) * 1.25);
		overflow-wrap: anywhere;
	}

	h1 {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1.15;
	}

	p {
		margin: 0;
	}

	.voltar {
		display: inline-flex;
		align-items: center;
		align-self: flex-start;
		gap: 8px;
		min-height: 44px;
		padding: 10px 18px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
		box-shadow: var(--sombra);
		font: inherit;
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
	}
</style>

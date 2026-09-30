<script lang="ts">
	import '../app.css';
	import { setContext, type Snippet } from 'svelte';
	import { page } from '$app/state';
	import BarraAbas, { type Aba } from '$lib/componentes/feed/BarraAbas.svelte';
	import { criarRepositorio } from '$lib/feed/conteudo';
	import { carregarFoco } from '$lib/feed/foco.svelte';
	import { carregarInteracoes, interacoes } from '$lib/feed/interacoes.svelte';

	let { children }: { children: Snippet } = $props();

	// Uma vez por aba: o layout raiz não é refeito ao navegar.
	carregarInteracoes();
	carregarFoco();
	// Um repositório por aba: feed, salvos e painel dividem o cache de índice e lotes
	// (as páginas leem com getContext('repositorio')).
	setContext('repositorio', criarRepositorio());

	const aba = $derived.by((): Aba => {
		const caminho = page.url.pathname;
		if (caminho.startsWith('/salvos')) return 'salvos';
		if (caminho.startsWith('/painel') || caminho.startsWith('/ferramenta')) return 'painel';
		return 'feed';
	});

	// Borda "armazenamento indisponível": avisa uma vez; fechado, não volta nesta aba.
	let avisoFechado = $state(false);
</script>

{#if !interacoes.persistindo && !avisoFechado}
	<div class="aviso" role="status">
		<p>Seu progresso não está sendo salvo neste navegador.</p>
		<button type="button" onclick={() => (avisoFechado = true)}>Entendi</button>
	</div>
{/if}

<main class="app">{@render children()}</main>

<BarraAbas atual={aba} />

<style>
	.app {
		max-width: 960px;
		margin: 0 auto;
		padding: var(--espaco);
		/* A barra de abas é fixa: o fim da página não pode ficar embaixo dela. */
		padding-bottom: calc(var(--espaco) + var(--altura-abas) + env(safe-area-inset-bottom));
		min-height: 100dvh;
	}

	.aviso {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0 12px;
		padding: 0 var(--espaco);
		background: var(--cor-aviso-fundo);
		color: var(--cor-aviso);
		font-size: 0.875rem;
		text-align: center;
	}

	.aviso p {
		margin: 0;
		padding: 8px 0;
	}

	.aviso button {
		min-height: 44px;
		padding: 0 12px;
		border: 0;
		background: none;
		color: inherit;
		font-weight: 700;
		text-decoration: underline;
		cursor: pointer;
	}
</style>

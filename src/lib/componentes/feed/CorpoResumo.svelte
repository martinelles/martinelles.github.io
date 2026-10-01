<script lang="ts">
	// Resumo em carrossel: título do tópico na 1ª tela, fonte na última.
	import type { PostResumo, TelaResumo } from '$lib/feed/tipos';
	import Carrossel from './Carrossel.svelte';
	import Fonte from './Fonte.svelte';

	let { post }: { post: PostResumo } = $props();
	const ultima = $derived(post.telas.length - 1);
</script>

<Carrossel itens={post.telas} rotulo="Resumo: {post.titulo}">
	{#snippet tela(t: TelaResumo, i: number)}
		<div class="tela" class:primeira={i === 0}>
			{#if i === 0}
				<h3 class="titulo">{post.titulo}</h3>
			{/if}
			{#if t.titulo}
				<h4 class="subtitulo">{t.titulo}</h4>
			{/if}
			<p class="texto">{t.texto}</p>
			{#if i === ultima}
				<p class="fonte">Fonte: <Fonte fonte={post.fonte} /></p>
			{/if}
		</div>
	{/snippet}
</Carrossel>

<style>
	.tela {
		height: 100%;
		min-height: 260px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 20px 18px;
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-fundo);
		border: var(--linha-peso) solid var(--cor-borda);
	}

	.titulo {
		margin: 0 0 4px;
		font-family: var(--fonte-titulo);
		font-size: 1.5rem;
		line-height: 1.2;
		text-wrap: balance;
	}

	.subtitulo {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
	}

	.texto {
		margin: 0;
		font-family: var(--fonte-texto);
		font-size: 1.0625rem;
		line-height: 1.6;
		white-space: pre-line;
		overflow-wrap: anywhere;
		max-width: var(--medida);
	}

	.fonte {
		margin: auto 0 0;
		padding-top: 10px;
		border-top: 1px solid var(--cor-divisor);
		font-size: 0.8125rem;
		color: var(--cor-texto-suave);
	}
</style>

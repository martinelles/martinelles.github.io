<script lang="ts">
	// Um artigo por post, com as linhas preservadas. `revogados` são índices de linha contados
	// no artigo inteiro (todas as telas em sequência); essas linhas saem riscadas, com a nota.
	import type { PostLei } from '$lib/feed/tipos';
	import Carrossel from './Carrossel.svelte';
	import { recuoLinha, separarNota } from './apresentacao';

	let { post }: { post: PostLei } = $props();

	interface Linha {
		texto: string;
		nota: string;
		recuo: number;
		revogada: boolean;
	}

	const telas = $derived.by(() => {
		const revogados = new Set(post.revogados ?? []);
		let n = 0;
		return post.telas.map((tela) =>
			tela
				.split('\n')
				.filter((l) => l.trim() !== '')
				.map((l): Linha => {
					const revogada = revogados.has(n++);
					const [texto, nota] = revogada ? separarNota(l) : [l, ''];
					return { texto, nota, recuo: recuoLinha(l), revogada };
				})
		);
	});
</script>

{#snippet linhas(tela: Linha[])}
	<div class="texto">
		{#each tela as l, i (i)}
			<p class="linha r{l.recuo}">
				{#if l.revogada}
					<s>{l.texto}</s>
					<span class="nota">{l.nota || '(revogado)'}</span>
				{:else}
					{l.texto}
				{/if}
			</p>
		{/each}
	</div>
{/snippet}

<div class="lei">
	<p class="norma">{post.norma.titulo}</p>
	<p class="artigo">{post.artigo}</p>
	{#if telas.length > 1}
		<Carrossel itens={telas} rotulo="{post.artigo}, {post.norma.titulo}">
			{#snippet tela(t)}
				{@render linhas(t)}
			{/snippet}
		</Carrossel>
	{:else if telas.length === 1}
		{@render linhas(telas[0])}
	{/if}
</div>

<style>
	.lei {
		display: grid;
		gap: 4px;
	}

	.norma {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--cor-texto-suave);
	}

	.artigo {
		margin: 0 0 8px;
		font-family: var(--fonte-texto);
		font-size: 2rem;
		line-height: 1.1;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--cor-lei);
	}

	.texto {
		font-family: var(--fonte-texto);
		font-size: 1.0625rem;
		line-height: 1.6;
		overflow-wrap: anywhere;
	}

	.linha {
		margin: 0 0 0.5em;
	}

	.linha.r1 {
		padding-left: 1em;
	}

	.linha.r2 {
		padding-left: 2em;
	}

	.linha.r3 {
		padding-left: 3em;
	}

	s {
		color: var(--cor-texto-suave);
		text-decoration-thickness: 1px;
	}

	.nota {
		display: block;
		font-family: var(--fonte);
		font-size: 0.8125rem;
		color: var(--cor-texto-suave);
	}
</style>

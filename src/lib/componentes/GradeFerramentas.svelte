<script lang="ts">
	import Icone from './Icone.svelte';
	import type { Ferramenta, NomeIcone } from '$lib/dados';

	let { ferramentas }: { ferramentas: Ferramenta[] } = $props();

	const atalhos = $derived(ferramentas.filter((f) => f.grupo === 'atalho'));
	const blocos = $derived([
		{ id: 'teorico', emoji: '📚', titulo: 'Material Teórico', itens: ferramentas.filter((f) => f.grupo === 'teorico') },
		{ id: 'pratica', emoji: '🎯', titulo: 'Prática & Revisão', itens: ferramentas.filter((f) => f.grupo === 'pratica') }
	]);
</script>

{#snippet cartao(f: Ferramenta, largo: boolean)}
	<li>
		<a class="cartao" class:largo href="/ferramenta/{f.id}">
			<span class="icone"><Icone nome={f.icone as NomeIcone} tamanho={largo ? 26 : 24} /></span>
			<span class="textos">
				<span class="titulo">{f.titulo}</span>
				<span class="subtitulo">{f.subtitulo}</span>
			</span>
		</a>
	</li>
{/snippet}

{#if atalhos.length}
	<ul class="atalhos" aria-label="Atalhos">
		{#each atalhos as f (f.id)}
			{@render cartao(f, true)}
		{/each}
	</ul>
{/if}

{#each blocos as bloco (bloco.id)}
	{#if bloco.itens.length}
		<section class="bloco" aria-labelledby="bloco-{bloco.id}">
			<h2 id="bloco-{bloco.id}"><span aria-hidden="true">{bloco.emoji}</span> {bloco.titulo}</h2>
			<ul class="grade">
				{#each bloco.itens as f (f.id)}
					{@render cartao(f, false)}
				{/each}
			</ul>
		</section>
	{/if}
{/each}

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.atalhos,
	.grade {
		display: grid;
		gap: 12px;
	}

	.atalhos {
		grid-template-columns: minmax(0, 1fr);
	}

	.grade {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	@media (min-width: 720px) {
		.atalhos {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.grade {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	.bloco {
		margin-top: calc(var(--espaco) * 1.5);
	}

	h2 {
		margin: 0 0 12px;
		font-size: 1.125rem;
	}

	li {
		min-width: 0;
	}

	.cartao {
		display: flex;
		flex-direction: column;
		gap: 10px;
		height: 100%;
		min-height: 44px;
		padding: 14px;
		border: 1px solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-superficie);
		box-shadow: var(--sombra);
		color: var(--cor-texto);
		text-decoration: none;
		overflow-wrap: anywhere;
		transition: border-color 0.15s ease;
	}

	.cartao:hover {
		border-color: var(--cor-primaria);
	}

	.cartao.largo {
		flex-direction: row;
		align-items: center;
	}

	.icone {
		color: var(--cor-primaria);
	}

	.textos {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.titulo {
		font-weight: 700;
		line-height: 1.25;
	}

	.subtitulo {
		color: var(--cor-texto-suave);
		font-size: 0.875rem;
		line-height: 1.3;
	}
</style>

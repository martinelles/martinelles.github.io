<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icone from './Icone.svelte';

	let {
		titulo,
		contagem,
		aberta = $bindable(false),
		children
	}: { titulo: string; contagem: number; aberta?: boolean; children: Snippet } = $props();

	const id = $props.id();
</script>

{#if contagem > 0}
	<section class="secao">
		<h2 class="cabecalho">
			<button type="button" aria-expanded={aberta} aria-controls={id} onclick={() => (aberta = !aberta)}>
				<span class="titulo">{titulo} <span class="contagem">({contagem})</span></span>
				<Icone nome={aberta ? 'seta-cima' : 'seta-baixo'} tamanho={20} />
			</button>
		</h2>
		<div {id} class="conteudo" hidden={!aberta}>
			{@render children()}
		</div>
	</section>
{/if}

<style>
	.secao {
		margin-block: var(--espaco);
	}

	.cabecalho {
		margin: 0;
		font-size: 1.0625rem;
	}

	.cabecalho button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		width: 100%;
		min-height: 48px;
		padding: 8px 4px;
		border: 0;
		background: transparent;
		font-weight: 700;
		text-align: left;
		cursor: pointer;
	}

	.titulo {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.contagem {
		color: var(--cor-texto-suave);
		font-weight: 600;
	}

	.conteudo {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding-top: 4px;
	}

	.conteudo[hidden] {
		display: none;
	}
</style>

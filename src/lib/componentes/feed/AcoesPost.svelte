<script lang="ts">
	// Rodapé do post: curtir e salvar (botões de alternância) e, quando houver, a fonte.
	import Icone from '$lib/componentes/Icone.svelte';
	import type { Fonte as TipoFonte } from '$lib/feed/tipos';
	import Fonte from './Fonte.svelte';

	let {
		curtido,
		salvo,
		onCurtir,
		onSalvar,
		fonte
	}: {
		curtido: boolean;
		salvo: boolean;
		/** Alterna curtido/não curtido. */
		onCurtir: () => void;
		/** Alterna salvo/não salvo. */
		onSalvar: () => void;
		/** Fonte citada (resumo e flashcard). */
		fonte?: TipoFonte;
	} = $props();

	// Pulso só quando a pessoa acabou de curtir (não ao montar um post já curtido).
	let pulsar = $state(false);
	function curtir(): void {
		pulsar = !curtido;
		onCurtir();
	}
</script>

<div class="acoes">
	<button type="button" class="acao curtir" class:ligado={curtido} class:pulsar aria-pressed={curtido} onclick={curtir}>
		<Icone nome={curtido ? 'coracao-cheio' : 'coracao'} />
		<span class="so-leitor">Curtir</span>
	</button>
	<button type="button" class="acao salvar" class:ligado={salvo} aria-pressed={salvo} onclick={onSalvar}>
		<Icone nome={salvo ? 'marcador-cheio' : 'marcador'} />
		<span class="so-leitor">Salvar</span>
	</button>
	{#if fonte}
		<p class="fonte">Fonte: <Fonte {fonte} /></p>
	{/if}
</div>

<style>
	.acoes {
		display: flex;
		align-items: center;
		gap: 4px;
		margin: 0 -10px;
	}

	.acao {
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: none;
		color: var(--cor-texto);
		cursor: pointer;
	}

	.acao:active :global(svg) {
		transform: scale(0.88);
	}

	.curtir.ligado {
		color: var(--cor-curtida);
	}

	.curtir.ligado.pulsar :global(svg) {
		animation: pulso 0.25s ease-out;
	}

	.salvar.ligado {
		color: var(--cor-primaria);
	}

	.fonte {
		flex: 1;
		min-width: 0;
		margin: 0 10px 0 8px;
		text-align: right;
		font-size: 0.8125rem;
		color: var(--cor-texto-suave);
		overflow-wrap: anywhere;
	}

	@keyframes pulso {
		50% {
			transform: scale(1.18);
		}
	}
</style>

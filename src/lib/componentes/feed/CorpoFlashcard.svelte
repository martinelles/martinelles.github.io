<script lang="ts">
	// Flashcard: um botão que alterna pergunta/resposta. O lado oculto sai da árvore de
	// acessibilidade (aria-hidden); a virada em 3D só acontece sem prefers-reduced-motion.
	import Icone from '$lib/componentes/Icone.svelte';
	import type { PostFlashcard } from '$lib/feed/tipos';

	let { post }: { post: PostFlashcard } = $props();
	let virado = $state(false);
</script>

<button type="button" class="cartao" class:virado aria-pressed={virado} onclick={() => (virado = !virado)}>
	<span class="giro">
		<span class="lado frente" aria-hidden={virado}>
			<span class="face">Pergunta</span>
			<span class="texto">{post.pergunta}</span>
			<span class="dica"><Icone nome="virar" tamanho={16} /> Toque para ver a resposta</span>
		</span>
		<span class="lado verso" aria-hidden={!virado}>
			<span class="face">Resposta</span>
			<span class="texto">{post.resposta}</span>
			<span class="dica"><Icone nome="virar" tamanho={16} /> Toque para voltar à pergunta</span>
		</span>
	</span>
</button>

<style>
	.cartao {
		display: block;
		width: 100%;
		padding: 0;
		border: 0;
		background: none;
		text-align: left;
		cursor: pointer;
		perspective: 1200px;
		border-radius: 14px;
	}

	.giro {
		display: grid;
		transform-style: preserve-3d;
		transition: transform 0.45s cubic-bezier(0.2, 0.7, 0.2, 1);
	}

	.virado .giro {
		transform: rotateY(180deg);
	}

	.lado {
		grid-area: 1 / 1;
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-height: 240px;
		padding: 20px 18px 16px;
		border-radius: 14px;
		border: 1.5px solid var(--cor-borda);
		background: var(--cor-fundo);
		backface-visibility: hidden;
	}

	.verso {
		transform: rotateY(180deg);
		border-style: dashed;
		border-color: var(--cor-texto-suave);
	}

	.face {
		font-size: 0.8125rem;
		font-weight: 700;
		color: var(--cor-texto-suave);
	}

	.texto {
		flex: 1;
		font-family: var(--fonte-texto);
		font-size: 1.1875rem;
		line-height: 1.5;
		white-space: pre-line;
		overflow-wrap: anywhere;
	}

	.dica {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8125rem;
		color: var(--cor-texto-suave);
	}

	/* Sem movimento: troca direta de lado, sem 3D. */
	@media (prefers-reduced-motion: reduce) {
		.giro,
		.virado .giro {
			transform: none;
		}

		.verso {
			transform: none;
			visibility: hidden;
		}

		.virado .verso {
			visibility: visible;
		}

		.virado .frente {
			visibility: hidden;
		}
	}
</style>

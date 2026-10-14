<script lang="ts">
	// Puxar para atualizar, como no Instagram: no topo da página, arrastar para baixo e soltar
	// sorteia uma ordem nova do feed. No app instalado não há o recarregar do navegador; no
	// navegador, o `overscroll-behavior` tira o dele, para não recarregar a página inteira junto.
	import Icone from '$lib/componentes/Icone.svelte';

	let { onAtualizar }: { onAtualizar: () => Promise<unknown> } = $props();

	/** Distância (px, já amortecida) que dispara a atualização ao soltar. */
	const LIMIAR = 70;
	const MAXIMO = 110;

	let distancia = $state(0);
	let atualizando = $state(false);
	const pronto = $derived(distancia >= LIMIAR);

	async function atualizar(): Promise<void> {
		atualizando = true;
		distancia = LIMIAR;
		try {
			await onAtualizar();
		} finally {
			atualizando = false;
			distancia = 0;
		}
	}

	$effect(() => {
		const raiz = document.documentElement;
		const antes = raiz.style.overscrollBehaviorY;
		raiz.style.overscrollBehaviorY = 'contain';

		let inicio: { x: number; y: number } | null = null;
		let puxando = false;

		const noTopo = () => window.scrollY <= 0;
		// Popup de login aberto: o gesto é dele.
		const bloqueado = () => atualizando || !!document.querySelector('dialog[open]');

		function aoTocar(e: TouchEvent) {
			if (e.touches.length !== 1 || !noTopo() || bloqueado()) return (inicio = null);
			inicio = { x: e.touches[0].clientX, y: e.touches[0].clientY };
			puxando = false;
		}
		function aoMover(e: TouchEvent) {
			if (!inicio) return;
			const dx = e.touches[0].clientX - inicio.x;
			const dy = e.touches[0].clientY - inicio.y;
			// Arrasto de lado (carrossel, stories) ou para cima: não é comigo.
			if (!puxando && (dy <= 0 || Math.abs(dx) > dy || !noTopo())) return (inicio = null);
			puxando = true;
			e.preventDefault();
			distancia = Math.min(MAXIMO, dy * 0.5);
		}
		function aoSoltar() {
			if (!inicio) return;
			inicio = null;
			if (puxando && distancia >= LIMIAR) void atualizar();
			else distancia = 0;
			puxando = false;
		}

		window.addEventListener('touchstart', aoTocar, { passive: true });
		window.addEventListener('touchmove', aoMover, { passive: false });
		window.addEventListener('touchend', aoSoltar);
		window.addEventListener('touchcancel', aoSoltar);
		return () => {
			raiz.style.overscrollBehaviorY = antes;
			window.removeEventListener('touchstart', aoTocar);
			window.removeEventListener('touchmove', aoMover);
			window.removeEventListener('touchend', aoSoltar);
			window.removeEventListener('touchcancel', aoSoltar);
		};
	});
</script>

{#if distancia > 0 || atualizando}
	<div
		class="indicador"
		class:pronto
		class:atualizando
		style:transform="translate(-50%, {distancia - 48}px)"
		role="status"
		aria-live="polite"
	>
		<span class="icone" style:transform={atualizando ? undefined : `rotate(${distancia * 3}deg)`}>
			<Icone nome="virar" tamanho={22} />
		</span>
		<span class="so-leitor">{atualizando ? 'Atualizando o feed…' : pronto ? 'Solte para atualizar' : 'Puxe para atualizar'}</span>
	</div>
{/if}

<style>
	.indicador {
		position: fixed;
		top: 0;
		left: 50%;
		z-index: 20;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: 50%;
		background: var(--cor-superficie);
		color: var(--cor-texto-suave);
		box-shadow: var(--sombra);
		pointer-events: none;
	}

	.indicador.pronto,
	.indicador.atualizando {
		color: var(--cor-primaria);
	}

	.icone {
		display: grid;
	}

	.atualizando .icone {
		animation: girar 0.8s linear infinite;
	}

	@keyframes girar {
		to {
			transform: rotate(360deg);
		}
	}
</style>

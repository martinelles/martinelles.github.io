<script lang="ts" generics="T">
	// Carrossel com scroll-snap horizontal: o gesto é o do navegador (não prende a rolagem
	// vertical do feed); setas ‹ ›, pontos e contador acompanham a tela visível.
	import type { Snippet } from 'svelte';
	import Icone from '$lib/componentes/Icone.svelte';

	let {
		itens,
		tela,
		rotulo
	}: {
		/** Uma entrada por tela. */
		itens: readonly T[];
		/** Desenha a tela `i` (base 0). */
		tela: Snippet<[T, number]>;
		/** Nome acessível do carrossel (ex.: "Resumo: Governança de dados"). */
		rotulo: string;
	} = $props();

	let faixa = $state<HTMLDivElement>();
	let raiz = $state<HTMLElement>();
	let anterior = $state<HTMLButtonElement>();
	let proximo = $state<HTMLButtonElement>();
	let atual = $state(0);
	const total = $derived(itens.length);

	function semMovimento(): boolean {
		return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	function irPara(i: number): void {
		if (!faixa) return;
		const alvo = Math.max(0, Math.min(total - 1, i));
		atual = alvo; // retorno imediato; a rolagem confirma depois
		faixa.scrollTo({ left: alvo * faixa.clientWidth, behavior: semMovimento() ? 'auto' : 'smooth' });
		// Se o botão focado vai sumir (primeira/última tela), o foco passa para o outro.
		if (alvo === 0 && document.activeElement === anterior) proximo?.focus();
		if (alvo === total - 1 && document.activeElement === proximo) anterior?.focus();
	}

	let quadro = 0;
	function aoRolar(): void {
		if (quadro) return;
		quadro = requestAnimationFrame(() => {
			quadro = 0;
			if (!faixa || faixa.clientWidth === 0) return;
			atual = Math.round(faixa.scrollLeft / faixa.clientWidth);
		});
	}

	// ←/→ com o foco em qualquer ponto do carrossel (faixa ou setas).
	$effect(() => {
		const el = raiz;
		if (!el) return;
		const tecla = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft' && atual > 0) {
				e.preventDefault();
				irPara(atual - 1);
			} else if (e.key === 'ArrowRight' && atual < total - 1) {
				e.preventDefault();
				irPara(atual + 1);
			}
		};
		el.addEventListener('keydown', tecla);
		return () => {
			el.removeEventListener('keydown', tecla);
			if (quadro) cancelAnimationFrame(quadro);
		};
	});
</script>

<section class="carrossel" aria-roledescription="carrossel" aria-label={rotulo} bind:this={raiz}>
	<!-- Faixa rolável focável: sem isso, tela só de texto fica inalcançável pelo teclado
	     (WCAG 2.1.1, regra axe scrollable-region-focusable); ←/→ trocam de tela. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div class="faixa" bind:this={faixa} onscroll={aoRolar} onscrollend={aoRolar} tabindex="0">
		{#each itens as item, i (i)}
			<div class="tela" role="group" aria-roledescription="tela" aria-label="{i + 1} de {total}">
				{@render tela(item, i)}
			</div>
		{/each}
	</div>

	{#if total > 1}
		<div class="controles" data-sem-duplo-toque>
			<button
				class="seta"
				type="button"
				aria-label="Tela anterior"
				hidden={atual === 0}
				bind:this={anterior}
				onclick={() => irPara(atual - 1)}
			>
				<Icone nome="seta-esquerda" tamanho={20} />
			</button>
			<div class="posicao">
				<span class="pontos" aria-hidden="true">
					{#each itens as _, i (i)}
						<span class="ponto" class:ativo={i === atual}></span>
					{/each}
				</span>
				<span class="contador" aria-live="polite" aria-atomic="true">
					<span aria-hidden="true">{atual + 1}/{total}</span>
					<span class="so-leitor">Tela {atual + 1} de {total}</span>
				</span>
			</div>
			<button
				class="seta"
				type="button"
				aria-label="Próxima tela"
				hidden={atual === total - 1}
				bind:this={proximo}
				onclick={() => irPara(atual + 1)}
			>
				<Icone nome="seta-direita" tamanho={20} />
			</button>
		</div>
	{/if}
</section>

<style>
	.carrossel {
		display: grid;
		gap: 8px;
	}

	.faixa {
		display: flex;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		overscroll-behavior-x: contain;
		touch-action: pan-x pan-y;
		scrollbar-width: none;
		border-radius: calc(var(--raio) / 2);
	}

	.faixa::-webkit-scrollbar {
		display: none;
	}

	.tela {
		position: relative;
		flex: 0 0 100%;
		min-width: 0;
		scroll-snap-align: start;
		scroll-snap-stop: always;
	}

	.controles {
		display: grid;
		grid-template-columns: 44px 1fr 44px;
		align-items: center;
	}

	.seta {
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		padding: 0;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: 50%;
		background: var(--cor-superficie);
		cursor: pointer;
	}

	.seta:last-child {
		grid-column: 3;
	}

	.seta[hidden] {
		display: none;
	}

	.posicao {
		grid-column: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
	}

	.pontos {
		display: flex;
		gap: 6px;
	}

	.ponto {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--cor-divisor);
		transition: width 0.2s ease, background-color 0.2s ease;
	}

	.ponto.ativo {
		width: 18px;
		border-radius: 3px;
		background: var(--cor-texto);
	}

	.contador {
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
		color: var(--cor-texto-suave);
	}
</style>

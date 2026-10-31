<script lang="ts">
	// Visor do mapa mental (planos/2026-10-31-mapas-mentais-nas-missoes.md): o SVG vem pronto do
	// import (`/conteudo/mapas/<slug>.svg`, cacheado pelo service worker como todo `/conteudo/`);
	// aqui é só navegar — arraste, pinça de dois dedos, scroll e botões, com limites que não
	// deixam o mapa escapar da janela. A escala nunca fica menor que a que encaixa a largura.
	let { svg, rotulo }: { svg: string; rotulo: string } = $props();

	let janela = $state<HTMLDivElement>();
	let mapaEl = $state<HTMLDivElement>();
	/** Tamanho intrínseco do SVG, lido do `viewBox` depois de injetar. */
	let larguraSvg = $state(1);
	let alturaSvg = $state(1);
	/** Escala que encaixa a largura do mapa na janela: o piso do zoom. */
	let ajuste = $state(1);
	let escala = $state(1);
	let tx = $state(0);
	let ty = $state(0);

	const ponteiros = new Map<number, { x: number; y: number }>();
	let puxando = $state(false);
	let ultima: { x: number; y: number } | null = null;
	let pinca: { d: number } | null = null;

	function medir() {
		const sv = mapaEl?.querySelector('svg');
		if (!sv || !janela) return;
		const vb = (sv.getAttribute('viewBox') ?? '').split(/[\s,]+/).map(Number);
		if (vb.length === 4 && vb.every((n) => Number.isFinite(n) && n >= 0)) {
			larguraSvg = vb[2] || 1;
			alturaSvg = vb[3] || 1;
		}
		sv.setAttribute('width', String(larguraSvg));
		sv.setAttribute('height', String(alturaSvg));
		sv.style.maxWidth = 'none';
		ajuste = janela.clientWidth / larguraSvg;
	}

	$effect(() => {
		if (!mapaEl) return;
		mapaEl.innerHTML = svg;
		medir();
		reset();
	});

	function reset() {
		escala = ajuste;
		tx = 0;
		ty = 0;
	}

	function limitar() {
		if (!janela) return;
		const w = larguraSvg * escala;
		const h = alturaSvg * escala;
		if (tx > 0) tx = 0;
		if (tx < janela.clientWidth - w) tx = janela.clientWidth - w;
		if (ty > 0) ty = 0;
		if (ty < janela.clientHeight - h) ty = janela.clientHeight - h;
	}

	function zoom(fator: number, cx = janela!.clientWidth / 2, cy = janela!.clientHeight / 2) {
		const nova = Math.min(Math.max(escala * fator, ajuste), ajuste * 5);
		const razao = nova / escala;
		tx = cx - (cx - tx) * razao;
		ty = cy - (cy - ty) * razao;
		escala = nova;
		limitar();
	}

	function baixar(e: PointerEvent) {
		janela?.setPointerCapture(e.pointerId);
		ponteiros.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (ponteiros.size === 1) {
			puxando = true;
			ultima = { x: e.clientX, y: e.clientY };
		}
		if (ponteiros.size === 2) {
			const p = [...ponteiros.values()];
			pinca = { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) };
			puxando = false;
		}
		e.preventDefault();
	}

	function mover(e: PointerEvent) {
		if (!ponteiros.has(e.pointerId) || !janela) return;
		ponteiros.set(e.pointerId, { x: e.clientX, y: e.clientY });
		const rect = janela.getBoundingClientRect();
		if (ponteiros.size === 2 && pinca) {
			const p = [...ponteiros.values()];
			const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
			if (d > 0) zoom(d / pinca.d, (p[0].x + p[1].x) / 2 - rect.left, (p[0].y + p[1].y) / 2 - rect.top);
			pinca.d = d;
		} else if (puxando && ultima) {
			tx += e.clientX - ultima.x;
			ty += e.clientY - ultima.y;
			ultima = { x: e.clientX, y: e.clientY };
			limitar();
		}
	}

	function soltar(e: PointerEvent) {
		ponteiros.delete(e.pointerId);
		if (ponteiros.size < 2) pinca = null;
		if (ponteiros.size === 0) {
			puxando = false;
			ultima = null;
		}
	}

	function roda(e: WheelEvent) {
		if (!janela) return;
		const rect = janela.getBoundingClientRect();
		zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - rect.left, e.clientY - rect.top);
		e.preventDefault();
	}
</script>

<svelte:window onresize={() => { medir(); limitar(); }} />

<div
	class="janela"
	class:arrastando={puxando}
	bind:this={janela}
	role="application"
	aria-label="Mapa mental {rotulo}: arraste para navegar, use os botões para zoom"
	onpointerdown={baixar}
	onpointermove={mover}
	onpointerup={soltar}
	onpointercancel={soltar}
	onwheel={roda}
>
	<div class="mapa" bind:this={mapaEl} style:transform="translate({tx}px, {ty}px) scale({escala})"></div>
</div>

<div class="zoom">
	<button type="button" onclick={() => zoom(1.3)} aria-label="Aproximar o mapa">+</button>
	<button type="button" onclick={() => zoom(1 / 1.3)} aria-label="Afastar o mapa">&minus;</button>
	<button type="button" onclick={reset} aria-label="Voltar o mapa ao início">&#8634;</button>
</div>

<style>
	.janela {
		position: relative;
		overflow: hidden;
		touch-action: none;
		cursor: grab;
		background: var(--cor-fundo);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
	}

	.janela.arrastando {
		cursor: grabbing;
	}

	.mapa {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		will-change: transform;
	}

	.mapa :global(svg) {
		display: block;
		max-width: none;
	}

	.zoom {
		display: grid;
		gap: 6px;
		margin-top: 8px;
		justify-items: center;
	}

	.zoom button {
		width: 44px;
		height: 44px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
		color: var(--cor-texto);
		font: inherit;
		font-size: 1.125rem;
		line-height: 1;
		cursor: pointer;
	}

	.zoom button:active {
		transform: scale(0.94);
	}
</style>

<script lang="ts">
	// FR-013: a raiz não tem tela própria. Concurso salvo e existente vai ao painel;
	// senão, à escolha. `carregar()` já zera concurso que sumiu dos dados.
	import { afterNavigate, goto } from '$app/navigation';
	import { buscarConcurso } from '$lib/dados';
	import { carregar, preferencias } from '$lib/preferencias.svelte';

	carregar();

	// Em afterNavigate, não em onMount: no SPA o onMount roda no meio da navegação de entrada
	// do roteador, e um goto disparado ali às vezes se perde (a tela ficava em "Abrindo…").
	let redirecionou = false;
	afterNavigate(() => {
		if (redirecionou) return;
		redirecionou = true;
		const destino = buscarConcurso(preferencias.concursoId) ? '/painel' : '/escolher';
		goto(destino, { replaceState: true });
	});
</script>

<p class="carregando" aria-live="polite">Abrindo…</p>

<style>
	.carregando {
		margin: 30vh 0 0;
		text-align: center;
		color: var(--cor-texto-suave);
	}
</style>

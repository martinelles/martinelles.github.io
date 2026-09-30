<script lang="ts">
	import { goto } from '$app/navigation';
	import CabecalhoPainel from '$lib/componentes/CabecalhoPainel.svelte';
	import FocoEstudo from '$lib/componentes/FocoEstudo.svelte';
	import GradeFerramentas from '$lib/componentes/GradeFerramentas.svelte';
	import { buscarConcurso, dados } from '$lib/dados';
	import { diasParaProva, hojeLocal } from '$lib/datas';
	import { carregar, preferencias } from '$lib/preferencias.svelte';

	carregar();

	const concurso = $derived(buscarConcurso(preferencias.concursoId));
	const prazo = $derived(concurso ? diasParaProva(concurso.dataProva, hojeLocal()) : null);

	// Borda "concurso que sumiu" e acesso direto sem escolha: vai para a escolha, sem deixar /painel no histórico.
	let redirecionando = false;
	$effect(() => {
		if (!concurso && !redirecionando) {
			redirecionando = true;
			goto('/escolher', { replaceState: true });
		}
	});
</script>

<svelte:head>
	<title>{concurso ? `${concurso.nome} · Painel de Concurso` : 'Painel de Concurso'}</title>
</svelte:head>

{#if concurso && prazo}
	<div class="painel">
		<!-- Trocar concurso não apaga a preferência (data-model, transição "trocar concurso"). -->
		<CabecalhoPainel {concurso} {prazo} ontrocar={() => goto('/escolher')} />
		<FocoEstudo
			{concurso}
			cargoId={preferencias.cargoId}
			disciplina={preferencias.disciplina}
			onescolherCargo={(id) => preferencias.escolherCargo(id)}
			onescolherDisciplina={(nome) => preferencias.escolherDisciplina(nome)}
		/>
		<div>
			<GradeFerramentas ferramentas={dados.ferramentas} />
		</div>
	</div>
{/if}

<style>
	.painel {
		display: flex;
		flex-direction: column;
		gap: calc(var(--espaco) * 1.25);
	}
</style>

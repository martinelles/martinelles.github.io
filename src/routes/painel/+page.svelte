<script lang="ts">
	// Painel da CGU (FR-014, FR-015): concurso fixo, foco, progresso calculado e atalhos.
	import { getContext } from 'svelte';
	import CabecalhoPainel from '$lib/componentes/CabecalhoPainel.svelte';
	import FocoEstudo from '$lib/componentes/FocoEstudo.svelte';
	import GradeFerramentas from '$lib/componentes/GradeFerramentas.svelte';
	import ProgressoEstudo from '$lib/componentes/ProgressoEstudo.svelte';
	import SeletorTema from '$lib/componentes/SeletorTema.svelte';
	import { concursoCgu, dados } from '$lib/dados';
	import { diasParaProva, hojeLocal } from '$lib/datas';
	import type { Repositorio } from '$lib/feed/conteudo';
	import { estatisticas } from '$lib/feed/estatisticas';
	import { foco } from '$lib/feed/foco.svelte';
	import { dadosInteracoes } from '$lib/feed/interacoes.svelte';
	import type { Indice, Materia } from '$lib/feed/tipos';

	/** Cargo fixo (D6): não há seletor. */
	const CARGO = 'AFFC — TI — Ciência de Dados';

	const repo = getContext<Repositorio>('repositorio');
	const prazo = diasParaProva(concursoCgu.dataProva, hojeLocal());

	let materias = $state.raw<Materia[] | null>(null);
	let indice = $state.raw<Indice | null>(null);
	// Sem conteúdo (rede), os totais ainda aparecem; só "por matéria" depende do índice.
	repo.materias().then((m) => (materias = m), () => {});
	repo.indice().then((i) => (indice = i), () => {});

	const numeros = $derived(estatisticas(dadosInteracoes(), indice ?? undefined));
</script>

<svelte:head>
	<title>Painel · Painel de Concurso</title>
</svelte:head>

<div class="painel">
	<CabecalhoPainel concurso={concursoCgu} {prazo} />
	<FocoEstudo
		cargo={CARGO}
		{materias}
		disciplina={foco.disciplina}
		onescolherDisciplina={(id) => foco.escolherDisciplina(id)}
	/>
	<ProgressoEstudo estatisticas={numeros} {materias} />
	<SeletorTema />
	<div>
		<GradeFerramentas ferramentas={dados.ferramentas} />
	</div>
</div>

<style>
	.painel {
		display: flex;
		flex-direction: column;
		gap: calc(var(--espaco) * 1.25);
	}
</style>

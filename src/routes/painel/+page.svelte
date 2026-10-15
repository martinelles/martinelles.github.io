<script lang="ts">
	// Painel da CGU (FR-014, FR-015): concurso fixo, foco em texto no cabeçalho, progresso calculado e atalhos.
	// Foco de Estudo e Aparência ficam na tela /painel/ajustes, aberta pelo canto do cabeçalho.
	// Missão de hoje e resumo do plano logo abaixo do cabeçalho: o plano de 61 dias das Missões, com as
	// mesmas marcações da página (planos/2026-10-14-missao-unica.md).
	import { getContext } from 'svelte';
	import CabecalhoPainel from '$lib/componentes/CabecalhoPainel.svelte';
	import GradeFerramentas from '$lib/componentes/GradeFerramentas.svelte';
	import ProgressoEstudo from '$lib/componentes/ProgressoEstudo.svelte';
	import MissaoDeHoje from '$lib/componentes/missoes/MissaoDeHoje.svelte';
	import ResumoMissoes from '$lib/componentes/missoes/ResumoMissoes.svelte';
	import { concursoCgu, dados } from '$lib/dados';
	import { diasParaProva, hojeLocal } from '$lib/datas';
	import type { Repositorio } from '$lib/feed/conteudo';
	import { topicosDa } from '$lib/feed/entrada';
	import { estatisticas } from '$lib/feed/estatisticas';
	import { ESPECIALIDADES, foco } from '$lib/feed/foco.svelte';
	import { dadosInteracoes } from '$lib/feed/interacoes.svelte';
	import { marcarMissao } from '$lib/feed/pedidoLogin.svelte';
	import type { Indice, Materia } from '$lib/feed/tipos';
	import { usarPlanoMissoes } from '$lib/missoes/estado.svelte';
	import { marcasMissoes } from '$lib/missoes/marcas.svelte';

	const repo = getContext<Repositorio>('repositorio');
	const prazo = diasParaProva(concursoCgu.dataProva, hojeLocal());

	let materias = $state.raw<Materia[] | null>(null);
	let indice = $state.raw<Indice | null>(null);
	// Sem conteúdo (rede), os totais ainda aparecem; só "por matéria" depende do índice.
	repo.materias().then((m) => (materias = m), () => {});
	repo.indice().then((i) => (indice = i), () => {});

	/** Enquanto as matérias carregam (ou sem post na disciplina), o código do edital: `cd-e1` vira `E1`. */
	function rotuloDoId(id: string): string {
		return (id.split('-').pop() ?? id).toUpperCase();
	}

	const nomeFoco = $derived(
		materias?.find((m) => m.id === foco.disciplina)?.nome ?? rotuloDoId(foco.disciplina)
	);

	const numeros = $derived(estatisticas(dadosInteracoes(), indice ?? undefined));

	const hoje = hojeLocal();
	const missoes = usarPlanoMissoes();
	const cargo = $derived(missoes.cargo);
	const plano = $derived(missoes.plano);
	const erroPlano = $derived(missoes.erro);
	const marcas = $derived(marcasMissoes.todas());

	/** Questões do feed por tópico (`tp`), para o atalho de cada subitem. */
	const questoesPorTopico = $derived.by(() => {
		if (!indice) return null;
		const m = new Map<string, number>();
		for (const e of indice.posts) if (e.t === 'q') for (const tp of topicosDa(e)) m.set(tp, (m.get(tp) ?? 0) + 1);
		return m;
	});

</script>

<svelte:head>
	<title>Painel · Painel de Concurso</title>
</svelte:head>

<div class="painel">
	<CabecalhoPainel
		concurso={concursoCgu}
		{prazo}
		foco={nomeFoco}
		especialidades={ESPECIALIDADES}
		especialidade={foco.especialidade.id}
		onescolherEspecialidade={(id) => foco.escolherEspecialidade(id)}
		ancora={foco.especialidade.ancora}
	/>
	{#if !cargo}
		<section class="sem-plano" aria-labelledby="titulo-missao">
			<h2 id="titulo-missao">Missão de hoje</h2>
			<p>{foco.especialidade.nome} ainda não tem plano nas Missões; o feed já traz as provas P1 e P2 e a P3 pelo guia de conteúdo programático.</p>
		</section>
	{:else if erroPlano}
		<p class="erro-plano" role="alert">{erroPlano}</p>
	{:else}
		<MissaoDeHoje {plano} {cargo} {hoje} {marcas} {questoesPorTopico} onmarcar={marcarMissao} />
		{#if plano}
			<ResumoMissoes {plano} {cargo} {marcas} />
		{/if}
	{/if}
	<ProgressoEstudo estatisticas={numeros} {materias} />
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

	.sem-plano {
		background: var(--cor-superficie);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		padding: var(--espaco);
		box-shadow: var(--sombra);
	}

	.sem-plano h2 {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.375rem;
		line-height: 1.2;
	}

	.sem-plano p {
		margin: 8px 0 0;
		color: var(--cor-texto-suave);
	}

	.erro-plano {
		margin: 0;
		padding: 12px var(--espaco);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-erro-fundo);
		color: var(--cor-erro);
	}
</style>

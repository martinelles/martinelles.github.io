<script lang="ts">
	// Painel da CGU (FR-014, FR-015): concurso fixo, foco em texto no cabeçalho, progresso calculado e atalhos.
	// Foco de Estudo e Aparência ficam na tela /painel/ajustes, aberta pelo canto do cabeçalho.
	// Plano de estudos (FR-002..FR-007, FR-011): missão de hoje e resumo do plano logo abaixo do cabeçalho.
	import { getContext } from 'svelte';
	import CabecalhoPainel from '$lib/componentes/CabecalhoPainel.svelte';
	import GradeFerramentas from '$lib/componentes/GradeFerramentas.svelte';
	import ProgressoEstudo from '$lib/componentes/ProgressoEstudo.svelte';
	import AvisoRegistro from '$lib/componentes/plano/AvisoRegistro.svelte';
	import MissaoDoDia from '$lib/componentes/plano/MissaoDoDia.svelte';
	import ResumoPlano from '$lib/componentes/plano/ResumoPlano.svelte';
	import {
		baixarProgresso,
		garantirRegistro,
		iniciarEstudos,
		usarAgora,
		usarMissao,
		usarPlano
	} from '$lib/componentes/plano/estado.svelte';
	import { concursoCgu, dados } from '$lib/dados';
	import { diasParaProva, hojeLocal } from '$lib/datas';
	import type { Repositorio } from '$lib/feed/conteudo';
	import { estatisticas } from '$lib/feed/estatisticas';
	import { foco } from '$lib/feed/foco.svelte';
	import { dadosInteracoes } from '$lib/feed/interacoes.svelte';
	import type { Indice, Materia } from '$lib/feed/tipos';

	const repo = getContext<Repositorio>('repositorio');
	const prazo = diasParaProva(concursoCgu.dataProva, hojeLocal());

	let materias = $state.raw<Materia[] | null>(null);
	let indice = $state.raw<Indice | null>(null);
	// Sem conteúdo (rede), os totais ainda aparecem; só "por matéria" depende do índice.
	repo.materias().then((m) => (materias = m), () => {});
	repo.indice().then((i) => (indice = i), () => {});

	/** Enquanto as matérias carregam, o id formatado: `ti-ciencia-de-dados` vira `Ti ciencia de dados`. */
	function rotuloDoId(id: string): string {
		const texto = id.replaceAll('-', ' ');
		return texto.charAt(0).toUpperCase() + texto.slice(1);
	}

	const nomeFoco = $derived(
		materias?.find((m) => m.id === foco.disciplina)?.nome ?? rotuloDoId(foco.disciplina)
	);

	const numeros = $derived(estatisticas(dadosInteracoes(), indice ?? undefined));

	garantirRegistro();
	const fonte = usarPlano();
	const agora = usarAgora();
	const missao = usarMissao(fonte, agora);
</script>

<svelte:head>
	<title>Painel · Painel de Concurso</title>
</svelte:head>

<div class="painel">
	<CabecalhoPainel
		concurso={concursoCgu}
		{prazo}
		foco={nomeFoco}
		cargo={foco.especialidade.cargo}
		ancora={foco.especialidade.ancora}
	/>
	<AvisoRegistro />
	{#if fonte.erro}
		<p class="erro-plano" role="alert">{fonte.erro}</p>
	{:else}
		<MissaoDoDia plano={fonte.plano} {missao} oniniciar={(t) => iniciarEstudos(t, agora.hoje)} />
		{#if fonte.plano}
			{@const plano = fonte.plano}
			<ResumoPlano
				{plano}
				dados={missao.dados}
				agora={agora.ms}
				hoje={agora.hoje}
				onexportar={() => baixarProgresso(plano, agora.hoje)}
			/>
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

	.erro-plano {
		margin: 0;
		padding: 12px var(--espaco);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-erro-fundo);
		color: var(--cor-erro);
	}
</style>

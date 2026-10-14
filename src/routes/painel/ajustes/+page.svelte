<script lang="ts">
	// Ajustes (FR-003 a FR-005): Foco de Estudo e Aparência, fora da primeira página do painel; e a Conta
	// (login por nome, planos/2026-10-13-login-por-nome-backend-cloudflare.md).
	import ContaAjustes from '$lib/componentes/ContaAjustes.svelte';
	import { getContext } from 'svelte';
	import FocoEstudo from '$lib/componentes/FocoEstudo.svelte';
	import Icone from '$lib/componentes/Icone.svelte';
	import SeletorTema from '$lib/componentes/SeletorTema.svelte';
	import type { Repositorio } from '$lib/feed/conteudo';
	import { ESPECIALIDADES, foco } from '$lib/feed/foco.svelte';
	import type { Materia } from '$lib/feed/tipos';

	const repo = getContext<Repositorio>('repositorio');
	let materias = $state.raw<Materia[] | null>(null);
	repo.materias().then((m) => (materias = m), () => {});
</script>

<svelte:head>
	<title>Ajustes · Painel de Concurso</title>
</svelte:head>

<div class="ajustes">
	<!-- No DOM, o título vem antes do "Voltar" (contrato); na tela, o "Voltar" fica acima. -->
	<header class="topo">
		<h1>Ajustes</h1>
		<a class="voltar" href="/painel"><Icone nome="voltar" tamanho={20} /> Voltar ao painel</a>
	</header>
	<FocoEstudo
		especialidades={ESPECIALIDADES}
		especialidade={foco.especialidade}
		{materias}
		disciplina={foco.disciplina}
		onescolherEspecialidade={(id) => foco.escolherEspecialidade(id)}
		onescolherDisciplina={(id) => foco.escolherDisciplina(id)}
	/>
	<SeletorTema />
	<ContaAjustes />
</div>

<style>
	.ajustes {
		display: flex;
		flex-direction: column;
		gap: calc(var(--espaco) * 1.25);
	}

	.topo {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--espaco);
	}

	.topo .voltar {
		order: -1;
	}

	h1 {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1.15;
	}

	.voltar {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 10px 18px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
		box-shadow: var(--sombra);
		font-weight: 700;
		text-decoration: none;
	}
</style>

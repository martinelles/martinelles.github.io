<script lang="ts">
	// Questões de certo ou errado do material da aula: um toque em C ou E por item; o gabarito
	// comentado abre logo abaixo de cada item respondido, e o placar acompanha no topo. As
	// respostas vivem só nesta visita — é um treino rápido, não um registro.
	import Icone from '$lib/componentes/Icone.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let respostas = $state<Record<number, 'C' | 'E'>>({});

	const acertos = $derived(
		data.gabarito.filter((g) => respostas[g.n] === g.r).length
	);
	const respondidas = $derived(Object.keys(respostas).length);
</script>

<svelte:head>
	<title>Questões C/E · {data.titulo} · Painel de Concurso</title>
</svelte:head>

<article class="pagina-questoes">
	<header>
		<h1>Questões de certo ou errado · {data.titulo}</h1>
		<a class="voltar" href="/painel">
			<Icone nome="voltar" tamanho={20} />
			Voltar ao painel
		</a>
	</header>
	<p class="placar" role="status">
		{#if respondidas === 0}
			{data.questoes.length} itens — marque Certo ou Errado; o gabarito comentado abre na hora.
		{:else}
			{acertos} de {respondidas} certos{respondidas < data.questoes.length ? ` · ${data.questoes.length - respondidas} por responder` : ' — fim'}
		{/if}
	</p>
	<ol>
		{#each data.questoes as q (q.n)}
			{@const resposta = respostas[q.n]}
			{@const gab = data.gabarito.find((g) => g.n === q.n)}
			<li class:certo={resposta && gab && resposta === gab.r} class:errado={resposta && gab && resposta !== gab.r}>
				<p class="enunciado">{q.texto}</p>
				<div class="acoes">
					<button
						type="button"
						class="c"
						aria-pressed={resposta === 'C'}
						onclick={() => (respostas[q.n] = 'C')}
						disabled={resposta !== undefined}
					>
						Certo
					</button>
					<button
						type="button"
						class="e"
						aria-pressed={resposta === 'E'}
						onclick={() => (respostas[q.n] = 'E')}
						disabled={resposta !== undefined}
					>
						Errado
					</button>
					{#if resposta !== undefined}
						<button type="button" class="refazer" onclick={() => delete respostas[q.n]}>Refazer</button>
					{/if}
				</div>
				{#if resposta !== undefined && gab}
					<div class="gabarito">
						<span class="selo {gab.r === 'C' ? 'certo' : 'errado'}">Gabarito: {gab.r === 'C' ? 'certo' : 'errado'}</span>
						<p>{gab.comentario}</p>
					</div>
				{/if}
			</li>
		{/each}
	</ol>
</article>

<style>
	.pagina-questoes {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-height: 100dvh;
		padding: var(--espaco);
	}

	header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
	}

	h1 {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.25rem;
		line-height: 1.25;
	}

	.voltar {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		color: var(--cor-texto);
		font-weight: 700;
		text-decoration: none;
	}

	.placar {
		margin: 0;
		color: var(--cor-texto-suave);
	}

	ol {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 12px;
	}

	li {
		display: grid;
		gap: 8px;
		padding: 12px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-superficie);
	}

	li.certo {
		border-color: var(--cor-acerto);
	}

	li.errado {
		border-color: var(--cor-erro);
	}

	.enunciado {
		margin: 0;
	}

	.acoes {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.acoes button {
		min-height: 44px;
		padding: 8px 16px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
		color: var(--cor-texto);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.acoes button:disabled {
		cursor: default;
	}

	.acoes .c[aria-pressed='true'] {
		background: var(--cor-acerto);
		border-color: var(--cor-acerto);
		color: var(--cor-superficie);
	}

	.acoes .e[aria-pressed='true'] {
		background: var(--cor-erro);
		border-color: var(--cor-erro);
		color: var(--cor-superficie);
	}

	.acoes .refazer {
		color: var(--cor-texto-suave);
		text-decoration: underline;
	}

	.gabarito {
		display: grid;
		gap: 4px;
		padding: 8px 10px;
		border-radius: calc(var(--raio) / 2);
		background: color-mix(in srgb, var(--cor-texto) 6%, transparent);
		font-size: 0.9375rem;
	}

	.gabarito p {
		margin: 0;
	}

	.selo {
		font-weight: 700;
	}

	.selo.certo {
		color: var(--cor-acerto);
	}

	.selo.errado {
		color: var(--cor-erro);
	}
</style>

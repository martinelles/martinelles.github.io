<script lang="ts">
	// Questões de certo ou errado do material da aula, uma por vez: C ou E responde (tecla ou
	// toque) e avança; o gabarito comentado abre na hora; ← e → navegam entre as respondidas.
	// Enter também avança. As respostas vivem só nesta visita — é um treino rápido.
	import Icone from '$lib/componentes/Icone.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let respostas = $state<Record<number, 'C' | 'E'>>({});
	let atual = $state(0);

	const total = $derived(data.questoes.length);
	const questao = $derived(data.questoes[atual] ?? null);
	const resposta = $derived(questao ? respostas[questao.n] : undefined);
	const gab = $derived(questao ? data.gabarito.find((g) => g.n === questao.n) : undefined);
	const acertos = $derived(data.gabarito.filter((g) => respostas[g.n] === g.r).length);
	const respondidas = $derived(Object.keys(respostas).length);

	function responder(r: 'C' | 'E') {
		if (!questao || respostas[questao.n] !== undefined) return;
		respostas[questao.n] = r;
	}

	function avancar() {
		if (atual < total - 1) atual++;
	}

	function voltar() {
		if (atual > 0) atual--;
	}

	function teclado(e: KeyboardEvent) {
		const alvo = e.target as HTMLElement | null;
		// Não roubar teclas de campo de texto (busca, login).
		if (alvo && (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA' || alvo.isContentEditable)) return;
		if (e.key === 'c' || e.key === 'C') {
			responder('C');
			if (respostas[questao?.n ?? -1] !== undefined) avancar();
		} else if (e.key === 'e' || e.key === 'E') {
			responder('E');
			if (respostas[questao?.n ?? -1] !== undefined) avancar();
		} else if (e.key === 'Enter') {
			if (resposta !== undefined) avancar();
		} else if (e.key === 'ArrowRight') avancar();
		else if (e.key === 'ArrowLeft') voltar();
		else return;
		e.preventDefault();
	}
</script>

<svelte:head>
	<title>Questões C/E · {data.titulo} · Painel de Concurso</title>
</svelte:head>

<svelte:window onkeydown={teclado} />

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
			{total} itens — marque Certo ou Errado (teclas C e E); o gabarito comentado abre na hora.
		{:else}
			{acertos} de {respondidas} certos{respondidas < total ? ` · ${total - respondidas} por responder` : ' — fim'}
		{/if}
	</p>

	{#if questao}
		<div class="cartao" class:certo={resposta && gab && resposta === gab.r} class:errado={resposta && gab && resposta !== gab.r}>
			<p class="numero">Questão {atual + 1} de {total}</p>
			<p class="enunciado">{questao.texto}</p>
			<div class="acoes">
				<button type="button" class="c" aria-pressed={resposta === 'C'} onclick={() => responder('C')} disabled={resposta !== undefined}>
					Certo <kbd>C</kbd>
				</button>
				<button type="button" class="e" aria-pressed={resposta === 'E'} onclick={() => responder('E')} disabled={resposta !== undefined}>
					Errado <kbd>E</kbd>
				</button>
			</div>
			{#if resposta !== undefined && gab}
				<div class="gabarito">
					<span class="selo {gab.r === 'C' ? 'certo' : 'errado'}">Gabarito: {gab.r === 'C' ? 'certo' : 'errado'}</span>
					<p>{gab.comentario}</p>
					<button type="button" class="refazer" onclick={() => delete respostas[questao.n]}>Refazer</button>
				</div>
			{/if}
		</div>

		<div class="navegacao">
			<button type="button" onclick={voltar} disabled={atual === 0}>← Anterior</button>
			<div class="pontos" aria-hidden="true">
				{#each data.questoes as q, i (q.n)}
					<span
						class="ponto {respostas[q.n]
							? data.gabarito.find((g) => g.n === q.n)?.r === respostas[q.n]
								? 'certo'
								: 'errado'
							: ''} {i === atual ? 'atual' : ''}"
					></span>
				{/each}
			</div>
			<button type="button" onclick={avancar} disabled={atual === total - 1}>
				Próxima → <kbd>Enter</kbd>
			</button>
		</div>
		<p class="dica-teclas">Teclas: C e E respondem · Enter avança · ← e → navegam</p>
	{/if}
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

	.cartao {
		display: grid;
		gap: 8px;
		padding: 16px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-superficie);
	}

	.cartao.certo {
		border-color: var(--cor-acerto);
	}

	.cartao.errado {
		border-color: var(--cor-erro);
	}

	.numero {
		margin: 0;
		color: var(--cor-texto-suave);
		font-size: 0.8125rem;
		font-weight: 700;
	}

	.enunciado {
		margin: 0;
		font-size: 1.0625rem;
	}

	.acoes {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.acoes button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
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

	kbd {
		padding: 1px 6px;
		border: 1px solid currentColor;
		border-radius: 4px;
		font: 700 0.75rem var(--fonte-dado, monospace);
		opacity: 0.8;
	}

	.gabarito {
		display: grid;
		gap: 4px;
		padding: 10px 12px;
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

	.gabarito .refazer {
		justify-self: start;
		min-height: 44px;
		padding: 8px 12px;
		border: 0;
		background: none;
		color: var(--cor-texto-suave);
		font: inherit;
		font-size: 0.875rem;
		font-weight: 700;
		text-decoration: underline;
		cursor: pointer;
	}

	.navegacao {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.navegacao button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 8px 14px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
		color: var(--cor-texto);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.navegacao button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.pontos {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 4px;
	}

	.ponto {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--cor-borda);
	}

	.ponto.certo {
		background: var(--cor-acerto);
	}

	.ponto.errado {
		background: var(--cor-erro);
	}

	.ponto.atual {
		outline: 2px solid var(--cor-primaria);
		outline-offset: 1px;
	}

	.dica-teclas {
		margin: 0;
		color: var(--cor-texto-suave);
		font-size: 0.8125rem;
		text-align: center;
	}
</style>

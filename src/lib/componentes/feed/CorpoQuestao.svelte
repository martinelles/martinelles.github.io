<script lang="ts">
	// Questão respondível no próprio post. A primeira resposta vale: depois dela os botões
	// ficam desabilitados e o estado final aparece (também quando o post monta já respondido).
	import Icone from '$lib/componentes/Icone.svelte';
	import type { Resposta } from '$lib/feed/interacoes.svelte';
	import type { PostQuestao } from '$lib/feed/tipos';

	let {
		post,
		resposta,
		onResponder
	}: {
		post: PostQuestao;
		/** Resposta já registrada (vinda do motor), se houver. */
		resposta?: Resposta;
		/** Chamado uma vez, com a letra escolhida ('C'/'E' ou 'A'–'E'). */
		onResponder: (r: string) => void;
	} = $props();

	/** Acima disto, o texto-base fica recolhido. */
	const LIMITE_TEXTO_BASE = 400;

	// Escolha local: dá o retorno visual na hora, antes de o motor devolver `resposta`.
	let escolhaLocal = $state<string | null>(null);
	const escolha = $derived(resposta?.r ?? escolhaLocal);
	const respondida = $derived(escolha !== null);
	const acertou = $derived(escolha === post.gabarito);

	const opcoes = $derived(
		post.formato === 'ce'
			? [
					{ letra: 'C', texto: 'Certo' },
					{ letra: 'E', texto: 'Errado' }
				]
			: (post.alternativas ?? [])
	);

	function responder(letra: string): void {
		if (respondida) return;
		escolhaLocal = letra;
		onResponder(letra);
	}

	const nomeGabarito = (l: string) => (post.formato === 'ce' ? (l === 'C' ? 'Certo' : 'Errado') : l);
</script>

<div class="questao">
	{#if post.textoBase}
		{#if post.textoBase.length > LIMITE_TEXTO_BASE}
			<details class="texto-base">
				<summary>Ler texto-base</summary>
				<p class="texto">{post.textoBase}</p>
			</details>
		{:else}
			<p class="texto texto-base">{post.textoBase}</p>
		{/if}
	{/if}

	<p class="texto enunciado">{post.enunciado}</p>

	<div class="opcoes" class:ce={post.formato === 'ce'} role="group" aria-label="Responder">
		{#each opcoes as op (op.letra)}
			{@const escolhida = escolha === op.letra}
			{@const correta = respondida && op.letra === post.gabarito}
			<button
				type="button"
				class="opcao"
				class:correta
				class:errada={escolhida && !correta}
				class:apagada={respondida && !escolhida && !correta}
				disabled={respondida}
				onclick={() => responder(op.letra)}
			>
				{#if post.formato === 'me'}
					<span class="letra" aria-hidden="true">{op.letra}</span>
					<span class="so-leitor">Alternativa {op.letra}:</span>
				{/if}
				<span class="rotulo">{op.texto}</span>
				{#if correta}
					<span class="marca"><Icone nome="check" tamanho={20} rotulo="correta" /></span>
				{:else if escolhida}
					<span class="marca"><Icone nome="x" tamanho={20} rotulo="sua resposta, errada" /></span>
				{/if}
				{#if escolhida && correta}
					<span class="so-leitor">(sua resposta)</span>
				{/if}
			</button>
		{/each}
	</div>

	<p class="resultado" class:ok={respondida && acertou} class:erro={respondida && !acertou} aria-live="polite">
		{#if respondida}
			{#if acertou}
				<Icone nome="check" tamanho={18} />
				Você acertou
			{:else}
				<Icone nome="x" tamanho={18} />
				Você errou — gabarito: {nomeGabarito(post.gabarito)}
			{/if}
		{/if}
	</p>
	{#if respondida && post.situacao === 'alterada'}
		<p class="alterada">Gabarito alterado pela banca após os recursos.</p>
	{/if}
</div>

<style>
	.questao {
		display: grid;
		gap: 12px;
	}

	.texto {
		margin: 0;
		font-family: var(--fonte-texto);
		font-size: 1.0625rem;
		line-height: 1.6;
		white-space: pre-line;
		overflow-wrap: anywhere;
		max-width: var(--medida);
	}

	/* Marca de citação, não contorno: tinta leve. */
	.texto-base {
		padding: 10px 12px;
		border-left: var(--linha-peso) solid var(--cor-divisor);
		color: var(--cor-texto-suave);
		font-size: 0.9375rem;
	}

	details.texto-base {
		padding: 0 12px;
	}

	details.texto-base .texto {
		padding-bottom: 10px;
		font-size: 0.9375rem;
	}

	summary {
		min-height: 44px;
		display: flex;
		align-items: center;
		cursor: pointer;
		font-family: var(--fonte);
		font-weight: 600;
		color: var(--cor-primaria);
	}

	.opcoes {
		display: grid;
		gap: 8px;
	}

	.opcoes.ce {
		grid-template-columns: 1fr 1fr;
	}

	.opcao {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 48px;
		padding: 10px 12px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
		text-align: left;
		cursor: pointer;
	}

	.ce .opcao {
		justify-content: center;
		min-height: 56px;
		font-weight: 700;
		font-size: 1.0625rem;
	}

	/* Levanta a opção: sombra dura no Aventura; nos Kindle --sombra é none. */
	.opcao:not(:disabled):hover {
		box-shadow: var(--sombra);
	}

	/* Só o Aventura desloca: nos Kindle a opção fica parada (sem sombra, o deslocamento não diz nada). */
	:global([data-tema='aventura']) .opcao:not(:disabled):hover {
		transform: translate(-1px, -1px);
	}

	.opcao:not(:disabled):active {
		background: var(--cor-fundo);
	}

	.opcao:disabled {
		cursor: default;
	}

	.letra {
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		border: var(--linha-peso) solid currentColor;
		font-weight: 700;
		font-size: 0.875rem;
	}

	.rotulo {
		flex: 1;
		overflow-wrap: anywhere;
	}

	.ce .rotulo {
		flex: 0 1 auto;
	}

	.marca {
		flex-shrink: 0;
	}

	.opcao.correta {
		border-color: var(--cor-acerto);
		background: var(--cor-acerto-fundo);
		color: var(--cor-acerto);
	}

	.opcao.errada {
		border-color: var(--cor-erro);
		background: var(--cor-erro-fundo);
		color: var(--cor-erro);
	}

	/* Kindle: erro e acerto têm a mesma tinta; o tracejado diferencia pela forma (FR-009). */
	:global([data-tema^='kindle']) .opcao.errada {
		border-style: dashed;
	}

	.opcao.apagada {
		color: var(--cor-texto-suave);
	}

	.resultado {
		margin: 0;
		min-height: 1.5em;
		display: flex;
		align-items: center;
		gap: 6px;
		font-weight: 700;
	}

	.resultado.ok {
		color: var(--cor-acerto);
	}

	.resultado.erro {
		color: var(--cor-erro);
	}

	.alterada {
		margin: -6px 0 0;
		font-size: 0.8125rem;
		color: var(--cor-texto-suave);
	}
</style>

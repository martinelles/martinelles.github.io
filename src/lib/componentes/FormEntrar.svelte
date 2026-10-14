<script lang="ts">
	// Formulário do login por nome, usado na tela /entrar e no popup do feed. O nome é a
	// credencial (plano planos/2026-10-13-login-por-nome-backend-cloudflare.md, decisão 1).
	import type { Snippet } from 'svelte';
	import { nomeValido, normalizarNome } from '$lib/conta/regras';
	import { ApiIndisponivel, conta } from '$lib/conta/sessao.svelte';

	let {
		destino = '/painel',
		depois
	}: {
		/** Para onde a carga nova vai depois de entrar. */
		destino?: string;
		/** Botões extras ao lado de "Entrar" (no popup, "Agora não"). */
		depois?: Snippet;
	} = $props();

	let texto = $state('');
	let erro = $state<string | null>(null);
	let entrando = $state(false);
	const nome = $derived(normalizarNome(texto));
	const valido = $derived(nomeValido(nome));

	async function entrar(e: SubmitEvent) {
		e.preventDefault();
		if (!valido || entrando) return;
		erro = null;
		entrando = true;
		try {
			await conta.entrar(texto, undefined, destino);
		} catch (x) {
			erro =
				x instanceof ApiIndisponivel
					? 'Login indisponível neste endereço. Use cgu.solarpunk.workers.dev, com internet.'
					: x instanceof Error
						? x.message
						: 'Não deu para entrar.';
			entrando = false;
		}
	}
</script>

<form onsubmit={entrar}>
	<label for="nome">Seu nome</label>
	<input
		id="nome"
		name="nome"
		autocomplete="username"
		autocapitalize="none"
		spellcheck="false"
		maxlength="60"
		bind:value={texto}
		aria-describedby="nome-ajuda"
	/>
	<p id="nome-ajuda" class="ajuda" aria-live="polite">
		{#if !texto.trim()}
			Sem senha: o mesmo nome abre o mesmo progresso em qualquer aparelho.
		{:else if valido}
			Você vai entrar como <strong>{nome}</strong>.
		{:else}
			O nome precisa de 3 a 30 letras ou números.
		{/if}
	</p>
	<div class="botoes">
		<button type="submit" disabled={!valido || entrando}>{entrando ? 'Entrando…' : 'Entrar'}</button>
		{@render depois?.()}
	</div>
	{#if erro}<p class="erro" role="alert">{erro}</p>{/if}
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		max-width: 28rem;
		padding: var(--espaco);
		background: var(--cor-superficie);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
	}

	p {
		margin: 0;
	}

	label {
		font-weight: 700;
	}

	input {
		min-height: 44px;
		padding: 8px 12px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-fundo);
		color: var(--cor-texto);
		font: inherit;
	}

	input:focus-visible {
		outline: 3px solid var(--cor-primaria);
		outline-offset: 2px;
	}

	.ajuda {
		color: var(--cor-texto-suave);
		font-size: 0.9375rem;
	}

	.erro {
		padding: 8px 12px;
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-erro-fundo);
		color: var(--cor-erro);
		font-weight: 700;
	}

	.botoes {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	button {
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
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
</style>

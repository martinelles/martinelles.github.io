<script lang="ts">
	// Login só com o nome (plano planos/2026-10-13-login-por-nome-backend-cloudflare.md, fase 3).
	// O nome é a credencial: quem digitar o mesmo nome abre o mesmo progresso (decisão 1).
	import Icone from '$lib/componentes/Icone.svelte';
	import { nomeValido, normalizarNome } from '$lib/conta/regras';
	import { ApiIndisponivel, conta } from '$lib/conta/sessao.svelte';

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
			await conta.entrar(texto);
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

<svelte:head>
	<title>Entrar · Painel de Concurso</title>
</svelte:head>

<div class="entrar">
	<a class="voltar" href="/painel/ajustes"><Icone nome="voltar" tamanho={20} /> Voltar aos ajustes</a>
	<h1>Entrar</h1>

	{#if conta.usuario}
		<p>Você já entrou como <strong>{conta.usuario}</strong>. Para trocar, saia nos Ajustes.</p>
	{:else}
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
			<button type="submit" disabled={!valido || entrando}>{entrando ? 'Entrando…' : 'Entrar'}</button>
			{#if erro}<p class="erro" role="alert">{erro}</p>{/if}
		</form>
	{/if}
</div>

<style>
	.entrar {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: calc(var(--espaco) * 1.25);
		overflow-wrap: anywhere;
	}

	h1 {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1.15;
	}

	p {
		margin: 0;
	}

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

	.voltar,
	button {
		display: inline-flex;
		align-items: center;
		align-self: flex-start;
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
		text-decoration: none;
		cursor: pointer;
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
</style>

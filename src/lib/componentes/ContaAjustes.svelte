<script lang="ts">
	// Seção Conta dos Ajustes (fase 3 do plano planos/2026-10-13-login-por-nome-backend-cloudflare.md):
	// com login, o nome e "Sair"; sem login, o convite para entrar.
	import { conta } from '$lib/conta/sessao.svelte';

	let saindo = $state(false);
	async function sair() {
		saindo = true;
		await conta.sair();
	}
</script>

<section class="conta" aria-labelledby="conta-titulo">
	<h2 id="conta-titulo">Conta</h2>
	{#if conta.usuario}
		<p>Entrou como <strong>{conta.usuario}</strong>. Seu progresso fica salvo e aparece em qualquer aparelho com este nome.</p>
		<button type="button" onclick={sair} disabled={saindo}>{saindo ? 'Saindo…' : 'Sair'}</button>
	{:else}
		<p>Seu progresso está só neste aparelho. Entre com um nome para guardá-lo e abrir em outro aparelho.</p>
		<a class="botao" href="/entrar">Entrar</a>
	{/if}
</section>

<style>
	.conta {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
		padding: var(--espaco);
		background: var(--cor-superficie);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		overflow-wrap: anywhere;
	}

	h2 {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.125rem;
	}

	p {
		margin: 0;
	}

	button,
	.botao {
		display: inline-flex;
		align-items: center;
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
		cursor: progress;
		opacity: 0.7;
	}
</style>

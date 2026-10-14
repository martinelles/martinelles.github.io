<script lang="ts">
	// Popup de login que o feed abre ao responder sem login (src/lib/feed/pedidoLogin.svelte.ts).
	// `<dialog>` modal: o navegador prende o foco e o Esc vale como "Agora não".
	import { page } from '$app/state';
	import FormEntrar from '$lib/componentes/FormEntrar.svelte';
	import { pedidoLogin } from '$lib/feed/pedidoLogin.svelte';

	let dialogo: HTMLDialogElement;

	$effect(() => {
		if (pedidoLogin.aberto && !dialogo.open) dialogo.showModal();
		else if (!pedidoLogin.aberto && dialogo.open) dialogo.close();
	});

	function cancelar(e: Event) {
		e.preventDefault();
		pedidoLogin.agoraNao();
	}
</script>

<dialog bind:this={dialogo} aria-labelledby="popup-entrar-titulo" oncancel={cancelar}>
	<h2 id="popup-entrar-titulo">Entre para guardar sua resposta</h2>
	<p>Com login, o que você responde fica salvo na sua conta e aparece em qualquer aparelho.</p>
	{#if pedidoLogin.aberto}
		<FormEntrar destino={page.url.pathname + page.url.search}>
			{#snippet depois()}
				<button type="button" class="secundario" onclick={() => pedidoLogin.agoraNao()}>Agora não</button>
			{/snippet}
		</FormEntrar>
	{/if}
</dialog>

<style>
	dialog {
		width: min(32rem, calc(100vw - 2 * var(--espaco)));
		max-width: none;
		padding: var(--espaco);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-fundo);
		color: var(--cor-texto);
		box-shadow: var(--sombra);
		overflow-wrap: anywhere;
	}

	dialog[open] {
		display: flex;
		flex-direction: column;
		gap: var(--espaco);
	}

	dialog::backdrop {
		background: rgb(0 0 0 / 0.45);
	}

	h2 {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.375rem;
		line-height: 1.2;
	}

	p {
		margin: 0;
	}

	.secundario {
		min-height: 44px;
		padding: 10px 18px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
		color: var(--cor-texto);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.secundario:focus-visible {
		outline: 3px solid var(--cor-primaria);
		outline-offset: 2px;
	}
</style>

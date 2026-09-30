<script lang="ts">
	import Icone from './Icone.svelte';

	let {
		valor = $bindable(''),
		rotulo = 'Buscar concurso',
		placeholder = 'Busque por concurso, órgão, banca ou cargo'
	}: { valor?: string; rotulo?: string; placeholder?: string } = $props();

	const id = $props.id();
	let campo: HTMLInputElement | undefined = $state();

	function limpar() {
		valor = '';
		campo?.focus();
	}
</script>

<div class="busca">
	<label class="sr-only" for={id}>{rotulo}</label>
	<span class="lupa"><Icone nome="busca" tamanho={20} /></span>
	<input
		bind:this={campo}
		bind:value={valor}
		{id}
		type="search"
		inputmode="search"
		autocomplete="off"
		enterkeyhint="search"
		{placeholder}
	/>
	{#if valor}
		<button type="button" class="limpar" aria-label="Limpar busca" onclick={limpar}>Limpar</button>
	{/if}
</div>

<style>
	.busca {
		position: relative;
		display: flex;
		align-items: center;
		min-height: 48px;
		background: var(--cor-superficie);
		border: 1px solid var(--cor-borda);
		border-radius: var(--raio);
		box-shadow: var(--sombra);
	}

	.busca:focus-within {
		border-color: var(--cor-primaria);
	}

	.lupa {
		display: flex;
		padding-left: 14px;
		color: var(--cor-texto-suave);
		pointer-events: none;
	}

	input {
		flex: 1;
		min-width: 0;
		min-height: 48px;
		padding: 0 12px;
		border: 0;
		background: transparent;
		outline: none;
	}

	input::placeholder {
		color: var(--cor-texto-suave);
		opacity: 1;
	}

	input::-webkit-search-cancel-button {
		appearance: none;
	}

	.busca:has(input:focus-visible) {
		outline: 3px solid var(--cor-primaria);
		outline-offset: 2px;
	}

	.limpar {
		min-height: 44px;
		min-width: 44px;
		margin-right: 2px;
		padding: 0 12px;
		border: 0;
		border-radius: calc(var(--raio) - 4px);
		background: transparent;
		color: var(--cor-primaria);
		font-weight: 600;
		cursor: pointer;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}
</style>

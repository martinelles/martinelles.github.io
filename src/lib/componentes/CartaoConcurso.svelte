<script lang="ts">
	import type { Concurso, NomeIcone } from '$lib/dados';
	import Icone from './Icone.svelte';

	let {
		concurso,
		etiqueta,
		onescolher
	}: { concurso: Concurso; etiqueta: string; onescolher: (id: string) => void } = $props();

	// `icone` é string no tipo, mas validarDados já recusa nome fora de ICONES.
	const icone = $derived(concurso.icone as NomeIcone);
	const cargoPrincipal = $derived(concurso.cargos[0]?.nome);
</script>

<button
	type="button"
	class="cartao"
	aria-label="{concurso.nome}, banca {concurso.banca}, {etiqueta}"
	onclick={() => onescolher(concurso.id)}
>
	<span class="circulo cor-{concurso.cor}"><Icone nome={icone} tamanho={22} /></span>
	<span class="texto">
		<span class="nome">{concurso.nome}</span>
		<span class="detalhe">
			{concurso.banca}{#if cargoPrincipal}&nbsp;· {cargoPrincipal}{/if}
		</span>
	</span>
	<span class="lateral">
		<span class="etiqueta">{etiqueta}</span>
		{#if concurso.salario}<span class="salario">{concurso.salario}</span>{/if}
	</span>
	<span class="chevron"><Icone nome="seta-baixo" tamanho={20} /></span>
</button>

<style>
	.cartao {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		min-height: 64px;
		padding: 12px var(--espaco);
		border: 1px solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-superficie);
		box-shadow: var(--sombra);
		text-align: left;
		cursor: pointer;
	}

	.cartao:hover {
		border-color: var(--cor-primaria);
	}

	.circulo {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		color: var(--cor-circulo);
		background: color-mix(in srgb, var(--cor-circulo) 14%, transparent);
	}

	.cor-azul {
		--cor-circulo: var(--cor-azul);
	}
	.cor-verde {
		--cor-circulo: var(--cor-verde);
	}
	.cor-roxo {
		--cor-circulo: var(--cor-roxo);
	}
	.cor-laranja {
		--cor-circulo: var(--cor-laranja);
	}
	.cor-vermelho {
		--cor-circulo: var(--cor-vermelho);
	}

	.texto {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.nome {
		font-weight: 700;
		line-height: 1.3;
	}

	.detalhe {
		color: var(--cor-texto-suave);
		font-size: 0.875rem;
	}

	.lateral {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4px;
		flex-shrink: 0;
		max-width: 40%;
		text-align: right;
	}

	.etiqueta {
		padding: 2px 10px;
		border: 1px solid var(--cor-borda);
		border-radius: 999px;
		background: var(--cor-fundo);
		font-size: 0.75rem;
		font-weight: 600;
	}

	.salario {
		color: var(--cor-texto-suave);
		font-size: 0.8125rem;
		font-weight: 600;
	}

	.chevron {
		flex-shrink: 0;
		color: var(--cor-texto-suave);
		transform: rotate(-90deg);
	}
</style>

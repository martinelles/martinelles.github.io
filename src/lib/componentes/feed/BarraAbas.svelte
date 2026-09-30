<script lang="ts" module>
	export type Aba = 'feed' | 'salvos' | 'painel';
</script>

<script lang="ts">
	// Abas fixas no rodapé: Feed, Salvos e Painel.
	import Icone from '$lib/componentes/Icone.svelte';
	import type { NomeIcone } from '$lib/dados';

	let { atual }: { /** Aba da página aberta. */ atual: Aba } = $props();

	const ABAS: { id: Aba; href: string; rotulo: string; icone: NomeIcone }[] = [
		{ id: 'feed', href: '/', rotulo: 'Feed', icone: 'casa' },
		{ id: 'salvos', href: '/salvos', rotulo: 'Salvos', icone: 'marcador' },
		{ id: 'painel', href: '/painel', rotulo: 'Painel', icone: 'grade' }
	];
</script>

<nav class="abas" aria-label="Seções">
	<ul>
		{#each ABAS as aba (aba.id)}
			<li>
				<a href={aba.href} class="aba" aria-current={aba.id === atual ? 'page' : undefined}>
					<Icone nome={aba.id === atual && aba.icone === 'marcador' ? 'marcador-cheio' : aba.icone} />
					<span>{aba.rotulo}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.abas {
		position: fixed;
		inset: auto 0 0 0;
		z-index: 10;
		background: var(--cor-superficie);
		border-top: 1px solid var(--cor-borda);
		padding-bottom: env(safe-area-inset-bottom);
	}

	ul {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		max-width: 560px;
		margin: 0 auto;
		padding: 0;
		list-style: none;
	}

	.aba {
		height: var(--altura-abas);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		color: var(--cor-texto-suave);
		text-decoration: none;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.aba[aria-current='page'] {
		color: var(--cor-texto);
		font-weight: 800;
	}

	.aba[aria-current='page'] span {
		text-decoration: underline 2px;
		text-underline-offset: 3px;
	}
</style>

<script lang="ts">
	// Borda "armazenamento indisponível" do plano (contracts/registro.md): o registro do plano tem
	// `persistindo` próprio. Se o armazenamento todo falhou, o aviso do layout já cobre; este só
	// aparece quando é o plano que não grava (ex.: cota cheia na escrita do registro).
	import { interacoes } from '$lib/feed/interacoes.svelte';
	import { registro } from '$lib/plano/registro.svelte';
</script>

{#if !registro.persistindo && interacoes.persistindo}
	<p class="aviso" role="status">Seu progresso do plano não está sendo salvo neste navegador. O cronômetro funciona até fechar a aba.</p>
{/if}

<style>
	.aviso {
		margin: 0;
		padding: 8px 12px;
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-aviso-fundo);
		color: var(--cor-aviso);
		font-size: 0.875rem;
	}
</style>

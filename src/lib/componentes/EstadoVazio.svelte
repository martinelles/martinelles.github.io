<script lang="ts">
	import Icone from './Icone.svelte';

	let {
		termo,
		whatsapp,
		onestudarPorDisciplina
	}: { termo: string; whatsapp: string | null; onestudarPorDisciplina: () => void } = $props();

	const linkWhatsapp = $derived(
		whatsapp === null
			? null
			: `${whatsapp}${whatsapp.includes('?') ? '&' : '?'}text=${encodeURIComponent('Quero o concurso: ' + termo)}`
	);
</script>

<div class="vazio" role="status">
	<p class="titulo">Poxa, não encontramos "{termo}"</p>
	<p>A gente adiciona para você!</p>
	<p class="suave">Enquanto isso, escolha um caminho:</p>
	<div class="acoes">
		<button type="button" class="primario" onclick={() => onestudarPorDisciplina()}>
			<Icone nome="livro" tamanho={20} />
			Estudar por Disciplina
		</button>
		{#if linkWhatsapp}
			<a class="secundario" href={linkWhatsapp} target="_blank" rel="noopener">
				<Icone nome="whatsapp" tamanho={20} />
				Pedir no WhatsApp
			</a>
		{/if}
	</div>
</div>

<style>
	.vazio {
		padding: calc(var(--espaco) * 1.5) var(--espaco);
		border: 1px solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-superficie);
		text-align: center;
		overflow-wrap: anywhere;
	}

	p {
		margin: 0 0 6px;
	}

	.titulo {
		font-size: 1.125rem;
		font-weight: 700;
	}

	.suave {
		color: var(--cor-texto-suave);
	}

	.acoes {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
		margin-top: var(--espaco);
	}

	.primario,
	.secundario {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 48px;
		padding: 0 20px;
		border-radius: var(--raio);
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
	}

	.primario {
		border: 0;
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
	}

	.secundario {
		border: 1px solid var(--cor-borda);
		background: var(--cor-superficie);
		color: var(--cor-texto);
	}
</style>

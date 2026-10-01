<script lang="ts">
	// Foco de estudo (FR-014, D6): cargo fixo; só a disciplina de foco se escolhe, entre as
	// matérias do conteúdo. A disciplina de foco vem logo depois de "Tudo" nos stories.
	import type { Materia } from '$lib/feed/tipos';

	let {
		cargo,
		materias,
		disciplina,
		onescolherDisciplina
	}: {
		/** Texto fixo do cargo (ex.: "AFFC — TI — Ciência de Dados"). */
		cargo: string;
		/** Matérias do conteúdo; `null` enquanto carregam. */
		materias: readonly Materia[] | null;
		/** Id da matéria de foco. */
		disciplina: string;
		onescolherDisciplina: (id: string) => void;
	} = $props();

	const opcoes = $derived([...(materias ?? [])].sort((a, b) => a.ordem - b.ordem));

	function aoMudarDisciplina(e: Event) {
		const valor = (e.currentTarget as HTMLSelectElement).value;
		if (opcoes.some((m) => m.id === valor)) onescolherDisciplina(valor);
	}
</script>

<section class="foco" aria-labelledby="titulo-foco">
	<h2 id="titulo-foco">Foco de Estudo</h2>

	<div class="campos">
		<div class="campo">
			<span class="rotulo">Cargo</span>
			<p class="fixo">{cargo}</p>
		</div>

		<div class="campo">
			<label for="foco-disciplina">Disciplina</label>
			<select id="foco-disciplina" value={disciplina} disabled={materias === null} onchange={aoMudarDisciplina}>
				{#if materias === null}
					<option value={disciplina}>Carregando matérias…</option>
				{/if}
				{#each opcoes as m (m.id)}
					<option value={m.id}>{m.nome}</option>
				{/each}
			</select>
		</div>
	</div>
</section>

<style>
	.foco {
		background: var(--cor-superficie);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		padding: var(--espaco);
	}

	h2 {
		margin: 0 0 12px;
		font-family: var(--fonte-titulo);
		font-size: 1.125rem;
	}

	.campos {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 12px;
	}

	@media (min-width: 720px) {
		.campos {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.campo {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	label,
	.rotulo {
		font-weight: 600;
		font-size: 0.9375rem;
	}

	.fixo {
		display: flex;
		align-items: center;
		min-height: 44px;
		margin: 0;
		padding: 8px 12px;
		border: 1px dashed var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	select {
		width: 100%;
		min-height: 44px;
		padding: 8px 12px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
	}

	select:disabled {
		color: var(--cor-texto-suave);
		cursor: not-allowed;
	}
</style>

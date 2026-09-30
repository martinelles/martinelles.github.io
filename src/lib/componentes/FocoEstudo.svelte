<script lang="ts">
	import type { Concurso } from '$lib/dados';

	let {
		concurso,
		cargoId,
		disciplina,
		onescolherCargo,
		onescolherDisciplina
	}: {
		concurso: Concurso;
		cargoId: string | null;
		disciplina: string | null;
		onescolherCargo: (id: string) => void;
		onescolherDisciplina: (nome: string) => void;
	} = $props();

	const cargoUnico = $derived(concurso.cargos.length === 1);
	const cargo = $derived(concurso.cargos.find((c) => c.id === cargoId) ?? null);

	function aoMudarCargo(e: Event) {
		const valor = (e.currentTarget as HTMLSelectElement).value;
		if (valor) onescolherCargo(valor);
	}

	function aoMudarDisciplina(e: Event) {
		const valor = (e.currentTarget as HTMLSelectElement).value;
		if (valor && cargo?.disciplinas.includes(valor)) onescolherDisciplina(valor);
	}
</script>

<section class="foco" aria-labelledby="titulo-foco">
	<h2 id="titulo-foco">Foco de Estudo</h2>

	<div class="campos">
		<div class="campo">
			<label for="foco-cargo">Cargo</label>
			<select id="foco-cargo" value={cargoId ?? ''} disabled={cargoUnico} onchange={aoMudarCargo}>
				{#if cargoId === null}
					<option value="" disabled>Selecione um cargo</option>
				{/if}
				{#each concurso.cargos as c (c.id)}
					<option value={c.id}>{c.nome}</option>
				{/each}
			</select>
		</div>

		<div class="campo">
			<label for="foco-disciplina">Disciplina</label>
			<!-- {#key}: ao trocar de cargo o select é refeito e volta ao placeholder. -->
			{#key cargo?.id}
				<select
					id="foco-disciplina"
					value={disciplina ?? ''}
					disabled={cargo === null}
					onchange={aoMudarDisciplina}
				>
					<option value="" disabled>Selecione uma disciplina</option>
					{#each cargo?.disciplinas ?? [] as d (d)}
						<option value={d}>{d}</option>
					{/each}
				</select>
			{/key}
		</div>
	</div>
</section>

<style>
	.foco {
		background: var(--cor-superficie);
		border: 1px solid var(--cor-borda);
		border-radius: var(--raio);
		padding: var(--espaco);
	}

	h2 {
		margin: 0 0 12px;
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

	label {
		font-weight: 600;
		font-size: 0.9375rem;
	}

	select {
		width: 100%;
		min-height: 44px;
		padding: 8px 12px;
		border: 1px solid var(--cor-borda);
		border-radius: 10px;
		background: var(--cor-fundo);
	}

	select:disabled {
		color: var(--cor-texto-suave);
		cursor: not-allowed;
	}
</style>

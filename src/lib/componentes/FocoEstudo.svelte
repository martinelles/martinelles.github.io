<script lang="ts">
	// Foco de estudo (FR-014): a especialidade decide o conteúdo (plano, matérias do feed, cargo
	// no cabeçalho); a disciplina de foco se escolhe entre as matérias dessa especialidade e vem
	// logo depois de "Tudo" nos stories.
	import type { Especialidade } from '$lib/feed/foco.svelte';
	import type { Materia } from '$lib/feed/tipos';

	let {
		especialidades,
		especialidade,
		materias,
		disciplina,
		onescolherEspecialidade,
		onescolherDisciplina
	}: {
		especialidades: readonly Especialidade[];
		/** Especialidade escolhida. */
		especialidade: Especialidade;
		/** Matérias do conteúdo; `null` enquanto carregam. */
		materias: readonly Materia[] | null;
		/** Id da matéria de foco. */
		disciplina: string;
		onescolherEspecialidade: (id: string) => void;
		onescolherDisciplina: (id: string) => void;
	} = $props();

	const opcoes = $derived(
		[...(materias ?? [])].filter((m) => !especialidade.fora(m.id)).sort((a, b) => a.ordem - b.ordem)
	);

	function aoMudarDisciplina(e: Event) {
		const valor = (e.currentTarget as HTMLSelectElement).value;
		if (opcoes.some((m) => m.id === valor)) onescolherDisciplina(valor);
	}
</script>

<section class="foco" aria-labelledby="titulo-foco">
	<h2 id="titulo-foco">Foco de Estudo</h2>

	<div class="campos">
		<fieldset class="campo">
			<legend class="rotulo">Especialidade</legend>
			<div class="opcoes">
				{#each especialidades as e (e.id)}
					<label class="opcao">
						<input
							type="radio"
							name="foco-especialidade"
							value={e.id}
							checked={e.id === especialidade.id}
							onchange={() => onescolherEspecialidade(e.id)}
						/>
						<span class="marca" aria-hidden="true">{e.id === especialidade.id ? '✓' : ''}</span>
						<span>{e.nome}</span>
					</label>
				{/each}
			</div>
		</fieldset>

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

	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
	}

	legend {
		padding: 0;
		margin-bottom: 4px;
	}

	.opcoes {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.opcao {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 8px 14px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
		font-weight: 600;
		cursor: pointer;
	}

	/* Como no seletor de tema: o rádio cobre a opção inteira, transparente, e o alvo de toque é
	   a opção toda (≥ 44 px, NFR-006). Selecionada: fundo e marca ✓ (forma, não só cor). */
	.opcao input {
		position: absolute;
		/* Até a borda de fora: a borda também é alvo de toque. */
		inset: calc(-1 * var(--linha-peso));
		width: calc(100% + 2 * var(--linha-peso));
		height: calc(100% + 2 * var(--linha-peso));
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	.opcao:has(input:checked) {
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
	}

	.opcao:has(input:focus-visible) {
		outline: 3px solid var(--cor-primaria);
		outline-offset: 2px;
	}

	.marca {
		display: inline-block;
		min-width: 1ch;
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

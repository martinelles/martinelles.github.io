<script lang="ts">
	// Progresso (FR-014, SC-007): tudo calculado de `estatisticas()` sobre as interações
	// registradas no aparelho; nenhum número escrito fixo (ACH-01 do protótipo).
	import type { Estatisticas } from '$lib/feed/estatisticas';
	import type { Materia } from '$lib/feed/tipos';

	let {
		estatisticas,
		materias
	}: {
		estatisticas: Estatisticas;
		/** Para o nome das matérias; `null` enquanto carregam. */
		materias: readonly Materia[] | null;
	} = $props();

	const LIMITE_MATERIAS = 5;
	const pct = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 0 });
	const num = new Intl.NumberFormat('pt-BR');

	const nomes = $derived(new Map((materias ?? []).map((m) => [m.id, m])));
	const taxa = $derived(estatisticas.taxa === null ? '—' : pct.format(estatisticas.taxa));

	/** As matérias com mais respostas; empate pela ordem das matérias. */
	const porMateria = $derived(
		Object.entries(estatisticas.porMateria)
			.map(([id, c]) => ({ id, nome: nomes.get(id)?.nome ?? id, ordem: nomes.get(id)?.ordem ?? Infinity, ...c }))
			.sort((a, b) => b.respondidas - a.respondidas || a.ordem - b.ordem)
			.slice(0, LIMITE_MATERIAS)
	);
</script>

<section class="progresso" aria-labelledby="titulo-progresso">
	<h2 id="titulo-progresso">Seu progresso</h2>

	<dl class="numeros">
		<div>
			<dt>Respondidas</dt>
			<dd>{num.format(estatisticas.respondidas)}</dd>
		</div>
		<div>
			<dt>Acertos</dt>
			<dd>{num.format(estatisticas.acertos)}</dd>
		</div>
		<div>
			<dt>Taxa de acerto</dt>
			<dd>{taxa}</dd>
		</div>
		<div>
			<dt>Salvos</dt>
			<dd>{num.format(estatisticas.salvos)}</dd>
		</div>
	</dl>

	{#if porMateria.length > 0}
		<h3>Por matéria</h3>
		<ul class="materias">
			{#each porMateria as m (m.id)}
				<li>
					<span class="nome">{m.nome}</span>
					<span class="conta">
						{m.acertos} de {m.respondidas} · {pct.format(m.acertos / m.respondidas)}
					</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="dica">Responda questões no feed para ver seu desempenho por matéria.</p>
	{/if}
</section>

<style>
	.progresso {
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

	h3 {
		margin: var(--espaco) 0 8px;
		font-family: var(--fonte-titulo);
		font-size: 1rem;
	}

	.numeros {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
		margin: 0;
	}

	@media (min-width: 720px) {
		.numeros {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	.numeros div {
		display: flex;
		flex-direction: column-reverse;
		gap: 2px;
		padding: 10px 12px;
		border: 1px solid var(--cor-divisor);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-fundo);
		min-width: 0;
	}

	dt {
		color: var(--cor-texto-suave);
		font-size: 0.875rem;
	}

	dd {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 800;
		line-height: 1.2;
		font-variant-numeric: tabular-nums;
	}

	.materias {
		display: grid;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.materias li {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0 12px;
		padding: 6px 0;
		border-bottom: 1px solid var(--cor-divisor);
	}

	.nome {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.conta {
		color: var(--cor-texto-suave);
		font-variant-numeric: tabular-nums;
	}

	.dica {
		margin: var(--espaco) 0 0;
		color: var(--cor-texto-suave);
	}
</style>

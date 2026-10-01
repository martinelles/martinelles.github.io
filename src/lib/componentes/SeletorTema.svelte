<script lang="ts">
	// Seletor de aparência (FR-001, FR-003, NFR-005): rádio nativo, uma prévia por tema.
	// Cada prévia leva data-tema e recebe os tokens daquele tema (contrato tema.md §1): nenhuma cor aqui.
	import Icone from '$lib/componentes/Icone.svelte';
	import { TEMAS, tema, type PreferenciaTema } from '$lib/tema.svelte';

	const escolher = (p: PreferenciaTema) => () => tema.escolher(p);
</script>

<fieldset class="seletor">
	<legend>Aparência</legend>

	<div class="opcoes">
		<label class="opcao">
			<input
				type="radio"
				name="tema"
				value="sistema"
				checked={tema.preferencia === 'sistema'}
				onchange={escolher('sistema')}
			/>
			<span class="previa previa-dupla" aria-hidden="true">
				<span class="metade" data-tema="aventura">
					<span class="previa-titulo">Aa</span>
					<span class="previa-linha"></span>
				</span>
				<span class="metade" data-tema="kindle-escuro">
					<span class="previa-titulo">Aa</span>
					<span class="previa-linha"></span>
				</span>
			</span>
			<span class="nome">
				Seguir o aparelho
				<span class="marca"><Icone nome="check" tamanho={18} /></span>
			</span>
			<span class="detalhe">Aventura no claro, Kindle escuro no escuro</span>
		</label>

		{#each TEMAS as t (t.id)}
			<label class="opcao">
				<input
						type="radio"
					name="tema"
					value={t.id}
					checked={tema.preferencia === t.id}
					onchange={escolher(t.id)}
				/>
				<span class="previa" data-tema={t.id} aria-hidden="true">
					<span class="previa-titulo">Aa</span>
					<span class="previa-linha"></span>
					<span class="previa-linha curta"></span>
				</span>
				<span class="nome">
					{t.nome}
					<span class="marca"><Icone nome="check" tamanho={18} /></span>
				</span>
			</label>
		{/each}
	</div>
</fieldset>

<style>
	.seletor {
		margin: 0;
		padding: var(--espaco);
		min-width: 0;
		background: var(--cor-superficie);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
	}

	legend {
		/* Legenda dentro da caixa, como o título das outras seções do painel. */
		float: left;
		width: 100%;
		margin: 0 0 12px;
		padding: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.125rem;
		font-weight: 700;
	}

	.opcoes {
		clear: both;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}

	@media (min-width: 592px) {
		.opcoes {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	.opcao {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
		min-height: 44px;
		padding: 8px;
		border: 3px solid transparent;
		border-radius: var(--raio);
		cursor: pointer;
	}

	/* O rádio cobre a opção inteira, transparente: segue focável e anunciado, e o alvo de
	   toque dele é a opção toda (≥ 44 px, NFR-006), não uma caixa de 1 px. */
	.opcao input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	/* Selecionada: contorno e ícone (forma, não só cor — FR-009). */
	.opcao:has(input:checked) {
		border-color: var(--cor-texto);
	}

	.opcao:has(input:focus-visible) {
		outline: 3px solid var(--cor-primaria);
		outline-offset: 2px;
	}

	.previa {
		display: flex;
		flex-direction: column;
		gap: 6px;
		aspect-ratio: 4 / 3;
		padding: 10px;
		overflow: hidden;
		background-color: var(--cor-fundo);
		background-image: var(--textura);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		box-shadow: var(--sombra);
	}

	.previa-dupla {
		flex-direction: row;
		gap: 0;
		padding: 0;
	}

	.metade {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
		padding: 10px;
		background-color: var(--cor-fundo);
		background-image: var(--textura);
	}

	.previa-titulo {
		font-family: var(--fonte-titulo);
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1;
		color: var(--cor-texto);
	}

	.previa-linha {
		display: block;
		height: 6px;
		border-radius: 3px;
		background: var(--cor-texto-suave);
	}

	.previa-linha.curta {
		width: 60%;
	}

	.nome {
		display: flex;
		align-items: center;
		gap: 4px;
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.marca {
		display: none;
		flex: none;
	}

	.opcao:has(input:checked) .marca {
		display: inline-flex;
	}

	.detalhe {
		font-size: 0.8125rem;
		color: var(--cor-texto-suave);
	}
</style>

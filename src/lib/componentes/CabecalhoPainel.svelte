<script lang="ts">
	// Cabeçalho do painel: o app atende só à CGU (FR-001, FR-014), então não há "trocar concurso".
	import Icone from './Icone.svelte';
	import type { Concurso } from '$lib/dados';
	import { formatarData, type Prazo } from '$lib/datas';

	let { concurso, prazo }: { concurso: Concurso; prazo: Prazo } = $props();

	const cargo = $derived(concurso.cargos[0]?.nome);
	const vagas = $derived(
		concurso.vagas === undefined
			? null
			: `${concurso.vagas.toLocaleString('pt-BR')} ${concurso.vagas === 1 ? 'vaga' : 'vagas'}`
	);
</script>

<header class="cabecalho">
	<h1>Seu Painel de Estudos</h1>

	<p class="concurso">{concurso.nome}{#if cargo}{' · '}<span class="cargo">{cargo}</span>{/if}</p>
	<p class="banca">banca {concurso.banca} · {concurso.orgao}</p>

	<ul class="indicadores">
		{#if vagas}
			<li>
				<Icone nome="pessoas" tamanho={20} />
				<span>{vagas}</span>
			</li>
		{/if}
		<li>
			<Icone nome="relogio" tamanho={20} />
			<span class="prazo">
				<span>{prazo.texto}</span>
				{#if prazo.tipo === 'dias' && concurso.dataProva}
					<small>prova em {formatarData(concurso.dataProva)}</small>
				{/if}
			</span>
		</li>
		{#if concurso.edital}
			<li>
				<a class="edital" href={concurso.edital} target="_blank" rel="noopener">
					<Icone nome="edital" tamanho={20} />
					Ver edital
				</a>
			</li>
		{/if}
	</ul>
</header>

<style>
	.cabecalho {
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
		border-radius: var(--raio);
		padding: calc(var(--espaco) * 1.25) var(--espaco);
		box-shadow: var(--sombra);
		overflow-wrap: anywhere;
	}

	h1 {
		margin: 0;
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.edital {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		padding: 6px 12px;
		border: 1px solid currentColor;
		border-radius: 999px;
		background: transparent;
		color: inherit;
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
	}

	.edital:focus-visible {
		outline-color: var(--cor-primaria-texto);
	}

	.concurso {
		margin: 12px 0 2px;
		font-size: 1.375rem;
		font-weight: 800;
		line-height: 1.25;
	}

	.cargo {
		font-weight: 600;
	}

	.banca {
		margin: 0;
	}

	.indicadores {
		list-style: none;
		margin: var(--espaco) 0 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 20px;
	}

	.indicadores li {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
	}

	.prazo {
		display: flex;
		flex-direction: column;
		line-height: 1.2;
	}

	small {
		font-size: 0.8125rem;
		font-weight: 400;
	}

	@media (max-width: 359px) {
		.indicadores {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>

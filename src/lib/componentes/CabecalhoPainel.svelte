<script lang="ts">
	// Cabeçalho do painel: o app atende só à CGU (FR-001, FR-014), então não há "trocar concurso".
	// No canto, o acesso aos Ajustes (FR-002); abaixo da banca, o foco atual em texto (FR-006).
	// O cargo é um seletor à vista (Ciência de Dados ou Auditoria): escondido nos Ajustes, ninguém
	// achava a troca.
	import Icone from './Icone.svelte';
	import { rotaDoArtefato } from '$lib/artefatos/rotas';
	import type { Concurso } from '$lib/dados';
	import { formatarData, type Prazo } from '$lib/datas';

	let {
		concurso,
		prazo,
		foco,
		especialidades = [],
		especialidade,
		onescolherEspecialidade,
		ancora
	}: {
		concurso: Concurso;
		prazo: Prazo;
		/** Nome da matéria de foco, já resolvido por quem monta o painel. */
		foco?: string;
		/** Cargos que dá para escolher; o rótulo é o cargo do edital. */
		especialidades?: readonly { id: string; cargo: string }[];
		/** Id da especialidade escolhida. */
		especialidade?: string;
		onescolherEspecialidade?: (id: string) => void;
		/** Âncora da especialidade nas Prioridades e nas Missões (`cd`, `aud`). */
		ancora?: string;
	} = $props();

	/** Com a âncora da especialidade; página do painel abre na rota do app, com a barra de abas. */
	const comAncora = (url: string) => {
		const com = ancora ? `${url.split('#')[0]}#${ancora}` : url;
		return rotaDoArtefato(com) ?? com;
	};
	/** Só o que sai do app (claude.ai) abre em aba nova. */
	const fora = (url: string) => (url.startsWith('https://') ? { target: '_blank', rel: 'noopener' } : {});
	const vagas = $derived(
		concurso.vagas === undefined
			? null
			: `${concurso.vagas.toLocaleString('pt-BR')} ${concurso.vagas === 1 ? 'vaga' : 'vagas'}`
	);
</script>

<header class="cabecalho">
	<div class="topo">
		<h1>Seu Painel de Estudos</h1>
		<a class="ajustes" href="/painel/ajustes" aria-label="Ajustes" title="Ajustes">
			<Icone nome="ajustes" tamanho={22} />
		</a>
	</div>

	<p class="concurso">{concurso.nome}</p>
	{#if especialidades.length > 1}
		<div class="cargos" role="group" aria-label="Cargo">
			{#each especialidades as e (e.id)}
				<button
					type="button"
					aria-pressed={e.id === especialidade}
					onclick={() => onescolherEspecialidade?.(e.id)}
				>
					{e.cargo}
				</button>
			{/each}
		</div>
	{/if}
	<p class="banca">banca {concurso.banca} · {concurso.orgao}</p>
	{#if foco}<p class="foco">Foco: {foco}</p>{/if}

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
		{#if concurso.prioridades}
			<li>
				<a class="edital" href={comAncora(concurso.prioridades)} {...fora(concurso.prioridades)}>
					<Icone nome="lista" tamanho={20} />
					Prioridades do edital
				</a>
			</li>
		{/if}
		{#if concurso.missoes}
			<li>
				<a class="edital" href={comAncora(concurso.missoes)} {...fora(concurso.missoes)}>
					<Icone nome="calendario" tamanho={20} />
					Missões até a prova
				</a>
			</li>
		{/if}
	</ul>
</header>

<style>
	/* Aventura: o único bloco de cor forte do painel. */
	.cabecalho {
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		padding: calc(var(--espaco) * 1.25) var(--espaco);
		box-shadow: var(--sombra);
		overflow-wrap: anywhere;
	}

	/* Kindle: o cabeçalho é página, não bloco de cor. */
	:global([data-tema^='kindle']) .cabecalho {
		background: var(--cor-superficie);
		color: var(--cor-texto);
	}

	.topo {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}

	h1 {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.75rem;
		font-weight: 700;
		line-height: 1.15;
	}

	.edital {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		padding: 6px 12px;
		border: var(--linha-peso) solid currentColor;
		border-radius: calc(var(--raio) / 2);
		background: transparent;
		color: inherit;
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
	}

	.ajustes {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 44px;
		height: 44px;
		border: var(--linha-peso) solid currentColor;
		border-radius: calc(var(--raio) / 2);
		color: inherit;
	}

	.edital:focus-visible,
	.ajustes:focus-visible {
		outline-color: var(--cor-primaria-texto);
	}

	/* Kindle: sobre a superfície, a cor do texto da primária some; o foco volta à primária. */
	:global([data-tema^='kindle']) .edital:focus-visible,
	:global([data-tema^='kindle']) .ajustes:focus-visible {
		outline-color: var(--cor-primaria);
	}

	.concurso {
		margin: 8px 0 6px;
		font-size: 1.0625rem;
		font-weight: 700;
		line-height: 1.25;
	}

	/* Três cargos não cabem numa linha em 360 px: quebram e esticam até a borda. Cada botão traça a
	   linha à direita e embaixo; a margem negativa leva as da borda para baixo do contorno do grupo. */
	.cargos {
		display: flex;
		flex-wrap: wrap;
		margin: 4px 0 8px;
		border: var(--linha-peso) solid currentColor;
		border-radius: calc(var(--raio) / 2);
		overflow: hidden;
	}

	.cargos button {
		flex: 1 1 auto;
		min-height: 44px;
		margin: 0 calc(-1 * var(--linha-peso)) calc(-1 * var(--linha-peso)) 0;
		padding: 6px 12px;
		border: 0;
		border-right: var(--linha-peso) solid currentColor;
		border-bottom: var(--linha-peso) solid currentColor;
		background: transparent;
		color: inherit;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	/* O escolhido em cor invertida; no Kindle, na primária. */
	.cargos button[aria-pressed='true'] {
		border-color: var(--cor-primaria-texto);
		background: var(--cor-primaria-texto);
		color: var(--cor-primaria);
	}

	:global([data-tema^='kindle']) .cargos button[aria-pressed='true'] {
		border-color: var(--cor-primaria);
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
	}

	.cargos button:focus-visible {
		outline-color: var(--cor-primaria-texto);
		outline-offset: -4px;
	}

	:global([data-tema^='kindle']) .cargos button:focus-visible {
		outline-color: var(--cor-primaria);
	}

	.banca,
	.foco {
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

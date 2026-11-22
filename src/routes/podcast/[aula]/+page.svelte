<script lang="ts">
	// Podcasts da aula (vault → /conteudo/audios, pelo importador): um player por capítulo, com a
	// marcação de ouvido na conta (a mesma chave sobe para os outros aparelhos). O fim da
	// reprodução marca sozinho; a caixa também desmarca.
	import Icone from '$lib/componentes/Icone.svelte';
	import { armazenamentoAtual } from '$lib/conta/sessao.svelte';
	import { audiosMissoes, carregarOuvidos, carregarAudios } from '$lib/missoes/audios.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	carregarOuvidos(armazenamentoAtual());
	// svelte-ignore state_referenced_locally
	if (!audiosMissoes.daAula(data.id)) void carregarAudios();

	const daAula = $derived(audiosMissoes.daAula(data.id));
	const audios = $derived(daAula?.audios ?? []);
	const ouvidos = $derived(audios.filter((a) => audiosMissoes.ouvido(a.arquivo)).length);
</script>

<svelte:head>
	<title>Podcasts · {data.titulo} · Painel de Concurso</title>
</svelte:head>

<article class="pagina-podcast">
	<header>
		<h1>Podcasts · {data.titulo}</h1>
		<a class="voltar" href="/painel">
			<Icone nome="voltar" tamanho={20} />
			Voltar ao painel
		</a>
	</header>
	{#if audios.length === 0}
		<p class="nota">Esta aula ainda não tem podcasts no painel.</p>
	{:else}
		<p class="sumario">{ouvidos} de {audios.length} ouvidos</p>
		{#if daAula?.capa}
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
			<figure class="capa">
				<a href={daAula.capa} target="_blank" rel="noopener" title="Abrir o infográfico da aula em tamanho cheio">
					<img src={daAula.capa} alt="Infográfico da aula {data.titulo}" loading="lazy" />
				</a>
				<figcaption>Infográfico da aula — toque para abrir em tamanho cheio</figcaption>
			</figure>
		{/if}
		<ol>
			{#each audios as a (a.arquivo)}
				{@const ouvido = audiosMissoes.ouvido(a.arquivo)}
				<li class:ouvido>
					<div class="linha">
						<span class="titulo">{a.titulo}</span>
						<label class="caixa">
							<input
								type="checkbox"
								checked={ouvido}
								onchange={(e) => {
									const alvo = e.currentTarget;
									alvo.checked = ouvido; // quem decide é a marcação (sobe para a conta)
									audiosMissoes.marcar(a.arquivo, !ouvido);
								}}
								aria-label="Marcar {a.titulo} como ouvido"
							/>
							<span class="quadrado" aria-hidden="true"><Icone nome="check" tamanho={14} /></span>
							Ouvi
						</label>
					</div>
					<!-- svelte-ignore a11y_media_has_caption -->
					<audio controls preload="none" src={a.arquivo} onended={() => audiosMissoes.marcar(a.arquivo, true)}></audio>
					{#if a.infografico}
						<a class="infografico" href={a.infografico} target="_blank" rel="noopener" title="Abrir o infográfico de {a.titulo} em tamanho cheio">
							<img src={a.infografico} alt="Infográfico de {a.titulo}" loading="lazy" />
						</a>
					{/if}
				</li>
			{/each}
		</ol>
	{/if}
</article>

<style>
	.pagina-podcast {
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-height: 100dvh;
		padding: var(--espaco);
	}

	header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
	}

	h1 {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.375rem;
		line-height: 1.2;
	}

	.voltar {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		color: var(--cor-texto);
		font-weight: 700;
		text-decoration: none;
	}

	.nota,
	.sumario {
		margin: 0;
		color: var(--cor-texto-suave);
	}

	ol {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 12px;
	}

	li {
		display: grid;
		gap: 8px;
		padding: 12px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-superficie);
	}

	li.ouvido .titulo {
		color: var(--cor-texto-suave);
		text-decoration: line-through;
		text-decoration-thickness: 1px;
	}

	.linha {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.titulo {
		font-weight: 700;
	}

	.caixa {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		font-weight: 700;
		cursor: pointer;
	}

	/* O checkbox cobre o rótulo inteiro, transparente: alvo de toque de 44 px, como na missão. */
	.caixa input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	.quadrado {
		display: grid;
		place-items: center;
		width: 22px;
		height: 22px;
		border: 2px solid var(--cor-primaria);
		border-radius: 4px;
		color: transparent;
	}

	.caixa input:checked + .quadrado {
		background: var(--cor-primaria);
		color: var(--cor-superficie);
	}

	.caixa:has(input:focus-visible) .quadrado {
		outline: 3px solid var(--cor-primaria);
		outline-offset: 2px;
	}

	audio {
		width: 100%;
	}

	.capa {
		margin: 0;
	}

	.capa figcaption,
	.infografico::after {
		display: block;
		margin-top: 4px;
		color: var(--cor-texto-suave);
		font-size: 0.8125rem;
	}

	.capa img,
	.infografico img {
		display: block;
		width: 100%;
		height: auto;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
	}

	.capa a,
	.infografico {
		display: block;
	}

	.infografico::after {
		content: 'Toque para abrir em tamanho cheio';
	}

	.infografico {
		margin-top: 4px;
	}
</style>

<script lang="ts">
	// Missão do dia (FR-005, FR-006, FR-007, FR-014; Cenário 2): as tarefas de hoje com disciplina,
	// bloco, tópico, modo (Leitura/Questões), tempo e o que fazer; quantas são, o tempo total e
	// quanto já foi feito; "Iniciar estudos". Emenda D5 (FR-016): cumprida a missão, "Continuar
	// estudando" abre a próxima da fila, e as extras de hoje aparecem embaixo.
	import Icone from '$lib/componentes/Icone.svelte';
	import { formatarData } from '$lib/datas';
	import type { Plano, Tarefa } from '$lib/plano/tipos';
	import type { VisaoMissao } from './estado.svelte';
	import { duracao, FAZER_CURTO, partesTopico, porcentoInteiro, ROTULO_BLOCO, ROTULO_MODO, tarefas as nTarefas } from './formato';

	let {
		plano,
		missao,
		oniniciar
	}: {
		/** `null` enquanto carrega. */
		plano: Plano | null;
		missao: VisaoMissao;
		oniniciar: (t: Tarefa) => void;
	} = $props();

	function estado(t: Tarefa): 'feita' | 'andamento' | 'pendente' {
		const r = missao.dados.registros[t.id];
		if (r?.concluidaEm) return 'feita';
		return r ? 'andamento' : 'pendente';
	}

	const ROTULO_ESTADO = { feita: 'concluída', andamento: 'em andamento', pendente: 'pendente' } as const;

	const comecou = $derived(missao.primeira ? !!missao.dados.registros[missao.primeira.id] : false);
</script>

<section class="missao" aria-labelledby="titulo-missao">
	<h2 id="titulo-missao">Missão de hoje</h2>

	{#if !plano || missao.fase === null}
		<p class="nota" role="status">Carregando a missão…</p>
	{:else if missao.fase === 'antes'}
		<p class="nota">A primeira missão sai em {formatarData(plano.inicio)}, quando o plano começa.</p>
	{:else if missao.fase === 'depois'}
		<p class="nota">O plano terminou em {formatarData(plano.fim)}. Exporte o progresso e lance no ESTUDO.csv.</p>
	{:else if missao.esgotada}
		<div class="cumprida">
			<span class="marca" aria-hidden="true"><Icone nome="check" tamanho={22} /></span>
			<div>
				<p class="titulo-estado">Plano cumprido — revise</p>
				<p>Todos os tópicos da fila foram estudados. As revisões seguem no REVISOES.md; para praticar, use o feed.</p>
				<a class="secundario" href="/">Abrir o feed</a>
			</div>
		</div>
	{:else}
		<p class="sumario">
			{nTarefas(missao.tarefas.length)}, {duracao(missao.minutos)} estimadas.
			<span class="feito">{missao.concluidas} de {missao.tarefas.length} feitas ({porcentoInteiro(missao.percentual)}).</span>
		</p>

		<ul class="lista">
			{#each missao.tarefas as t (t.id)}
				{@const e = estado(t)}
				{@const topico = partesTopico(t.topico)}
				<li class={e}>
					<a href="/tarefa/{encodeURIComponent(t.id)}">
						<span class="marcador" aria-hidden="true">
							{#if e === 'feita'}<Icone nome="check" tamanho={16} />{/if}
						</span>
						<span class="texto">
							<span class="disciplina">{t.disciplina} · {ROTULO_BLOCO[t.bloco]}</span>
							<span class="topico">{topico.folha}</span>
							<span class="fazer"><strong class="modo">{ROTULO_MODO[t.modo]}</strong>, {duracao(t.minutos)}: {FAZER_CURTO[t.modo]}</span>
						</span>
						<span class="so-leitor">, {ROTULO_ESTADO[e]}</span>
					</a>
				</li>
			{/each}
		</ul>

		{#if missao.cumprida}
			<p class="cumprida curta" role="status">
				<span class="marca" aria-hidden="true"><Icone nome="check" tamanho={20} /></span>
				<span class="titulo-estado">Missão cumprida</span>
			</p>
			{#if missao.proxima}
				<!-- Emenda D5: a próxima da fila (ou a extra pausada), com o cronômetro; a foto de hoje não muda. -->
				{@const alvo = missao.proxima}
				<button type="button" class="primario" onclick={() => oniniciar(alvo)}>
					<Icone nome="cronometro" tamanho={22} />
					Continuar estudando
				</button>
			{:else}
				<p class="nota fim-fila">Plano cumprido — revise. Não há mais tarefas na fila; as revisões seguem no REVISOES.md.</p>
			{/if}
		{:else if missao.primeira}
			{@const alvo = missao.primeira}
			<button type="button" class="primario" onclick={() => oniniciar(alvo)}>
				<Icone nome="cronometro" tamanho={22} />
				{comecou ? 'Continuar estudos' : 'Iniciar estudos'}
			</button>
		{/if}
		{#if missao.extras.tarefas > 0}
			<p class="extras">Extras de hoje: {nTarefas(missao.extras.tarefas)} · {duracao(missao.extras.minutos)}</p>
		{/if}
	{/if}
</section>

<style>
	.missao {
		background: var(--cor-superficie);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		padding: var(--espaco);
		box-shadow: var(--sombra);
		overflow-wrap: anywhere;
	}

	h2 {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.375rem;
		line-height: 1.2;
	}

	.nota,
	.sumario {
		margin: 4px 0 0;
		color: var(--cor-texto-suave);
	}

	.sumario {
		font-variant-numeric: tabular-nums;
	}

	.feito {
		color: var(--cor-texto);
		font-weight: 700;
	}

	.lista {
		margin: 12px 0 0;
		padding: 0;
		list-style: none;
	}

	.lista li + li {
		border-top: 1px solid var(--cor-divisor);
	}

	.lista a {
		display: grid;
		grid-template-columns: 24px minmax(0, 1fr);
		gap: 12px;
		align-items: start;
		min-height: 44px;
		padding: 10px 0;
		color: inherit;
		text-decoration: none;
	}

	.lista a:hover .topico {
		text-decoration: underline;
	}

	/* Círculo vazio = pendente; meio cheio = em andamento; cheio com check = feita. Não só cor. */
	.marcador {
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		margin-top: 2px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: 50%;
		background: var(--cor-superficie);
	}

	.andamento .marcador {
		background: linear-gradient(90deg, var(--cor-texto) 50%, var(--cor-superficie) 50%);
	}

	.feita .marcador {
		background: var(--cor-texto);
		color: var(--cor-superficie);
	}

	.texto {
		display: grid;
		gap: 1px;
		min-width: 0;
	}

	.disciplina,
	.fazer {
		color: var(--cor-texto-suave);
		font-size: 0.8125rem;
	}

	/* O modo é texto em negrito, não só cor (FR-014). */
	.modo {
		color: var(--cor-texto);
		font-weight: 700;
	}

	.topico {
		font-family: var(--fonte-texto);
		font-size: 1rem;
		line-height: 1.35;
	}

	.feita .topico {
		text-decoration: line-through;
		text-decoration-thickness: 1px;
		color: var(--cor-texto-suave);
	}

	/* Botão primário do sistema (igual em todo o app). */
	.primario {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		width: 100%;
		min-height: 52px;
		margin-top: 12px;
		padding: 0 20px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
		box-shadow: var(--sombra);
		font-size: 1.0625rem;
		font-weight: 800;
		cursor: pointer;
	}

	@media (min-width: 720px) {
		.primario {
			width: auto;
		}
	}

	.cumprida {
		display: flex;
		gap: 12px;
		align-items: flex-start;
		margin: 12px 0 0;
		padding: 12px;
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-acerto-fundo);
		color: var(--cor-acerto);
	}

	.cumprida.curta {
		align-items: center;
	}

	.cumprida p {
		margin: 0 0 4px;
	}

	.marca {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		border: var(--linha-peso) solid currentColor;
		border-radius: 50%;
	}

	.titulo-estado {
		font-family: var(--fonte-titulo);
		font-size: 1.125rem;
		font-weight: 700;
	}

	.fim-fila {
		margin-top: 8px;
	}

	.extras {
		margin: 10px 0 0;
		color: var(--cor-texto-suave);
		font-size: 0.9375rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.secundario {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: inherit;
		font-weight: 700;
	}
</style>

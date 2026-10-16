<script lang="ts">
	// Missão de hoje no painel (planos/2026-10-14-missao-unica.md): o dia do plano de 61 dias das
	// Missões, com as mesmas bolhas da página (mesma chave e mesma conta). Cada subitem leva às
	// questões do tópico no feed, quando há, e às do Qconcursos (o mesmo link da página das
	// Missões); nas revisões, também às que ela errou lá. Bloco com mais de um subitem tem uma caixa
	// por subitem: com todas marcadas, o bloco se marca (planos/2026-10-15-topico-da-missao.md).
	import Icone from '$lib/componentes/Icone.svelte';
	import { formatarData } from '$lib/datas';
	import {
		blocoFeito,
		diaDeHoje,
		itemFeito,
		mudancasDoBloco,
		mudancasDoItem,
		progressoDoDia,
		type Mudancas
	} from '$lib/missoes/calculos';
	import type { Cargo, Marcas, PlanoMissoes, TipoBloco } from '$lib/missoes/tipos';

	let {
		plano,
		cargo,
		hoje,
		marcas,
		questoesPorTopico,
		onmarcar
	}: {
		/** `null` enquanto carrega. */
		plano: PlanoMissoes | null;
		cargo: Cargo;
		hoje: string;
		marcas: Marcas;
		/** Questões do feed por tópico (`tp`); `null` enquanto o índice carrega. */
		questoesPorTopico: Map<string, number> | null;
		onmarcar: (mudancas: Mudancas) => void;
	} = $props();

	const LETRA: Record<TipoBloco, string> = { rev: 'R', novo: 'N', disc: 'D', sim: 'S', q: 'Q' };
	const TIPO: Record<TipoBloco, string> = {
		rev: 'Revisão',
		novo: 'Estudo novo',
		disc: 'Discursiva',
		sim: 'Simulado',
		q: 'Questões'
	};

	const hojeNoPlano = $derived(plano ? diaDeHoje(plano, hoje) : null);
	const dia = $derived(hojeNoPlano?.dia ?? null);
	const progresso = $derived(dia ? progressoDoDia(marcas, cargo, dia) : null);
	const minutosDoDia = $derived(dia ? dia.blocos.reduce((s, b) => s + b.min, 0) : 0);
	const horas = (min: number) => (min % 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min / 60} h`);
	const linkMissoes = $derived(`/artefato/missoes#${cargo}`);
</script>

<section class="missao" aria-labelledby="titulo-missao">
	<h2 id="titulo-missao">Missão de hoje</h2>
	{#if !plano || !hojeNoPlano}
		<p class="nota" role="status">Carregando a missão…</p>
	{:else if hojeNoPlano.fase === 'antes'}
		<p class="nota">As missões começam em {formatarData(plano.plan[0].data)}.</p>
	{:else if hojeNoPlano.fase === 'depois'}
		<p class="nota">O plano terminou em {formatarData(plano.plan[plano.plan.length - 1].data)}.</p>
	{:else if !dia}
		<p class="nota">Hoje não tem missão no plano.</p>
	{:else if progresso}
		<p class="sumario">
			{dia.dow} {formatarData(dia.data)} · {dia.fase} · {horas(minutosDoDia)}.
			<span class="contagem">{progresso.feitos} de {progresso.total} blocos feitos.</span>
		</p>
		<ol class="blocos">
			{#each dia.blocos as b, i (i)}
				{@const feito = blocoFeito(marcas, cargo, dia, i)}
				<li class="bloco t-{b.tipo}" class:feito>
					<label class="bolha">
						<input
							type="checkbox"
							checked={feito}
							onchange={(e) => {
								const alvo = e.currentTarget;
								const marcar = alvo.checked;
								alvo.checked = feito; // quem decide é o onmarcar (pode pedir login antes)
								onmarcar(mudancasDoBloco(marcas, cargo, dia, i, marcar));
							}}
							aria-label="Marcar {b.titulo} como cumprido"
						/>
						<span class="circulo" aria-hidden="true">{LETRA[b.tipo]}</span>
					</label>
					<div class="corpo">
						<span class="tipo">{TIPO[b.tipo]}</span>
						<p class="titulo">
							<span>{b.titulo}</span>
							{#if b.min}<span class="min">{b.min} min</span>{/if}
						</p>
						{#if b.itens?.length}
							{@const porItem = b.itens.length > 1}
							<ul class="itens" class:por-item={porItem}>
								{#each b.itens as it (it.cid)}
									{@const n = questoesPorTopico?.get(it.cid) ?? 0}
									{@const erros = b.tipo === 'rev' ? plano.qcErros[it.cid] : undefined}
									{@const itemOk = porItem && itemFeito(marcas, cargo, dia, i, it.cid)}
									<li class:feito={itemOk}>
										{#if porItem}
											<label class="caixa">
												<input
													type="checkbox"
													checked={itemOk}
													onchange={(e) => {
														const alvo = e.currentTarget;
														const marcar = alvo.checked;
														alvo.checked = itemOk; // quem decide é o onmarcar (pode pedir login antes)
														onmarcar(mudancasDoItem(marcas, cargo, dia, i, it.cid, marcar));
													}}
													aria-label="Marcar {it.cod} como estudado"
												/>
												<span class="quadrado" aria-hidden="true"><Icone nome="check" tamanho={14} /></span>
											</label>
										{/if}
										<span class="cod">{it.cod}</span>
										<span class="texto">
											{it.texto}
											{#if it.lab || it.min}<em> · {it.lab ?? `${it.min} min`}{it.fim === false ? ', continua' : ''}</em>{/if}
											{#if n > 0 || plano.qc[it.cid] || erros}
												<span class="atalhos">
													{#if n > 0}
														<a class="topico" href="/?topico={encodeURIComponent(it.cid)}&tipo=questao">
															{n} {n === 1 ? 'questão' : 'questões'} deste tópico
														</a>
													{/if}
													{#if plano.qc[it.cid]}
														<a class="topico" href={plano.qc[it.cid]} target="_blank" rel="noopener">
															Questões no Qconcursos ↗
														</a>
													{/if}
													{#if erros}
														<a class="topico" href={erros} target="_blank" rel="noopener">
															Questões que errei ↗
														</a>
													{/if}
												</span>
											{/if}
										</span>
									</li>
								{/each}
							</ul>
						{/if}
						{#if b.det}<p class="det">{b.det}</p>{/if}
					</div>
				</li>
			{/each}
		</ol>
		{#if progresso.feitos === progresso.total}
			<p class="cumprida" role="status">
				<span class="marca" aria-hidden="true"><Icone nome="check" tamanho={20} /></span>
				Missão cumprida
			</p>
		{/if}
		<a class="secundario" href={linkMissoes}>Abrir nas Missões, com os links de questões</a>
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

	.contagem {
		color: var(--cor-texto);
		font-weight: 700;
	}

	.blocos {
		margin: 12px 0 0;
		padding: 0;
		list-style: none;
	}

	.bloco {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr);
		gap: 10px;
		padding: 12px 0;
	}

	.bloco + .bloco {
		border-top: 1px dashed var(--cor-divisor);
	}

	/* Cor por tipo, como na página das Missões; no Kindle, tudo tinta (forma e letra dizem o tipo). */
	.t-novo {
		--c: var(--cor-acerto);
	}
	.t-rev {
		--c: var(--cor-primaria);
	}
	.t-disc {
		--c: var(--cor-erro);
	}
	.t-sim {
		--c: var(--cor-curtida);
	}
	.t-q {
		--c: var(--cor-lei);
	}
	:global([data-tema^='kindle']) .bloco {
		--c: var(--cor-texto);
	}

	/* O checkbox cobre a bolha inteira, transparente: segue focável e anunciado, e o alvo de toque
	   é de 44 px (como o seletor de tema). */
	.bolha {
		position: relative;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		cursor: pointer;
	}

	.bolha input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	.circulo {
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border: 2px solid var(--c);
		border-radius: 50%;
		color: var(--c);
		font-weight: 700;
		font-size: 0.8125rem;
	}

	.bolha input:checked + .circulo {
		background: var(--c);
		color: var(--cor-superficie);
	}

	.bolha:has(input:focus-visible) .circulo {
		outline: 3px solid var(--cor-primaria);
		outline-offset: 2px;
	}

	.corpo {
		min-width: 0;
	}

	.tipo {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--c);
	}

	.titulo {
		margin: 2px 0 0;
		display: flex;
		flex-wrap: wrap;
		gap: 2px 10px;
		align-items: baseline;
		font-weight: 700;
	}

	.min {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--c);
		font-variant-numeric: tabular-nums;
	}

	.bloco.feito .titulo,
	.bloco.feito .itens {
		color: var(--cor-texto-suave);
		text-decoration: line-through;
		text-decoration-thickness: 1px;
	}

	.itens {
		margin: 6px 0 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 6px;
		font-size: 0.9375rem;
	}

	.itens li {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 8px;
	}

	/* Bloco com vários subitens: uma caixa por subitem, com alvo de 44 px como as bolhas. */
	.itens.por-item li {
		grid-template-columns: 44px auto minmax(0, 1fr);
		gap: 0 8px;
		/* A caixa fica embaixo da bolha do bloco, para sobrar largura ao texto em 360 px. */
		margin-left: -54px;
	}

	.caixa {
		position: relative;
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		cursor: pointer;
	}

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
		border: 2px solid var(--c);
		border-radius: 4px;
		color: transparent;
	}

	.caixa input:checked + .quadrado {
		background: var(--c);
		color: var(--cor-superficie);
	}

	.caixa:has(input:focus-visible) .quadrado {
		outline: 3px solid var(--cor-primaria);
		outline-offset: 2px;
	}

	.itens.por-item .cod,
	.itens.por-item .texto {
		padding-top: 11px;
	}

	.itens li.feito .cod,
	.itens li.feito .texto {
		color: var(--cor-texto-suave);
		text-decoration: line-through;
		text-decoration-thickness: 1px;
	}

	.cod {
		font-variant-numeric: tabular-nums;
		font-weight: 700;
		white-space: nowrap;
	}

	.texto em {
		font-style: normal;
		color: var(--cor-texto-suave);
		font-size: 0.875rem;
	}

	.atalhos {
		display: flex;
		flex-wrap: wrap;
		column-gap: 16px;
	}

	.topico {
		display: flex;
		align-items: center;
		min-height: 44px;
		width: fit-content;
		color: var(--cor-primaria);
		font-weight: 700;
	}

	.det {
		margin: 6px 0 0;
		color: var(--cor-texto-suave);
		font-size: 0.875rem;
	}

	.cumprida {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 8px 0 0;
		font-weight: 700;
	}

	.marca {
		color: var(--cor-acerto);
	}

	.secundario {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		margin-top: 8px;
		padding: 8px 16px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		color: var(--cor-texto);
		font-weight: 700;
		text-decoration: none;
	}
</style>

<script lang="ts">
	// Missão de hoje no painel (planos/2026-10-14-missao-unica.md): o dia do plano de 61 dias das
	// Missões, com as mesmas bolhas da página (mesma chave e mesma conta). Cada subitem leva às
	// questões do tópico no feed, quando há, e à aula da mentoria que o cobre (o mesmo link da
	// disciplina na página das Missões). Bloco com mais de um subitem tem uma caixa
	// por subitem: com todas marcadas, o bloco se marca (planos/2026-10-15-topico-da-missao.md).
	// O subitem aberto na aula da mentoria fica destacado na volta, até ela marcar ou dispensar
	// (emAndamento; antes o gatilho era o link do Qconcursos, que saiu em 2026-11-08).
	// Aula feita fora da missão do dia também entra aqui: aula nova ou revisão, do catálogo da
	// mentoria; aula nova conclui o dia do plano em que ela estava (chave `missoes-extras-cgu-2026`)
	// e as revisões dela contam da data real (D+1, D+7, D+30), como a repetição espaçada pede.
	// Aula nova de dia que passou sem ser feita desliza para o dia seguinte, no bloco "Aula
	// adiada", até ser marcada (a bolha dele marca cada aula na chave do dia em que chegou).
	import { tick } from 'svelte';
	import Icone from '$lib/componentes/Icone.svelte';
	import { aulaDaMentoria, aulaPorId, dados } from '$lib/dados';
	import { formatarData } from '$lib/datas';
	import type { ExtraDaMissao } from '$lib/feed/pedidoLogin.svelte';
	import {
		blocoCumprido,
		diaDeHoje,
		itemCumprido,
		itemFeito,
		mudancasDaAulaNova,
		mudancasDoBloco,
		mudancasDoBlocoAtrasado,
		mudancasDoItem,
		ocorrenciasDaAula,
		progressoDoDia,
		soPonteiros,
		type Mudancas,
		type OcorrenciaDaAula
	} from '$lib/missoes/calculos';
	import { carregarEmAndamento, emAndamento } from '$lib/missoes/emAndamento.svelte';
	import { audiosMissoes, carregarAudios } from '$lib/missoes/audios.svelte';
	import { carregarIndiceQuestoes, questoesDaAula } from '$lib/missoes/questoes-aula.svelte';
	import { extrasMissoes } from '$lib/missoes/extras.svelte';
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
		onmarcar: (mudancas: Mudancas, extra?: ExtraDaMissao) => void;
	} = $props();

	const LETRA: Record<TipoBloco, string> = { rev: 'R', novo: 'N', disc: 'D', sim: 'S', q: 'Q' };
	const TIPO: Record<TipoBloco, string> = {
		rev: 'Revisão',
		novo: 'Estudo novo',
		disc: 'Discursiva',
		sim: 'Simulado',
		q: 'Questões'
	};

	/** Dia em vista: começa em `hoje`; o seletor da seção troca para qualquer dia do plano. */
	// svelte-ignore state_referenced_locally
	let escolhida = $state(hoje);

	const hojeNoPlano = $derived(plano ? diaDeHoje(plano, escolhida) : null);
	const dia = $derived(hojeNoPlano?.dia ?? null);
	const progresso = $derived(dia ? progressoDoDia(marcas, cargo, dia) : null);
	const minutosDoDia = $derived(dia ? dia.blocos.reduce((s, b) => s + (soPonteiros(b) ? 0 : b.min), 0) : 0);
	const horas = (min: number) => (min % 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min / 60} h`);

	/** `/podcast/e1-2`: o código da aula (`E1·2`) em slug, o mesmo que o importador nomeia. */
	function slugDaAula(disciplina: string, titulo: string): string {
		const disc = disciplina.split(':')[1] ?? disciplina;
		const n = titulo.match(/^\d+/)?.[0] ?? '';
		return `${disc}·${n}`
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}
	const linkMissoes = $derived(`/artefato/missoes#${cargo}`);

	/** As próximas aulas que vêm depois do dia em vista (item-aula), para a linha "A seguir". */
	const aSeguir = $derived.by(() => {
		if (!plano) return [];
		const fora: { data: string; dow: string; cod: string; titulo: string }[] = [];
		const vistos = new Set<string>();
		for (const d of plano.plan) {
			if (d.data <= escolhida) continue;
			for (const b of d.blocos) {
				if (b.tipo !== 'novo') continue;
				for (const it of b.itens ?? []) {
					if (!it.subitens || vistos.has(it.cid)) continue;
					vistos.add(it.cid);
					fora.push({ data: d.data, dow: d.dow, cod: it.cod, titulo: it.texto });
				}
			}
			if (fora.length >= 4) break;
		}
		return fora.slice(0, 4);
	});

	// Relê a cada montagem: a página das Missões (no iframe de /artefato/missoes) grava na mesma chave.
	carregarEmAndamento();
	// Catálogo de podcasts das aulas (aparece o atalho nas aulas que têm).
	void carregarAudios();
	// Questões C/E do material da aula, no mesmo esquema.
	void carregarIndiceQuestoes();
	const lembrete = $derived(dia ? emAndamento.de(cargo, dia.data) : null);
	const lembreteFeito = $derived(
		!!(dia && lembrete && dia.blocos[lembrete.bloco]?.itens?.some((it) => it.cid === lembrete.cid)) &&
			itemFeito(marcas, cargo, dia!, lembrete!.bloco, lembrete!.cid)
	);
	// Marcado (aqui, nas Missões ou noutro aparelho): o lembrete cumpriu o papel.
	$effect(() => {
		if (lembreteFeito) emAndamento.limpar();
	});

	let secao = $state<HTMLElement>();
	/** Leva o subitem destacado à vista: ao abrir o painel e ao voltar da aula da mentoria para esta aba. */
	async function mostrarLembrete() {
		await tick();
		secao?.querySelector('.em-andamento')?.scrollIntoView({ block: 'center' });
	}
	// Uma vez por carga, quando o plano chega com o lembrete; o clique no link já conta (não rola na saída).
	let mostrado = false;
	$effect(() => {
		if (lembrete && !lembreteFeito && !mostrado) {
			mostrado = true;
			mostrarLembrete();
		}
	});

	function abrirAula(i: number, cid: string) {
		if (!dia) return;
		mostrado = true;
		emAndamento.abrir({ cargo, data: dia.data, bloco: i, cid });
	}

	function marcarLembrete(i: number, cid: string, porItem: boolean) {
		if (!dia) return;
		onmarcar(porItem ? mudancasDoItem(marcas, cargo, dia, i, cid, true) : mudancasDoBloco(marcas, cargo, dia, i, true));
	}

	/** Aula feita fora da missão do dia: escolha em três passos (tipo, disciplina, aula). */
	const AULAS = dados.mentoria?.aulas ?? [];

	/** Disciplinas das aulas que o plano traz (o catálogo pode ter mais), na ordem do catálogo. */
	const disciplinas = $derived.by(() => {
		if (!plano) return [] as { chave: string; rotulo: string }[];
		const noPlano = new Set<string>();
		for (const d of plano.plan)
			for (const b of d.blocos) for (const it of b.itens ?? []) if (aulaPorId(it.cid)) noPlano.add(it.cid);
		const chaves: string[] = [];
		for (const a of AULAS) if (noPlano.has(a.id) && !chaves.includes(a.disciplina)) chaves.push(a.disciplina);
		const pref = `${cargo.toUpperCase()}:`;
		return chaves.map((chave) => ({ chave, rotulo: chave === pref ? chave : chave.replace(pref, '') }));
	});

	let extraAberta = $state(false);
	let tipoExtra = $state<'novo' | 'rev' | ''>('');
	let discExtra = $state('');
	let aulaExtra = $state('');

	function fecharExtra() {
		extraAberta = false;
		tipoExtra = '';
		discExtra = '';
		aulaExtra = '';
	}

	const aulasDaDisc = $derived(discExtra ? AULAS.filter((a) => a.disciplina === discExtra) : []);
	const aulaEscolhida = $derived(aulaExtra ? aulaPorId(aulaExtra) : null);

	/** Onde o plano traz a aula escolhida como estudo novo, para o aviso antes de registrar. */
	const novasDaAula = $derived.by(() => {
		if (!plano || !aulaEscolhida) return [] as OcorrenciaDaAula[];
		return ocorrenciasDaAula(plano, aulaEscolhida.id).filter((o) => o.tipo === 'novo');
	});
	const datasNovas = $derived([...new Set(novasDaAula.map((o) => o.dia.data))].map(formatarData).join(' e '));

	/** Código da aula: o do item no plano (`B1·1`); fora dele, o número do título com a disciplina. */
	const codDaAula = $derived.by(() => {
		if (!aulaEscolhida) return '';
		if (novasDaAula.length) return novasDaAula[0].item.cod;
		const rotulo = discExtra.replace(`${cargo.toUpperCase()}:`, '');
		return `${rotulo}·${aulaEscolhida.titulo.match(/^\d+/)?.[0] ?? aulaEscolhida.titulo}`;
	});

	const extrasDoDia = $derived(extrasMissoes.doDia(cargo, escolhida));

	function adicionarExtra() {
		if (!dia || !tipoExtra || !aulaEscolhida) return;
		onmarcar(
			tipoExtra === 'novo' && plano ? mudancasDaAulaNova(marcas, cargo, plano, aulaEscolhida.id) : {},
			{ cargo, data: dia.data, tarefa: { tipo: tipoExtra, cid: aulaEscolhida.id, cod: codDaAula, texto: aulaEscolhida.titulo } }
		);
		fecharExtra();
	}
</script>

<svelte:document
	onvisibilitychange={() => {
		if (document.visibilityState !== 'visible') return;
		carregarEmAndamento();
		if (lembrete && !lembreteFeito) mostrarLembrete();
	}}
/>

<section class="missao" aria-labelledby="titulo-missao" bind:this={secao}>
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
		<div class="quando">
			<input
				class="dia"
				type="date"
				bind:value={escolhida}
				min={plano.plan[0].data}
				max={plano.plan.at(-1)?.data}
				aria-label="Ver a missão de outro dia"
			/>
			{#if escolhida !== hoje}
				<button type="button" class="voltar-hoje" onclick={() => (escolhida = hoje)}>Hoje</button>
			{/if}
		</div>
		<ol class="blocos">
								{#each dia.blocos as b, i (i)}
									{@const feito = blocoCumprido(marcas, cargo, dia, i, b)}
									{@const ponteiros = soPonteiros(b)}
									{@const oculto = !!b.itens?.length && b.itens.every((it) => it.suspensa === true)}
									{#if !oculto}
									<li class="bloco t-{b.tipo}" class:feito>
									{#if ponteiros}
										<span class="bolha"><span class="circulo" aria-hidden="true">{LETRA[b.tipo]}</span></span>
									{:else}
										<label class="bolha">
										<input
											type="checkbox"
											checked={feito}
											onchange={(e) => {
												const alvo = e.currentTarget;
												const marcar = alvo.checked;
												alvo.checked = feito; // quem decide é o onmarcar (pode pedir login antes)
												onmarcar(
													b.atrasado
														? mudancasDoBlocoAtrasado(marcas, cargo, dia, i, marcar)
														: mudancasDoBloco(marcas, cargo, dia, i, marcar)
												);
											}}
											aria-label="Marcar {b.titulo} como cumprido"
										/>
											<span class="circulo" aria-hidden="true">{LETRA[b.tipo]}</span>
										</label>
									{/if}
					<div class="corpo">
						<span class="tipo">{TIPO[b.tipo]}</span>
						<p class="titulo">
							<span>{b.titulo}</span>
							{#if b.min}<span class="min">{b.min} min</span>{/if}
						</p>
						{#if b.itens?.length}
							{@const visiveis = b.itens.filter((it) => it.suspensa !== true)}
							{@const porItem = visiveis.length > 1}
							<ul class="itens" class:por-item={porItem}>
									{#each visiveis as it (it.cid)}
										{@const aulaInfo = aulaPorId(it.cid)}
										{@const aula = aulaInfo?.url ?? aulaDaMentoria(cargo, it.cod)}
									{@const tec = aulaInfo?.tec}
									{@const extras = aulaInfo?.tecExtras ?? []}
									{@const subs = it.subitens ?? []}
									{@const nSub = (s: { cid: string }) => questoesPorTopico?.get(s.cid) ?? 0}
									{@const temAtalhoSub = subs.some((s) => nSub(s) > 0 || plano.mapas?.[s.cid])}
									{@const podcasts = aulaInfo ? audiosMissoes.daAula(aulaInfo.id) : null}
									{@const questoes = questoesDaAula.slug(it.cod)}
									{@const itemOk = porItem && itemCumprido(marcas, cargo, dia, i, it)}
									{@const aberto = !lembreteFeito && lembrete?.bloco === i && lembrete.cid === it.cid}
									<li
										class:feito={itemOk}
										class:em-andamento={aberto}
										class:ponteiro={it.movida !== undefined}
									>
										{#if porItem && it.movida === undefined && it.feitaEm === undefined}
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
											{#if it.nota}<em> · {it.nota}</em>{/if}
											{#if it.feitaEm}<em> · aula feita em {formatarData(it.feitaEm)}</em>{/if}
											{#if it.movida !== undefined}
												<em>
													· {it.movida
														? `${b.tipo === 'novo' ? 'aula adiada para' : 'revisão movida para'} ${formatarData(it.movida)}`
														: `${b.tipo === 'novo' ? 'aula' : 'revisão'} além do fim do plano`}
												</em>
											{:else if it.suspensa === true}
												<em> · revisão suspensa: estudo não concluído</em>
											{/if}
											{#if it.partes && it.partes > 1}<em> · parte {it.parte} de {it.partes}</em>{/if}
											{#if it.subitens?.length}
												<em> · aula da mentoria, subitens {it.subitens.map((s) => s.cod).join(' · ')}</em>
											{/if}
											{#if aula || tec || extras.length || temAtalhoSub || (!it.subitens && (nSub(it) > 0 || plano.mapas?.[it.cid]))}
												<span class="atalhos">
													{#if !it.subitens && nSub(it) > 0}
														<a class="topico" href="/?topico={encodeURIComponent(it.cid)}&tipo=questao">
															{nSub(it)} {nSub(it) === 1 ? 'questão' : 'questões'} deste tópico
														</a>
													{/if}
													{#if !it.subitens && plano.mapas?.[it.cid]}
														<a class="topico" href="/mapa/{plano.mapas[it.cid]}">Mapa mental ↗</a>
													{/if}
													{#each subs as s (s.cid)}
														{#if nSub(s) > 0}
															<a class="topico" href="/?topico={encodeURIComponent(s.cid)}&tipo=questao">
																{nSub(s)} questões de {s.cod}
															</a>
														{/if}
														{#if plano.mapas?.[s.cid]}
															<a class="topico" href="/mapa/{plano.mapas[s.cid]}">Mapa de {s.cod} ↗</a>
														{/if}
													{/each}
													{#if questoes}
														<a class="topico" href="/questoes/{questoes}">Questões C/E ↗</a>
													{/if}
													{#if podcasts?.audios?.length}
														<a class="topico" href="/podcast/{slugDaAula(aulaInfo!.disciplina, aulaInfo!.titulo)}">
															Podcasts da aula ↗
														</a>
													{/if}
													{#if aula}
														<a
															class="topico"
															href={aula}
															target="_blank"
															rel="noopener"
															onclick={() => abrirAula(i, it.cid)}
														>
															Aula da mentoria ↗
														</a>
													{/if}
													{#if tec}
														<a
															class="topico"
															href={tec}
															target="_blank"
															rel="noopener"
															onclick={() => abrirAula(i, it.cid)}
														>
															Questões no TEC ↗
														</a>
													{/if}
													{#each extras as e (e.url)}
														<a class="topico" href={e.url} target="_blank" rel="noopener">
															{e.rotulo ?? 'caderno extra'}{e.questoes ? ` (${e.questoes})` : ''} ↗
														</a>
													{/each}
												</span>
											{/if}
											{#if aberto}
												<span class="lembrete" role="status">
													<strong>Você parou aqui:</strong> abriu a aula da mentoria ou as questões do TEC.
													<span class="acoes">
														<button type="button" onclick={() => marcarLembrete(i, it.cid, porItem)}>
															Terminei, marcar
														</button>
														<button type="button" class="dispensar" onclick={() => emAndamento.limpar()}>
															Dispensar
														</button>
													</span>
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
				{/if}
			{/each}
		</ol>
		{#if extrasDoDia.length}
			<div class="extras">
				<p class="titulo-extras">Também estudado neste dia, fora da missão</p>
				<ul>
					{#each extrasDoDia as t (`${t.tipo}~${t.cid}`)}
						<li class="t-{t.tipo}">
							<span class="selo" aria-hidden="true">{LETRA[t.tipo]}</span>
							<span class="cod">{t.cod}</span>
							<span class="texto-extra">{t.texto}</span>
							<button
								type="button"
								class="remover"
								onclick={() => extrasMissoes.remover(cargo, escolhida, t)}
							>
								Remover
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
		{#if extraAberta}
			<form class="form-extra" onsubmit={(e) => {
				e.preventDefault();
				adicionarExtra();
			}}>
				<p class="pergunta">Aula feita fora da missão</p>
				<div class="passo">
					<p class="rotulo-passo">1. Aula nova ou revisão?</p>
					<div class="opcoes">
						<button type="button" class="opcao" aria-pressed={tipoExtra === 'novo'} onclick={() => (tipoExtra = 'novo')}>
							Aula nova
						</button>
						<button type="button" class="opcao" aria-pressed={tipoExtra === 'rev'} onclick={() => (tipoExtra = 'rev')}>
							Revisão
						</button>
					</div>
				</div>
				{#if tipoExtra}
					<div class="passo">
						<p class="rotulo-passo">2. Qual disciplina?</p>
						<div class="opcoes">
							{#each disciplinas as d (d.chave)}
								<button
									type="button"
									class="opcao"
									aria-pressed={discExtra === d.chave}
									onclick={() => {
										discExtra = d.chave;
										aulaExtra = '';
									}}
								>
									{d.rotulo}
								</button>
							{/each}
						</div>
					</div>
				{/if}
				{#if tipoExtra && discExtra}
					<div class="passo">
						<p class="rotulo-passo">3. Qual aula?</p>
						<select class="aula" bind:value={aulaExtra} required aria-label="Escolha a aula">
							<option value="" disabled>Escolha a aula</option>
							{#each aulasDaDisc as a (a.id)}
								<option value={a.id}>{a.titulo}</option>
							{/each}
						</select>
							{#if aulaEscolhida && tipoExtra === 'novo'}
								<p class="aviso-extra" role="status">
									{#if novasDaAula.length}
										O plano traz esta aula em {datasNovas}; o que lá ainda não está concluído fica marcado, e as
										revisões dela (D+1, D+7, D+30) passam a contar deste dia.
									{:else}
										Esta aula não está no plano; ela entra só na lista deste dia.
									{/if}
								</p>
							{/if}
					</div>
				{/if}
				<div class="acoes-extra">
					<button type="submit" disabled={!aulaEscolhida}>Adicionar</button>
					<button type="button" class="cancelar" onclick={fecharExtra}>Cancelar</button>
				</div>
			</form>
		{:else}
			<button type="button" class="abrir-extra" onclick={() => (extraAberta = true)}>
				Registrar aula feita fora da missão
			</button>
		{/if}
		{#if aSeguir.length}
			<p class="a-seguir">
				<strong>A seguir:</strong>
				{#each aSeguir as a, k (a.data + a.cod)}
					<span>{k ? '·' : ''} {a.dow} {formatarData(a.data).slice(0, 5)} · {a.cod} {a.titulo}</span>
				{/each}
			</p>
		{/if}
		{#if progresso.feitos === progresso.total}
			<p class="cumprida" role="status">
				<span class="marca" aria-hidden="true"><Icone nome="check" tamanho={20} /></span>
				Missão cumprida
			</p>
		{/if}
		<a class="secundario" href={linkMissoes}>Abrir nas Missões</a>
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

	/* Seletor de dia: ver a missão de qualquer data do plano, com o botão de volta para hoje
	   aparecendo só quando o dia em vista não é o de hoje. */
	.quando {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 8px;
	}

	.quando .dia {
		min-height: 44px;
		padding: 8px 14px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
		color: var(--cor-texto);
		font: inherit;
	}

	.quando .voltar-hoje {
		min-height: 44px;
		padding: 8px 14px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
		color: var(--cor-texto);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
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

									/* Ponteiro (revisão movida ou suspensa, aula adiada): sem marcação. */
									.itens li.ponteiro .cod,
									.itens li.ponteiro .texto {
										color: var(--cor-texto-suave);
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

	/* Subitem aberto na aula da mentoria: marca-texto (aviso), com a borda na cor do tipo; no Kindle, tinta. */
	.itens li.em-andamento {
		padding: 4px 8px 8px 0;
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-aviso-fundo);
		color: var(--cor-aviso);
		box-shadow: inset 4px 0 0 var(--c);
		scroll-margin: 96px;
	}

	.itens:not(.por-item) li.em-andamento {
		padding-left: 12px;
	}

	.itens li.em-andamento .texto em {
		color: inherit;
	}

	.lembrete {
		display: block;
		margin-top: 4px;
		font-size: 0.875rem;
	}

	.acoes {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 6px;
	}

	.acoes button {
		min-height: 44px;
		padding: 8px 14px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
		color: var(--cor-texto);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.acoes .dispensar {
		background: transparent;
		color: inherit;
	}

	.det {
		margin: 6px 0 0;
		color: var(--cor-texto-suave);
		font-size: 0.875rem;
	}

	/* Aula feita fora da missão: o que já foi registrado no dia e o formulário em três passos. */
	.extras {
		margin: 12px 0 0;
		padding: 10px 12px;
		border: var(--linha-peso) dashed var(--cor-divisor);
		border-radius: calc(var(--raio) / 2);
	}

	.titulo-extras {
		margin: 0;
		color: var(--cor-texto-suave);
		font-size: 0.875rem;
		font-weight: 700;
	}

	.extras ul {
		margin: 6px 0 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 8px;
		font-size: 0.9375rem;
	}

	.extras li {
		display: grid;
		grid-template-columns: 28px auto minmax(0, 1fr) auto;
		gap: 8px;
		align-items: center;
	}

	.extras li.t-novo {
		--c: var(--cor-acerto);
	}

	.extras li.t-rev {
		--c: var(--cor-primaria);
	}

	:global([data-tema^='kindle']) .extras li {
		--c: var(--cor-texto);
	}

	.selo {
		display: grid;
		place-items: center;
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: var(--c);
		color: var(--cor-superficie);
		font-weight: 700;
		font-size: 0.75rem;
	}

	.remover {
		min-height: 44px;
		padding: 8px 12px;
		border: 0;
		background: none;
		color: var(--cor-texto-suave);
		font: inherit;
		font-size: 0.875rem;
		font-weight: 700;
		text-decoration: underline;
		cursor: pointer;
	}

	.abrir-extra {
		min-height: 44px;
		margin-top: 12px;
		padding: 8px 16px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
		color: var(--cor-texto);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.form-extra {
		margin-top: 12px;
		padding: 12px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
	}

	.pergunta {
		margin: 0;
		font-weight: 700;
	}

	.passo {
		margin-top: 10px;
	}

	.rotulo-passo {
		margin: 0 0 6px;
		color: var(--cor-texto-suave);
		font-size: 0.875rem;
		font-weight: 700;
	}

	.opcoes {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.opcao {
		min-height: 44px;
		padding: 8px 14px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
		color: var(--cor-texto);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.opcao[aria-pressed='true'] {
		border-color: var(--cor-primaria);
		background: var(--cor-primaria);
		color: var(--cor-superficie);
	}

	.form-extra .aula {
		min-height: 44px;
		width: 100%;
		padding: 8px 14px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
		color: var(--cor-texto);
		font: inherit;
	}

	.aviso-extra {
		margin: 6px 0 0;
		color: var(--cor-texto-suave);
		font-size: 0.875rem;
	}

	.acoes-extra {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 12px;
	}

	.acoes-extra button {
		min-height: 44px;
		padding: 8px 16px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-primaria);
		color: var(--cor-superficie);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.acoes-extra button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.acoes-extra .cancelar {
		background: var(--cor-superficie);
		color: var(--cor-texto);
	}

	.cumprida {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 8px 0 0;
		font-weight: 700;
	}

	/* Próximas aulas depois do dia em vista: linha compacta, sem roubar o foco do dia. */
	.a-seguir {
		display: flex;
		flex-wrap: wrap;
		column-gap: 6px;
		margin: 8px 0 0;
		color: var(--cor-texto-suave);
		font-size: 0.875rem;
	}

	.a-seguir strong {
		color: var(--cor-texto);
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

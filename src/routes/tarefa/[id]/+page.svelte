<script lang="ts">
	// Tela da tarefa (FR-007, FR-008, FR-009, FR-014; Cenário 3): modo e bloco, tópico do edital,
	// o que fazer (por modo), cronômetro, atalho para o feed da matéria (questões na tarefa de
	// Questões — e, antes, as do próprio tópico, se houver (FR-003 de questoes-por-tarefa); lei seca
	// e resumos na de Leitura) e "Concluir tarefa" — questões feitas/certas só
	// na tarefa de Questões (emenda D4). Emenda D5 (FR-016): se a missão de hoje fica cumprida com
	// esta tarefa, a tela fica aberta com "Continuar estudando" (a próxima da fila, com o cronômetro).
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import Icone from '$lib/componentes/Icone.svelte';
	import AvisoRegistro from '$lib/componentes/plano/AvisoRegistro.svelte';
	import Cronometro from '$lib/componentes/plano/Cronometro.svelte';
	import { proximaDaFila } from '$lib/componentes/plano/continuar';
	import { garantirRegistro, iniciarEstudos, usarAgora } from '$lib/componentes/plano/estado.svelte';
	import { duracao, ITENS_QUESTOES, partesTopico, ROTULO_BLOCO, ROTULO_MODO } from '$lib/componentes/plano/formato';
	import { formatarData } from '$lib/datas';
	import type { Repositorio } from '$lib/feed/conteudo';
	import { diaLocalDe } from '$lib/plano/dias';
	import { minutosEstudados } from '$lib/plano/horas';
	import { missaoDoDia, pendente } from '$lib/plano/missao';
	import { aceitaQuestoes } from '$lib/plano/ids';
	import { registro } from '$lib/plano/registro.svelte';
	import type { Tarefa } from '$lib/plano/tipos';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	garantirRegistro();
	const agora = usarAgora();

	const tarefa = $derived(data.tarefa);
	const topico = $derived(partesTopico(tarefa.topico));
	const reg = $derived(registro.doTarefa(tarefa.id));

	/** Só a tarefa de Questões (`…:Q`) lança questões feitas/certas (FR-014). */
	const comQuestoes = $derived(aceitaQuestoes(tarefa.id));
	const modo = $derived(ROTULO_MODO[tarefa.modo]);
	/** Atalho por modo: Questões ⇒ feed só de questões da matéria; Leitura ⇒ feed da matéria (lei seca e resumos). */
	const atalho = $derived(
		tarefa.materia === null
			? null
			: comQuestoes
				? { href: `/?materia=${encodeURIComponent(tarefa.materia)}&tipo=questao`, rotulo: 'Questões desta matéria' }
				: { href: `/?materia=${encodeURIComponent(tarefa.materia)}`, rotulo: 'Lei seca e resumos desta matéria' }
	);

	/**
	 * Questões do catálogo ligadas ao tópico (FR-003), contadas no índice do feed. `null` enquanto o
	 * índice carrega ou se ele falhar (sem rede): aí fica só o atalho da matéria, como antes.
	 */
	const repo = getContext<Repositorio>('repositorio');
	let qtdTopico = $state<{ topico: string; n: number } | null>(null);
	$effect(() => {
		if (!comQuestoes) return;
		const topicoId = tarefa.topicoId;
		let vivo = true;
		repo.indice().then(
			(i) => {
				if (vivo) qtdTopico = { topico: topicoId, n: i.posts.filter((e) => e.t === 'q' && e.tp === topicoId).length };
			},
			() => {}
		);
		return () => (vivo = false);
	});
	/** Contagem do tópico desta tarefa (a página é reaproveitada ao trocar de tarefa). */
	const questoesDoTopico = $derived(comQuestoes && qtdTopico?.topico === tarefa.topicoId ? qtdTopico.n : null);
	const atalhoTopico = $derived(
		questoesDoTopico ? `/?topico=${encodeURIComponent(tarefa.topicoId)}&tipo=questao` : null
	);

	let feitas = $state<number | null>(null);
	let certas = $state<number | null>(null);
	let erro = $state('');
	/**
	 * Id da tarefa com que a missão de hoje acabou de ficar cumprida (D5). Guardado por id porque a
	 * mesma página é reaproveitada ao abrir a tarefa seguinte.
	 */
	let cumpriuCom = $state<string | null>(null);
	/** Alvo de "Continuar estudando" depois de cumprir a missão com esta tarefa. */
	const continuar = $derived(cumpriuCom === tarefa.id ? proximaDaFila(data.plano, registro.dados(), agora.hoje) : null);

	const vazio = (v: number | null | undefined) => v === null || v === undefined || Number.isNaN(v);
	const contagem = (v: number) => Number.isInteger(v) && v >= 0;

	async function concluir(e: SubmitEvent) {
		e.preventDefault();
		erro = '';
		const semFeitas = vazio(feitas);
		const semCertas = vazio(certas);
		let q: { questoes: number; certas: number } | undefined;
		if (comQuestoes && (!semFeitas || !semCertas)) {
			if (semFeitas || semCertas) {
				erro = 'Preencha as duas quantidades ou deixe as duas em branco.';
				return;
			}
			if (!contagem(feitas!) || !contagem(certas!)) {
				erro = 'Use números inteiros, de 0 para cima.';
				return;
			}
			if (certas! > feitas!) {
				erro = 'Certas não pode passar de feitas.';
				return;
			}
			q = { questoes: feitas!, certas: certas! };
		}
		registro.concluir(tarefa.id, q);
		if (cumpriuAMissao()) {
			cumpriuCom = tarefa.id;
			return;
		}
		await goto('/painel');
	}

	/** A tarefa era da missão de hoje, a missão ficou toda feita e a fila ainda tem pendentes. */
	function cumpriuAMissao(): boolean {
		const dados = registro.dados();
		const missao = missaoDoDia(data.plano, dados, agora.hoje);
		return (
			missao.some((t) => t.id === tarefa.id) &&
			missao.every((t) => !pendente(dados, t.id)) &&
			proximaDaFila(data.plano, dados, agora.hoje) !== null
		);
	}

	function continuarEstudando(alvo: Tarefa) {
		feitas = certas = null;
		erro = '';
		void iniciarEstudos(alvo, agora.hoje);
	}

	const resumoConcluida = $derived.by(() => {
		if (!reg?.concluidaEm) return '';
		const min = Math.round(minutosEstudados(reg, Date.parse(reg.concluidaEm)));
		const partes = [`Concluída em ${formatarData(diaLocalDe(reg.concluidaEm))}`, `${duracao(min)} cronometrados`];
		if (reg.questoes !== null) partes.push(`${reg.certas} de ${reg.questoes} questões certas`);
		return partes.join(', ') + '.';
	});
</script>

<svelte:head>
	<title>{modo} {tarefa.topicoId} · Missão · Painel de Concurso</title>
</svelte:head>

<div class="tarefa">
	<a class="voltar" href="/painel"><Icone nome="voltar" tamanho={20} /> Voltar à missão</a>

	<header>
		<p class="disciplina">{tarefa.disciplina}, tópico {tarefa.topicoId}</p>
		<p class="rotulos"><strong class="modo">{modo}</strong> · {duracao(tarefa.minutos)} · Bloco: {ROTULO_BLOCO[tarefa.bloco]}</p>
		<h1>{topico.folha}</h1>
		{#if topico.caminho.length > 0}
			<p class="caminho">{topico.caminho.join(' › ')}</p>
		{/if}
	</header>

	<AvisoRegistro />

	<section class="painel-cronometro" aria-label="Cronômetro">
		<Cronometro
			registro={reg}
			agora={agora.ms}
			estimado={tarefa.minutos}
			oniniciar={() => registro.iniciar(tarefa.id, agora.hoje)}
			onpausar={() => registro.pausar(tarefa.id)}
			onretomar={() => registro.retomar(tarefa.id)}
		/>
	</section>

	<section class="fazer" aria-labelledby="titulo-fazer">
		<h2 id="titulo-fazer">O que fazer</h2>
		<ol>
			{#if comQuestoes}
				<li>Resolva {ITENS_QUESTOES} itens C/E do próprio tópico.</li>
				<li>Lance abaixo quantos fez e quantos acertou.</li>
			{:else}
				<li>Estude o tópico acima: teoria e, se houver, a lei seca dele.</li>
				<li>Anote as dúvidas; as questões do tópico vêm na tarefa seguinte, de Questões.</li>
			{/if}
		</ol>
		{#if questoesDoTopico !== null}
			<p class="ligadas" role="status">
				{#if questoesDoTopico === 0}
					Nenhuma questão do catálogo ligada a este tópico ainda.
				{:else}
					{questoesDoTopico === 1 ? '1 questão deste tópico' : `${questoesDoTopico} questões deste tópico`}.
				{/if}
			</p>
		{/if}
		<div class="atalhos">
			{#if atalhoTopico}
				<a class="atalho" href={atalhoTopico}>
					<Icone nome="lista" tamanho={20} /> Questões deste tópico
				</a>
			{/if}
			{#if atalho}
				<a class={atalhoTopico ? 'atalho secundario' : 'atalho'} href={atalho.href}>
					<Icone nome="lista" tamanho={20} /> {atalho.rotulo}
				</a>
			{/if}
		</div>
	</section>

	<section class="concluir" aria-labelledby="titulo-concluir">
		<h2 id="titulo-concluir">{reg?.concluidaEm ? 'Tarefa concluída' : 'Concluir tarefa'}</h2>
		{#if reg?.concluidaEm}
			<p class="feita"><Icone nome="check" tamanho={20} /> {resumoConcluida}</p>
			{#if continuar}
				{@const alvo = continuar}
				<div class="cumprida" role="status">
					<p class="titulo-cumprida">Missão cumprida</p>
					<p>A missão de hoje está feita. Quer seguir com a próxima tarefa da fila?</p>
				</div>
				<div class="acoes">
					<button type="button" class="primario" onclick={() => continuarEstudando(alvo)}>
						<Icone nome="cronometro" tamanho={22} />
						Continuar estudando
					</button>
					<a class="voltar-painel" href="/painel">Voltar ao painel</a>
				</div>
			{/if}
		{:else}
			<form onsubmit={concluir} novalidate>
				{#if comQuestoes}
					<p class="dica">Questões são opcionais: preencha as duas ou nenhuma.</p>
					<div class="campos">
						<label>
							Questões feitas
							<input type="number" inputmode="numeric" min="0" step="1" bind:value={feitas} aria-invalid={erro ? 'true' : undefined} aria-describedby={erro ? 'erro-questoes' : undefined} />
						</label>
						<label>
							Questões certas
							<input type="number" inputmode="numeric" min="0" step="1" bind:value={certas} aria-invalid={erro ? 'true' : undefined} aria-describedby={erro ? 'erro-questoes' : undefined} />
						</label>
					</div>
					{#if erro}
						<p class="erro" id="erro-questoes" role="alert">{erro}</p>
					{/if}
				{:else}
					<p class="dica">Concluir marca a leitura como feita; o tempo vem do cronômetro.</p>
				{/if}
				<button type="submit">Concluir tarefa</button>
			</form>
		{/if}
	</section>
</div>

<style>
	.tarefa {
		display: flex;
		flex-direction: column;
		gap: calc(var(--espaco) * 1.25);
		max-width: 40rem;
		margin: 0 auto;
		overflow-wrap: anywhere;
	}

	.voltar {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		align-self: flex-start;
		min-height: 44px;
		color: var(--cor-texto);
		font-weight: 600;
		text-decoration: none;
	}

	header {
		display: grid;
		gap: 6px;
	}

	.disciplina {
		margin: 0;
		color: var(--cor-texto-suave);
		font-weight: 600;
	}

	/* O texto do edital, na voz de leitura do app. */
	.rotulos {
		margin: 0;
		color: var(--cor-texto-suave);
		font-size: 0.9375rem;
	}

	.modo {
		color: var(--cor-texto);
		font-weight: 800;
	}

	h1 {
		margin: 0;
		font-family: var(--fonte-texto);
		font-size: 1.625rem;
		font-weight: 700;
		line-height: 1.25;
	}

	.caminho {
		margin: 0;
		max-width: var(--medida);
		color: var(--cor-texto-suave);
		font-family: var(--fonte-texto);
		font-size: 0.9375rem;
		line-height: 1.55;
	}

	.painel-cronometro {
		padding: calc(var(--espaco) * 1.5) var(--espaco);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-superficie);
		box-shadow: var(--sombra);
	}

	.fazer,
	.concluir {
		padding: 0 2px;
	}

	h2 {
		margin: 0 0 8px;
		font-family: var(--fonte-titulo);
		font-size: 1.125rem;
	}

	ol {
		margin: 0;
		padding-left: 1.4em;
		max-width: var(--medida);
		font-family: var(--fonte-texto);
		line-height: 1.6;
	}

	.ligadas {
		margin: 8px 0 0;
		color: var(--cor-texto-suave);
		font-weight: 600;
	}

	.atalhos {
		display: flex;
		flex-wrap: wrap;
		gap: 0 20px;
	}

	.atalho {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		margin-top: 8px;
		color: var(--cor-primaria);
		font-weight: 700;
	}

	/* Com questões do tópico, a matéria inteira fica como saída de segunda ordem. */
	.atalho.secundario {
		color: var(--cor-texto);
		font-weight: 600;
	}

	form {
		display: grid;
		gap: 10px;
	}

	.dica {
		margin: 0;
		color: var(--cor-texto-suave);
		font-size: 0.9375rem;
	}

	.campos {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
		max-width: 24rem;
	}

	label {
		display: grid;
		gap: 4px;
		font-weight: 600;
		font-size: 0.9375rem;
	}

	input {
		width: 100%;
		min-height: 44px;
		padding: 8px 12px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
		font-variant-numeric: tabular-nums;
	}

	.erro {
		margin: 0;
		padding: 8px 12px;
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-erro-fundo);
		color: var(--cor-erro);
		font-weight: 600;
	}

	/* Concluir é definitivo: botão de contorno, para não competir com o cronômetro. */
	button[type='submit'] {
		justify-self: start;
		min-height: 48px;
		padding: 0 22px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
		font-weight: 800;
		cursor: pointer;
	}

	.cumprida {
		margin-top: 12px;
		padding: 12px;
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-acerto-fundo);
		color: var(--cor-acerto);
	}

	.cumprida p {
		margin: 0;
	}

	.titulo-cumprida {
		font-family: var(--fonte-titulo);
		font-size: 1.125rem;
		font-weight: 700;
	}

	.acoes {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 20px;
		margin-top: 12px;
	}

	/* Botão primário do sistema (igual ao do painel). */
	.primario {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		width: 100%;
		min-height: 52px;
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

	.voltar-painel {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--cor-texto);
		font-weight: 600;
	}

	.feita {
		display: flex;
		gap: 8px;
		align-items: flex-start;
		margin: 0;
		padding: 10px 12px;
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-acerto-fundo);
		color: var(--cor-acerto);
	}
</style>

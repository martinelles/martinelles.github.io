<script lang="ts">
	// Resumo do plano (FR-002, FR-003, FR-004; Cenário 1): horas, % concluída com barra e os
	// quatro números de dias, armados como uma conta (concluídos + em aberto + restantes = no plano).
	// Tudo calculado pelo motor a partir dos registros (C-003).
	import { formatarData } from '$lib/datas';
	import { contarDias, fasePlano } from '$lib/plano/dias';
	import { horasEstudadas, horasTotais } from '$lib/plano/horas';
	import { topicoDe } from '$lib/plano/ids';
	import { percentualPlano, tarefasConcluidas } from '$lib/plano/missao';
	import type { DadosPlano, Plano } from '$lib/plano/tipos';
	import { horas, porcento } from './formato';

	let {
		plano,
		dados,
		agora,
		hoje,
		onexportar
	}: {
		plano: Plano;
		dados: DadosPlano;
		/** Epoch ms, para o trecho do cronômetro em curso entrar nas horas. */
		agora: number;
		hoje: string;
		onexportar: () => void;
	} = $props();

	const num = new Intl.NumberFormat('pt-BR');

	const fase = $derived(fasePlano(plano, hoje));
	const estudadas = $derived(horasEstudadas(dados, agora));
	const totais = $derived(horasTotais(plano));
	const fracao = $derived(percentualPlano(plano, dados));
	const feitas = $derived(tarefasConcluidas(plano, dados));
	const dias = $derived(contarDias(plano, dados, hoje));
	/**
	 * Tópicos com ao menos uma tarefa concluída — uma linha cada no CSV (emenda D4/FR-015),
	 * inclusive de tópicos que saíram do plano.
	 */
	const paraLancar = $derived(
		new Set(Object.entries(dados.registros).flatMap(([id, r]) => (r.concluidaEm !== null ? [topicoDe(id)] : []))).size
	);
	const janela = $derived(`De ${formatarData(plano.inicio)} a ${formatarData(plano.fim)}, ${num.format(plano.horasPorDia)} h por dia.`);
</script>

<section class="resumo" aria-labelledby="titulo-plano">
	<h2 id="titulo-plano">Seu plano</h2>
	<p class="janela">{janela}</p>
	{#if fase === 'antes'}
		<p class="fase" role="status">Plano ainda não começou. A primeira missão sai em {formatarData(plano.inicio)}.</p>
	{:else if fase === 'depois'}
		<p class="fase" role="status">Plano encerrado em {formatarData(plano.fim)}.</p>
	{/if}

	<div class="corpo">
		<div class="horas">
			<p class="estudadas">
				<span class="grande">{horas(estudadas)}</span>
				<span class="de">de {horas(totais)} estudadas</span>
			</p>
			<progress max="1" value={fracao} aria-label="Plano concluído: {porcento(fracao)}"></progress>
			<p class="concluido">
				<strong>{porcento(fracao)}</strong> do plano concluído, {num.format(feitas)} de {num.format(plano.tarefas.length)} tarefas.
			</p>
		</div>

		<dl class="dias" aria-label="Dias do plano">
			<div class="parcela">
				<dt>concluídos</dt>
				<dd>{num.format(dias.concluidos)}</dd>
			</div>
			<div class="parcela mais">
				<dt>em aberto</dt>
				<dd>{num.format(dias.emAberto)}</dd>
			</div>
			<div class="parcela mais">
				<dt>restantes</dt>
				<dd>{num.format(dias.restantes)}</dd>
			</div>
			<div class="total">
				<dt>dias no plano</dt>
				<dd>{num.format(dias.noPlano)}</dd>
			</div>
		</dl>
	</div>

	<div class="exportar">
		<button type="button" onclick={onexportar}>Exportar progresso</button>
		<p>
			{#if paraLancar === 0}
				Nenhuma tarefa concluída ainda. O arquivo sai só com o cabeçalho do ESTUDO.csv.
			{:else}
				{num.format(paraLancar)}
				{paraLancar === 1 ? 'tópico' : 'tópicos'} com tarefa concluída para lançar no ESTUDO.csv.
			{/if}
		</p>
	</div>
</section>

<style>
	.resumo {
		background: var(--cor-superficie);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		padding: var(--espaco);
		overflow-wrap: anywhere;
	}

	h2 {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.125rem;
	}

	.janela {
		margin: 2px 0 0;
		color: var(--cor-texto-suave);
		font-size: 0.9375rem;
	}

	.fase {
		margin: 12px 0 0;
		padding: 8px 12px;
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-aviso-fundo);
		color: var(--cor-aviso);
		font-weight: 600;
	}

	.corpo {
		display: grid;
		gap: calc(var(--espaco) * 1.25);
		margin-top: var(--espaco);
	}

	@media (min-width: 720px) {
		.corpo {
			grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
			align-items: start;
		}
	}

	.estudadas {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0 10px;
		margin: 0;
	}

	/* O número das horas é a voz da seção: título grande, algarismos alinhados. */
	.grande {
		font-family: var(--fonte-titulo);
		font-size: 2.5rem;
		font-weight: 700;
		line-height: 1.05;
		font-variant-numeric: tabular-nums;
	}

	.de {
		color: var(--cor-texto-suave);
		font-size: 1.0625rem;
	}

	/* Barra: trilho com o contorno do tema e preenchimento na primária (a única cor da seção). */
	progress {
		display: block;
		width: 100%;
		height: 14px;
		margin: 12px 0 8px;
		appearance: none;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: 999px;
		background: var(--cor-fundo);
		overflow: hidden;
	}

	progress::-webkit-progress-bar {
		background: var(--cor-fundo);
	}

	progress::-webkit-progress-value {
		background: var(--cor-primaria);
	}

	progress::-moz-progress-bar {
		background: var(--cor-primaria);
	}

	.concluido {
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	/* Conta armada, como no papel: as três parcelas somam o total, abaixo do traço. */
	.dias {
		display: grid;
		gap: 2px;
		margin: 0;
		max-width: 20rem;
	}

	.dias div {
		display: grid;
		grid-template-columns: 1.25rem 2.75rem minmax(0, 1fr);
		align-items: baseline;
		column-gap: 8px;
	}

	.dias div::before {
		content: '' / '';
		grid-column: 1;
		color: var(--cor-texto-suave);
		font-weight: 700;
		text-align: center;
	}

	.dias .mais::before {
		content: '+' / '';
	}

	.dias .total::before {
		content: '=' / '';
	}

	.dias dd {
		grid-column: 2;
		grid-row: 1;
		margin: 0;
		font-size: 1.375rem;
		font-weight: 800;
		line-height: 1.3;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.dias dt {
		grid-column: 3;
		grid-row: 1;
		color: var(--cor-texto-suave);
	}

	.dias .total {
		margin-top: 4px;
		padding-top: 4px;
		border-top: var(--linha-peso) solid var(--cor-borda);
	}

	.dias .total dt {
		color: var(--cor-texto);
		font-weight: 600;
	}

	.exportar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 14px;
		margin-top: calc(var(--espaco) * 1.25);
		padding-top: var(--espaco);
		border-top: 1px solid var(--cor-divisor);
	}

	.exportar p {
		flex: 1 1 14rem;
		margin: 0;
		color: var(--cor-texto-suave);
		font-size: 0.875rem;
	}

	/* Botão secundário: contorno, sem preenchimento (o primário da tela é "Iniciar estudos"). */
	.exportar button {
		min-height: 44px;
		padding: 0 18px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		background: var(--cor-superficie);
		font-weight: 700;
		cursor: pointer;
	}
</style>

<script lang="ts">
	// "Seu plano" (planos/2026-10-14-missao-unica.md): o plano de 61 dias das Missões em três números,
	// das mesmas marcações das bolhas. O detalhe dos 61 dias fica na página das Missões.
	import { formatarData } from '$lib/datas';
	import { resumo } from '$lib/missoes/calculos';
	import type { Cargo, Marcas, PlanoMissoes } from '$lib/missoes/tipos';

	let { plano, cargo, marcas }: { plano: PlanoMissoes; cargo: Cargo; marcas: Marcas } = $props();

	const r = $derived(resumo(plano, marcas, cargo));
	const pct = $derived(r.minutos ? Math.round((100 * r.minutosFeitos) / r.minutos) : 0);
	const h = (min: number) => (min / 60).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
</script>

<section class="resumo" aria-labelledby="titulo-resumo">
	<h2 id="titulo-resumo">Seu plano</h2>
	<p class="periodo">
		De {formatarData(plano.plan[0].data)} a {formatarData(plano.plan[plano.plan.length - 1].data)}, {r.dias} dias.
	</p>
	<div class="barra" role="progressbar" aria-label="Horas do plano cumpridas" aria-valuemin="0" aria-valuemax="100" aria-valuenow={pct}>
		<span style:width="{pct}%"></span>
	</div>
	<dl class="numeros">
		<div><dt>dias cumpridos</dt><dd>{r.diasCumpridos} <small>de {r.dias}</small></dd></div>
		<div><dt>blocos feitos</dt><dd>{r.blocosFeitos} <small>de {r.blocos}</small></dd></div>
		<div><dt>horas feitas</dt><dd>{h(r.minutosFeitos)} <small>de {h(r.minutos)} h</small></dd></div>
	</dl>
	<a class="secundario" href="/conteudo/artefatos/missoes.html#{cargo}" target="_blank" rel="noopener">Ver os {r.dias} dias nas Missões</a>
</section>

<style>
	.resumo {
		background: var(--cor-superficie);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		padding: var(--espaco);
		box-shadow: var(--sombra);
	}

	h2 {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.375rem;
		line-height: 1.2;
	}

	.periodo {
		margin: 4px 0 12px;
		color: var(--cor-texto-suave);
	}

	.barra {
		height: 12px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: 999px;
		overflow: hidden;
	}

	.barra span {
		display: block;
		height: 100%;
		background: var(--cor-primaria);
	}

	.numeros {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 8px;
		margin: 12px 0 0;
	}

	.numeros div {
		display: flex;
		flex-direction: column-reverse;
		gap: 2px;
	}

	dt {
		color: var(--cor-texto-suave);
		font-size: 0.875rem;
	}

	dd {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.5rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	small {
		font-family: var(--fonte-corpo, inherit);
		font-size: 0.875rem;
		font-weight: 400;
		color: var(--cor-texto-suave);
	}

	.secundario {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		margin-top: 12px;
		padding: 8px 16px;
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: calc(var(--raio) / 2);
		color: var(--cor-texto);
		font-weight: 700;
		text-decoration: none;
	}
</style>

<script lang="ts">
	// Lista de todas as discursivas do plano (blocos `disc`), para fazer na ordem que quiser:
	// marcar aqui grava a mesma chave do bloco no dia dele (`cd~data~índice`), então a missão de
	// hoje, a página das Missões e esta lista mostram sempre o mesmo estado.
	import Icone from '$lib/componentes/Icone.svelte';
	import { formatarData, hojeLocal } from '$lib/datas';
	import { foco } from '$lib/feed/foco.svelte';
	import { marcarMissao } from '$lib/feed/pedidoLogin.svelte';
	import {
		blocoFeito,
		chaveBloco,
		discursivasDoPlano,
		mudancasDoBloco,
		type DiscursivaDoPlano
	} from '$lib/missoes/calculos';
	import { usarPlanoMissoes } from '$lib/missoes/estado.svelte';
	import { marcasMissoes } from '$lib/missoes/marcas.svelte';

	const hoje = hojeLocal();
	const missoes = usarPlanoMissoes();
	const cargo = $derived(missoes.cargo);
	const plano = $derived(missoes.plano);
	const marcas = $derived(marcasMissoes.todas());

	const linhas = $derived.by(() => {
		if (!plano || !cargo) return [] as { d: DiscursivaDoPlano; chave: string; feito: boolean }[];
		return discursivasDoPlano(plano).map((d) => ({
			d,
			chave: chaveBloco(cargo, d.dia.data, d.indice),
			feito: blocoFeito(marcas, cargo, d.dia, d.indice)
		}));
	});
	const feitas = $derived(linhas.filter((l) => l.feito).length);

	function alternar(l: { d: DiscursivaDoPlano; feito: boolean }, marcar: boolean): void {
		if (cargo) marcarMissao(mudancasDoBloco(marcas, cargo, l.d.dia, l.d.indice, marcar));
	}
</script>

<svelte:head>
	<title>Discursivas · Painel de Concurso</title>
</svelte:head>

<div class="discursivas">
	<a class="voltar" href="/painel">
		<Icone nome="voltar" tamanho={20} />
		Painel
	</a>
	<h1>Discursivas</h1>

	{#if !cargo}
		<p class="nota">{foco.especialidade.nome} ainda não tem plano nas Missões.</p>
	{:else if !plano}
		<p class="nota" role="status">Carregando as discursivas…</p>
	{:else if !linhas.length}
		<p class="nota">O plano não tem blocos de discursiva.</p>
	{:else}
		<p class="sumario">
			<span class="contagem">{feitas} de {linhas.length} concluídas</span> · faça na ordem que quiser.
		</p>
		<ol class="lista">
			{#each linhas as l (l.chave)}
				{@const d = l.d}
				{@const deHoje = d.dia.data === hoje}
				<li class="item" class:feito={l.feito} class:de-hoje={deHoje} class:passou={d.dia.data < hoje}>
					<label class="bolha">
						<input
							type="checkbox"
							checked={l.feito}
							onchange={(e) => {
								const alvo = e.currentTarget;
								const marcar = alvo.checked;
								alvo.checked = l.feito; // quem decide é o alternar (pode pedir login antes)
								alternar(l, marcar);
							}}
							aria-label="Marcar {d.bloco.titulo} de {formatarData(d.dia.data)} como concluída"
						/>
						<span class="circulo" aria-hidden="true">D</span>
					</label>
					<div class="corpo">
						<p class="quando">
							{d.dia.dow} {formatarData(d.dia.data)}{deHoje ? ' · hoje' : ''}
						</p>
						<p class="titulo">
							<span>{d.bloco.titulo}</span>
							{#if d.bloco.min}<span class="min">{d.bloco.min} min</span>{/if}
						</p>
						{#if d.bloco.det}<p class="det">{d.bloco.det}</p>{/if}
					</div>
				</li>
			{/each}
		</ol>
	{/if}
</div>

<style>
	.discursivas {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.voltar {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		color: var(--cor-primaria);
		font-weight: 700;
		text-decoration: none;
	}

	h1 {
		margin: 0;
		font-family: var(--fonte-titulo);
		font-size: 1.5rem;
		line-height: 1.2;
	}

	.nota,
	.sumario {
		margin: 0;
		color: var(--cor-texto-suave);
	}

	.contagem {
		color: var(--cor-texto);
		font-weight: 700;
	}

	.lista {
		margin: 4px 0 0;
		padding: var(--espaco);
		border: var(--linha-peso) solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-superficie);
		box-shadow: var(--sombra);
		list-style: none;
		overflow-wrap: anywhere;
	}

	.item {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr);
		gap: 10px;
		padding: 12px 0;
	}

	.item + .item {
		border-top: 1px dashed var(--cor-divisor);
	}

	/* A mesma bolha de discursiva da Missão de hoje (t-disc). */
	.item {
		--c: var(--cor-erro);
	}

	:global([data-tema^='kindle']) .item {
		--c: var(--cor-texto);
	}

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

	.quando {
		margin: 0;
		color: var(--cor-texto-suave);
		font-size: 0.875rem;
	}

	.de-hoje .quando {
		color: var(--cor-texto);
		font-weight: 700;
	}

	.de-hoje {
		border-left: 3px solid var(--c);
		padding-left: 9px;
		margin-left: -12px;
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
		color: var(--cor-texto-suave);
		font-weight: 400;
		font-size: 0.875rem;
		white-space: nowrap;
	}

	.det {
		margin: 4px 0 0;
		color: var(--cor-texto-suave);
		font-size: 0.875rem;
	}

	.feito .titulo {
		color: var(--cor-texto-suave);
	}

	.feito .quando::after {
		content: ' · concluída';
		color: var(--cor-acerto);
		font-weight: 700;
	}
</style>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import CampoBusca from '$lib/componentes/CampoBusca.svelte';
	import CartaoConcurso from '$lib/componentes/CartaoConcurso.svelte';
	import EstadoVazio from '$lib/componentes/EstadoVazio.svelte';
	import SecaoRecolhivel from '$lib/componentes/SecaoRecolhivel.svelte';
	import { filtrar, indexar, normalizar } from '$lib/busca';
	import { buscarConcurso, dados, type Concurso, type Situacao } from '$lib/dados';
	import { hojeLocal } from '$lib/datas';
	import { carregar, preferencias } from '$lib/preferencias.svelte';
	import { agruparEmSecoes, situacaoEfetiva, totalVisivel } from '$lib/secoes';

	carregar();

	const hoje = hojeLocal();
	const indice = indexar(dados.concursos);
	const limite = dados.config.limiteEmAlta;
	const ETIQUETAS: Record<Situacao, string> = {
		aberto: 'Aberto',
		previsto: 'Previsto',
		encerrado: 'Encerrado'
	};

	let termo = $state('');
	const termoNormalizado = $derived(normalizar(termo));
	const buscando = $derived(termoNormalizado !== '');
	const filtrados = $derived(filtrar(indice, termo));
	const secoes = $derived(agruparEmSecoes(filtrados, hoje));
	const total = $derived(totalVisivel(secoes));
	const semResultado = $derived(buscando && filtrados.length === 0);
	const salvo = $derived(buscarConcurso(preferencias.concursoId));

	// "Abertos em alta": o limite só vale fora da busca; resultado de busca nunca é cortado.
	let emAltaExpandida = $state(false);
	const emAltaVisiveis = $derived(
		buscando || emAltaExpandida ? secoes.emAlta : secoes.emAlta.slice(0, limite)
	);
	const restantes = $derived(secoes.emAlta.length - limite);
	let tituloEmAlta: HTMLHeadingElement | undefined = $state();

	async function verMenos() {
		emAltaExpandida = false;
		await tick();
		const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
		tituloEmAlta?.scrollIntoView({ behavior: reduzir ? 'auto' : 'smooth', block: 'start' });
	}

	// Seções recolhíveis: o estado manual vive fora da busca. Durante a busca toda seção com
	// resultado abre sozinha; o que a pessoa mexer nela vale só para aquele termo. Limpando a
	// busca, volta o estado manual que ela tinha deixado.
	type IdRecolhivel = 'previstos' | 'por-area' | 'encerrados';
	let manual = $state<Record<IdRecolhivel, boolean>>({
		previstos: false,
		'por-area': false,
		encerrados: false
	});
	let naBusca = $state<{ termo: string; abertas: Partial<Record<IdRecolhivel, boolean>> }>({
		termo: '',
		abertas: {}
	});

	function estaAberta(id: IdRecolhivel): boolean {
		if (!buscando) return manual[id];
		return naBusca.termo === termoNormalizado ? (naBusca.abertas[id] ?? true) : true;
	}

	function definirAberta(id: IdRecolhivel, valor: boolean) {
		if (!buscando) {
			manual[id] = valor;
			return;
		}
		const abertas = naBusca.termo === termoNormalizado ? naBusca.abertas : {};
		naBusca = { termo: termoNormalizado, abertas: { ...abertas, [id]: valor } };
	}

	const anuncio = $derived(
		!buscando || total === 0
			? ''
			: total === 1
				? '1 concurso encontrado'
				: `${total} concursos encontrados`
	);

	const totalPorArea = $derived(secoes.porArea.reduce((n, g) => n + g.concursos.length, 0));

	function escolher(id: string) {
		preferencias.escolherConcurso(id);
		goto('/painel');
	}

	const etiqueta = (c: Concurso) => ETIQUETAS[situacaoEfetiva(c, hoje)];
</script>

<!-- Título igual ao do app: esta é a tela inicial, e o smoke test do WP01 confere
     "Painel de Concurso" depois do redirecionamento da raiz. -->
<svelte:head>
	<title>Painel de Concurso</title>
</svelte:head>

{#snippet cartoes(lista: Concurso[])}
	<ul class="lista">
		{#each lista as concurso (concurso.id)}
			<li>
				<CartaoConcurso {concurso} etiqueta={etiqueta(concurso)} onescolher={escolher} />
			</li>
		{/each}
	</ul>
{/snippet}

<header class="topo">
	<p class="ola">Olá!</p>
	<h1>Qual o concurso dos seus sonhos?</h1>
	<p class="subtitulo">Vamos personalizar a inteligência do aplicativo para o seu objetivo.</p>
</header>

{#if salvo}
	<p class="continuar">
		<a href="/painel">Continuar com {salvo.nome}</a>
	</p>
{/if}

<CampoBusca bind:valor={termo} />

<p class="sr-only" aria-live="polite" aria-atomic="true">{anuncio}</p>

{#if semResultado}
	<div class="vazio">
		<EstadoVazio
			{termo}
			whatsapp={dados.config.whatsapp}
			onestudarPorDisciplina={() => goto('/ferramenta/estudo-por-disciplina')}
		/>
	</div>
{:else}
	{#if secoes.emAlta.length > 0}
		<section class="secao-alta" aria-labelledby="titulo-em-alta">
			<h2 id="titulo-em-alta" bind:this={tituloEmAlta}>
				Abertos em alta <span class="contagem">({secoes.emAlta.length})</span>
			</h2>
			{@render cartoes(emAltaVisiveis)}
			{#if !buscando && restantes > 0}
				{#if emAltaExpandida}
					<button type="button" class="ver" onclick={verMenos}>Ver menos</button>
				{:else}
					<button type="button" class="ver" onclick={() => (emAltaExpandida = true)}>
						Ver mais ({restantes})
					</button>
				{/if}
			{/if}
		</section>
	{/if}

	<SecaoRecolhivel
		titulo="Autorizados ou Previstos"
		contagem={secoes.previstos.length}
		bind:aberta={() => estaAberta('previstos'), (v) => definirAberta('previstos', v)}
	>
		{@render cartoes(secoes.previstos)}
	</SecaoRecolhivel>

	<SecaoRecolhivel
		titulo="Por Área"
		contagem={totalPorArea}
		bind:aberta={() => estaAberta('por-area'), (v) => definirAberta('por-area', v)}
	>
		{#each secoes.porArea as grupo (grupo.area)}
			<h3 class="area">{grupo.area}</h3>
			{@render cartoes(grupo.concursos)}
		{/each}
	</SecaoRecolhivel>

	<SecaoRecolhivel
		titulo="Encerrados"
		contagem={secoes.encerrados.length}
		bind:aberta={() => estaAberta('encerrados'), (v) => definirAberta('encerrados', v)}
	>
		{@render cartoes(secoes.encerrados)}
	</SecaoRecolhivel>
{/if}

<style>
	.topo {
		margin-bottom: var(--espaco);
	}

	.ola {
		margin: 0;
		color: var(--cor-texto-suave);
		font-weight: 600;
	}

	h1 {
		margin: 2px 0 6px;
		font-size: 1.5rem;
		line-height: 1.25;
	}

	.subtitulo {
		margin: 0;
		color: var(--cor-texto-suave);
	}

	.continuar {
		margin: 0 0 var(--espaco);
	}

	.continuar a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--cor-primaria);
		font-weight: 600;
		overflow-wrap: anywhere;
	}

	.vazio {
		margin-top: var(--espaco);
	}

	.secao-alta {
		margin-block: var(--espaco);
		scroll-margin-top: var(--espaco);
	}

	.secao-alta h2 {
		margin: 0;
		padding: 8px 4px;
		font-size: 1.0625rem;
		scroll-margin-top: var(--espaco);
	}

	.contagem {
		color: var(--cor-texto-suave);
		font-weight: 600;
	}

	.lista {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.area {
		margin: 8px 4px 0;
		font-size: 0.9375rem;
		color: var(--cor-texto-suave);
	}

	.ver {
		display: block;
		width: 100%;
		min-height: 48px;
		margin-top: 10px;
		border: 1px solid var(--cor-borda);
		border-radius: var(--raio);
		background: var(--cor-superficie);
		color: var(--cor-primaria);
		font-weight: 600;
		cursor: pointer;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}
</style>

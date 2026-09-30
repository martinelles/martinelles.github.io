<script lang="ts" module>
	import type { Sessao } from '$lib/feed/sessao.svelte';

	/**
	 * Sessões do feed por filtro e dia, enquanto a aba estiver aberta. Voltar a um filtro
	 * reaproveita a sessão (e os posts já na tela) em vez de criar outra: sessão nova pularia
	 * tudo o que a anterior já mostrou (FR-010) e a tela voltaria quase vazia.
	 */
	const sessoes = new Map<string, Sessao>();
</script>

<script lang="ts">
	// Feed de estudo (FR-002): stories no topo, posts em rolagem infinita, fim sem repetição.
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import BarraStories from '$lib/componentes/feed/BarraStories.svelte';
	import FimDoFeed from '$lib/componentes/feed/FimDoFeed.svelte';
	import Post from '$lib/componentes/feed/Post.svelte';
	import { hojeLocal } from '$lib/datas';
	import type { Repositorio } from '$lib/feed/conteudo';
	import { materiaVistaHoje, ordenarStories } from '$lib/feed/estatisticas';
	import { foco } from '$lib/feed/foco.svelte';
	import { interacoes } from '$lib/feed/interacoes.svelte';
	import { chaveFiltro, criarSessao } from '$lib/feed/sessao.svelte';
	import type { Filtro, Indice, Materia, Post as PostFeed, TipoPost as Tipo } from '$lib/feed/tipos';

	const repo = getContext<Repositorio>('repositorio');
	const dia = hojeLocal();

	const ROTULO_TIPO: Record<Tipo, string> = {
		questao: 'Questões',
		lei: 'Lei seca',
		resumo: 'Resumos',
		flashcard: 'Flashcards'
	};
	const ehTipo = (t: string | null): t is Tipo => t !== null && t in ROTULO_TIPO;

	// Índice e matérias: stories, anel "visto" e nome da matéria no cabeçalho de cada post.
	let materias = $state.raw<Materia[] | null>(null);
	let indice = $state.raw<Indice | null>(null);
	let falhaBase = $state(false);

	function carregarBase(): void {
		falhaBase = false;
		Promise.all([repo.materias(), repo.indice()]).then(
			([m, i]) => {
				materias = m;
				indice = i;
			},
			() => (falhaBase = true)
		);
	}
	carregarBase();

	const porId = $derived(new Map((materias ?? []).map((m) => [m.id, m])));

	const filtro = $derived.by((): Filtro => {
		const p = page.url.searchParams;
		const materia = p.get('materia') || undefined;
		const tipo = p.get('tipo');
		return { materia, tipo: ehTipo(tipo) ? tipo : undefined };
	});

	const sessao = $derived.by(() => {
		const chave = `${dia}|${chaveFiltro(filtro)}`;
		let s = sessoes.get(chave);
		if (!s) {
			s = criarSessao(repo, filtro, dia);
			sessoes.set(chave, s);
		}
		return s;
	});

	const stories = $derived(materias ? ordenarStories(materias, foco.disciplina) : []);
	const vistas = $derived.by(() => {
		if (!indice) return new Set<string>();
		const hoje = interacoes.vistosNoDia(dia);
		return new Set(stories.filter((m) => materiaVistaHoje(m.id, indice!, hoje)).map((m) => m.id));
	});

	const materiaFiltrada = $derived(filtro.materia ? (porId.get(filtro.materia) ?? null) : null);
	const titulo = $derived(
		[materiaFiltrada?.abrev, filtro.tipo && ROTULO_TIPO[filtro.tipo], 'Feed', 'Painel de Concurso']
			.filter(Boolean)
			.join(' · ')
	);

	function materiaDe(id: string): Materia {
		return porId.get(id) ?? { id, nome: id, abrev: id, ordem: 0, total: 0 };
	}

	function responder(post: PostFeed, r: string): void {
		if (post.tipo === 'questao') interacoes.responder(post.id, r, post.gabarito);
	}

	// Próxima página quando a sentinela (perto do fim) aparece. O observador é refeito a cada
	// página e a cada fim de carga: se a sentinela continua visível, a observação nova avisa de
	// novo. Com erro, espera o "Tentar de novo" em vez de insistir sozinho.
	let sentinela = $state<HTMLElement>();
	$effect(() => {
		const el = sentinela;
		const s = sessao;
		void s.posts.length;
		if (!el || s.carregando || s.fim || s.erro) return;
		const obs = new IntersectionObserver(
			([e]) => {
				if (e.isIntersecting) s.proximaPagina();
			},
			{ rootMargin: '0px 0px 1200px 0px' }
		);
		obs.observe(el);
		return () => obs.disconnect();
	});

	function tentarDeNovo(): void {
		if (falhaBase) carregarBase();
		sessao.proximaPagina();
	}
</script>

<svelte:head>
	<title>{titulo}</title>
</svelte:head>

<h1 class="so-leitor">Feed de estudo</h1>

<div class="feed">
	{#if materias}
		<BarraStories materias={stories} selecionada={filtro.materia ?? null} {vistas} />
	{:else}
		<div class="stories-esqueleto" aria-hidden="true">
			{#each { length: 5 } as _, i (i)}
				<span class="bolinha"></span>
			{/each}
		</div>
	{/if}

	{#if filtro.tipo}
		<p class="filtro-tipo">
			Só {ROTULO_TIPO[filtro.tipo].toLocaleLowerCase('pt-BR')}
			<a href={filtro.materia ? `/?materia=${encodeURIComponent(filtro.materia)}` : '/'}>Mostrar todos os tipos</a>
		</p>
	{/if}

	<div class="posts">
		{#each sessao.posts as post (post.id)}
			<div class="item" data-post-id={post.id} data-tipo={post.tipo}>
				<Post
					{post}
					materia={materiaDe(post.materia)}
					curtido={interacoes.curtido(post.id)}
					salvo={interacoes.salvo(post.id)}
					resposta={interacoes.resposta(post.id) ?? undefined}
					onCurtir={() => interacoes.alternarCurtida(post.id)}
					onSalvar={() => interacoes.alternarSalvo(post.id)}
					onResponder={(r) => responder(post, r)}
					onVisto={() => interacoes.marcarVisto(post.id, dia)}
				/>
			</div>
		{/each}

		{#if sessao.posts.length === 0 && !sessao.fim && !sessao.erro}
			<p class="so-leitor" role="status">Carregando posts…</p>
			{#each { length: 2 } as _, i (i)}
				<div class="esqueleto" aria-hidden="true">
					<span class="linha curta"></span>
					<span class="bloco"></span>
					<span class="linha"></span>
				</div>
			{/each}
		{/if}
	</div>

	{#if sessao.erro}
		<div class="erro" role="alert">
			<p>{sessao.erro}</p>
			<button type="button" onclick={tentarDeNovo} disabled={sessao.carregando}>Tentar de novo</button>
		</div>
	{:else if sessao.fim}
		<FimDoFeed materia={materiaFiltrada} />
	{:else if sessao.carregando && sessao.posts.length > 0}
		<p class="carregando" role="status">Carregando mais posts…</p>
	{/if}

	<div class="sentinela" bind:this={sentinela} aria-hidden="true"></div>
</div>

<style>
	.feed {
		max-width: 560px;
		margin: calc(-1 * var(--espaco)) auto 0;
	}

	/* Posts de ponta a ponta no celular: o post já tem o próprio recuo. */
	.posts {
		display: grid;
		margin: 0 calc(-1 * var(--espaco));
		border-top: 1px solid var(--cor-borda);
	}

	@media (min-width: 592px) {
		.posts {
			margin: 0;
			border: 1px solid var(--cor-borda);
			border-bottom: 0;
			border-radius: var(--raio) var(--raio) 0 0;
			overflow: hidden;
		}
	}

	.item {
		min-width: 0;
	}

	.filtro-tipo {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0 12px;
		margin: 0 0 8px;
		font-weight: 700;
	}

	.filtro-tipo a {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: var(--cor-primaria);
		font-weight: 600;
	}

	.stories-esqueleto {
		display: flex;
		gap: 12px;
		padding: 10px 0 36px;
		overflow: hidden;
	}

	.bolinha {
		flex-shrink: 0;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: var(--cor-borda);
	}

	.esqueleto {
		display: grid;
		gap: 14px;
		padding: 18px 16px;
		background: var(--cor-superficie);
		border-bottom: 1px solid var(--cor-borda);
	}

	.esqueleto span,
	.bolinha {
		animation: pulso 1.2s ease-in-out infinite alternate;
	}

	.linha {
		height: 14px;
		border-radius: 7px;
		background: var(--cor-borda);
	}

	.linha.curta {
		width: 45%;
	}

	.bloco {
		height: 220px;
		border-radius: 10px;
		background: var(--cor-borda);
	}

	@keyframes pulso {
		to {
			opacity: 0.45;
		}
	}

	.erro {
		display: grid;
		justify-items: center;
		gap: 8px;
		padding: 24px var(--espaco);
		text-align: center;
	}

	.erro p {
		margin: 0;
		color: var(--cor-texto-suave);
	}

	.erro button {
		min-height: 44px;
		padding: 0 20px;
		border: 0;
		border-radius: 999px;
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
		font-weight: 700;
		cursor: pointer;
	}

	.carregando {
		margin: 0;
		padding: 20px 0;
		text-align: center;
		color: var(--cor-texto-suave);
	}

	.sentinela {
		height: 1px;
	}
</style>

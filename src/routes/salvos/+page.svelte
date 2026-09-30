<script lang="ts">
	// Salvos (FR-012): do mais recente ao mais antigo, com as mesmas ações do feed.
	// A lista é tirada ao abrir a aba: tirar o marcador aqui não some com o post na hora,
	// para dar tempo de desfazer; ele sai na próxima visita.
	import { getContext, untrack } from 'svelte';
	import Icone from '$lib/componentes/Icone.svelte';
	import Post from '$lib/componentes/feed/Post.svelte';
	import { hojeLocal } from '$lib/datas';
	import type { Repositorio } from '$lib/feed/conteudo';
	import { interacoes } from '$lib/feed/interacoes.svelte';
	import type { Materia, Post as PostFeed } from '$lib/feed/tipos';

	const repo = getContext<Repositorio>('repositorio');
	const dia = hojeLocal();
	const ids = untrack(() => interacoes.salvosOrdenados());

	let posts = $state.raw<PostFeed[] | null>(null);
	let materias = $state.raw<Materia[]>([]);
	let falhou = $state(false);

	async function carregar(): Promise<void> {
		falhou = false;
		try {
			const [m, r] = await Promise.all([repo.materias(), repo.posts(ids)]);
			materias = m;
			// Id que sumiu do conteúdo não volta do repositório: fica fora da tela (contrato).
			posts = r.posts;
			falhou = r.falharam.length > 0;
		} catch {
			falhou = true;
		}
	}
	carregar();

	const porId = $derived(new Map(materias.map((m) => [m.id, m])));
	const materiaDe = (id: string): Materia => porId.get(id) ?? { id, nome: id, abrev: id, ordem: 0, total: 0 };

	function responder(post: PostFeed, r: string): void {
		if (post.tipo === 'questao') interacoes.responder(post.id, r, post.gabarito);
	}
</script>

<svelte:head>
	<title>Salvos · Painel de Concurso</title>
</svelte:head>

<div class="salvos">
	<h1>Salvos</h1>

	{#if ids.length === 0 || (posts !== null && posts.length === 0 && !falhou)}
		<div class="vazio">
			<span class="icone" aria-hidden="true"><Icone nome="marcador" tamanho={40} /></span>
			<p>Nada salvo ainda — toque no marcador de um post para guardar aqui.</p>
			<a href="/">Ir para o feed</a>
		</div>
	{:else}
		{#if posts === null && !falhou}
			<p class="carregando" role="status">Carregando salvos…</p>
		{/if}
		{#if posts && posts.length > 0}
			<div class="posts">
				{#each posts as post (post.id)}
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
			</div>
		{/if}
		{#if falhou}
			<div class="erro" role="alert">
				<p>Não foi possível carregar alguns salvos.</p>
				<button type="button" onclick={carregar}>Tentar de novo</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.salvos {
		max-width: 560px;
		margin: 0 auto;
	}

	h1 {
		margin: 0 0 12px;
		font-size: 1.375rem;
	}

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

	.vazio {
		display: grid;
		justify-items: center;
		gap: 8px;
		padding: 48px var(--espaco);
		text-align: center;
	}

	.vazio .icone {
		color: var(--cor-texto-suave);
	}

	.vazio p {
		margin: 0;
		max-width: 32ch;
		color: var(--cor-texto-suave);
	}

	.vazio a,
	.erro button {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		margin-top: 8px;
		padding: 0 20px;
		border: 0;
		border-radius: 999px;
		background: var(--cor-primaria);
		color: var(--cor-primaria-texto);
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
	}

	.carregando,
	.erro p {
		margin: 0;
		padding: 16px 0;
		text-align: center;
		color: var(--cor-texto-suave);
	}

	.erro {
		display: grid;
		justify-items: center;
		padding-bottom: 16px;
	}
</style>

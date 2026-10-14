<script lang="ts">
	import '../app.css';
	import { setContext, type Snippet } from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	import { page, updated } from '$app/state';
	import BarraAbas, { type Aba } from '$lib/componentes/feed/BarraAbas.svelte';
	import PopupEntrar from '$lib/componentes/feed/PopupEntrar.svelte';
	import { criarRepositorio } from '$lib/feed/conteudo';
	import { carregarFoco, garantirFoco } from '$lib/feed/foco.svelte';
	import { carregarInteracoes, interacoes } from '$lib/feed/interacoes.svelte';
	import { aplicar, tomarPendente } from '$lib/feed/pedidoLogin.svelte';
	import { carregarTema } from '$lib/tema.svelte';
	import { armazenamentoAtual, sincronizarAoAbrir } from '$lib/conta/sessao.svelte';
	import { carregarMarcas } from '$lib/missoes/marcas.svelte';

	let { children }: { children: Snippet } = $props();

	// Uma vez por aba: o layout raiz não é refeito ao navegar. O tema chega ao mesmo valor que o
	// script inline de app.html já pôs (sem piscar) e passa a seguir o aparelho e o seletor.
	carregarInteracoes(armazenamentoAtual());
	garantirFoco();
	carregarTema(armazenamentoAtual());
	carregarMarcas(armazenamentoAtual());
	// Logado: traz do servidor o que lá é mais novo e, se algo mudou, os stores leem de novo.
	void sincronizarAoAbrir(() => {
		const arm = armazenamentoAtual();
		carregarInteracoes(arm);
		carregarFoco(arm);
		carregarTema(arm);
		carregarMarcas(arm);
	}).then(() => {
		// Voltando do popup de login: a interação que o pediu entra depois da sincronização, para ser a mais nova.
		const p = tomarPendente();
		if (p) aplicar(p);
	});
	// Saiu versão nova (deploy) com o app aberto: a próxima navegação carrega a página inteira, para
	// não seguir com o código antigo (que, por exemplo, abria as Missões numa aba sem o menu).
	beforeNavigate(({ willUnload, to }) => {
		if (updated.current && !willUnload && to?.url) location.href = to.url.href;
	});

	// Um repositório por aba: feed, salvos e painel dividem o cache de índice e lotes
	// (as páginas leem com getContext('repositorio')).
	setContext('repositorio', criarRepositorio());

	const aba = $derived.by((): Aba => {
		const caminho = page.url.pathname;
		if (caminho.startsWith('/salvos')) return 'salvos';
		if (
			caminho.startsWith('/painel') ||
			caminho.startsWith('/entrar') ||
			caminho.startsWith('/ferramenta') ||
			caminho.startsWith('/artefato')
		)
			return 'painel';
		return 'feed';
	});

	// Borda "armazenamento indisponível": avisa uma vez; fechado, não volta nesta aba.
	let avisoFechado = $state(false);
</script>

{#if !interacoes.persistindo && !avisoFechado}
	<div class="aviso" role="status">
		<p>Seu progresso não está sendo salvo neste navegador.</p>
		<button type="button" onclick={() => (avisoFechado = true)}>Entendi</button>
	</div>
{/if}

<!-- Páginas de artefato ocupam a tela toda acima das abas: o iframe tem a própria coluna. -->
<main class="app" class:tela-cheia={page.url.pathname.startsWith('/artefato/')}>{@render children()}</main>

<BarraAbas atual={aba} />

<PopupEntrar />

<style>
	.app {
		max-width: 960px;
		margin: 0 auto;
		padding: var(--espaco);
		/* A barra de abas é fixa: o fim da página não pode ficar embaixo dela. */
		padding-bottom: calc(var(--espaco) + var(--altura-abas) + env(safe-area-inset-bottom));
		min-height: 100dvh;
	}

	.app.tela-cheia {
		max-width: none;
		padding: 0;
		min-height: 0;
	}

	.aviso {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0 12px;
		padding: 0 var(--espaco);
		background: var(--cor-aviso-fundo);
		color: var(--cor-aviso);
		font-size: 0.875rem;
		text-align: center;
	}

	.aviso p {
		margin: 0;
		padding: 8px 0;
	}

	.aviso button {
		min-height: 44px;
		padding: 0 12px;
		border: 0;
		background: none;
		color: inherit;
		font-weight: 700;
		text-decoration: underline;
		cursor: pointer;
	}
</style>

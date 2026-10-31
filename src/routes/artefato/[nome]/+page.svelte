<script lang="ts">
	// Missões, Prioridades e Raio-X dentro do app: a página do vault num iframe (mesma origem, então
	// mesmo armazenamento e mesmo login) e a barra de abas do layout por baixo, para voltar ao feed.
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { paginaDoArtefato, rotaDoArtefato, type NomeArtefato } from '$lib/artefatos/rotas';

	let { data }: { data: { nome: NomeArtefato } } = $props();

	const TITULOS: Record<NomeArtefato, string> = {
		missoes: 'Missões até a prova',
		prioridades: 'Prioridades do edital',
		raiox: 'Raio-X das questões'
	};
	const src = $derived(paginaDoArtefato(data.nome, page.url.hash));

	/**
	 * Os links entre as páginas abrem em aba nova (vêm assim do vault). Aqui, um clique num deles
	 * troca a rota do app, e a barra de abas continua embaixo. O "mapa ↗" dos subitens
	 * (`/mapa/<slug>`, visor do painel) passa pela mesma ponte.
	 */
	let iframe = $state<HTMLIFrameElement>();
	/** Documento que já tem a ponte anexada (ela fica na página, que pode recarregar). */
	let ponte: Document | null = null;

	function anexar(doc: Document | null) {
		if (!doc || doc === ponte) return;
		ponte = doc;
		doc.addEventListener(
			'click',
			(ev) => {
				const a = (ev.target as Element | null)?.closest?.('a[href]');
				const href = a?.getAttribute('href') ?? '';
				const rota = a
					? href.startsWith('/mapa/')
						? href
						: rotaDoArtefato(href)
					: null;
				if (!rota || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
				ev.preventDefault();
				void goto(rota);
			},
			true
		);
	}

	/**
	 * A ponte entra o mais cedo possível: o `load` do iframe só dispara no fim dos subrecursos,
	 * mas a página já aceita clique no `DOMContentLoaded` — um clique nessa brecha cairia no
	 * alvo do link (aba nova, ou o app inteiro dentro do iframe). O `requestAnimationFrame`
	 * prende o documento assim que ele sai de `loading`; o `onload` cobre o documento que vier
	 * depois (navegação interna do próprio iframe).
	 */
	function aoCarregar(e: Event) {
		anexar((e.currentTarget as HTMLIFrameElement).contentDocument);
	}

	$effect(() => {
		if (!iframe) return;
		let viva = true;
		const quadro = iframe;
		const ciclo = () => {
			if (!viva) return;
			let doc: Document | null = null;
			try {
				doc = quadro.contentDocument;
			} catch {
				doc = null; // outra origem: não há o que interceptar
			}
			anexar(doc);
			if (doc?.readyState !== 'complete') requestAnimationFrame(ciclo);
		};
		requestAnimationFrame(ciclo);
		return () => {
			viva = false;
		};
	});
</script>

<svelte:head>
	<title>{TITULOS[data.nome]} · Painel de Concurso</title>
</svelte:head>

<h1 class="so-leitor">{TITULOS[data.nome]}</h1>
{#key src}
	<iframe bind:this={iframe} {src} title={TITULOS[data.nome]} onload={aoCarregar}></iframe>
{/key}

<style>
	iframe {
		display: block;
		width: 100%;
		/* A tela toda acima da barra de abas; a página do vault rola por dentro. */
		height: calc(100dvh - var(--altura-abas) - env(safe-area-inset-bottom));
		border: 0;
	}
</style>

<script lang="ts">
	// Post do feed: cabeçalho da matéria, corpo por tipo e ações. Só props e callbacks;
	// quem grava curtidas, salvos, respostas e vistos é o motor (src/lib/feed).
	import type { Resposta } from '$lib/feed/interacoes.svelte';
	import type { Materia, Post } from '$lib/feed/tipos';
	import Icone from '$lib/componentes/Icone.svelte';
	import AcoesPost from './AcoesPost.svelte';
	import CorpoFlashcard from './CorpoFlashcard.svelte';
	import CorpoLei from './CorpoLei.svelte';
	import CorpoQuestao from './CorpoQuestao.svelte';
	import CorpoResumo from './CorpoResumo.svelte';
	import { corMateria, iniciais, rotuloTipo } from './apresentacao';

	let {
		post,
		materia,
		curtido,
		salvo,
		resposta,
		onCurtir,
		onSalvar,
		onResponder,
		onVisto
	}: {
		post: Post;
		materia: Materia;
		curtido: boolean;
		salvo: boolean;
		/** Resposta registrada da questão (só em `tipo: 'questao'`). */
		resposta?: Resposta;
		/** Alterna a curtida. O duplo toque só chama quando ainda não está curtido. */
		onCurtir: () => void;
		/** Alterna o salvo. */
		onSalvar: () => void;
		/** Resposta escolhida na questão ('C'/'E' ou 'A'–'E'). */
		onResponder: (r: string) => void;
		/** Post ficou ≥ 50% visível por ≥ 1 s; chamado uma vez por montagem. */
		onVisto?: () => void;
	} = $props();

	const uid = $props.id();
	const JANELA_DUPLO_TOQUE = 300;
	const TEMPO_VISTO = 1000;

	const naoConferido = $derived((post.tipo === 'resumo' || post.tipo === 'flashcard') && post.conferido === false);
	const fonte = $derived(post.tipo === 'resumo' || post.tipo === 'flashcard' ? post.fonte : undefined);
	// R9: em questão ainda não respondida, curtir só pelo coração.
	const duploToqueLiberado = $derived(post.tipo !== 'questao' || resposta !== undefined);

	let artigo = $state<HTMLElement>();
	let conteudo = $state<HTMLElement>();
	let coracao = $state(0); // incrementa a cada duplo toque: reinicia a animação

	function duploToque(): void {
		if (!curtido) onCurtir();
		coracao++;
	}

	// Duplo toque: pointerup de toque/caneta numa janela de 300 ms; dblclick para mouse.
	$effect(() => {
		const el = conteudo;
		if (!el) return;
		let ultimo = { t: -Infinity, x: 0, y: 0 };
		let disparouEm = -Infinity;
		const ignorar = (alvo: EventTarget | null) =>
			!duploToqueLiberado || (alvo instanceof Element && !!alvo.closest('a, summary, [data-sem-duplo-toque]'));

		const aoSoltar = (e: PointerEvent) => {
			if (e.pointerType === 'mouse' || ignorar(e.target)) return;
			const perto = Math.hypot(e.clientX - ultimo.x, e.clientY - ultimo.y) < 30;
			if (e.timeStamp - ultimo.t < JANELA_DUPLO_TOQUE && perto) {
				ultimo = { t: -Infinity, x: 0, y: 0 };
				disparouEm = e.timeStamp;
				duploToque();
			} else {
				ultimo = { t: e.timeStamp, x: e.clientX, y: e.clientY };
			}
		};
		const aoDuploClique = (e: MouseEvent) => {
			if (ignorar(e.target) || e.timeStamp - disparouEm < 500) return;
			duploToque();
		};
		el.addEventListener('pointerup', aoSoltar);
		el.addEventListener('dblclick', aoDuploClique);
		return () => {
			el.removeEventListener('pointerup', aoSoltar);
			el.removeEventListener('dblclick', aoDuploClique);
		};
	});

	// Visto: metade do post (ou metade da tela, se o post for mais alto que duas telas) por 1 s.
	// Depende só do elemento; `onVisto` é lido na hora de avisar (trocar a função não reinicia o relógio).
	$effect(() => {
		const el = artigo;
		if (!el || typeof IntersectionObserver === 'undefined') return;
		let relogio: ReturnType<typeof setTimeout> | undefined;
		const obs = new IntersectionObserver(
			([e]) => {
				const tela = e.rootBounds?.height ?? window.innerHeight;
				const visivel = e.isIntersecting && (e.intersectionRatio >= 0.5 || e.intersectionRect.height >= tela / 2);
				if (visivel && relogio === undefined) {
					relogio = setTimeout(() => {
						obs.disconnect();
						onVisto?.();
					}, TEMPO_VISTO);
				} else if (!visivel && relogio !== undefined) {
					clearTimeout(relogio);
					relogio = undefined;
				}
			},
			{ threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
		);
		obs.observe(el);
		return () => {
			obs.disconnect();
			clearTimeout(relogio);
		};
	});
</script>

<article class="post" aria-labelledby="{uid}-materia {uid}-tipo" style:--cor-materia={corMateria(materia.id)} bind:this={artigo}>
	<header class="cabecalho">
		<span class="avatar" aria-hidden="true">{iniciais(materia.abrev)}</span>
		<div class="identificacao">
			<h2 class="materia" id="{uid}-materia">{materia.nome}</h2>
			<p class="tipo" id="{uid}-tipo">{rotuloTipo(post)}</p>
		</div>
		{#if naoConferido}
			<span class="selo">gerado — a revisar</span>
		{/if}
	</header>

	<div class="conteudo" bind:this={conteudo}>
		{#if post.tipo === 'questao'}
			<CorpoQuestao {post} {resposta} {onResponder} />
		{:else if post.tipo === 'lei'}
			<CorpoLei {post} />
		{:else if post.tipo === 'resumo'}
			<CorpoResumo {post} />
		{:else}
			<CorpoFlashcard {post} />
		{/if}

		{#key coracao}
			{#if coracao > 0}
				<span class="coracao-grande" aria-hidden="true"><Icone nome="coracao-cheio" tamanho={96} /></span>
			{/if}
		{/key}
	</div>

	<AcoesPost {curtido} {salvo} {onCurtir} {onSalvar} {fonte} />
</article>

<style>
	.post {
		display: grid;
		gap: 14px;
		padding: 14px 16px 6px;
		background: var(--cor-superficie);
		border-left: 4px solid var(--cor-materia);
		border-bottom: 1px solid var(--cor-borda);
		content-visibility: auto;
		contain-intrinsic-size: auto 480px;
	}

	.cabecalho {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}

	.avatar {
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: var(--cor-materia);
		color: var(--cor-materia-texto);
		font-size: 0.875rem;
		font-weight: 800;
		letter-spacing: 0.02em;
	}

	.identificacao {
		flex: 1;
		min-width: 0;
	}

	.materia {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 700;
		line-height: 1.3;
		overflow-wrap: anywhere;
	}

	.tipo {
		margin: 0;
		font-size: 0.8125rem;
		line-height: 1.3;
		color: var(--cor-texto-suave);
		overflow-wrap: anywhere;
	}

	.selo {
		flex-shrink: 0;
		max-width: 8.5em;
		padding: 3px 8px;
		border-radius: 6px;
		background: var(--cor-aviso-fundo);
		color: var(--cor-aviso);
		font-size: 0.75rem;
		font-weight: 700;
		line-height: 1.25;
		text-align: center;
	}

	.conteudo {
		position: relative;
		min-width: 0;
		touch-action: manipulation;
	}

	.coracao-grande {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		pointer-events: none;
		color: var(--cor-curtida);
		opacity: 0;
		animation: coracao 0.8s ease-out;
	}

	.coracao-grande :global(svg) {
		filter: drop-shadow(0 2px 8px rgb(0 0 0 / 25%));
	}

	@keyframes coracao {
		0% {
			opacity: 0;
			transform: scale(0.4);
		}
		25% {
			opacity: 0.95;
			transform: scale(1.1);
		}
		45% {
			transform: scale(1);
		}
		80% {
			opacity: 0.95;
		}
		100% {
			opacity: 0;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.coracao-grande {
			display: none;
		}
	}
</style>

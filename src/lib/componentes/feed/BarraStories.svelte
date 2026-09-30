<script lang="ts">
	// Stories por matéria: links reais (/?materia=id), então o filtro funciona sem JS e com
	// o voltar do navegador. A ordem vem pronta do motor (foco logo depois de "Tudo").
	import Icone from '$lib/componentes/Icone.svelte';
	import type { Materia } from '$lib/feed/tipos';
	import { corMateria, iniciais } from './apresentacao';

	let {
		materias,
		selecionada = null,
		vistas
	}: {
		/** Já ordenadas (ver `ordenarStories`). */
		materias: readonly Materia[];
		/** Id da matéria filtrada; `null`/ausente = "Tudo". */
		selecionada?: string | null;
		/** Ids das matérias com tudo visto (anel cinza). */
		vistas: ReadonlySet<string>;
	} = $props();
</script>

<nav class="stories" aria-label="Matérias">
	<ul>
		<li>
			<a href="/" class="story" aria-current={selecionada ? undefined : 'true'}>
				<span class="anel tudo"><span class="miolo"><Icone nome="lista" tamanho={22} /></span></span>
				<span class="nome">Tudo</span>
			</a>
		</li>
		{#each materias as m (m.id)}
			{@const vista = vistas.has(m.id)}
			<li>
				<a
					href="/?materia={encodeURIComponent(m.id)}"
					class="story"
					class:vista
					aria-current={selecionada === m.id ? 'true' : undefined}
					style:--cor-materia={corMateria(m.id)}
				>
					<span class="anel"><span class="miolo" aria-hidden="true">{iniciais(m.abrev)}</span></span>
					<span class="nome">{m.abrev}</span>
					<span class="so-leitor">— {m.nome}{vista ? ', tudo visto' : ''}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.stories {
		margin: 0 calc(-1 * var(--espaco));
	}

	ul {
		display: flex;
		gap: 4px;
		margin: 0;
		padding: 8px var(--espaco) 10px;
		list-style: none;
		overflow-x: auto;
		scrollbar-width: none;
		overscroll-behavior-x: contain;
	}

	ul::-webkit-scrollbar {
		display: none;
	}

	.story {
		/* Contém o texto .so-leitor (absoluto) dentro da faixa rolável. */
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		width: 72px;
		padding: 2px 0;
		border-radius: 12px;
		color: var(--cor-texto);
		text-decoration: none;
	}

	.anel {
		width: 64px;
		height: 64px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		border: 3px solid var(--cor-materia, var(--cor-texto));
	}

	.story.vista .anel {
		border-width: 2px;
		border-color: var(--cor-visto);
	}

	.miolo {
		width: 52px;
		height: 52px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: var(--cor-materia, var(--cor-superficie));
		color: var(--cor-materia-texto);
		font-weight: 800;
		font-size: 1rem;
	}

	.tudo .miolo {
		background: var(--cor-superficie);
		color: var(--cor-texto);
		border: 1px solid var(--cor-borda);
	}

	.nome {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.75rem;
		line-height: 1.3;
	}

	/* Selecionado: nome em negrito e sublinhado grosso na cor da matéria (não só cor). */
	.story[aria-current='true'] .nome {
		font-weight: 800;
		text-decoration: underline 3px var(--cor-materia, var(--cor-texto));
		text-underline-offset: 4px;
	}
</style>

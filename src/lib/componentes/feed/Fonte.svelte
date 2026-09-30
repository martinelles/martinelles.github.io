<script lang="ts">
	// Fonte citada (C-004): rótulo, com link quando há URL externa.
	import type { Fonte } from '$lib/feed/tipos';

	let { fonte }: { fonte: Fonte } = $props();
</script>

{#if fonte.url}
	<a href={fonte.url} target="_blank" rel="noopener noreferrer">{fonte.rotulo}</a>
{:else}
	<cite>{fonte.rotulo}</cite>
{/if}

<style>
	a {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	cite {
		font-style: normal;
	}
</style>

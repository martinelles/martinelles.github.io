<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<main class="app">{@render children()}</main>

<style>
	.app {
		max-width: 960px;
		margin: 0 auto;
		padding: var(--espaco);
		padding-bottom: calc(var(--espaco) + env(safe-area-inset-bottom));
		min-height: 100dvh;
	}
</style>

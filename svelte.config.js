import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({ fallback: 'index.html' }),
		serviceWorker: { register: true },
		// Aba do app aberta há horas: confere a versão publicada para trocar na próxima navegação.
		version: { pollInterval: 60_000 }
	}
};

/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/**
 * Service worker nativo (research.md R2): pré-cache do app inteiro no install, navegação
 * network-first com fallback à casca do SPA no cache, ativos versionados cache-first.
 * Não intercepta outra origem (edital, WhatsApp) e não faz rastreamento, sync nem postMessage (C-003).
 */
import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `painel-concurso-${version}`;
// A casca do SPA é guardada sob '/'. '/index.html' não serve de chave: o `vite preview`
// responde 404 a ela, e um único 404 faz o addAll falhar e o SW inteiro não instalar.
const CASCA = '/';
const ATIVOS = [...new Set([...build, ...files])];

/**
 * A casca vem da raiz e pode trazer caminhos relativos à raiz (`./_app/...`,
 * `new URL(".", location)`): é assim que o `vite preview` a entrega. Servida offline em
 * `/ferramenta/x`, ela carregaria `/ferramenta/_app/...` e erraria a base do roteador.
 * Guardamos a versão com caminhos absolutos, que vale em qualquer profundidade. O
 * `build/index.html` do adapter-static já é absoluto; nele a troca não muda nada.
 */
function absolutizar(html: string): string {
	return html
		.replace(/new URL\("\.", location\)/g, 'new URL("/", location)')
		.replace(/(["'])\.\//g, '$1/');
}

async function guardarCasca(cache: Cache) {
	const resposta = await fetch(CASCA, { cache: 'no-cache' });
	if (!resposta.ok) throw new Error(`casca respondeu ${resposta.status}`);
	const html = absolutizar(await resposta.text());
	await cache.put(
		CASCA,
		new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })
	);
}

sw.addEventListener('install', (e) => {
	e.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			await cache.addAll(ATIVOS);
			await guardarCasca(cache);
			await sw.skipWaiting();
		})()
	);
});

sw.addEventListener('activate', (e) => {
	e.waitUntil(
		(async () => {
			for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
			await sw.clients.claim();
		})()
	);
});

sw.addEventListener('fetch', (e) => {
	const req = e.request;
	if (req.method !== 'GET') return;
	const url = new URL(req.url);
	if (url.origin !== sw.location.origin) return; // edital e WhatsApp são externos: não interceptar

	if (req.mode === 'navigate') {
		// SPA: online pega a versão nova da rede; offline toda navegação cai na casca.
		e.respondWith(
			fetch(req).catch(async () => (await caches.match(CASCA)) ?? Response.error())
		);
		return;
	}

	e.respondWith((async () => (await caches.match(req)) ?? fetch(req))());
});

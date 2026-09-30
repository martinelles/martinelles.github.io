/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/**
 * Service worker nativo. Pré-cache em duas fases (research.md R4):
 *
 * 1. `install` guarda só a casca — `build` + `files` fora de `/conteudo/` + `/` — com um
 *    `addAll`. Ela é o que precisa estar garantido: se faltar, o SW não instala.
 * 2. O conteúdo do feed (`/conteudo/*.json`, alguns MB) é gravado depois, arquivo por arquivo,
 *    cada um com seu `catch`: um lote que falha não derruba a instalação nem os outros lotes.
 *    O que faltou é tentado de novo no `activate` e a cada abertura do app (toda navegação que
 *    passa pelo SW). O gatilho escolhido é do próprio SW, e não uma mensagem da página: toda
 *    abertura do app é uma navegação, e o `FetchEvent.waitUntil` da navegação mantém o SW vivo
 *    até a gravação terminar sem atrasar a resposta. Nenhum código de página precisa saber
 *    do pré-cache.
 *
 * Navegação network-first com fallback à casca do SPA no cache; ativos versionados e conteúdo
 * cache-first. Não intercepta outra origem (edital, WhatsApp) e não faz rastreamento nem sync.
 */
import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `painel-concurso-${version}`;
// A casca do SPA é guardada sob '/'. '/index.html' não serve de chave: o `vite preview`
// responde 404 a ela, e um único 404 faz o addAll falhar e o SW inteiro não instalar.
const CASCA = '/';
const PREFIXO_CONTEUDO = '/conteudo/';
const TODOS = [...new Set([...build, ...files])];
const SHELL = TODOS.filter((f) => !f.startsWith(PREFIXO_CONTEUDO));
// Índice e matérias primeiro: sem eles o feed não abre.
const CONTEUDO = TODOS.filter((f) => f.startsWith(PREFIXO_CONTEUDO)).sort(
	(a, b) => Number(a.includes('/lote-')) - Number(b.includes('/lote-')) || a.localeCompare(b)
);

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

/**
 * Baixa um arquivo de conteúdo para o cache desta versão. Pedidos simultâneos do mesmo arquivo
 * (a fase 2 e a página pedindo o mesmo lote) dividem um único download.
 *
 * A fase 2 pede com `no-cache` (revalida no servidor em vez de gravar no cache da versão nova uma
 * cópia velha do cache HTTP). O pedido da página vai como a página o fez, com o cache HTTP
 * valendo como valeria sem SW: exigir revalidação ali atrasaria a visita seguinte, que pede os
 * mesmos lotes da primeira enquanto a fase 2 ainda desce.
 */
const emVoo = new Map<string, Promise<void>>();
function baixar(arquivo: string, pedido: Request = new Request(arquivo, { cache: 'no-cache' })): Promise<void> {
	let p = emVoo.get(arquivo);
	if (!p) {
		p = (async () => {
			const resposta = await fetch(pedido);
			if (!resposta.ok) throw new Error(`${arquivo} respondeu ${resposta.status}`);
			await (await caches.open(CACHE)).put(arquivo, resposta);
		})().finally(() => emVoo.delete(arquivo));
		emVoo.set(arquivo, p);
	}
	return p;
}

/**
 * Fase 2: grava, um por vez, cada arquivo de conteúdo que ainda não está no cache desta versão.
 * A falha de um arquivo não interrompe os outros; ele fica para a próxima chamada. Chamadas
 * concorrentes reaproveitam a mesma execução.
 */
let completando: Promise<void> | null = null;
function completarConteudo(): Promise<void> {
	completando ??= (async () => {
		try {
			const cache = await caches.open(CACHE);
			for (const arquivo of CONTEUDO) {
				try {
					if (!(await cache.match(arquivo))) await baixar(arquivo);
				} catch {
					// Rede fora ou erro HTTP: fica para o próximo activate ou abertura do app.
				}
			}
		} finally {
			completando = null;
		}
	})();
	return completando;
}

sw.addEventListener('install', (e) => {
	const casca = (async () => {
		const cache = await caches.open(CACHE);
		await cache.addAll(SHELL);
		await guardarCasca(cache);
		await sw.skipWaiting();
	})();
	e.waitUntil(casca);
	// Fase 2 fora do waitUntil: o conteúdo não segura nem derruba a instalação.
	casca.then(completarConteudo, () => {});
});

sw.addEventListener('activate', (e) => {
	e.waitUntil(
		(async () => {
			// Só há activate depois de um install bem-sucedido: a casca nova já está completa,
			// então as versões antigas podem sair.
			for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
			await sw.clients.claim();
		})()
	);
	// Retentativa sem segurar a ativação: a página já usa o SW enquanto os lotes descem.
	void completarConteudo();
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
		// Cada abertura do app completa o conteúdo que faltou, sem atrasar a resposta.
		e.waitUntil(completarConteudo());
		return;
	}

	if (url.pathname.startsWith(PREFIXO_CONTEUDO)) {
		// Conteúdo: cache-first; se faltar, baixa (dividindo o download com a fase 2, se ela já
		// estiver nele), grava e serve do cache. Se a gravação falhar, a página recebe a resposta da rede.
		e.respondWith(
			(async () => {
				const cache = await caches.open(CACHE);
				const guardada = await cache.match(url.pathname);
				if (guardada) return guardada;
				try {
					await baixar(url.pathname, req);
					const baixada = await cache.match(url.pathname);
					if (baixada) return baixada;
				} catch {
					// segue para a rede
				}
				return fetch(req);
			})()
		);
		return;
	}

	e.respondWith((async () => (await caches.match(req)) ?? fetch(req))());
});

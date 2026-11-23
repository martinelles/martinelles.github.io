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
 *    passa pelo SW). O gatilho é do próprio SW, e não uma mensagem da página: toda abertura do
 *    app é uma navegação, e o `FetchEvent.waitUntil` da navegação mantém o SW vivo até a
 *    gravação terminar sem atrasar a resposta. Nenhum código de página precisa saber do
 *    pré-cache. Exceção: MP3 de podcast não é pré-cacheado (são dezenas de MB); o handler de
 *    fetch grava no primeiro play, e offline vale o que já foi ouvido.
 *
 * Dois caches: a casca muda a cada build; o conteúdo não tem fingerprint nos nomes de arquivo,
 * então mora em cache próprio cujo nome deriva do `geradoEm` do `indice.json`. Deploy de código
 * sem conteúdo novo reutiliza o cache de conteúdo inteiro (nada é re-baixado); quando o
 * `geradoEm` muda, os arquivos da geração anterior são copiados para a geração nova e cada um é
 * revalidado (`no-cache` dá 304 para o que não mudou), mantendo o app offline durante a troca.
 *
 * Navegação network-first com fallback à casca do SPA no cache; ativos versionados e conteúdo
 * cache-first. Não intercepta outra origem (edital, WhatsApp) e não faz rastreamento nem sync.
 */
import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `painel-concurso-${version}`;
const PREFIXO_CACHE_CONTEUDO = 'painel-concurso-conteudo-';
// Chave de rede indisponível no preparo (sem índice não há `geradoEm`): o conteúdo desce para
// este cache e a migração o leva ao cache certo na geração seguinte.
const CACHE_SEM_INDICE = `${PREFIXO_CACHE_CONTEUDO}sem-indice`;
// A casca do SPA é guardada sob '/'. '/index.html' não serve de chave: o `vite preview`
// responde 404 a ela, e um único 404 faz o addAll falhar e o SW inteiro não instalar.
const CASCA = '/';
const PREFIXO_CONTEUDO = '/conteudo/';
const PREFIXO_ARTEFATOS = '/conteudo/artefatos/';
const PREFIXO_AUDIOS = '/conteudo/audios/';
const TODOS = [...new Set([...build, ...files])];
const SHELL = TODOS.filter((f) => !f.startsWith(PREFIXO_CONTEUDO));
// Índice e matérias primeiro: sem eles o feed não abre. MP3 de podcast fica fora do pré-cache
// (dezenas de MB por aparelho na instalação): o handler de fetch grava no primeiro play. Os
// infográficos WebP da mesma pasta continuam (poucos MB, e a página do podcast abre completa).
const ehMp3DeAula = (f: string) => f.startsWith(PREFIXO_AUDIOS) && f.endsWith('.mp3');
const CONTEUDO = TODOS.filter((f) => f.startsWith(PREFIXO_CONTEUDO) && !ehMp3DeAula(f)).sort(
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
 * Resolve o nome do cache de conteúdo desta geração. A rede manda: o `geradoEm` do índice no ar
 * muda só quando o importador gerou conteúdo novo. Sem rede, vale a chave da geração que já está
 * no aparelho; sem nenhuma das duas, um nome provisório (ver CACHE_SEM_INDICE).
 */
async function resolverChaveConteudo(): Promise<string> {
	try {
		const resposta = await fetch(`${PREFIXO_CONTEUDO}indice.json`, { cache: 'no-cache' });
		if (resposta.ok) {
			const geradoEm = (await resposta.json())?.geradoEm;
			if (typeof geradoEm === 'string' && geradoEm) return PREFIXO_CACHE_CONTEUDO + geradoEm;
		}
	} catch {
		// Offline no preparo: a chave da geração existente continua valendo.
	}
	const existente = (await caches.keys()).find((k) => k.startsWith(PREFIXO_CACHE_CONTEUDO));
	return existente ?? CACHE_SEM_INDICE;
}

let chaveConteudo = '';
let revalidarTudo = false;
let preparo: Promise<Cache> | null = null;
/** Caminhos que o build atual conhece: só eles migram e só eles ficam no cache de conteúdo.
 * Cobre também o MP3 (que existe no build, só não é pré-cacheado): quem já baixou não perde. */
const listaConteudo = new Set(TODOS.filter((f) => f.startsWith(PREFIXO_CONTEUDO)));
const caminhoDe = (req: Request) => new URL(req.url).pathname;

/**
 * Abre (criando, se for o caso) o cache de conteúdo da geração atual. Na primeira geração de uma
 * chave nova, herda os arquivos da geração anterior: o app segue offline enquanto a fase 2
 * revalida arquivo por arquivo. Só migram caminhos que o build atual lista: arquivo que saiu do
 * conteúdo (por exemplo, um PNG trocado por WebP) vira lixo, não herança. Chamadas concorrentes
 * dividem a mesma execução.
 */
function prepararConteudo(): Promise<Cache> {
	preparo ??= (async () => {
		chaveConteudo = await resolverChaveConteudo();
		const cache = await caches.open(chaveConteudo);
		const anteriores = (await caches.keys()).filter(
			(k) => k.startsWith(PREFIXO_CACHE_CONTEUDO) && k !== chaveConteudo
		);
		if (anteriores.length) {
			revalidarTudo = true;
			for (const nome of anteriores) {
				const anterior = await caches.open(nome);
				for (const req of await anterior.keys()) {
					const caminho = caminhoDe(req);
					if (!listaConteudo.has(caminho) || (await cache.match(caminho))) continue;
					const resposta = await anterior.match(caminho);
					if (resposta) await cache.put(caminho, resposta);
				}
			}
		}
		return cache;
	})();
	return preparo;
}

/**
 * Baixa um arquivo de conteúdo para o cache da geração atual. Pedidos simultâneos do mesmo
 * arquivo (a fase 2 e a página pedindo o mesmo lote) dividem um único download.
 *
 * Todo download para o cache pede `no-cache`: revalida no servidor (um 304 quando nada mudou)
 * em vez de gravar no cache uma cópia velha do cache HTTP. Até 2026-10-02 o pedido da página ia
 * com o cache HTTP valendo, e um `plano.json` anterior à emenda D4 ficou gravado como se fosse
 * o novo ("Plano de estudos inválido: minutosLeitura").
 */
const emVoo = new Map<string, Promise<void>>();
function baixar(arquivo: string): Promise<void> {
	const pedido = new Request(arquivo, { cache: 'no-cache' });
	let p = emVoo.get(arquivo);
	if (!p) {
		p = (async () => {
			const resposta = await fetch(pedido);
			if (!resposta.ok) throw new Error(`${arquivo} respondeu ${resposta.status}`);
			await (await prepararConteudo()).put(arquivo, resposta);
		})().finally(() => emVoo.delete(arquivo));
		emVoo.set(arquivo, p);
	}
	return p;
}

/**
 * Fase 2: grava, um por vez, cada arquivo de conteúdo que ainda não está no cache da geração.
 * A falha de um arquivo não interrompe os outros; ele fica para a próxima chamada. Chamadas
 * concorrentes reaproveitam a mesma execução. Depois de uma migração, a primeira passada
 * revalida também o que já está no cache (herdado da geração anterior); a bandeira só cai
 * quando a passada termina sem nenhuma falha, senão a próxima revalida de novo.
 */
let completando: Promise<void> | null = null;
function completarConteudo(): Promise<void> {
	completando ??= (async () => {
		try {
			const cache = await prepararConteudo();
			let falhou = false;
			for (const arquivo of CONTEUDO) {
				try {
					if (revalidarTudo || !(await cache.match(arquivo))) await baixar(arquivo);
				} catch {
					falhou = true;
					// Rede fora ou erro HTTP: fica para o próximo activate ou abertura do app.
				}
			}
			if (!falhou) revalidarTudo = false;
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
			// então as versões antigas podem sair. O cache de conteúdo da geração atual fica;
			// sem chave resolvida (rede fora no preparo), todo cache de conteúdo fica, senão o
			// app perde o offline por causa de um índice que não respondeu.
			const cache = await prepararConteudo();
			for (const k of await caches.keys()) {
				if (k === CACHE || k === chaveConteudo) continue;
				if (k.startsWith(PREFIXO_CACHE_CONTEUDO) && chaveConteudo === CACHE_SEM_INDICE) continue;
				await caches.delete(k);
			}
			// Órfãos do cache atual (arquivo que saiu do conteúdo, ex.: PNG trocado por WebP)
			// saem também; a chave não muda quando só a lista de arquivos muda.
			for (const req of await cache.keys()) {
				if (!listaConteudo.has(caminhoDe(req))) await cache.delete(req);
			}
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
	if (url.pathname.startsWith('/api/')) return; // progresso do login: sempre a rede, nunca o cache
	if (url.pathname === '/_app/version.json') return; // o app confere se saiu versão nova: sempre a rede

	if (req.mode === 'navigate') {
		// SPA: online pega a versão nova da rede; offline toda navegação cai na casca. Exceção: as
		// páginas de artefato (`/conteudo/artefatos/*.html`) não são o app; offline, a cópia delas
		// que a fase 2 guardou.
		const artefato = url.pathname.startsWith(PREFIXO_ARTEFATOS);
		e.respondWith(
			fetch(req).catch(
				async () =>
					(artefato ? await caches.match(url.pathname) : undefined) ??
					(await caches.match(CASCA)) ??
					Response.error()
			)
		);
		// Cada abertura do app completa o conteúdo que faltou, sem atrasar a resposta.
		e.waitUntil(completarConteudo());
		return;
	}

	if (url.pathname.startsWith(PREFIXO_CONTEUDO)) {
		// Conteúdo: cache-first; se faltar, baixa (dividindo o download com a fase 2, se ela já
		// estiver nele), grava e serve do cache. Se a gravação falhar, a página recebe a resposta da rede.
		// Pedido de recarga (`cache: 'reload'` ou `'no-cache'`, que o app usa quando um arquivo vem
		// inválido): ignora a cópia guardada, baixa de novo, troca e serve a nova.
		const recarga = req.cache === 'reload' || req.cache === 'no-cache';
		e.respondWith(
			(async () => {
				const cache = await prepararConteudo();
				const guardada = recarga ? undefined : await cache.match(url.pathname);
				if (guardada) return guardada;
				try {
					await baixar(url.pathname);
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

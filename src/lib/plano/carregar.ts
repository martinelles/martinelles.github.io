/**
 * Carga de `/conteudo/plano.json` no mesmo padrão do repositório do feed: busca uma vez só
 * (promessa compartilhada); falha sai do cache para ser tentada de novo na próxima chamada.
 */
import { BASE_CONTEUDO, fetchJson, type Buscar } from '$lib/feed/conteudo';
import { idTarefa } from './ids';
import type { BlocoTarefa, Plano } from './tipos';

export const URL_PLANO = `${BASE_CONTEUDO}plano.json`;

const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;
const BLOCOS: readonly BlocoTarefa[] = ['basicos', 'complementares', 'especificos'];

/** Promessa por URL: cada especialidade tem o seu arquivo de plano. */
const cache = new Map<string, Promise<Plano>>();

/** Confere o mínimo de que o motor depende; o schema completo é garantido pelo importador. */
export function validarPlano(bruto: unknown): Plano {
	const p = bruto as Partial<Plano> | null;
	const erro = (motivo: string) => new Error(`Plano de estudos inválido: ${motivo}`);
	if (!p || typeof p !== 'object') throw erro('não é um objeto');
	if (p.versao !== 1) throw erro(`versão ${String(p.versao)} (esperada 1)`);
	if (typeof p.inicio !== 'string' || !DIA_RE.test(p.inicio)) throw erro('inicio ausente ou fora de AAAA-MM-DD');
	if (typeof p.fim !== 'string' || !DIA_RE.test(p.fim)) throw erro('fim ausente ou fora de AAAA-MM-DD');
	if (p.inicio > p.fim) throw erro(`inicio ${p.inicio} depois de fim ${p.fim}`);
	if (typeof p.horasPorDia !== 'number' || !(p.horasPorDia > 0)) throw erro('horasPorDia deve ser > 0');
	if (!Number.isInteger(p.minutosLeitura) || (p.minutosLeitura as number) < 1) throw erro('minutosLeitura deve ser inteiro ≥ 1');
	if (!Number.isInteger(p.minutosQuestoes) || (p.minutosQuestoes as number) < 1) throw erro('minutosQuestoes deve ser inteiro ≥ 1');
	if (!Array.isArray(p.tarefas)) throw erro('tarefas não é uma lista');
	const vistos = new Set<string>();
	for (const t of p.tarefas) {
		// Emenda D4: id = `<topicoId>:L` (leitura) ou `<topicoId>:Q` (questões), bloco do edital.
		const ok =
			!!t &&
			typeof t.id === 'string' &&
			typeof t.topicoId === 'string' &&
			(t.modo === 'leitura' || t.modo === 'questoes') &&
			t.id === idTarefa(t.topicoId, t.modo) &&
			BLOCOS.includes(t.bloco) &&
			Number.isFinite(t.minutos) &&
			t.minutos >= 1;
		if (!ok) throw erro(`tarefa malformada: ${JSON.stringify(t)}`);
		if (vistos.has(t.id)) throw erro(`tarefa repetida: ${t.id}`);
		vistos.add(t.id);
	}
	return p as Plano;
}

/** Busca ignorando cópias guardadas: o service worker troca a dele pela do servidor. */
export async function fetchJsonRecarregando(url: string): Promise<unknown> {
	const resposta = await fetch(url, { cache: 'reload' });
	if (!resposta.ok) throw new Error(`HTTP ${resposta.status} em ${url}`);
	return resposta.json();
}

/**
 * Plano importado. Erro claro se a busca falhar ou o arquivo vier inválido.
 * Se vier inválido, tenta uma vez de novo sem cache: depois de uma importação nova, um service
 * worker antigo pode servir o `plano.json` anterior a um app que já espera o formato novo.
 * `url` escolhe o arquivo (`plano.json` é Ciência de Dados; `plano-auditoria.json`, Auditoria).
 */
export function carregarPlano(
	buscar: Buscar = fetchJson,
	recarregar: Buscar = fetchJsonRecarregando,
	url: string = URL_PLANO
): Promise<Plano> {
	const atual = cache.get(url);
	if (atual) return atual;
	const nova = (async () => {
		const falhaDeBusca = (e: unknown) =>
			new Error(
				`Não foi possível carregar o plano de estudos (${url}): ${e instanceof Error ? e.message : String(e)}`
			);
		let bruto: unknown;
		try {
			bruto = await buscar(url);
		} catch (e) {
			throw falhaDeBusca(e);
		}
		try {
			return validarPlano(bruto);
		} catch {
			try {
				bruto = await recarregar(url);
			} catch (e) {
				throw falhaDeBusca(e);
			}
			return validarPlano(bruto);
		}
	})();
	cache.set(url, nova);
	nova.catch(() => {
		if (cache.get(url) === nova) cache.delete(url);
	});
	return nova;
}

/** Esquece o plano em cache (testes; nova importação). */
export function esquecerPlano(): void {
	cache.clear();
}

/** Plano da especialidade escolhida em Ajustes. */
export function carregarPlanoDe(arquivo: string): Promise<Plano> {
	return carregarPlano(fetchJson, fetchJsonRecarregando, `${BASE_CONTEUDO}${arquivo}`);
}

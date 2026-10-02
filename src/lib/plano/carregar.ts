/**
 * Carga de `/conteudo/plano.json` no mesmo padrão do repositório do feed: busca uma vez só
 * (promessa compartilhada); falha sai do cache para ser tentada de novo na próxima chamada.
 */
import { BASE_CONTEUDO, fetchJson, type Buscar } from '$lib/feed/conteudo';
import { idTarefa } from './ids';
import type { BlocoTarefa, Plano } from './tipos';

export const URL_PLANO = `${BASE_CONTEUDO}plano.json`;

const DIA_RE = /^\d{4}-\d{2}-\d{2}$/;
const BLOCOS: readonly BlocoTarefa[] = ['basicos', 'especificos', 'especializados'];

let cache: Promise<Plano> | null = null;

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

/** Plano importado. Erro claro se a busca falhar ou o arquivo vier inválido. */
export function carregarPlano(buscar: Buscar = fetchJson): Promise<Plano> {
	if (cache) return cache;
	const nova = (async () => {
		let bruto: unknown;
		try {
			bruto = await buscar(URL_PLANO);
		} catch (e) {
			throw new Error(`Não foi possível carregar o plano de estudos (${URL_PLANO}): ${e instanceof Error ? e.message : String(e)}`);
		}
		return validarPlano(bruto);
	})();
	cache = nova;
	nova.catch(() => {
		if (cache === nova) cache = null;
	});
	return nova;
}

/** Esquece o plano em cache (testes; nova importação). */
export function esquecerPlano(): void {
	cache = null;
}

import { beforeEach, describe, expect, it } from 'vitest';
import { AVISO_FALHA_CARGA, criarSessao, esquecerMostrados, TAMANHO_PAGINA } from '$lib/feed/sessao.svelte';
import { criarRepositorio } from '$lib/feed/conteudo';
import { buscarSintetico, indiceSintetico, repoFalso } from './apoio';

const DIA = '2026-09-30';

async function rolarAteOFim(sessao: ReturnType<typeof criarSessao>, limite = 10_000) {
	let paginas = 0;
	while (!sessao.fim && paginas < limite) {
		await sessao.proximaPagina();
		paginas++;
	}
	return paginas;
}

beforeEach(() => esquecerMostrados());

describe('criarSessao', () => {
	it('95 posts: 10 páginas ⇒ 95 ids únicos e fim', async () => {
		const indice = indiceSintetico(95);
		const sessao = criarSessao(repoFalso(indice), {}, DIA);
		expect(sessao.posts).toEqual([]);
		expect(sessao.fim).toBe(false);
		for (let i = 0; i < 9; i++) {
			await sessao.proximaPagina();
			expect(sessao.posts).toHaveLength((i + 1) * TAMANHO_PAGINA);
			expect(sessao.fim).toBe(false);
		}
		await sessao.proximaPagina();
		const ids = sessao.posts.map((p) => p.id);
		expect(ids).toHaveLength(95);
		expect(new Set(ids).size).toBe(95);
		expect(sessao.fim).toBe(true);
		expect(sessao.carregando).toBe(false);
		expect(sessao.erro).toBeNull();

		await sessao.proximaPagina(); // fim não reinicia a ordem
		expect(sessao.posts).toHaveLength(95);
	});

	it('segue a ordem do dia', async () => {
		const indice = indiceSintetico(40);
		const sessao = criarSessao(repoFalso(indice), { tipo: 'questao' }, DIA);
		await rolarAteOFim(sessao);
		const { ordemDoDia } = await import('$lib/feed/ordem');
		expect(sessao.posts.map((p) => p.id)).toEqual(ordemDoDia(indice, { tipo: 'questao' }, DIA));
	});

	it('trocar de filtro e voltar não repete', async () => {
		const indice = indiceSintetico(95);
		const repo = repoFalso(indice);
		const a = criarSessao(repo, { materia: 'auditoria' }, DIA);
		await a.proximaPagina();
		await a.proximaPagina();
		const outro = criarSessao(repo, { tipo: 'lei' }, DIA);
		await outro.proximaPagina();
		const volta = criarSessao(repo, { materia: 'auditoria' }, DIA);
		await rolarAteOFim(volta);
		const todos = [...a.posts, ...volta.posts].map((p) => p.id);
		expect(new Set(todos).size).toBe(todos.length);
		expect(todos).toHaveLength(indice.posts.filter((e) => e.m === 'auditoria').length);
		// Filtro diferente tem seu próprio conjunto: pode mostrar posts que o outro filtro mostrou.
		expect(outro.posts).toHaveLength(TAMANHO_PAGINA);
	});

	it('páginas pedidas ao mesmo tempo não duplicam', async () => {
		const indice = indiceSintetico(95);
		const repo = repoFalso(indice);
		const sessao = criarSessao(repo, {}, DIA);
		const p1 = sessao.proximaPagina();
		expect(sessao.carregando).toBe(true);
		const p2 = sessao.proximaPagina();
		expect(p2).toBe(p1);
		await Promise.all([p1, p2, sessao.proximaPagina()]);
		expect(sessao.posts).toHaveLength(TAMANHO_PAGINA);
		expect(repo.pedidos).toHaveLength(1);
	});

	it('erro de lote não trava: avisa e tenta de novo na próxima página, sem repetir', async () => {
		const indice = indiceSintetico(95);
		let falhar = true;
		const repo = repoFalso(indice, (id) => falhar && Number(id.split(':p')[1]) % 2 === 0);
		const sessao = criarSessao(repo, {}, DIA);
		await sessao.proximaPagina();
		expect(sessao.erro).toBe(AVISO_FALHA_CARGA);
		const primeiros = sessao.posts.length;
		expect(primeiros).toBeGreaterThan(0);
		expect(primeiros).toBeLessThan(TAMANHO_PAGINA);
		const falhados = repo.pedidos[0].filter((id) => !sessao.posts.some((p) => p.id === id));

		falhar = false;
		await sessao.proximaPagina();
		expect(sessao.erro).toBeNull();
		expect(repo.pedidos[1].slice(0, falhados.length)).toEqual(falhados);
		await rolarAteOFim(sessao);
		const ids = sessao.posts.map((p) => p.id);
		expect(ids).toHaveLength(95);
		expect(new Set(ids).size).toBe(95);
	});

	it('página inteira falhando não marca fim e não perde posts', async () => {
		const indice = indiceSintetico(20);
		let falhar = true;
		const sessao = criarSessao(repoFalso(indice, () => falhar), {}, DIA);
		await sessao.proximaPagina();
		await sessao.proximaPagina();
		expect(sessao.posts).toEqual([]);
		expect(sessao.fim).toBe(false);
		expect(sessao.erro).toBe(AVISO_FALHA_CARGA);
		falhar = false;
		await rolarAteOFim(sessao);
		expect(new Set(sessao.posts.map((p) => p.id)).size).toBe(20);
	});

	it('falha do índice vira aviso e a próxima página tenta de novo', async () => {
		const indice = indiceSintetico(12);
		const { buscar, falhando } = buscarSintetico(indice);
		falhando.add('indice.json');
		const sessao = criarSessao(criarRepositorio(buscar), {}, DIA);
		await sessao.proximaPagina();
		expect(sessao.erro).toBe(AVISO_FALHA_CARGA);
		expect(sessao.carregando).toBe(false);
		falhando.clear();
		await rolarAteOFim(sessao);
		expect(sessao.posts).toHaveLength(12);
		expect(sessao.erro).toBeNull();
	});

	it('filtro sem nada: fim na primeira página, sem erro', async () => {
		const sessao = criarSessao(repoFalso(indiceSintetico(10)), { materia: 'nao-existe' }, DIA);
		await sessao.proximaPagina();
		expect(sessao.fim).toBe(true);
		expect(sessao.posts).toEqual([]);
		expect(sessao.erro).toBeNull();
	});

	it('SC-002: 3.000 ids, rolar até o fim com repositório real ⇒ zero repetição', async () => {
		const indice = indiceSintetico(3000);
		const { buscar } = buscarSintetico(indice);
		const sessao = criarSessao(criarRepositorio(buscar), {}, DIA);
		const paginas = await rolarAteOFim(sessao);
		const ids = sessao.posts.map((p) => p.id);
		expect(paginas).toBe(300);
		expect(ids).toHaveLength(3000);
		expect(new Set(ids).size).toBe(3000);
	});
});

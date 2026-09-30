import { describe, expect, it } from 'vitest';
import { criarRepositorio } from '$lib/feed/conteudo';
import { buscarSintetico, FIXTURES, indiceSintetico } from './apoio';

function buscarFixtures() {
	const chamadas: string[] = [];
	const buscar = async (url: string) => {
		chamadas.push(url);
		if (!(url in FIXTURES)) throw new Error(`404 ${url}`);
		return structuredClone(FIXTURES[url]);
	};
	return { buscar, chamadas };
}

describe('criarRepositorio', () => {
	it('índice e matérias são buscados uma vez e cacheados', async () => {
		const { buscar, chamadas } = buscarFixtures();
		const repo = criarRepositorio(buscar);
		const [a, b] = await Promise.all([repo.indice(), repo.indice()]);
		expect(a).toBe(b);
		expect(a.posts).toHaveLength(5);
		expect((await repo.materias()).map((m) => m.id)).toEqual(['ti-ciencia-de-dados', 'outros-ramos-do-direito', 'direito-penal']);
		await repo.materias();
		expect(chamadas.filter((u) => u.endsWith('indice.json'))).toHaveLength(1);
		expect(chamadas.filter((u) => u.endsWith('materias.json'))).toHaveLength(1);
	});

	it('devolve os posts na ordem pedida, entre lotes, ignorando id inexistente', async () => {
		const { buscar } = buscarFixtures();
		const repo = criarRepositorio(buscar);
		const ids = ['l:06-Lei-12527-2011-LAI:art-7', 'q:sumiu', 'f:ti-ciencia-de-dados--supervisionado:1', 'q:CGU2022-AFFC-TI-47'];
		const { posts, falharam } = await repo.posts(ids);
		expect(posts.map((p) => p.id)).toEqual([ids[0], ids[2], ids[3]]);
		expect(falharam).toEqual([]);
		const q = posts[2];
		expect(q.tipo === 'questao' && q.gabarito).toBe('C');
	});

	it('lote é buscado uma vez só, mesmo com chamadas concorrentes', async () => {
		const indice = indiceSintetico(60, ['ti-ciencia-de-dados']);
		const { buscar, chamadas } = buscarSintetico(indice);
		const repo = criarRepositorio(buscar);
		const ids = indice.posts.map((e) => e.id);
		await Promise.all([repo.posts(ids.slice(0, 10)), repo.posts(ids.slice(5, 20)), repo.posts(ids.slice(0, 3))]);
		await repo.posts(ids.slice(10, 20));
		expect(chamadas.get('/conteudo/lote-ti-ciencia-de-dados-1.json')).toBe(1);
		expect(chamadas.get('/conteudo/indice.json')).toBe(1);
		expect(chamadas.has('/conteudo/lote-ti-ciencia-de-dados-2.json')).toBe(false);
	});

	it('erro de rede rejeita só os posts do lote que falhou, e o lote é tentado de novo depois', async () => {
		const indice = indiceSintetico(60, ['ti-ciencia-de-dados']);
		const { buscar, chamadas, falhando } = buscarSintetico(indice);
		const repo = criarRepositorio(buscar);
		const ids = [indice.posts[0].id, indice.posts[30].id]; // lote 1 e lote 2
		falhando.add('lote-ti-ciencia-de-dados-2.json');
		const r1 = await repo.posts(ids);
		expect(r1.posts.map((p) => p.id)).toEqual([ids[0]]);
		expect(r1.falharam).toEqual([ids[1]]);

		falhando.clear();
		const r2 = await repo.posts(ids);
		expect(r2.posts.map((p) => p.id)).toEqual(ids);
		expect(r2.falharam).toEqual([]);
		expect(chamadas.get('/conteudo/lote-ti-ciencia-de-dados-2.json')).toBe(2);
		expect(chamadas.get('/conteudo/lote-ti-ciencia-de-dados-1.json')).toBe(1);
	});

	it('falha do índice rejeita e é tentada de novo na próxima chamada', async () => {
		const indice = indiceSintetico(4);
		const { buscar, falhando } = buscarSintetico(indice);
		const repo = criarRepositorio(buscar);
		falhando.add('indice.json');
		await expect(repo.indice()).rejects.toThrow('rede');
		falhando.clear();
		expect((await repo.indice()).posts).toHaveLength(4);
	});
});

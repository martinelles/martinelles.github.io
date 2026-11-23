import { beforeEach, describe, expect, it } from 'vitest';
import { audiosMissoes, carregarAudios, esquecerAudios } from '../../../src/lib/missoes/audios.svelte';

// O catálogo de podcasts (audios.json): falha de rede não pode virar "aula sem podcasts";
// o erro fica visível e a próxima chamada tenta de novo (a promessa rejeitada não fica memorizada).

const resposta = (corpo: unknown) =>
	({ ok: true, json: async () => corpo }) as unknown as Response;

describe('catálogo de podcasts', () => {
	beforeEach(esquecerAudios);

	it('falha de rede vira erro visível, não catálogo vazio', async () => {
		const buscar = (async () => {
			throw new Error('rede fora');
		}) as typeof fetch;
		await carregarAudios(buscar);
		expect(audiosMissoes.erro).toContain('Não foi possível carregar os podcasts');
		expect(audiosMissoes.erro).toContain('rede fora');
		expect(audiosMissoes.carregando).toBe(false);
		expect(audiosMissoes.daAula('id-1')).toBeNull();
	});

	it('HTTP de erro também vira erro visível', async () => {
		const buscar = (async () =>
			({ ok: false, status: 503, json: async () => ({}) }) as unknown as Response) as typeof fetch;
		await carregarAudios(buscar);
		expect(audiosMissoes.erro).toContain('HTTP 503');
	});

	it('depois do erro, a próxima chamada tenta de novo e limpa o erro', async () => {
		let falhar = true;
		const buscar = (async () => {
			if (falhar) throw new Error('rede fora');
			return resposta({ 'id-1': { audios: [{ titulo: 'Cap 1', arquivo: '/conteudo/audios/e1-2/a.mp3' }] } });
		}) as typeof fetch;
		await carregarAudios(buscar);
		expect(audiosMissoes.erro).not.toBe('');
		falhar = false;
		await carregarAudios(buscar);
		expect(audiosMissoes.erro).toBe('');
		expect(audiosMissoes.carregando).toBe(false);
		expect(audiosMissoes.daAula('id-1')?.audios).toHaveLength(1);
	});

	it('formato antigo (lista de audios) entra como { audios }', async () => {
		const buscar = (async () =>
			resposta({ 'id-1': [{ titulo: 'Cap 1', arquivo: '/conteudo/audios/e1-2/a.mp3' }] })) as typeof fetch;
		await carregarAudios(buscar);
		expect(audiosMissoes.daAula('id-1')?.audios).toHaveLength(1);
	});
});

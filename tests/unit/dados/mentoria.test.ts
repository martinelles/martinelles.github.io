import { describe, expect, it } from 'vitest';
import { aulaDaMentoria, aulaPorId, dados } from '$lib/dados';
import { validarDados } from '$lib/dados/validar';
import type { Dados } from '$lib/dados/tipos';

// Aulas da mentoria nos subitens (planos/2026-11-03 e 2026-11-08-catalogo-de-aulas-da-mentoria.md):
// o catálogo diz qual aula cobre cada subitem; sem aula, a queda é a playlist da disciplina.

const base = (): Dados => JSON.parse(JSON.stringify(dados));

const aulaDe = (chave: string) => dados.mentoria?.aulas?.find((a) => a.subitens.includes(chave));

describe('aulaDaMentoria', () => {
	it('subitem mapeado leva à aula que o cobre', () => {
		expect(aulaDe('C1-1.1')).toBeTruthy();
		expect(aulaDe('CD:E2-1.2')).toBeTruthy();
		expect(aulaDaMentoria('cd', 'C1 1.1')).toBe(aulaDe('C1-1.1')?.url);
		expect(aulaDaMentoria('cd', 'E2 1.2')).toBe(aulaDe('CD:E2-1.2')?.url);
	});

	it('subitem da P3 leva à aula do cargo certo, não à do outro', () => {
		expect(aulaDaMentoria('cd', 'E2 1.2')).toBe(aulaDe('CD:E2-1.2')?.url);
		expect(aulaDaMentoria('aud', 'E2 1.2')).toBe(aulaDe('AUD:E2-1.2')?.url);
	});

	it('subitem sem aula mapeada cai na playlist da disciplina', () => {
		// Itens das aulas ainda agendadas na plataforma na coleta (B1 8, AUD:E5 7): sem aula no
		// catálogo, o atalho segue para a playlist.
		expect(dados.mentoria?.aulas?.some((a) => a.subitens.includes('B1-8.1'))).toBe(false);
		expect(aulaDaMentoria('cd', 'B1 8.1')).toBe(dados.mentoria?.playlists['B1']);
		expect(aulaDaMentoria('aud', 'E5 7.1')).toBe(dados.mentoria?.playlists['AUD:E5']);
	});

	it('subitem de terceiro nível resolve pela aula do pai', () => {
		const pai = aulaDe('CD:E2-5.2');
		expect(pai).toBeTruthy();
		expect(aulaDaMentoria('cd', 'E2 5.2.9')).toBe(pai?.url);
	});

	it('as 22 playlists cobrem B1–C5 e as P3, e o catálogo tem as aulas coletadas', () => {
		expect(Object.keys(dados.mentoria?.playlists ?? {})).toHaveLength(22);
		expect(dados.mentoria?.aulas?.length).toBeGreaterThan(100);
	});
});

describe('aulaPorId', () => {
	it('devolve a aula pelo UUID e null para desconhecido', () => {
		const aula = dados.mentoria?.aulas?.[0];
		expect(aula).toBeTruthy();
		expect(aulaPorId(aula!.id)).toBe(aula);
		expect(aulaPorId('00000000-0000-4000-8000-000000000000')).toBeNull();
	});
});

describe('validarMentoria', () => {
	const mentoria = (m: unknown) => ({ ...base(), mentoria: m });

	it('chave fora do padrão e URL de outra origem são recusadas', () => {
		expect(() =>
			validarDados(
				mentoria({ curso: 'x', playlists: { B9: 'https://mentoria.plataformatutory.com.br/x', B1: 'https://outro.site/x' } })
			)
		).toThrow(/B9.*fora do padrão[\s\S]*playlists.B1.*plataforma da mentoria/);
	});

	it('aula torta é recusada em cada campo: id repetido, URL, TEC e subitem de outra disciplina', () => {
		const boa = dados.mentoria?.aulas?.[0];
		const torta = { ...boa!, url: 'https://outro.site/x', tec: 'https://qconcursos.com/x', subitens: ['C9-9.9'] };
		const validar = () => validarDados(mentoria({ ...base().mentoria!, aulas: [boa!, torta] }));
		expect(validar).toThrow(/aulas\[1\].url.*plataforma da mentoria/);
		expect(validar).toThrow(/aulas\[1\].tec.*TEC Concursos/);
		expect(validar).toThrow(/aulas\[1\].subitens.*não é subitem da disciplina/);
		expect(validar).toThrow(/aulas\[1\].id.*repetido/);
	});

	it('mentoria ausente continua válida (o campo é opcional como o config)', () => {
		const semMentoria = base();
		delete semMentoria.mentoria;
		expect(() => validarDados(semMentoria)).not.toThrow();
	});

	it('mentoria sem o catálogo de aulas continua válida (só playlists)', () => {
		const soPlaylists = base();
		delete (soPlaylists.mentoria as { aulas?: unknown }).aulas;
		expect(() => validarDados(soPlaylists)).not.toThrow();
	});
});

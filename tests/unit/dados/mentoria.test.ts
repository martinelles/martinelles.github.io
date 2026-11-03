import { describe, expect, it } from 'vitest';
import { aulaDaMentoria, dados } from '$lib/dados';
import { validarDados } from '$lib/dados/validar';
import type { Dados } from '$lib/dados/tipos';

// Aulas da mentoria nos subitens (planos/2026-11-03-aulas-da-mentoria-no-painel.md): a playlist
// é por disciplina do edital, e o arquivo de dados do app é quem sabe a URL de cada uma.

const base = (): Dados => JSON.parse(JSON.stringify(dados));

describe('aulaDaMentoria', () => {
	it('item de B/C leva à playlist da disciplina, nos dois cargos', () => {
		expect(aulaDaMentoria('cd', 'B1 8.2')).toBe(dados.mentoria?.playlists['B1']);
		expect(aulaDaMentoria('aud', 'C5 1.3')).toBe(dados.mentoria?.playlists['C5']);
	});

	it('item de E leva à playlist da P3 do cargo certo', () => {
		expect(aulaDaMentoria('cd', 'E2 1.2')).toBe(dados.mentoria?.playlists['CD:E2']);
		expect(aulaDaMentoria('aud', 'E2 1.2')).toBe(dados.mentoria?.playlists['AUD:E2']);
	});

	it('as 22 playlists do arquivo cobrem B1–C5 e as P3 que o painel usa', () => {
		expect(Object.keys(dados.mentoria?.playlists ?? {})).toHaveLength(22);
	});
});

describe('validarMentoria', () => {
	const mentoria = (playlists: Record<string, string>) => ({ ...base(), mentoria: { curso: 'x', playlists } });

	it('chave fora do padrão e URL de outra origem são recusadas', () => {
		expect(() =>
			validarDados(mentoria({ 'B9': 'https://mentoria.plataformatutory.com.br/x', 'B1': 'https://outro.site/x' }))
		).toThrow(/B9.*fora do padrão[\s\S]*playlists.B1.*plataforma da mentoria/);
	});

	it('mentoria ausente continua válida (o campo é opcional como o config)', () => {
		const semMentoria = base();
		delete semMentoria.mentoria;
		expect(() => validarDados(semMentoria)).not.toThrow();
	});
});

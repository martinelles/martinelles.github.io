import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { montarAudios, slugificar } from '../../../scripts/importar/audios.mjs';
import mentoria from '../../../src/lib/dados/mentoria.json' with { type: 'json' };

describe('importador dos podcasts', () => {
	const raiz = mkdtempSync(join(tmpdir(), 'painel-audios-'));
	afterAll(() => rmSync(raiz, { recursive: true, force: true }));

	it('slug sem acento nem espaço, e a extensão não duplica', () => {
		expect(slugificar('Podcast Cap 1 - Probabilidade')).toBe('podcast-cap-1-probabilidade');
	});

	it('copia os MP3 da pasta da aula e os lista em audios.json pelo id da aula', () => {
		const pasta = join(raiz, '01/P3. Conhecimentos Específicos/E1. Estatística, programação e analise de dados');
		mkdirSync(pasta, { recursive: true });
		// MP3 de verdade (2 s de tom): é o que o ffmpeg comprime. Sem ffmpeg na máquina, o texto
		// falso segue sem comprimir e com o aviso — as duas saídas estão cobertas.
		const gerado = spawnSync(
			'ffmpeg',
			['-y', '-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', '-b:a', '96k', join(pasta, 'Podcast Cap 1 - Probabilidade.mp3')]
		);
		if (gerado.status !== 0) writeFileSync(join(pasta, 'Podcast Cap 1 - Probabilidade.mp3'), 'audio');
		writeFileSync(join(pasta, 'Notas de leitura.pdf'), 'ignorado');
		const r = montarAudios(raiz, mentoria);
		if (gerado.status === 0) expect(r.avisos).toEqual([]);
		else expect(r.avisos[0]).toContain('ffmpeg não comprimiu');
		const id = (mentoria.aulas ?? []).find(
			(a) => (a.disciplina.split(':')[1] ?? a.disciplina) === 'E1' && a.titulo.startsWith('2.')
		)!.id;
		expect(r.indice[id]).toEqual([
			{
				titulo: 'Podcast Cap 1 - Probabilidade',
				arquivo: '/conteudo/audios/e1-2/podcast-cap-1-probabilidade.mp3'
			}
		]);
		// O MP3 segue como bytes, e o índice fecha a lista.
		expect(r.arquivos.map((a) => [a.arquivo, typeof a.conteudo])).toContainEqual([
			'audios/e1-2/podcast-cap-1-probabilidade.mp3',
			'object'
		]);
		expect(JSON.parse(String(r.arquivos.at(-1)!.conteudo))).toEqual(r.indice);
	});

	it('pasta ausente no vault: aviso e nada gerado', () => {
		const r = montarAudios(join(raiz, 'vazio'), mentoria);
		expect(r.avisos[0]).toContain('ausente no vault');
		expect(r.indice).toEqual({});
		expect(r.arquivos.map((a) => a.arquivo)).toEqual(['audios.json']);
	});
});

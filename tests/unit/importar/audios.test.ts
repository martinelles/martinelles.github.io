import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { montarAudios, slugificar } from '../../../scripts/importar/audios.mjs';
import mentoria from '../../../src/lib/dados/mentoria.json' with { type: 'json' };

describe('importador dos podcasts', () => {
	const raiz = mkdtempSync(join(tmpdir(), 'painel-audios-'));
	afterAll(() => rmSync(raiz, { recursive: true, force: true }));
	// Sem isso, o cache mmap do libvips segura os arquivos lidos e o afterAll falha com EPERM
	// no Windows depois de um metadata().
	sharp.cache(false);

	it('slug sem acento nem espaço, e a extensão não duplica', () => {
		expect(slugificar('Podcast Cap 1 - Probabilidade')).toBe('podcast-cap-1-probabilidade');
	});

	it('copia os MP3 da pasta da aula e os lista em audios.json pelo id da aula', async () => {
		const pasta = join(raiz, '01/P3. Conhecimentos Específicos/E1. Estatística, programação e analise de dados/NotebookLM/2. Probabilidade e inferência');
		mkdirSync(pasta, { recursive: true });
		// MP3 de verdade (2 s de tom): é o que o ffmpeg comprime. Sem ffmpeg na máquina, o texto
		// falso segue sem comprimir e com o aviso — as duas saídas estão cobertas.
		const gerado = spawnSync(
			'ffmpeg',
			['-y', '-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', '-b:a', '96k', join(pasta, 'Podcast Cap 1 - Probabilidade.mp3')]
		);
		if (gerado.status !== 0) writeFileSync(join(pasta, 'Podcast Cap 1 - Probabilidade.mp3'), 'audio');
		writeFileSync(join(pasta, 'Notas de leitura.pdf'), 'ignorado');
		// O infográfico do capítulo acompanha o podcast; o geral, sem "Cap", vira a capa.
		writeFileSync(
			join(pasta, 'Infografico Cap 1 - Probabilidade.png'),
			await sharp({ create: { width: 2000, height: 500, channels: 3, background: '#f00' } }).png().toBuffer()
		);
		writeFileSync(
			join(pasta, 'Infografico - Aula inteira.png'),
			await sharp({ create: { width: 900, height: 300, channels: 3, background: '#0f0' } }).png().toBuffer()
		);
		const r = await montarAudios(raiz, mentoria);
		if (gerado.status === 0) expect(r.avisos).toEqual([]);
		else expect(r.avisos[0]).toContain('ffmpeg não comprimiu');
		const id = (mentoria.aulas ?? []).find(
			(a) => (a.disciplina.split(':')[1] ?? a.disciplina) === 'E1' && a.titulo.startsWith('2.')
		)!.id;
		expect(r.indice[id]).toEqual({
			capa: '/conteudo/audios/e1-2/infografico-aula-inteira.webp',
			audios: [
				{
					titulo: 'Podcast Cap 1 - Probabilidade',
					arquivo: '/conteudo/audios/e1-2/podcast-cap-1-probabilidade.mp3',
					infografico: '/conteudo/audios/e1-2/infografico-cap-1-probabilidade.webp'
				}
			]
		});
		// O MP3 segue como bytes, e o índice fecha a lista.
		expect(r.arquivos.map((a) => [a.arquivo, typeof a.conteudo])).toContainEqual([
			'audios/e1-2/podcast-cap-1-probabilidade.mp3',
			'object'
		]);
		expect(JSON.parse(String(r.arquivos.at(-1)!.conteudo))).toEqual(r.indice);
		// O PNG vira WebP redimensionado para 1600px (o de 900px não é ampliado).
		const checados = join(raiz, 'checados');
		mkdirSync(checados, { recursive: true });
		for (const [nome, largura] of [
			['infografico-cap-1-probabilidade.webp', 1600],
			['infografico-aula-inteira.webp', 900]
		] as const) {
			const achado = r.arquivos.find((a) => a.arquivo === `audios/e1-2/${nome}`)!;
			const dados = achado.conteudo as Uint8Array;
			expect(Array.from(dados.slice(0, 4))).toEqual([0x52, 0x49, 0x46, 0x46]); // "RIFF"
			const arquivo = join(checados, nome);
			writeFileSync(arquivo, achado.conteudo);
			expect((await sharp(arquivo).metadata()).width).toBe(largura);
		}
	});

	it('PNG que o sharp não abre segue como está, com o aviso', async () => {
		const pasta = join(raiz, '01/P3. Conhecimentos Específicos/E1. Estatística, programação e analise de dados/NotebookLM/2. Probabilidade e inferência');
		writeFileSync(join(pasta, 'Infografico Cap 2 - Quebrado.png'), 'png de mentira');
		writeFileSync(join(pasta, 'Podcast Cap 2 - Quebrado.mp3'), 'audio');
		const r = await montarAudios(raiz, mentoria);
		expect(r.avisos.join('\n')).toContain('sharp não converteu Infografico Cap 2 - Quebrado.png');
		const quebrado = r.arquivos.find((a) => a.arquivo === 'audios/e1-2/infografico-cap-2-quebrado.png')!;
		expect(new TextDecoder().decode(quebrado.conteudo as Uint8Array)).toBe('png de mentira');
		expect(r.arquivos.map((a) => a.arquivo)).not.toContain('audios/e1-2/infografico-cap-2-quebrado.webp');
	});

	it('pasta ausente no vault: aviso e nada gerado', async () => {
		const r = await montarAudios(join(raiz, 'vazio'), mentoria);
		expect(r.avisos[0]).toContain('ausente no vault');
		expect(r.indice).toEqual({});
		expect(r.arquivos.map((a) => a.arquivo)).toEqual(['audios.json']);
	});
});

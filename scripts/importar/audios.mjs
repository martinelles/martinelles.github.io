/**
 * Podcasts e infográficos das aulas (vault → painel): da pasta NotebookLM da aula saem os MP3
 * (comprimidos em mono de 48 kbps) e os PNG "Infografico …", recriados em WebP de até 1600px de
 * largura, gravados em `static/conteudo/audios/<aula>/` e listados em `audios.json`, que a rota
 * /podcast/<aula> lê. O infográfico do capítulo (mesmo "Cap N") acompanha o podcast; o geral
 * (sem "Cap") é a capa. A pasta de cada aula é declarada em PODCASTS; sem ela no vault, só fica
 * o aviso.
 */
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { basename, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import sharp from 'sharp';

/** @typedef {{ id: string, disciplina: string, titulo: string }} AulaMentoria */

/** Onde estão os podcasts e infográficos de cada aula, relativo à raiz do vault. */
export const PODCASTS = [
	{
		aula: 'E1·2',
		pasta: '01/P3. Conhecimentos Específicos/E1. Estatística, programação e analise de dados/NotebookLM/2. Probabilidade e inferência'
	}
];

/** `Podcast Cap 1 - Probabilidade` → `podcast-cap-1-probabilidade`. */
export function slugificar(/** @type {string} */ s) {
	return s
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Recria o MP3 em mono de 48 kbps (é fala): cerca de metade do tamanho, no mesmo formato que
 * toca em qualquer aparelho. Sem ffmpeg (ou se ele recusar o arquivo), o original segue inteiro.
 * @param {string} caminho
 * @param {string[]} avisos
 * @returns {Uint8Array}
 */
function lerComprimido(caminho, avisos) {
	const pasta = mkdtempSync(join(tmpdir(), 'painel-audio-'));
	try {
		const destino = join(pasta, 'a.mp3');
		const r = spawnSync(
			'ffmpeg',
			['-y', '-v', 'error', '-i', caminho, '-ac', '1', '-ar', '44100', '-b:a', '48k', destino],
			{ encoding: 'utf8' }
		);
		if (r.status === 0) return readFileSync(destino);
		avisos.push(`audios: ffmpeg não comprimiu ${basename(caminho)}; o MP3 seguiu como está no vault`);
		return readFileSync(caminho);
	} finally {
		rmSync(pasta, { recursive: true, force: true });
	}
}

/** Recria o infográfico em WebP de largura até 1600px (na tela do painel ele aparece a ~400px e
 * abre em tamanho cheio em outra aba): o PNG do vault tem 5-6 MB, o WebP fica em poucas centenas
 * de KB. Sem sharp (ou se ele recusar o arquivo), o PNG segue como está.
 * @param {string} caminho
 * @param {string[]} avisos
 * @returns {Promise<{ conteudo: Uint8Array, ext: string }>}
 */
async function lerInfografico(caminho, avisos) {
	try {
		const conteudo = await sharp(caminho)
			.rotate()
			.resize({ width: 1600, withoutEnlargement: true })
			.webp({ quality: 85 })
			.toBuffer();
		return { conteudo, ext: '.webp' };
	} catch {
		avisos.push(`audios: sharp não converteu ${basename(caminho)}; o PNG seguiu como está no vault`);
		return { conteudo: readFileSync(caminho), ext: '.png' };
	}
}

/** Id da aula no catálogo da mentoria, pelo código (`E1·2` → UUID de "2. …" em CD:E1). */
function idDaAula(/** @type {{ aulas?: AulaMentoria[] }} */ mentoria, /** @type {string} */ cod) {
	const [disc, n] = cod.split('·');
	const aula = (mentoria.aulas ?? []).find(
		(/** @type {AulaMentoria} */ a) => (a.disciplina.split(':')[1] ?? a.disciplina) === disc && a.titulo.startsWith(`${n}.`)
	);
	if (!aula) throw new Error(`audios: aula ${cod} não está no catálogo da mentoria`);
	return aula.id;
}

/** O capítulo do nome (`Cap 3` → `'3'`); sem "Cap", null (é o infográfico geral da aula). */
const capDe = (/** @type {string} */ nome) => nome.match(/cap (\d+)/i)?.[1] ?? null;

/**
 * @param {string} vault raiz do vault
 * @param {{ aulas?: AulaMentoria[] }} mentoria catálogo do app
 * @returns {Promise<{ arquivos: { arquivo: string, conteudo: string | Uint8Array }[], indice: Record<string, { capa?: string, audios: { titulo: string, arquivo: string, infografico?: string }[] }>, avisos: string[] }>}
 */
export async function montarAudios(vault, mentoria) {
	/** @type {{ arquivo: string, conteudo: string | Uint8Array }[]} */
	const arquivos = [];
	/** @type {Record<string, { capa?: string, audios: { titulo: string, arquivo: string, infografico?: string }[] }>} */
	const indice = {};
	/** @type {string[]} */
	const avisos = [];
	for (const { aula, pasta } of PODCASTS) {
		const id = idDaAula(mentoria, aula);
		/** @type {string[]} */
		let nomes;
		try {
			nomes = readdirSync(join(vault, pasta)).sort();
		} catch {
			avisos.push(`audios: pasta da aula ${aula} ausente no vault (${pasta})`);
			continue;
		}
		const slugAula = slugificar(aula);
		const mp3s = nomes.filter((f) => /^podcast .+\.mp3$/i.test(f));
		if (!mp3s.length) {
			avisos.push(`audios: nenhum MP3 de "Podcast …" em ${pasta}`);
			continue;
		}
		// Infográficos por capítulo; o que não tem "Cap" vira a capa da aula.
		const porCap = new Map();
		for (const nome of nomes.filter((f) => /^infografico .+\.png$/i.test(f))) {
			const { conteudo, ext } = await lerInfografico(join(vault, pasta, nome), avisos);
			const destino = `audios/${slugAula}/${slugificar(nome.replace(/\.png$/i, ''))}${ext}`;
			arquivos.push({ arquivo: destino, conteudo });
			porCap.set(capDe(nome), `/conteudo/${destino}`);
		}
		indice[id] = {
			capa: porCap.get(null) ?? undefined,
			audios: mp3s.map((nome) => {
				const destino = `audios/${slugAula}/${slugificar(nome.replace(/\.mp3$/i, ''))}.mp3`;
				arquivos.push({ arquivo: destino, conteudo: lerComprimido(join(vault, pasta, nome), avisos) });
				return {
					titulo: nome.replace(/\.mp3$/i, ''),
					arquivo: `/conteudo/${destino}`,
					infografico: porCap.get(capDe(nome))
				};
			})
		};
	}
	arquivos.push({ arquivo: 'audios.json', conteudo: JSON.stringify(indice) });
	return { arquivos, indice, avisos };
}

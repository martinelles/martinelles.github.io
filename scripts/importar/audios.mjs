/**
 * Podcasts das aulas (vault → painel): os MP3 da pasta da disciplina são copiados para
 * `static/conteudo/audios/<aula>/` e listados em `audios.json`, que a rota /podcast/<aula> lê.
 * A pasta de cada aula é declarada em PODCASTS; sem ela no vault, só fica o aviso.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** @typedef {{ id: string, disciplina: string, titulo: string }} AulaMentoria */

/** Onde estão os podcasts de cada aula, relativo à raiz do vault. */
export const PODCASTS = [
	{
		aula: 'E1·2',
		pasta: '01/P3. Conhecimentos Específicos/E1. Estatística, programação e analise de dados'
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

/** Id da aula no catálogo da mentoria, pelo código (`E1·2` → UUID de "2. …" em CD:E1). */
function idDaAula(/** @type {{ aulas?: AulaMentoria[] }} */ mentoria, /** @type {string} */ cod) {
	const [disc, n] = cod.split('·');
	const aula = (mentoria.aulas ?? []).find(
		(/** @type {AulaMentoria} */ a) => (a.disciplina.split(':')[1] ?? a.disciplina) === disc && a.titulo.startsWith(`${n}.`)
	);
	if (!aula) throw new Error(`audios: aula ${cod} não está no catálogo da mentoria`);
	return aula.id;
}

/**
 * @param {string} vault raiz do vault
 * @param {{ aulas?: AulaMentoria[] }} mentoria catálogo do app
 * @returns {{ arquivos: { arquivo: string, conteudo: string | Uint8Array }[], indice: Record<string, { titulo: string, arquivo: string }[]>, avisos: string[] }}
 */
export function montarAudios(vault, mentoria) {
	/** @type {{ arquivo: string, conteudo: string | Uint8Array }[]} */
	const arquivos = [];
	/** @type {Record<string, { titulo: string, arquivo: string }[]>} */
	const indice = {};
	const avisos = [];
	for (const { aula, pasta } of PODCASTS) {
		const id = idDaAula(mentoria, aula);
		/** @type {string[]} */
		let nomes;
		try {
			nomes = readdirSync(join(vault, pasta)).filter((/** @type {string} */ f) => /^podcast .+\.mp3$/i.test(f)).sort();
		} catch {
			avisos.push(`audios: pasta dos podcasts de ${aula} ausente no vault (${pasta})`);
			continue;
		}
		if (!nomes.length) {
			avisos.push(`audios: nenhum MP3 de "Podcast …" em ${pasta}`);
			continue;
		}
		const slugAula = slugificar(aula);
		indice[id] = nomes.map((nome) => {
			const destino = `audios/${slugAula}/${slugificar(nome.replace(/\.mp3$/i, ''))}.mp3`;
			arquivos.push({ arquivo: destino, conteudo: readFileSync(join(vault, pasta, nome)) });
			return { titulo: nome.replace(/\.mp3$/i, ''), arquivo: `/conteudo/${destino}` };
		});
	}
	arquivos.push({ arquivo: 'audios.json', conteudo: JSON.stringify(indice) });
	return { arquivos, indice, avisos };
}

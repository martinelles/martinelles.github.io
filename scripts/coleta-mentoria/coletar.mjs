// Baixa os PDFs das aulas da mentoria direto do S3 (URL pública e determinística)
// e extrai: links do TEC Concursos (anotações /URI) e contagem aproximada de páginas.
// Uso: node coletar.mjs            (lê/escreve %TEMP%/mentoria-aulas.json)
import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inflateSync, inflateRawSync } from 'node:zlib';

const S3 = 'https://tutory-membros.s3.amazonaws.com/13483/materiais/aulas/';
const caminho = join(tmpdir(), 'mentoria-aulas.json');
const dados = JSON.parse(readFileSync(caminho, 'utf8'));
const RE = /https?:\/\/[^\s"<>\\()]*tecconcursos[^\s"<>\\()]*/gi;

const uuidDe = (url) => url.split('/').at(-1);

function analisar(latin) {
	const tecs = new Set(latin.match(RE) ?? []);
	const textos = [];
	const reStream = /stream\r?\n/g;
	let m;
	while ((m = reStream.exec(latin)) !== null) {
		const ini = m.index + m[0].length;
		const fim = latin.indexOf('endstream', ini);
		if (fim === -1) break;
		const pedaco = Buffer.from(latin.slice(ini, fim), 'latin1');
		for (const inflar of [inflateSync, inflateRawSync]) {
			try {
				textos.push(inflar(pedaco).toString('latin1'));
				break;
			} catch {
				/* stream não-flate: segue */
			}
		}
	}
	for (const t of textos) for (const u of t.match(RE) ?? []) tecs.add(u);
	const counts = [...latin.matchAll(/\/Count\s+(\d+)/g)].map((x) => Number(x[1]));
	return { tecs: [...tecs], paginas: counts.length ? Math.max(...counts) : null };
}

const pendentes = dados.aulas.filter((a) => a.url && !a.tecs);
let ok = 0;
let falhas = [];
for (const aula of pendentes) {
	const uuid = uuidDe(aula.url);
	try {
		const resp = await fetch(S3 + uuid);
		if (!resp.ok) throw new Error('HTTP ' + resp.status);
		const buf = Buffer.from(await resp.arrayBuffer());
		const latin = buf.toString('latin1');
		const r = analisar(latin);
		aula.tecs = r.tecs;
		aula.paginas = r.paginas;
		aula.bytes = buf.length;
		ok++;
		console.log(`${aula.disciplina} | ${aula.titulo} | ${r.paginas ?? '?'} pág | ${r.tecs.length} tec`);
	} catch (e) {
		falhas.push(`${aula.disciplina} ${aula.titulo}: ${e.message}`);
	}
	writeFileSync(caminho, JSON.stringify(dados, null, '\t'), 'utf8');
	await new Promise((r) => setTimeout(r, 250));
}
console.log(`\nExtraídos: ${ok}. Falhas: ${falhas.length}. Agendadas (sem URL): ${dados.aulas.filter((a) => !a.url).length}.`);
if (falhas.length) console.log(falhas.join('\n'));

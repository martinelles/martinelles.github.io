// Gera src/lib/dados/mentoria.json a partir do catálogo coletado (aulas.json).
// Uso: node gerar-mentoria.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const BASE = 'https://mentoria.plataformatutory.com.br';
const CURSO = 'd3ef2108-f695-41a3-bd84-8b95d35c60b3';
/** Ordem canônica das disciplinas do app. */
const ORDEM = [
	'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'C5',
	'CD:E1', 'CD:E2', 'CD:E3', 'CD:E4',
	'AUD:E1', 'AUD:E2', 'AUD:E3', 'AUD:E4', 'AUD:E5',
	'INFRA:E1', 'INFRA:E2', 'INFRA:E3', 'INFRA:E4'
];

const cat = JSON.parse(readFileSync('scripts/coleta-mentoria/aulas.json', 'utf8'));

// playlists: o UUID de cada playlist vem do catálogo (campo `playlist` das aulas); corrige o
// UUID de B4, truncado na coleta de 2026-11-03
const playlists = {};
for (const disc of ORDEM) {
	const aula = cat.aulas.find((a) => a.disciplina === disc);
	if (!aula?.playlist) throw new Error(`playlist não achada no catálogo: ${disc}`);
	playlists[disc] = `${BASE}/dash/cursos/${CURSO}/playlists/${aula.playlist}`;
}

// subitens: do mapeamento aprovado (regra aula N ↔ item N), recalculados aqui na hora
const VAULT = 'C:/Users/martinelle.santos/OneDrive - mtegovbr/00. vault/Estudo/cgu';
const ler = (f) => JSON.parse(readFileSync(`${VAULT}/catalogo-questoes/qconcursos/subitens/${f}`, 'utf8'));
const p12 = ler('p12.json');
const p3 = ler('p3.json');
const pE = ler('pE.json');
function subitensDaAula(aula) {
	const disc = aula.disciplina;
	if (disc.startsWith('INFRA:')) return []; // P3 de Infra fora do vault (deriva conhecida)
	const lista = disc.startsWith('AUD:') ? pE : disc.startsWith('CD:') ? p3 : p12;
	const sufixo = disc.split(':')[1] ?? disc;
	const m = /^(\d+)\./.exec(aula.titulo);
	if (!m) return [];
	const num = m[1];
	const prefixo = disc.includes(':') ? `${disc}-` : `${disc}-`;
	return lista
		.filter((s) => s.id.startsWith(`${sufixo}-`) && s.id.split('-')[1].startsWith(`${num}.`))
		.map((s) => prefixo + s.id.split('-')[1])
		.sort();
}

const aulas = [];
for (const disc of ORDEM) {
	const daDisc = cat.aulas
		.filter((a) => a.disciplina === disc && a.url && a.tecDetalhe)
		.sort((a, b) => numero(a.titulo) - numero(b.titulo));
	for (const a of daDisc) {
		const entrada = {
			id: a.url.split('/').at(-1),
			disciplina: disc,
			titulo: a.titulo,
			url: BASE + a.url
		};
		if (a.tecDetalhe.principal) entrada.tec = a.tecDetalhe.principal;
		if (a.tecDetalhe.extras.length) entrada.tecExtras = a.tecDetalhe.extras.map((e) => e.url);
		entrada.subitens = subitensDaAula(a);
		aulas.push(entrada);
	}
}
function numero(titulo) {
	return Number(/^(\d+)\./.exec(titulo)?.[1] ?? 99);
}

const saida = { curso: 'Resumo Completo - CGU (Pietro Viecili, Plataforma Tutory)', playlists, aulas };
writeFileSync('src/lib/dados/mentoria.json', JSON.stringify(saida, null, '\t') + '\n', 'utf8');
console.log(`gerado: src/lib/dados/mentoria.json | ${Object.keys(playlists).length} playlists | ${aulas.length} aulas`);

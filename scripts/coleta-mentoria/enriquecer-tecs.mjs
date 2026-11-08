// Reprocessa os PDFs com o pdf.js local e enriquece o catálogo: para cada aula, páginas
// exatas e cadernos do TEC na ordem, com rótulo ("Caderno do tópico, N questões" ou
// "Caderno extra k, N questões") e link. O primeiro "Caderno do tópico" é o principal.
// Aulas com caderno ficam; sem caderno reprocessam a cada execução (o professor adiciona
// aos poucos). Para reprocessar tudo (por exemplo, depois de mexer aqui), apague
// `tecDetalhe` das aulas em aulas.json.
// Requer pdfjs-dist fora do package.json: `npm install pdfjs-dist --no-save` antes de rodar.
// Uso: node enriquecer-tecs.mjs            (lê/escreve scripts/coleta-mentoria/aulas.json)
import { readFileSync, writeFileSync } from 'node:fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const cat = JSON.parse(readFileSync('scripts/coleta-mentoria/aulas.json', 'utf8'));
const S3 = 'https://tutory-membros.s3.amazonaws.com/13483/materiais/aulas/';

let feitas = 0;
let semCaderno = 0;
const falhas = [];
for (const aula of cat.aulas) {
	const d = aula.tecDetalhe;
	if (!aula.url || (d && (d.principal || d.extras.length))) continue;
	const uuid = aula.url.split('/').at(-1);
	try {
		const doc = await pdfjs.getDocument({ url: S3 + uuid, isEvalSupported: false }).promise;
		aula.paginas = doc.numPages;
		const cadernos = [];
		for (let n = 1; n <= doc.numPages; n++) {
			const page = await doc.getPage(n);
			const anots = (await page.getAnnotations())
				.filter((a) => /tecconcursos/i.test(a.url ?? a.unsafeUrl ?? ''))
				.sort((x, y) => y.rect[3] - x.rect[3]); // pelo topo do rect: ordem de leitura
			if (!anots.length) continue;
			const texto = await page.getTextContent();
			const linhas = new Map();
			for (const it of texto.items) {
				if (!('str' in it) || !it.str.trim()) continue;
				const y = Math.round(it.transform[5] / 3) * 3;
				linhas.set(y, (linhas.get(y) ?? '') + it.str);
			}
			// cabeçalhos "Caderno do tópico/extra N" com a contagem do próprio bloco (título +
			// linhas logo abaixo). O rect da âncora cobre a célula inteira da tabela, então o
			// pareamento confiável é por ordem: k-ésimo link ↔ k-ésimo cabeçalho da página.
			const ordenadas = [...linhas.entries()].sort((a, b) => b[0] - a[0]);
			const cabecalhos = [];
			for (const [y, t] of ordenadas) {
				const m = /Caderno (do tópico|extra \d+)/i.exec(t);
				if (!m) continue;
				const bloco = ordenadas
					.filter(([yy]) => yy <= y && yy > y - 16)
					.map(([, tt]) => tt)
					.join(' ');
				const mq = /(\d+)\s*quest/i.exec(bloco);
				cabecalhos.push({ y, rotulo: m[0], questoes: mq ? Number(mq[1]) : null });
			}
			const porOrdem = anots.length === cabecalhos.length;
			anots.forEach((a, idx) => {
				const url = a.url ?? a.unsafeUrl;
				const cab = porOrdem
					? cabecalhos[idx]
					: (cabecalhos.filter((c) => c.y >= a.rect[3] / 3 - 6).sort((p, q) => p.y - q.y)[0] ?? null);
				cadernos.push({ url, rotulo: cab?.rotulo ?? null, questoes: cab?.questoes ?? null });
			});
		}
		const principal = cadernos.find((c) => /do tópico/i.test(c.rotulo ?? '')) ?? cadernos[0] ?? null;
		aula.tecDetalhe = {
			principal: principal?.url ?? null,
			questoes: principal?.questoes ?? null,
			extras: cadernos
				.filter((c) => c !== principal)
				.map((c) => ({ url: c.url, rotulo: c.rotulo, questoes: c.questoes }))
		};
		if (!cadernos.length) semCaderno++;
		feitas++;
		console.log(`${aula.disciplina} | ${aula.titulo} | ${doc.numPages} pág | principal: ${principal?.url ?? '—'} (+${aula.tecDetalhe.extras.length} extras)`);
	} catch (e) {
		falhas.push(`${aula.disciplina} ${aula.titulo}: ${e.message}`);
	}
	writeFileSync('scripts/coleta-mentoria/aulas.json', JSON.stringify(cat, null, '\t'), 'utf8');
}
console.log(`\nProcessadas: ${feitas}. Sem caderno: ${semCaderno}. Falhas: ${falhas.length}`);
if (falhas.length) console.log(falhas.join('\n'));

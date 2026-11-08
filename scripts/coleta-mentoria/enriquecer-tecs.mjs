// Reprocessa os PDFs com o pdf.js local e enriquece o catálogo: para cada aula, páginas
// exatas e cadernos do TEC na ordem, com rótulo ("Caderno do tópico, N questões" ou
// "Caderno extra k, N questões") e link. O primeiro "Caderno do tópico" é o principal.
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
	if (!aula.url || aula.tecDetalhe) continue;
	const uuid = aula.url.split('/').at(-1);
	try {
		const doc = await pdfjs.getDocument({ url: S3 + uuid, isEvalSupported: false }).promise;
		aula.paginas = doc.numPages;
		const cadernos = [];
		for (let n = 1; n <= doc.numPages; n++) {
			const page = await doc.getPage(n);
			const anots = (await page.getAnnotations())
				.filter((a) => /tecconcursos/i.test(a.url ?? a.unsafeUrl ?? ''))
				.sort((x, y) => y.rect[1] - x.rect[1]);
			if (!anots.length) continue;
			const texto = await page.getTextContent();
			const linhas = new Map();
			for (const it of texto.items) {
				if (!('str' in it) || !it.str.trim()) continue;
				const y = Math.round(it.transform[5] / 3) * 3;
				linhas.set(y, (linhas.get(y) ?? '') + it.str);
			}
			const ordenadas = [...linhas.entries()].sort((a, b) => b[0] - a[0]).map(([, t]) => t);
			for (const a of anots) {
				const url = a.url ?? a.unsafeUrl;
				const yPdf = a.rect[1] / 3;
				const perto = ordenadas.filter(([y]) => Math.abs(y - yPdf) < 16).join(' ');
				const rotulo = /Caderno (do tópico|extra \d+)[^\d]*(\d+)?\s*quest/i.exec(
					ordenadas.join(' ').slice(0, 4000)
				);
				// rótulo pela linha vizinha à altura do link (a URL impressa está na linha do caderno)
				let rot = null;
				for (const [y, t] of [...linhas.entries()].sort((a, b) => b[0] - a[0])) {
					if (Math.abs(y - yPdf) < 30) {
						const m = /Caderno (do tópico|extra \d+)/i.exec(t);
						if (m) {
							rot = m[0];
							break;
						}
					}
				}
				const mQ = /(\d+)\s*quest/i.exec(
					[...linhas.entries()]
						.filter(([y]) => Math.abs(y - yPdf) < 40)
						.map(([, t]) => t)
						.join(' ')
				);
				cadernos.push({ url, rotulo: rot ?? rotulo?.[0] ?? null, questoes: mQ ? Number(mQ[1]) : null });
			}
		}
		// principal: o primeiro com rótulo "Caderno do tópico"; sem rótulo, o primeiro
		const principal = cadernos.find((c) => /do tópico/i.test(c.rotulo ?? '')) ?? cadernos[0] ?? null;
		aula.tecDetalhe = {
			principal: principal?.url ?? null,
			questoes: principal?.questoes ?? null,
			extras: cadernos.filter((c) => c !== principal).map((c) => ({ url: c.url, rotulo: c.rotulo, questoes: c.questoes }))
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

// Atualiza tudo que vem da mentoria e recompõe o painel, na ordem:
//   1. coletar.mjs         baixa os PDFs das aulas conhecidas (reprocessa as sem caderno TEC,
//                          que o professor adiciona aos poucos) e extrai os links
//   2. enriquecer-tecs.mjs reprocessa com pdf.js (páginas e cadernos rotulados)
//   3. gerar-mentoria.mjs  escreve src/lib/dados/mentoria.json
//   4. plano_aulas.py      regenera o plano das Missões por aula (vault, --oficial)
//   5. montar_artifacts.py regenera as páginas de artefatos (vault)
//   6. npm run importar    recompõe static/conteudo
// A descoberta de AULAS NOVAS (agendadas, recém-publicadas) não está aqui: as listas da
// plataforma exigem o navegador logado; peça a recoleta das playlists ao agente e depois rode
// este script. Requer pdfjs-dist fora do package.json: `npm install pdfjs-dist --no-save`.
// Uso: node scripts/coleta-mentoria/atualizar-mentoria.mjs [--sem-testes]
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const VAULT = 'C:/Users/martinelle.santos/OneDrive - mtegovbr/00. vault/Estudo/cgu';
const semTestes = process.argv.includes('--sem-testes');

const passos = [
	['coletar PDFs e links', ['node', 'scripts/coleta-mentoria/coletar.mjs']],
	['enriquecer com pdf.js', ['node', 'scripts/coleta-mentoria/enriquecer-tecs.mjs']],
	['gerar mentoria.json', ['node', 'scripts/coleta-mentoria/gerar-mentoria.mjs']],
	['regerar o plano (cd)', ['python', 'artifacts/missoes/plano_aulas.py', 'catalogo-questoes/qconcursos/subitens', 'ESTUDO.csv', 'cd', join(REPO, 'src/lib/dados/mentoria.json').replace(/\\/g, '/'), '--oficial'], VAULT],
	['regerar o plano (aud)', ['python', 'artifacts/missoes/plano_aulas.py', 'catalogo-questoes/qconcursos/subitens', 'ESTUDO.csv', 'aud', join(REPO, 'src/lib/dados/mentoria.json').replace(/\\/g, '/'), '--oficial'], VAULT],
	['montar artefatos', ['python', 'scripts/montar_artifacts.py'], VAULT],
	['importar conteúdo', ['npm', 'run', 'importar']]
];

if (!existsSync(join(REPO, 'node_modules/pdfjs-dist/package.json'))) {
	console.error('falta pdfjs-dist: rode `npm install pdfjs-dist --no-save` antes');
	process.exit(1);
}

for (const [nome, cmd, cwd] of passos) {
	console.log(`\n== ${nome} ==`);
	const r = spawnSync(cmd[0], cmd.slice(1), { cwd: cwd ?? REPO, stdio: 'inherit', shell: process.platform === 'win32' });
	if (r.status !== 0) {
		console.error(`falhou: ${nome}`);
		process.exit(1);
	}
}

if (!semTestes) {
	for (const cmd of [['npm', 'run', 'check'], ['npm', 'test']]) {
		const r = spawnSync(cmd[0], cmd.slice(1), { cwd: REPO, stdio: 'inherit', shell: process.platform === 'win32' });
		if (r.status !== 0) process.exit(1);
	}
}

// resumo do que mudou, para o commit
const aulas = JSON.parse(readFileSync(join(REPO, 'scripts/coleta-mentoria/aulas.json'), 'utf8')).aulas;
const comTec = aulas.filter((a) => a.tecDetalhe?.principal).length;
const semUrl = aulas.filter((a) => !a.url).length;
console.log(`\ncatálogo: ${comTec}/${aulas.length - semUrl} aulas liberadas com caderno; ${semUrl} agendadas (recoleta das listas é no navegador, logada).`);
console.log('falta revisar o diff (git diff static/conteudo src/lib/dados/mentoria.json) e commitar/pushar.');

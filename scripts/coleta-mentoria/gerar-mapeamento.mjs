// Gera a tabela de proposta de mapeamento aula × subitem (scripts/coleta-mentoria/mapeamento-proposta.md).
// Regra: a aula N da playlist cobre os subitens do item N da disciplina no edital.
import { readFileSync, writeFileSync } from 'node:fs';

const VAULT = 'C:/Users/martinelle.santos/OneDrive - mtegovbr/00. vault/Estudo/cgu';
const ler = (f) =>
	JSON.parse(readFileSync(`${VAULT}/catalogo-questoes/qconcursos/subitens/${f}`, 'utf8'));
const p12 = ler('p12.json');
const p3 = ler('p3.json');
const pE = ler('pE.json');
const todos = [...p12, ...p3, ...pE];
const cat = JSON.parse(readFileSync('scripts/coleta-mentoria/aulas.json', 'utf8'));

const subPor = (disc) => {
	const lista = disc.startsWith('AUD:') ? pE : disc.startsWith('CD:') ? p3 : p12;
	const sufixo = disc.includes(':') ? disc.split(':')[1] : disc;
	return lista.filter((x) => x.id.startsWith(`${sufixo}-`));
};
const PRIO = { alta: 3, 'média': 2, media: 2, baixa: 1 };
const txt = (id) => {
	const s = todos.find((x) => x.id === id);
	return s ? s.texto.replace(/\s+/g, ' ').slice(0, 90) : '';
};

let md = `# Mapeamento aula da mentoria × subitem do edital: proposta

Regra aplicada: a aula **N** da playlist cobre os subitens do **item N** da disciplina no
edital. Fecha 100% para B, C, CD e AUD (toda aula tem subitens, todo subitem tem aula).
Prioridade da aula = a maior entre seus subitens. TEC = nº de cadernos do TEC Concursos no
fim do PDF da aula (0 = a aula ainda não tem a seção). Infraestrutura fica sem mapeamento
enquanto a P3 de Infra não voltar ao vault.

`;

const grupos = [
	['Comum aos cargos (P1 e P2)', (d) => /^[BC]\d/.test(d)],
	['Cargo cd (P3 Ciência de Dados)', (d) => d.startsWith('CD:')],
	['Cargo aud (P3 Auditoria)', (d) => d.startsWith('AUD:')],
	['Infraestrutura (P3)', (d) => d.startsWith('INFRA:')]
];

for (const [titulo, filtro] of grupos) {
	const disciplinas = [...new Set(cat.aulas.filter((a) => filtro(a.disciplina)).map((a) => a.disciplina))];
	if (!disciplinas.length) continue;
	md += `## ${titulo}\n\n`;
	for (const disc of disciplinas) {
		md += `### ${disc}\n\n| Aula | Subitens | Prio | TEC | Confira (início do 1º subitem) |\n|---|---|---|---|---|\n`;
		for (const a of cat.aulas.filter((x) => x.disciplina === disc)) {
			const m = /^(\d+)\./.exec(a.titulo);
			const subs = m ? subPor(disc).filter((s) => s.id.split('-')[1].startsWith(`${m[1]}.`)) : [];
			const prio = subs.length
				? subs.reduce((p, s) => (PRIO[s.prio] > PRIO[p] ? s.prio : p), 'baixa')
				: '';
			md += `| ${a.titulo}${a.agendada ? ` *(libera ${a.agendada})*` : ''} | ${
				subs.map((s) => s.id.split('-')[1]).join(', ') || 'sem subitem'
			} | ${prio} | ${a.tecs?.length ?? 0} | ${subs[0] ? txt(subs[0].id) : ''} |\n`;
		}
		md += '\n';
	}
}

writeFileSync('scripts/coleta-mentoria/mapeamento-proposta.md', md, 'utf8');
console.log(`gerado: scripts/coleta-mentoria/mapeamento-proposta.md (${md.length} chars)`);

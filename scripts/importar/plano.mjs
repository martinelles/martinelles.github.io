/**
 * Plano de estudos (FR-001, C-004): `ESTUDO.csv` do vault → `static/conteudo/plano.json`
 * no formato de `contracts/plano.schema.json` (missão plano-de-estudos).
 *
 * Fila = tópicos com `status` ≠ `dominado` e `obs` sem prefixo `CORTADO`, ordenados por
 * `prioridade` desc (coluna derivada do gerador do vault) e, no empate, por `id` asc.
 * Emenda D4 (FR-013): cada tópico vira duas tarefas consecutivas, `<id>:L` (leitura,
 * `minutosLeitura`) e `<id>:Q` (questões, `minutosQuestoes`), ambas com o `bloco` da disciplina.
 * Parâmetros (janela e ritmo) vêm de `feed-conteudo/plano.md` (frontmatter `inicio`, `fim`,
 * `horas_por_dia`, `minutos_leitura`, `minutos_questoes`); chave ausente ⇒ padrão de D2/D4.
 * `minutos_por_tarefa` (pré-D4) é ignorada com aviso. Valor inválido é erro fatal: plano com
 * janela errada não deve ir para o app calado.
 */
import { lerCsv } from './csv.mjs';
import { lerFrontmatter } from './frontmatter.mjs';
import { materiaPorId } from './materias.mjs';
import { comparar } from './texto.mjs';

/**
 * As 13 disciplinas do `ESTUDO.csv` (nome exato) → id de matéria do feed (`materias.mjs`).
 * Desde 2026-10-09 o `ESTUDO.csv` segue o item 15 do Edital CGU nº 1/2026 (Cargo 2, Ciência
 * de Dados): a disciplina leva a prova na frente (`P1 · `, `P2 · `, `P3 · `). As matérias do
 * feed continuam as do catálogo de questões; cada bloco do edital aponta para a mais próxima.
 * Disciplina fora daqui vira `materia: null` com aviso no relatório.
 * @type {Record<string, string>}
 */
export const DISCIPLINA_PARA_MATERIA = {
	'P1 · Estado, Democracia, Direitos e Ciência Política': 'direito-constitucional',
	'P1 · Sociedade Brasileira, Desigualdades, Diversidade e Desenvolvimento': 'adm-publica-politicas-publicas-e-adm-geral',
	'P1 · Ética Pública e Responsabilidade Profissional': 'outros-ramos-do-direito',
	'P1 · Administração Pública e Fundamentos de Políticas Públicas': 'adm-publica-politicas-publicas-e-adm-geral',
	'P2 · Fundamentos de Governança, Riscos e Integridade Pública e Privada': 'cgu-correicao-integridade-e-leniencia',
	'P2 · Fundamentos de Transparência, Ouvidoria e Participação Social': 'ouvidoria-e-comunicacao-social',
	'P2 · Fundamentos de Direito Público Aplicado, Controle e Responsabilização': 'direito-administrativo',
	'P2 · Fundamentos de Evidências, Dados e Inteligência Artificial': 'raciocinio-critico-e-argumentacao',
	'P2 · Fundamentos de Auditoria Governamental e Atuação Integrada da CGU': 'fundamentos-de-auditoria-governamental',
	'P3 · Estatística, Programação e Análise de Dados': 'estatistica',
	'P3 · Engenharia, Arquitetura e Governança de Dados': 'ti-ciencia-de-dados',
	'P3 · Aprendizado de Máquina e Inteligência Artificial': 'ti-ciencia-de-dados',
	'P3 · Operação, Governança e Gestão de Soluções de Dados e IA': 'ti-governanca-gestao-e-contratacoes-de-ti'
};

for (const [disciplina, id] of Object.entries(DISCIPLINA_PARA_MATERIA)) {
	if (!materiaPorId(id)) throw new Error(`DISCIPLINA_PARA_MATERIA: "${disciplina}" aponta para matéria inexistente "${id}"`);
}

/**
 * Disciplina do `ESTUDO.csv` (nome exato) → prova objetiva do edital (item 7.1): P1
 * conhecimentos básicos, P2 complementares, P3 específicos. Disciplina fora daqui é erro
 * fatal: tarefa sem bloco não vai ao app.
 * @type {Record<string, 'basicos' | 'complementares' | 'especificos'>}
 */
export const DISCIPLINA_PARA_BLOCO = Object.fromEntries(
	Object.keys(DISCIPLINA_PARA_MATERIA).map((d) => [
		d,
		/** @type {const} */ ({ P1: 'basicos', P2: 'complementares', P3: 'especificos' })[
			/** @type {'P1' | 'P2' | 'P3'} */ (d.slice(0, 2))
		]
	])
);

/**
 * Padrão de D2 (horas, 2026-10-01) e D4 (minutos por modo, 2026-10-02). Janela desde
 * 2026-10-09: do dia do edital à véspera da prova (13/12/2026, Anexo I do Edital CGU 1/2026).
 */
export const PARAMETROS_PADRAO = Object.freeze({
	inicio: '2026-10-09',
	fim: '2026-12-12',
	horasPorDia: 3,
	minutosLeitura: 25,
	minutosQuestoes: 20
});

/** Chave do frontmatter → campo do plano. */
const CHAVES = /** @type {const} */ ({
	inicio: 'inicio',
	fim: 'fim',
	horas_por_dia: 'horasPorDia',
	minutos_leitura: 'minutosLeitura',
	minutos_questoes: 'minutosQuestoes'
});

/** Chaves que deixaram de existir: aviso específico, valor ignorado. */
const CHAVES_OBSOLETAS = /** @type {Record<string, string>} */ ({
	minutos_por_tarefa: 'deixou de existir na emenda D4 (use minutos_leitura e minutos_questoes)'
});

const STATUS_NA_FILA = new Set(['nao_iniciado', 'estudado', 'revisado', 'travado']);
const COLUNAS = ['id', 'disciplina', 'topico', 'status', 'obs', 'prioridade'];

/**
 * @typedef {{ inicio: string, fim: string, horasPorDia: number, minutosLeitura: number, minutosQuestoes: number }} Parametros
 * @typedef {'basicos' | 'complementares' | 'especificos'} Bloco
 * @typedef {{ id: string, topicoId: string, modo: 'leitura' | 'questoes', bloco: Bloco, disciplina: string,
 *   materia: string | null, topico: string, minutos: number, prioridade: number, status: string }} Tarefa
 * @typedef {Parametros & { versao: 1, geradoEm: string, tarefas: Tarefa[] }} Plano
 * @typedef {{
 *   tarefas: number,
 *   topicos: number,
 *   porBloco: Record<Bloco, number>,
 *   linhas: number,
 *   excluidas: { dominado: number, cortado: number },
 *   semMateria: string[],
 *   parametros: Parametros,
 *   origemParametros: Record<keyof Parametros, 'arquivo' | 'padrão'>,
 *   avisos: string[]
 * }} RelatorioPlano
 */

/** @param {string} v */
function dataReal(v) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
	const d = new Date(`${v}T00:00:00Z`);
	return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/**
 * Lê e valida os parâmetros do plano. `texto` = conteúdo de `feed-conteudo/plano.md`, ou
 * `null`/`undefined` quando o arquivo não existe (tudo no padrão).
 * @param {string | null | undefined} texto
 * @returns {{ parametros: Parametros, origem: RelatorioPlano['origemParametros'], avisos: string[] }}
 */
export function lerParametros(texto) {
	/** @type {Parametros} */
	const parametros = { ...PARAMETROS_PADRAO };
	/** @type {RelatorioPlano['origemParametros']} */
	const origem = { inicio: 'padrão', fim: 'padrão', horasPorDia: 'padrão', minutosLeitura: 'padrão', minutosQuestoes: 'padrão' };
	/** @type {string[]} */
	const avisos = [];
	if (texto == null) return { parametros, origem, avisos };

	const erro = (/** @type {string} */ msg) => new Error(`feed-conteudo/plano.md: ${msg}`);
	let dados;
	try {
		dados = lerFrontmatter(texto).dados;
	} catch (e) {
		throw erro(/** @type {Error} */ (e).message);
	}
	for (const [chave, valor] of Object.entries(dados)) {
		if (chave in CHAVES_OBSOLETAS) {
			avisos.push(`feed-conteudo/plano.md: chave "${chave}" ignorada: ${CHAVES_OBSOLETAS[chave]}`);
			continue;
		}
		if (!(chave in CHAVES)) {
			avisos.push(`feed-conteudo/plano.md: chave "${chave}" ignorada (aceitas: ${Object.keys(CHAVES).join(', ')})`);
			continue;
		}
		const campo = CHAVES[/** @type {keyof typeof CHAVES} */ (chave)];
		if (campo === 'inicio' || campo === 'fim') {
			if (typeof valor !== 'string' || !dataReal(valor))
				throw erro(`${chave} deve ser uma data real no formato AAAA-MM-DD (veio "${valor}")`);
			parametros[campo] = valor;
		} else if (campo === 'horasPorDia') {
			if (typeof valor !== 'number' || !(valor > 0)) throw erro(`${chave} deve ser um número maior que zero (veio "${valor}")`);
			parametros.horasPorDia = valor;
		} else {
			if (typeof valor !== 'number' || !Number.isInteger(valor) || valor < 1)
				throw erro(`${chave} deve ser um inteiro maior que zero (veio "${valor}")`);
			parametros[campo] = valor;
		}
		origem[campo] = 'arquivo';
	}
	if (parametros.inicio > parametros.fim)
		throw erro(`inicio (${parametros.inicio}) depois de fim (${parametros.fim})`);
	return { parametros, origem, avisos };
}

/**
 * @param {{ csvTexto: string, parametros?: string | null, mtime: number }} entrada
 *   `parametros` = texto de `feed-conteudo/plano.md` (ou ausente); `mtime` = mtime do `ESTUDO.csv` em ms.
 * @returns {{ plano: Plano, relatorio: RelatorioPlano }}
 */
export function importarPlano({ csvTexto, parametros: textoParametros, mtime }) {
	const { parametros, origem, avisos } = lerParametros(textoParametros);
	const linhas = /** @type {Record<string, string>[]} */ (lerCsv(csvTexto));
	if (linhas.length) {
		const faltam = COLUNAS.filter((c) => !(c in linhas[0]));
		if (faltam.length) throw new Error(`ESTUDO.csv sem coluna(s): ${faltam.join(', ')}`);
	}

	const excluidas = { dominado: 0, cortado: 0 };
	/** @type {Map<string, number>} */
	const semMapa = new Map();
	/** @type {string[]} */
	const semMateria = [];
	/** @type {Set<string>} */
	const vistos = new Set();
	/** @type {(Omit<Tarefa, 'topicoId' | 'modo' | 'minutos'>)[]} */
	const topicos = [];
	linhas.forEach((l, i) => {
		const onde = `ESTUDO.csv linha ${i + 2}`;
		const id = l.id.trim();
		if (!/^[A-Z]+-\d+$/.test(id)) throw new Error(`${onde}: id inválido "${l.id}"`);
		if (vistos.has(id)) throw new Error(`${onde}: id repetido ${id}`);
		vistos.add(id);
		const status = l.status.trim();
		if (status === 'dominado') return void excluidas.dominado++;
		if (l.obs.trim().startsWith('CORTADO')) return void excluidas.cortado++;
		if (!STATUS_NA_FILA.has(status)) throw new Error(`${onde} (${id}): status desconhecido "${l.status}"`);
		const topico = l.topico.trim();
		if (!topico) throw new Error(`${onde} (${id}): tópico vazio`);
		const prioridade = Number(l.prioridade.trim());
		if (l.prioridade.trim() === '' || !Number.isFinite(prioridade))
			throw new Error(`${onde} (${id}): prioridade não numérica "${l.prioridade}"`);
		const disciplina = l.disciplina.trim();
		const bloco = DISCIPLINA_PARA_BLOCO[disciplina];
		if (!bloco)
			throw new Error(`${onde} (${id}): disciplina "${disciplina}" sem bloco em DISCIPLINA_PARA_BLOCO (plano.mjs)`);
		const materia = DISCIPLINA_PARA_MATERIA[disciplina] ?? null;
		if (!materia) {
			semMapa.set(disciplina, (semMapa.get(disciplina) ?? 0) + 1);
			semMateria.push(id);
		}
		topicos.push({ id, bloco, disciplina, materia, topico, prioridade, status });
	});
	topicos.sort((a, b) => b.prioridade - a.prioridade || comparar(a.id, b.id));
	/** @type {Record<Bloco, number>} */
	const porBloco = { basicos: 0, complementares: 0, especificos: 0 };
	/** @type {Tarefa[]} */
	const tarefas = [];
	for (const { id, bloco, disciplina, materia, topico, prioridade, status } of topicos) {
		porBloco[bloco] += 2;
		const resto = { bloco, disciplina, materia, topico };
		tarefas.push(
			{ id: `${id}:L`, topicoId: id, modo: 'leitura', ...resto, minutos: parametros.minutosLeitura, prioridade, status },
			{ id: `${id}:Q`, topicoId: id, modo: 'questoes', ...resto, minutos: parametros.minutosQuestoes, prioridade, status }
		);
	}
	for (const [disciplina, n] of [...semMapa].sort((a, b) => comparar(a[0], b[0])))
		avisos.push(`plano: disciplina "${disciplina}" sem matéria em DISCIPLINA_PARA_MATERIA (plano.mjs); ${n} tópico(s) com materia null`);

	const geradoEm = new Date(Math.floor(mtime / 1000) * 1000).toISOString();
	return {
		plano: { versao: 1, geradoEm, ...parametros, tarefas },
		relatorio: { tarefas: tarefas.length, topicos: topicos.length, porBloco, linhas: linhas.length, excluidas, semMateria, parametros, origemParametros: origem, avisos }
	};
}

/**
 * JSON determinístico, uma tarefa por linha (diff legível).
 * @param {Plano} plano
 */
export function serializarPlano(plano) {
	const { tarefas, ...cabeca } = plano;
	const topo = JSON.stringify(cabeca).slice(0, -1);
	return `${topo},"tarefas":[\n${tarefas.map((t) => JSON.stringify(t)).join(',\n')}\n]}\n`;
}

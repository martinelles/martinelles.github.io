import { describe, expect, it } from 'vitest';
import { dados, buscarConcurso, buscarFerramenta, validarDados, type Dados } from '$lib/dados';

const HOJE = '2026-09-30';

/** Cópia profunda dos dados reais, válida, para quebrar uma regra de cada vez. */
const base = (): Dados => structuredClone(dados);
type Mutavel = any;

function falhaCom(mutar: (d: Mutavel) => void, ...trechos: string[]) {
	const d: Mutavel = base();
	mutar(d);
	let mensagem = '';
	try {
		validarDados(d);
	} catch (e) {
		mensagem = (e as Error).message;
	}
	expect(mensagem, 'validarDados deveria lançar').not.toBe('');
	for (const t of trechos) expect(mensagem).toContain(t);
	return mensagem;
}

describe('dados reais', () => {
	it('passam na validação e têm 12+ concursos e exatamente 12 ferramentas', () => {
		expect(() => validarDados(base())).not.toThrow();
		expect(dados.concursos.length).toBeGreaterThanOrEqual(12);
		expect(dados.ferramentas).toHaveLength(12);
		expect(dados.config).toEqual({ whatsapp: null, limiteEmAlta: 5 });
	});

	it('cobrem todas as seções da tela de escolha', () => {
		const passada = (c: { dataProva?: string }) => c.dataProva !== undefined && c.dataProva < HOJE;
		const abertosFuturos = dados.concursos.filter((c) => c.situacao === 'aberto' && !passada(c));
		const previstos = dados.concursos.filter((c) => c.situacao === 'previsto' && !passada(c));
		const encerrados = dados.concursos.filter((c) => c.situacao === 'encerrado' || passada(c));
		const abertoVencido = dados.concursos.filter((c) => c.situacao === 'aberto' && passada(c));

		expect(abertosFuturos.length).toBeGreaterThanOrEqual(6);
		expect(abertosFuturos.filter((c) => c.emAlta).length).toBeGreaterThanOrEqual(1);
		expect(abertosFuturos.length).toBeGreaterThan(dados.config.limiteEmAlta); // força "Ver mais"
		expect(previstos.length).toBeGreaterThanOrEqual(1);
		expect(encerrados.length).toBeGreaterThanOrEqual(1);
		expect(abertoVencido.length).toBeGreaterThanOrEqual(1);

		expect(dados.concursos.some((c) => c.cargos.length === 1)).toBe(true);
		expect(dados.concursos.some((c) => c.edital === undefined)).toBe(true);
		expect(dados.concursos.some((c) => c.vagas === undefined)).toBe(true);
		const areas = new Set(dados.concursos.map((c) => c.area));
		for (const a of ['Controle', 'Fiscal', 'Tribunais', 'Policial', 'Bancária']) expect(areas).toContain(a);
	});

	it('trazem os concursos obrigatórios', () => {
		const cgu = buscarConcurso('cgu-affc-ti');
		expect(cgu?.situacao).toBe('aberto');
		expect(cgu?.emAlta).toBe(true);
		expect(cgu?.cargos.map((c) => c.id)).toEqual(['auditor-ti', 'auditor-geral']);
		expect(cgu?.cargos[0].disciplinas).toHaveLength(9);
		const tcu = buscarConcurso('tcu-auditor');
		expect(tcu?.situacao).toBe('previsto');
		expect(tcu?.dataProva).toBeUndefined();
		expect(buscarConcurso(null)).toBeNull();
		expect(buscarConcurso('nao-existe')).toBeNull();
	});

	it('trazem as 12 ferramentas na ordem da spec', () => {
		expect(dados.ferramentas.map((f) => f.id)).toEqual([
			'aulas',
			'resumos',
			'mapas-mentais',
			'pdfs',
			'questoes-objetivas',
			'questoes-discursivas',
			'desafios-diarios',
			'flashcards',
			'simulados',
			'jurisprudencia',
			'estudo-por-disciplina',
			'plano-de-estudos'
		]);
		expect(buscarFerramenta('simulados')?.titulo).toBe('Simulados');
		expect(buscarFerramenta('nada')).toBeNull();
	});
});

describe('validarDados recusa dado malformado', () => {
	it('não-objeto na raiz', () => {
		expect(() => validarDados(null)).toThrow('dados: deveria ser objeto');
	});

	it('campo obrigatório ausente', () => {
		falhaCom((d) => delete d.concursos[2].banca, 'concursos[2].banca: campo obrigatório ausente');
	});

	it('tipo errado', () => {
		falhaCom((d) => (d.concursos[0].nome = 42), 'concursos[0].nome: deveria ser texto');
		falhaCom((d) => (d.concursos[0].emAlta = 'sim'), 'concursos[0].emAlta');
		falhaCom((d) => (d.concursos[0].vagas = 1.5), 'concursos[0].vagas: deveria ser inteiro');
		falhaCom((d) => (d.concursos[0].vagas = -1), 'concursos[0].vagas');
		falhaCom((d) => (d.config.limiteEmAlta = 0), 'config.limiteEmAlta');
		falhaCom((d) => (d.concursos[0].cargos = {}), 'concursos[0].cargos: deveria ser lista');
	});

	it('enum inválido', () => {
		falhaCom((d) => (d.concursos[1].situacao = 'suspenso'), 'concursos[1].situacao');
		falhaCom((d) => (d.concursos[1].cor = 'rosa'), 'concursos[1].cor');
		falhaCom((d) => (d.ferramentas[4].grupo = 'extra'), 'ferramentas[4].grupo');
	});

	it('id fora de kebab-case', () => {
		falhaCom((d) => (d.concursos[0].id = 'CGU_TI'), 'concursos[0].id');
		falhaCom((d) => (d.concursos[0].cargos[1].id = 'Auditor Geral'), 'concursos[0].cargos[1].id');
		falhaCom((d) => (d.ferramentas[0].id = 'aulas!'), 'ferramentas[0].id');
	});

	it('id de concurso repetido', () => {
		falhaCom((d) => (d.concursos[5].id = d.concursos[0].id), 'concursos[5].id: id "cgu-affc-ti" repetido');
	});

	it('id de cargo repetido dentro do concurso (mas igual entre concursos é permitido)', () => {
		falhaCom(
			(d) => (d.concursos[0].cargos[1].id = d.concursos[0].cargos[0].id),
			'concursos[0].cargos[1].id: id "auditor-ti" repetido'
		);
		const d: Mutavel = base();
		d.concursos[1].cargos[0].id = 'auditor-ti';
		expect(() => validarDados(d)).not.toThrow();
	});

	it('id de ferramenta repetido', () => {
		falhaCom((d) => (d.ferramentas[11].id = 'aulas'), 'ferramentas[11].id: id "aulas" repetido');
	});

	it('cargos vazio', () => {
		falhaCom((d) => (d.concursos[3].cargos = []), 'concursos[3].cargos: lista vazia');
	});

	it('disciplinas vazia', () => {
		falhaCom((d) => (d.concursos[3].cargos[0].disciplinas = []), 'concursos[3].cargos[0].disciplinas: lista vazia');
		falhaCom((d) => (d.concursos[3].cargos[0].disciplinas[1] = ''), 'concursos[3].cargos[0].disciplinas[1]');
	});

	it('dataProva fora do formato ou data inexistente', () => {
		falhaCom((d) => (d.concursos[0].dataProva = '13/12/2026'), 'concursos[0].dataProva');
		falhaCom((d) => (d.concursos[0].dataProva = '2026-02-30'), 'concursos[0].dataProva: "2026-02-30" não é data real');
		const d: Mutavel = base();
		d.concursos[0].dataProva = '2028-02-29';
		expect(() => validarDados(d)).not.toThrow();
	});

	it('edital e whatsapp sem https://', () => {
		falhaCom((d) => (d.concursos[0].edital = 'http://exemplo.org'), 'concursos[0].edital: deveria começar com https://');
		falhaCom((d) => (d.config.whatsapp = 'wa.me/5561'), 'config.whatsapp: deveria começar com https://');
		const d: Mutavel = base();
		d.config.whatsapp = 'https://wa.me/5561999999999';
		expect(() => validarDados(d)).not.toThrow();
	});

	it('ícone fora de ICONES', () => {
		falhaCom((d) => (d.concursos[0].icone = 'foguete'), 'concursos[0].icone: ícone "foguete" não existe');
		falhaCom((d) => (d.ferramentas[2].icone = 'foguete'), 'ferramentas[2].icone');
	});

	it('ferramentas diferente de 12', () => {
		falhaCom((d) => d.ferramentas.pop(), 'ferramentas: são 11; deveriam ser exatamente 12');
		falhaCom(
			(d) => d.ferramentas.push({ ...d.ferramentas[0], id: 'extra' }),
			'ferramentas: são 13; deveriam ser exatamente 12'
		);
	});

	it('menos de 12 concursos', () => {
		falhaCom((d) => (d.concursos = d.concursos.slice(0, 11)), 'concursos: são 11; o mínimo é 12');
	});

	it('campo desconhecido (erro de digitação)', () => {
		falhaCom((d) => (d.concursos[4].dataprova = '2026-12-01'), 'concursos[4].dataprova: campo desconhecido');
		falhaCom((d) => (d.concursos[4].cargos[0].disciplina = []), 'concursos[4].cargos[0].disciplina: campo desconhecido');
		falhaCom((d) => (d.ferramentas[0].cor = 'azul'), 'ferramentas[0].cor: campo desconhecido');
		falhaCom((d) => (d.config.tema = 'escuro'), 'config.tema: campo desconhecido');
		falhaCom((d) => (d.extra = true), 'dados.extra: campo desconhecido');
	});
});

describe('várias falhas juntas', () => {
	it('a mensagem lista todas, uma por linha', () => {
		const msg = falhaCom(
			(d) => {
				d.concursos[3].cargos[0].disciplinas = [];
				d.concursos[0].dataProva = '2026-02-30';
				d.ferramentas[1].icone = 'foguete';
				d.config.whatsapp = 'http://x';
			},
			'concursos[3].cargos[0].disciplinas: lista vazia',
			'concursos[0].dataProva',
			'ferramentas[1].icone',
			'config.whatsapp'
		);
		expect(msg).toContain('4 falha(s)');
		expect(msg.split('\n')).toHaveLength(5);
	});
});

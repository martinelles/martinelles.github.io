import { describe, expect, it } from 'vitest';
import { dados, buscarFerramenta, concursoCgu, rotaDaFerramenta, validarDados, type Dados } from '$lib/dados';

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
	it('passam na validação: um concurso e exatamente 12 ferramentas', () => {
		expect(() => validarDados(base())).not.toThrow();
		expect(dados.concursos).toHaveLength(1);
		expect(dados.ferramentas).toHaveLength(12);
		expect(dados.config).toEqual({ whatsapp: null, limiteEmAlta: 5 });
	});

	it('o concurso é o da CGU, sem data nem edital (FR-001, FR-014)', () => {
		expect(concursoCgu).toBe(dados.concursos[0]);
		expect(concursoCgu.id).toBe('cgu-affc-ti-cd');
		expect(concursoCgu.nome).toBe('CGU — Auditor Federal de Finanças e Controle');
		expect(concursoCgu.banca).toBe('Cebraspe');
		expect(concursoCgu.situacao).toBe('previsto');
		expect(concursoCgu.dataProva).toBeUndefined();
		expect(concursoCgu.edital).toBeUndefined();
		expect(concursoCgu.cargos.map((c) => c.nome)).toEqual(['TI — Ciência de Dados']);
	});

	it('trazem as 12 ferramentas na ordem da spec, com "Lei seca" no lugar de Jurisprudência', () => {
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
		expect(buscarFerramenta('jurisprudencia')?.titulo).toBe('Lei seca');
		expect(buscarFerramenta('nada')).toBeNull();
	});

	it('quatro atalhos abrem o feed filtrado por tipo; os demais vão para "em breve" (FR-015)', () => {
		const rotas = Object.fromEntries(dados.ferramentas.map((f) => [f.id, rotaDaFerramenta(f)]));
		expect(rotas['questoes-objetivas']).toBe('/?tipo=questao');
		expect(rotas.resumos).toBe('/?tipo=resumo');
		expect(rotas.flashcards).toBe('/?tipo=flashcard');
		expect(rotas.jurisprudencia).toBe('/?tipo=lei');
		const emBreve = dados.ferramentas.filter((f) => rotas[f.id].startsWith('/ferramenta/'));
		expect(emBreve).toHaveLength(8);
		for (const f of emBreve) expect(rotas[f.id]).toBe(`/ferramenta/${f.id}`);
	});
});

describe('validarDados recusa dado malformado', () => {
	it('não-objeto na raiz', () => {
		expect(() => validarDados(null)).toThrow('dados: deveria ser objeto');
	});

	it('campo obrigatório ausente', () => {
		falhaCom((d) => delete d.concursos[0].banca, 'concursos[0].banca: campo obrigatório ausente');
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
		falhaCom((d) => (d.concursos[0].situacao = 'suspenso'), 'concursos[0].situacao');
		falhaCom((d) => (d.concursos[0].cor = 'rosa'), 'concursos[0].cor');
		falhaCom((d) => (d.ferramentas[4].grupo = 'extra'), 'ferramentas[4].grupo');
	});

	it('id fora de kebab-case', () => {
		falhaCom((d) => (d.concursos[0].id = 'CGU_TI'), 'concursos[0].id');
		falhaCom((d) => (d.concursos[0].cargos[0].id = 'Auditor Geral'), 'concursos[0].cargos[0].id');
		falhaCom((d) => (d.ferramentas[0].id = 'aulas!'), 'ferramentas[0].id');
	});

	it('id de concurso repetido', () => {
		falhaCom(
			(d) => d.concursos.push({ ...d.concursos[0] }),
			'concursos[1].id: id "cgu-affc-ti-cd" repetido'
		);
	});

	it('id de cargo repetido dentro do concurso', () => {
		falhaCom(
			(d) => d.concursos[0].cargos.push({ ...d.concursos[0].cargos[0] }),
			'concursos[0].cargos[1].id: id "ti-ciencia-de-dados" repetido'
		);
	});

	it('id de ferramenta repetido', () => {
		falhaCom((d) => (d.ferramentas[11].id = 'aulas'), 'ferramentas[11].id: id "aulas" repetido');
	});

	it('cargos vazio', () => {
		falhaCom((d) => (d.concursos[0].cargos = []), 'concursos[0].cargos: lista vazia');
	});

	it('disciplinas vazia', () => {
		falhaCom((d) => (d.concursos[0].cargos[0].disciplinas = []), 'concursos[0].cargos[0].disciplinas: lista vazia');
		falhaCom((d) => (d.concursos[0].cargos[0].disciplinas[1] = ''), 'concursos[0].cargos[0].disciplinas[1]');
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

	it('concursos diferente de 1 (FR-001)', () => {
		falhaCom((d) => (d.concursos = []), 'concursos: lista vazia');
		falhaCom(
			(d) => d.concursos.push({ ...d.concursos[0], id: 'outro' }),
			'concursos: são 2; deveria ser exatamente 1'
		);
	});

	it('campo desconhecido (erro de digitação)', () => {
		falhaCom((d) => (d.concursos[0].dataprova = '2026-12-01'), 'concursos[0].dataprova: campo desconhecido');
		falhaCom((d) => (d.concursos[0].cargos[0].disciplina = []), 'concursos[0].cargos[0].disciplina: campo desconhecido');
		falhaCom((d) => (d.ferramentas[0].cor = 'azul'), 'ferramentas[0].cor: campo desconhecido');
		falhaCom((d) => (d.config.tema = 'escuro'), 'config.tema: campo desconhecido');
		falhaCom((d) => (d.extra = true), 'dados.extra: campo desconhecido');
	});
});

describe('várias falhas juntas', () => {
	it('a mensagem lista todas, uma por linha', () => {
		const msg = falhaCom(
			(d) => {
				d.concursos[0].cargos[0].disciplinas = [];
				d.concursos[0].dataProva = '2026-02-30';
				d.ferramentas[1].icone = 'foguete';
				d.config.whatsapp = 'http://x';
			},
			'concursos[0].cargos[0].disciplinas: lista vazia',
			'concursos[0].dataProva',
			'ferramentas[1].icone',
			'config.whatsapp'
		);
		expect(msg).toContain('4 falha(s)');
		expect(msg.split('\n')).toHaveLength(5);
	});
});

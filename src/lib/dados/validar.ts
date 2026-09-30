import { CORES, GRUPOS, ICONES, SITUACOES, type Dados } from './tipos';

/**
 * Validador escrito à mão (sem Ajv/Zod) que segue data-model.md e
 * contracts/dados-exemplo.schema.json. Junta todas as falhas e lança um único
 * Error, uma falha por linha, no formato `caminho: problema`.
 */

type Objeto = Record<string, unknown>;

const ID = /^[a-z0-9-]+$/;
const DATA = /^\d{4}-\d{2}-\d{2}$/;

const ehObjeto = (v: unknown): v is Objeto => typeof v === 'object' && v !== null && !Array.isArray(v);

function dataReal(s: string): boolean {
	if (!DATA.test(s)) return false;
	const [a, m, d] = s.split('-').map(Number);
	const dt = new Date(Date.UTC(a, m - 1, d));
	return dt.getUTCFullYear() === a && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

class Coletor {
	falhas: string[] = [];
	add(caminho: string, problema: string) {
		this.falhas.push(`${caminho}: ${problema}`);
	}

	/** Confere se é objeto, exige `obrigatorios` e recusa campos fora de `permitidos`. */
	objeto(v: unknown, caminho: string, obrigatorios: string[], opcionais: string[] = []): v is Objeto {
		if (!ehObjeto(v)) {
			this.add(caminho, 'deveria ser objeto');
			return false;
		}
		for (const k of obrigatorios) if (!(k in v)) this.add(`${caminho}.${k}`, 'campo obrigatório ausente');
		const permitidos = new Set([...obrigatorios, ...opcionais]);
		for (const k of Object.keys(v)) if (!permitidos.has(k)) this.add(`${caminho}.${k}`, 'campo desconhecido');
		return true;
	}

	texto(o: Objeto, k: string, caminho: string, { vazioOk = false } = {}): string | undefined {
		if (!(k in o)) return undefined;
		const v = o[k];
		if (typeof v !== 'string') this.add(`${caminho}.${k}`, 'deveria ser texto');
		else if (!vazioOk && v.trim() === '') this.add(`${caminho}.${k}`, 'texto vazio');
		else return v;
		return undefined;
	}

	id(o: Objeto, caminho: string): string | undefined {
		const v = this.texto(o, 'id', caminho);
		if (v !== undefined && !ID.test(v)) this.add(`${caminho}.id`, `"${v}" não é kebab-case (a-z, 0-9, -)`);
		return v;
	}

	umDe(o: Objeto, k: string, caminho: string, valores: readonly string[]) {
		if (!(k in o)) return;
		const v = o[k];
		if (typeof v !== 'string' || !valores.includes(v))
			this.add(`${caminho}.${k}`, `valor ${JSON.stringify(v)} inválido (use ${valores.join(', ')})`);
	}

	https(o: Objeto, k: string, caminho: string) {
		const v = this.texto(o, k, caminho);
		if (v !== undefined && !v.startsWith('https://')) this.add(`${caminho}.${k}`, 'deveria começar com https://');
	}

	icone(o: Objeto, caminho: string) {
		const v = this.texto(o, 'icone', caminho);
		if (v !== undefined && !(ICONES as readonly string[]).includes(v))
			this.add(`${caminho}.icone`, `ícone "${v}" não existe em ICONES`);
	}

	inteiro(o: Objeto, k: string, caminho: string, minimo: number) {
		if (!(k in o)) return;
		const v = o[k];
		if (typeof v !== 'number' || !Number.isInteger(v) || v < minimo)
			this.add(`${caminho}.${k}`, `deveria ser inteiro ≥ ${minimo}`);
	}

	/** `onde` é o caminho completo do campo (ex.: `concursos[0].cargos`). */
	lista(o: Objeto, k: string, onde: string): unknown[] | undefined {
		if (!(k in o)) return undefined;
		const v = o[k];
		if (!Array.isArray(v)) {
			this.add(onde, 'deveria ser lista');
			return undefined;
		}
		if (v.length === 0) this.add(onde, 'lista vazia');
		return v;
	}

	unico(ids: (string | undefined)[], caminho: (i: number) => string) {
		const vistos = new Set<string>();
		ids.forEach((id, i) => {
			if (id === undefined) return;
			if (vistos.has(id)) this.add(caminho(i), `id "${id}" repetido`);
			vistos.add(id);
		});
	}
}

function validarCargo(c: Coletor, v: unknown, caminho: string): string | undefined {
	if (!c.objeto(v, caminho, ['id', 'nome', 'disciplinas'])) return undefined;
	const id = c.id(v, caminho);
	c.texto(v, 'nome', caminho);
	const disciplinas = c.lista(v, 'disciplinas', `${caminho}.disciplinas`);
	disciplinas?.forEach((d, i) => {
		if (typeof d !== 'string' || d.trim() === '') c.add(`${caminho}.disciplinas[${i}]`, 'deveria ser texto não vazio');
	});
	return id;
}

function validarConcurso(c: Coletor, v: unknown, caminho: string): string | undefined {
	const obrigatorios = ['id', 'nome', 'orgao', 'banca', 'area', 'situacao', 'icone', 'cor', 'cargos'];
	const opcionais = ['emAlta', 'vagas', 'salario', 'dataProva', 'edital'];
	if (!c.objeto(v, caminho, obrigatorios, opcionais)) return undefined;
	const id = c.id(v, caminho);
	for (const k of ['nome', 'orgao', 'banca', 'area']) c.texto(v, k, caminho);
	c.umDe(v, 'situacao', caminho, SITUACOES);
	if ('emAlta' in v && typeof v.emAlta !== 'boolean') c.add(`${caminho}.emAlta`, 'deveria ser true ou false');
	c.inteiro(v, 'vagas', caminho, 0);
	c.texto(v, 'salario', caminho, { vazioOk: true });
	const data = c.texto(v, 'dataProva', caminho);
	if (data !== undefined && !dataReal(data)) c.add(`${caminho}.dataProva`, `"${data}" não é data real AAAA-MM-DD`);
	c.https(v, 'edital', caminho);
	c.icone(v, caminho);
	c.umDe(v, 'cor', caminho, CORES);
	const cargos = c.lista(v, 'cargos', `${caminho}.cargos`);
	if (cargos) {
		const ids = cargos.map((cargo, i) => validarCargo(c, cargo, `${caminho}.cargos[${i}]`));
		c.unico(ids, (i) => `${caminho}.cargos[${i}].id`);
	}
	return id;
}

function validarFerramenta(c: Coletor, v: unknown, caminho: string): string | undefined {
	if (!c.objeto(v, caminho, ['id', 'titulo', 'subtitulo', 'icone', 'grupo'])) return undefined;
	const id = c.id(v, caminho);
	c.texto(v, 'titulo', caminho);
	c.texto(v, 'subtitulo', caminho, { vazioOk: true });
	c.icone(v, caminho);
	c.umDe(v, 'grupo', caminho, GRUPOS);
	return id;
}

function validarConfig(c: Coletor, v: unknown, caminho: string) {
	if (!c.objeto(v, caminho, ['whatsapp', 'limiteEmAlta'])) return;
	if ('whatsapp' in v && v.whatsapp !== null) {
		if (typeof v.whatsapp !== 'string') c.add(`${caminho}.whatsapp`, 'deveria ser texto https:// ou null');
		else c.https(v, 'whatsapp', caminho);
	}
	c.inteiro(v, 'limiteEmAlta', caminho, 1);
}

export function validarDados(bruto: unknown): Dados {
	const c = new Coletor();
	if (c.objeto(bruto, 'dados', ['concursos', 'ferramentas', 'config'])) {
		const concursos = c.lista(bruto, 'concursos', 'concursos');
		if (concursos) {
			if (concursos.length > 0 && concursos.length < 12) c.add('concursos', `são ${concursos.length}; o mínimo é 12`);
			const ids = concursos.map((x, i) => validarConcurso(c, x, `concursos[${i}]`));
			c.unico(ids, (i) => `concursos[${i}].id`);
		}
		const ferramentas = c.lista(bruto, 'ferramentas', 'ferramentas');
		if (ferramentas) {
			if (ferramentas.length !== 12) c.add('ferramentas', `são ${ferramentas.length}; deveriam ser exatamente 12`);
			const ids = ferramentas.map((x, i) => validarFerramenta(c, x, `ferramentas[${i}]`));
			c.unico(ids, (i) => `ferramentas[${i}].id`);
		}
		if ('config' in bruto) validarConfig(c, bruto.config, 'config');
	}
	if (c.falhas.length > 0) {
		throw new Error(`Dados inválidos (${c.falhas.length} falha(s)):\n${c.falhas.join('\n')}`);
	}
	return bruto as unknown as Dados;
}

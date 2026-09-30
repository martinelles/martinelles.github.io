/**
 * Checagem própria (sem Ajv) de `contracts/conteudo-importado.schema.json`: devolve a lista
 * de violações de um post, vazia quando ele casa com o contrato.
 */
type Obj = Record<string, unknown>;

const ehObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const ehTexto = (v: unknown, min = 0): v is string => typeof v === 'string' && v.length >= min;

function checarFonte(f: unknown, erros: string[]) {
	if (!ehObj(f)) return erros.push('fonte não é objeto');
	for (const k of Object.keys(f)) if (!['rotulo', 'arquivo', 'url'].includes(k)) erros.push(`fonte.${k} não permitido`);
	if (!ehTexto(f.rotulo, 1)) erros.push('fonte.rotulo vazio');
	if (f.arquivo !== undefined && !ehTexto(f.arquivo)) erros.push('fonte.arquivo não é texto');
	if (f.url !== undefined && !(ehTexto(f.url) && f.url.startsWith('https://'))) erros.push('fonte.url sem https://');
}

export function violacoes(p: unknown): string[] {
	const erros: string[] = [];
	if (!ehObj(p)) return ['post não é objeto'];
	if (!ehTexto(p.id) || !/^[qlrf]:/.test(p.id)) erros.push('id inválido');
	if (!ehTexto(p.materia) || !/^[a-z0-9-]+$/.test(p.materia)) erros.push('materia inválida');
	if (p.subtopico !== undefined && !ehTexto(p.subtopico)) erros.push('subtopico não é texto');
	if (p.fonte !== undefined) checarFonte(p.fonte, erros);
	switch (p.tipo) {
		case 'questao': {
			const pr = p.prova;
			if (!ehObj(pr) || !['CGU', 'TCU'].includes(pr.orgao as string) || !Number.isInteger(pr.ano) || !ehTexto(pr.cargo))
				erros.push('prova inválida');
			else if (pr.banca !== undefined && !ehTexto(pr.banca)) erros.push('prova.banca não é texto');
			if (!Number.isInteger(p.numero)) erros.push('numero não é inteiro');
			if (p.textoBase !== undefined && !ehTexto(p.textoBase)) erros.push('textoBase não é texto');
			if (!ehTexto(p.enunciado, 1)) erros.push('enunciado vazio');
			if (!['ce', 'me'].includes(p.formato as string)) erros.push('formato inválido');
			if (p.alternativas !== undefined) {
				if (!Array.isArray(p.alternativas)) erros.push('alternativas não é lista');
				else
					for (const a of p.alternativas)
						if (!ehObj(a) || !['A', 'B', 'C', 'D', 'E'].includes(a.letra as string) || !ehTexto(a.texto))
							erros.push('alternativa inválida');
			}
			if (!['C', 'E', 'A', 'B', 'D'].includes(p.gabarito as string)) erros.push('gabarito inválido');
			if (!['valida', 'alterada'].includes(p.situacao as string)) erros.push('situacao inválida');
			break;
		}
		case 'lei': {
			const n = p.norma;
			if (!ehObj(n) || !ehTexto(n.arquivo) || !ehTexto(n.titulo)) erros.push('norma inválida');
			else if (n.numero !== undefined && !ehTexto(n.numero)) erros.push('norma.numero não é texto');
			if (!ehTexto(p.artigo)) erros.push('artigo não é texto');
			if (!Array.isArray(p.telas) || p.telas.length < 1 || !p.telas.every((t) => ehTexto(t, 1))) erros.push('telas inválidas');
			if (p.revogados !== undefined && !(Array.isArray(p.revogados) && p.revogados.every(Number.isInteger)))
				erros.push('revogados inválidos');
			break;
		}
		case 'resumo': {
			if (!ehTexto(p.titulo)) erros.push('titulo não é texto');
			if (!Array.isArray(p.telas) || p.telas.length < 3 || p.telas.length > 8) erros.push('resumo precisa de 3 a 8 telas');
			else
				for (const t of p.telas)
					if (!ehObj(t) || !ehTexto(t.texto) || t.texto.length > 600 || (t.titulo !== undefined && !ehTexto(t.titulo)))
						erros.push('tela de resumo inválida');
			if (typeof p.conferido !== 'boolean') erros.push('conferido não é booleano');
			if (p.fonte === undefined) erros.push('resumo sem fonte');
			break;
		}
		case 'flashcard': {
			if (!ehTexto(p.pergunta, 1) || !ehTexto(p.resposta, 1)) erros.push('pergunta/resposta vazia');
			if (typeof p.conferido !== 'boolean') erros.push('conferido não é booleano');
			if (p.fonte === undefined) erros.push('flashcard sem fonte');
			break;
		}
		default:
			erros.push(`tipo inválido: ${String(p.tipo)}`);
	}
	return erros;
}

// NFR-001 e SC-003: contraste dos tokens de cada tema, lido da fonte da verdade (src/app.css).
// Contrato: kitty-specs/identidade-visual-aventura-kindle-01M3T7H9/contracts/tema.md §5 e §6.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

type Tema = 'aventura' | 'kindle' | 'kindle-escuro';
const TEMAS: Tema[] = ['aventura', 'kindle', 'kindle-escuro'];

const css = readFileSync(fileURLToPath(new URL('../../src/app.css', import.meta.url)), 'utf8');
const html = readFileSync(fileURLToPath(new URL('../../src/app.html', import.meta.url)), 'utf8');

/** Declarações `--nome: valor;` do bloco cujo seletor contém [data-tema='X']. */
function blocoDoTema(tema: Tema): Record<string, string> {
	const blocos = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
	const achado = blocos.find(([, seletor]) =>
		seletor.split(',').some((s) => s.trim().endsWith(`[data-tema='${tema}']`))
	);
	if (!achado) throw new Error(`bloco do tema ${tema} não encontrado em app.css`);
	const tokens: Record<string, string> = {};
	for (const [, nome, valor] of achado[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) tokens[nome] = valor.trim();
	return tokens;
}

const tokens = Object.fromEntries(TEMAS.map((t) => [t, blocoDoTema(t)])) as Record<Tema, Record<string, string>>;

const MATERIAS = Array.from({ length: 8 }, (_, i) => `--materia-${i}`);
const CORES = [
	'--cor-fundo',
	'--cor-superficie',
	'--cor-divisor',
	'--cor-texto',
	'--cor-texto-suave',
	'--cor-lei',
	'--cor-primaria',
	'--cor-primaria-texto',
	'--cor-curtida',
	'--cor-acerto',
	'--cor-acerto-fundo',
	'--cor-erro',
	'--cor-erro-fundo',
	'--cor-aviso',
	'--cor-aviso-fundo',
	'--cor-visto',
	'--cor-materia-texto',
	'--cor-borda',
	...MATERIAS
];
// Não são cor: só precisam existir.
const OUTROS = ['--linha-peso', '--sombra', '--raio', '--textura', '--fonte-titulo'];
const ESPERADOS = [...CORES, ...OUTROS].sort();

// Contrato §6: [frente, fundo, mínimo]. O foco é --cor-primaria sobre fundo (mesmo par da primária).
const PARES: [string, string, number][] = [
	['texto', 'fundo', 4.5],
	['texto', 'superficie', 4.5],
	['texto-suave', 'fundo', 4.5],
	['texto-suave', 'superficie', 4.5],
	['primaria-texto', 'primaria', 4.5],
	['acerto', 'acerto-fundo', 4.5],
	['erro', 'erro-fundo', 4.5],
	['aviso', 'aviso-fundo', 4.5],
	['lei', 'superficie', 4.5],
	['borda', 'fundo', 3],
	['borda', 'superficie', 3],
	['primaria', 'fundo', 3],
	['curtida', 'superficie', 3],
	['visto', 'fundo', 3],
	...MATERIAS.map((m): [string, string, number] => ['materia-texto', m.slice(2), 4.5])
];

const cor = (tema: Tema, nome: string): string => {
	const token = /^materia-\d$/.test(nome) ? `--${nome}` : `--cor-${nome}`;
	const valor = tokens[tema][token];
	if (!valor || !/^#[0-9a-f]{6}$/i.test(valor)) throw new Error(`${tema}: ${token} ausente ou não é #rrggbb (${valor})`);
	return valor;
};

/** Luminância relativa da WCAG 2.x (sRGB linearizado). */
function luminancia(hex: string): number {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a: string, b: string): number {
	const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
	return (l1 + 0.05) / (l2 + 0.05);
}

const virgula = (n: number) => n.toFixed(2).replace('.', ',');

describe('contraste dos temas (app.css)', () => {
	it('os três temas definem exatamente os tokens do contrato §5', () => {
		for (const t of TEMAS) expect(Object.keys(tokens[t]).sort(), t).toEqual(ESPERADOS);
	});

	it.each(TEMAS)('%s: cada par do contrato §6 cumpre o mínimo', (t) => {
		const falhas = PARES.flatMap(([frente, fundo, minimo]) => {
			const valor = contraste(cor(t, frente), cor(t, fundo));
			return valor + 1e-9 < minimo ? [`${t}: ${frente}/${fundo} = ${virgula(valor)} (mín. ${virgula(minimo).replace(',00', '')})`] : [];
		});
		expect(falhas, falhas.join('\n')).toEqual([]);
	});

	it('o script inline de app.html usa o mesmo --cor-fundo de cada tema', () => {
		const objeto = html.match(/var fundo = (\{[^}]*\})/)?.[1];
		expect(objeto, 'objeto fundo no script inline').toBeDefined();
		const fundo = Object.fromEntries(
			[...objeto!.matchAll(/'?([\w-]+)'?\s*:\s*'(#[0-9a-f]{6})'/gi)].map(([, k, v]) => [k, v.toLowerCase()])
		);
		for (const t of TEMAS) expect(fundo[t], t).toBe(tokens[t]['--cor-fundo'].toLowerCase());
		// O <meta theme-color> estático é o do fallback sem JS (Aventura).
		expect(html).toMatch(new RegExp(`name="theme-color" content="${tokens.aventura['--cor-fundo']}"`, 'i'));
	});

	it('tabela de contraste por tema (SC-003)', () => {
		for (const t of TEMAS) {
			console.log(`\nContraste — ${t}`);
			console.table(
				PARES.map(([frente, fundo, minimo]) => ({
					par: `${frente} / ${fundo}`,
					contraste: Number(contraste(cor(t, frente), cor(t, fundo)).toFixed(2)),
					minimo
				}))
			);
		}
	});
});

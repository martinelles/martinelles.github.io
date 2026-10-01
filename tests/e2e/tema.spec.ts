import { expect, test, type Page } from '@playwright/test';

// Missão identidade-visual-aventura-kindle: Cenários 1, 2 e 4 da spec, FR-001 a FR-004, FR-008,
// FR-010, FR-011, NFR-005 (teclado) e NFR-007. Contrato: contracts/tema.md (§1 atributo, §2 chave,
// §3 regra, §5 tokens, §7 movimento).

const CHAVE = 'painel-concurso:tema:v1';
const CHAVE_INTERACOES = 'painel-concurso:interacoes:v1';
const TEMAS = ['aventura', 'kindle', 'kindle-escuro'] as const;
type Tema = (typeof TEMAS)[number];

/** Tokens de cor do contrato §5 (os de forma, papel e tipo não são cor). */
const TOKENS_COR = [
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
	...Array.from({ length: 8 }, (_, i) => `--materia-${i}`)
];

test.beforeEach(async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-09-30T12:00:00-03:00'));
});

const temaAtual = (page: Page) => page.evaluate(() => document.documentElement.dataset.tema);
const lerChave = (page: Page) => page.evaluate((k) => localStorage.getItem(k), CHAVE);

/** Grava a preferência antes de cada carga da página (vale para o teste inteiro). */
async function fixarTema(page: Page, tema: Tema | 'sistema') {
	await page.addInitScript(([k, t]) => localStorage.setItem(k, JSON.stringify({ tema: t })), [CHAVE, tema] as const);
}

async function abrirPainel(page: Page) {
	await page.goto('/painel');
	await expect(page.getByRole('group', { name: 'Aparência' })).toBeVisible();
}

const radio = (page: Page, nome: string | RegExp) =>
	page.getByRole('group', { name: 'Aparência' }).getByRole('radio', { name: nome, exact: typeof nome === 'string' });

// ---------------------------------------------------------------------------------------------
// T025 — padrão, troca, persistência, clarão
// ---------------------------------------------------------------------------------------------

test.describe('padrão pelo aparelho, sem escolha salva', () => {
	test.describe('aparelho claro', () => {
		test.use({ colorScheme: 'light' });
		test('padrão claro: Aventura (FR-002, Cenário 1.1)', async ({ page }) => {
			await page.goto('/');
			await expect(page.locator('html')).toHaveAttribute('data-tema', 'aventura');
			expect(await lerChave(page)).toBeNull();
		});
	});
	test.describe('aparelho escuro', () => {
		test.use({ colorScheme: 'dark' });
		test('padrão escuro: Kindle escuro (FR-002, Cenário 1.2)', async ({ page }) => {
			await page.goto('/');
			await expect(page.locator('html')).toHaveAttribute('data-tema', 'kindle-escuro');
			expect(await lerChave(page)).toBeNull();
		});
	});
});

test('seletor: grupo "Aparência" com 4 rádios e "Seguir o aparelho" marcado (FR-001, FR-003, Cenário 2.1)', async ({ page }) => {
	await abrirPainel(page);
	const grupo = page.getByRole('group', { name: 'Aparência' });
	const radios = grupo.getByRole('radio');
	await expect(radios).toHaveCount(4);
	await expect(radios.nth(0)).toHaveAccessibleName(/^Seguir o aparelho/);
	await expect(radios.nth(1)).toHaveAccessibleName('Aventura');
	await expect(radios.nth(2)).toHaveAccessibleName('Kindle');
	await expect(radios.nth(3)).toHaveAccessibleName('Kindle escuro');
	await expect(radios.nth(0)).toBeChecked();
	for (const i of [1, 2, 3]) await expect(radios.nth(i)).not.toBeChecked();
});

test('troca e persistência: "Kindle" sobrevive ao reload (FR-003, SC-002)', async ({ page }) => {
	await abrirPainel(page);
	await radio(page, 'Kindle').check();
	await expect(page.locator('html')).toHaveAttribute('data-tema', 'kindle');
	expect(await lerChave(page)).toBe('{"tema":"kindle"}');

	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-tema', 'kindle');
	await expect(radio(page, 'Kindle')).toBeChecked();
	expect(await lerChave(page)).toBe('{"tema":"kindle"}');
});

test('ao vivo: "Seguir o aparelho" acompanha claro/escuro sem recarregar (Cenário 2.3)', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' });
	await abrirPainel(page);
	await expect(radio(page, /^Seguir o aparelho/)).toBeChecked();
	await expect(page.locator('html')).toHaveAttribute('data-tema', 'aventura');
	// Marca na janela: some se a página recarregar.
	await page.evaluate(() => ((window as unknown as { __semReload: boolean }).__semReload = true));

	await page.emulateMedia({ colorScheme: 'dark' });
	await expect(page.locator('html')).toHaveAttribute('data-tema', 'kindle-escuro');
	await page.emulateMedia({ colorScheme: 'light' });
	await expect(page.locator('html')).toHaveAttribute('data-tema', 'aventura');

	expect(await page.evaluate(() => (window as unknown as { __semReload?: boolean }).__semReload)).toBe(true);
});

test('tema fixo ignora o aparelho (contrato §3)', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' });
	await abrirPainel(page);
	await radio(page, 'Kindle').check();
	await expect(page.locator('html')).toHaveAttribute('data-tema', 'kindle');
	await page.emulateMedia({ colorScheme: 'dark' });
	// Dá tempo ao ouvinte de prefers-color-scheme de agir, se fosse agir.
	await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
	expect(await temaAtual(page)).toBe('kindle');
});

test.describe('teclado', () => {
	// Escuro: "Seguir o aparelho" dá kindle-escuro, então cada seta muda o tema que aparece.
	test.use({ colorScheme: 'dark' });
	test('setas trocam o tema a cada tecla (NFR-005)', async ({ page }) => {
		await abrirPainel(page);
		await expect(page.locator('html')).toHaveAttribute('data-tema', 'kindle-escuro');
		await radio(page, /^Seguir o aparelho/).focus();
		await page.keyboard.press('ArrowDown');
		await expect(page.locator('html')).toHaveAttribute('data-tema', 'aventura');
		await expect(radio(page, 'Aventura')).toBeChecked();
		await expect(radio(page, 'Aventura')).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(page.locator('html')).toHaveAttribute('data-tema', 'kindle');
		await expect(radio(page, 'Kindle')).toBeChecked();
	});
});

test('posição do feed: ir ao painel, trocar o tema e voltar pela barra de abas (FR-010)', async ({ page }) => {
	test.setTimeout(60_000);
	const abas = page.getByRole('navigation', { name: 'Seções' });

	/** Rola o feed até ≥ 1500 px, vai ao painel, opcionalmente troca o tema, volta. */
	async function idaEVolta(trocar?: string): Promise<{ antes: number; depois: number }> {
		await page.goto('/');
		await expect(page.locator('[data-post-id]').first()).toBeVisible();
		await expect
			.poll(async () => {
				return page.evaluate(() => {
					window.scrollTo(0, 1600);
					return window.scrollY;
				});
			})
			.toBeGreaterThanOrEqual(1500);
		const antes = await page.evaluate(() => window.scrollY);
		await abas.getByRole('link', { name: 'Painel' }).click();
		await expect(page).toHaveURL('/painel');
		await expect(page.getByRole('group', { name: 'Aparência' })).toBeVisible();
		if (trocar) {
			await radio(page, trocar).check();
			await expect(page.locator('html')).toHaveAttribute('data-tema', 'kindle');
		}
		await abas.getByRole('link', { name: 'Feed' }).click();
		await expect(page).toHaveURL('/');
		await expect(page.locator('[data-post-id]').first()).toBeAttached();
		await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
		return { antes, depois: await page.evaluate(() => window.scrollY) };
	}

	const base = await idaEVolta();
	const comTroca = await idaEVolta('Kindle');
	const restaura = Math.abs(base.depois - base.antes) <= 50;
	test.info().annotations.push({
		type: 'FR-010 rolagem entre rotas',
		description:
			`sem troca: ${base.antes} → ${base.depois} px; com troca: ${comTroca.antes} → ${comTroca.depois} px; ` +
			(restaura ? 'o app restaura a rolagem pela barra de abas' : 'o app NÃO restaura a rolagem pela barra de abas nem sem trocar tema (comportamento-base)')
	});
	if (restaura) {
		expect(Math.abs(comTroca.depois - comTroca.antes)).toBeLessThanOrEqual(50);
	} else {
		// Comportamento-base registrado: trocar o tema não muda o que já acontece sem trocar.
		expect(Math.abs(comTroca.depois - base.depois)).toBeLessThanOrEqual(50);
	}
});

test('troca de tema não perde a posição na própria página (FR-010)', async ({ page }) => {
	// O seletor fica no painel: a troca "na hora" é medida ali, rolado até o seletor.
	await page.setViewportSize({ width: 412, height: 500 });
	await abrirPainel(page);
	await radio(page, 'Kindle').scrollIntoViewIfNeeded();
	const antes = await page.evaluate(() => window.scrollY);
	expect(antes).toBeGreaterThan(0);
	await radio(page, 'Kindle').check();
	await expect(page.locator('html')).toHaveAttribute('data-tema', 'kindle');
	const depois = await page.evaluate(() => window.scrollY);
	expect(Math.abs(depois - antes)).toBeLessThanOrEqual(50);
});

test('preferência corrompida: abre pelo aparelho, sem erro, e a chave fica como está (borda, contrato §2)', async ({ page }) => {
	const erros: string[] = [];
	page.on('pageerror', (e) => erros.push(e.message));
	await page.emulateMedia({ colorScheme: 'light' });
	await page.goto('/');
	for (const valor of ['lixo{', '{"tema":"roxo"}']) {
		await page.evaluate(([k, v]) => localStorage.setItem(k, v), [CHAVE, valor] as const);
		await page.goto('/');
		await expect(page.locator('[data-post-id]').first()).toBeVisible();
		await expect(page.locator('html')).toHaveAttribute('data-tema', 'aventura');
		expect(await lerChave(page), valor).toBe(valor);
		await abrirPainel(page);
		await expect(radio(page, /^Seguir o aparelho/)).toBeChecked();
		expect(await lerChave(page), valor).toBe(valor);
	}
	expect(erros).toEqual([]);
});

test('sem clarão: tema certo no DOMContentLoaded e nenhuma troca até load + 500 ms, 10 cargas por tema (FR-011, NFR-007)', async ({
	page
}) => {
	test.setTimeout(180_000);
	// Roda antes do script inline do <head>: só instala o observador. O primeiro valor é lido no
	// DOMContentLoaded, depois do script inline.
	await page.addInitScript(() => {
		const w = window as unknown as { __temaInicial?: string; __mutacoesTema: (string | null)[]; __fim: boolean };
		w.__mutacoesTema = [];
		w.__fim = false;
		new MutationObserver((registros) => {
			for (const r of registros) {
				if (r.target === document.documentElement) {
					w.__mutacoesTema.push((r.target as HTMLElement).getAttribute('data-tema'));
				}
			}
		}).observe(document, { attributes: true, attributeFilter: ['data-tema'], subtree: true });
		document.addEventListener('DOMContentLoaded', () => (w.__temaInicial = document.documentElement.dataset.tema), {
			once: true
		});
		addEventListener('load', () => setTimeout(() => (w.__fim = true), 500), { once: true });
	});

	await page.goto('/');
	const resultados: string[] = [];
	for (const tema of TEMAS) {
		await page.evaluate(([k, t]) => localStorage.setItem(k, JSON.stringify({ tema: t })), [CHAVE, tema] as const);
		for (let i = 1; i <= 10; i++) {
			await page.reload();
			await page.waitForFunction(() => (window as unknown as { __fim: boolean }).__fim);
			const { inicial, mutacoes } = await page.evaluate(() => {
				const w = window as unknown as { __temaInicial?: string; __mutacoesTema: (string | null)[] };
				return { inicial: w.__temaInicial, mutacoes: w.__mutacoesTema };
			});
			// A primeira mutação é a do script inline (ausente → tema); depois dela, nenhuma.
			const depoisDoPrimeiro = mutacoes.slice(1);
			resultados.push(`${tema} #${i}: inicial=${inicial} mutações=${JSON.stringify(mutacoes)}`);
			expect(inicial, `${tema} carga ${i}`).toBe(tema);
			expect(mutacoes[0], `${tema} carga ${i}`).toBe(tema);
			expect(depoisDoPrimeiro, `${tema} carga ${i}`).toEqual([]);
		}
	}
	test.info().annotations.push({ type: 'NFR-007 cargas', description: `${resultados.length} cargas, todas sem troca` });
});

test('sem o JS do app: o script inline aplica o tema salvo (FR-011)', async ({ page }) => {
	await fixarTema(page, 'kindle');
	await page.route('**/_app/**', (r) => r.abort());
	await page.goto('/');
	await expect(page.locator('html')).toHaveAttribute('data-tema', 'kindle');
	// O app de fato não carregou: nenhum post na tela.
	await expect(page.locator('[data-post-id]')).toHaveCount(0);
});

// ---------------------------------------------------------------------------------------------
// T026 — cores só de token, Kindle sem movimento e sem cor, Aventura sem loop
// ---------------------------------------------------------------------------------------------

const TELAS: { nome: string; abrir: (page: Page) => Promise<void> }[] = [
	{
		nome: '/',
		abrir: async (page) => {
			await page.goto('/');
			await expect(page.locator('[data-post-id]').first()).toBeVisible();
		}
	},
	{
		nome: '/salvos (com um salvo)',
		abrir: async (page) => {
			await page.goto('/?tipo=resumo');
			await expect(page.locator('[data-post-id]').first()).toBeVisible();
			const id = await page.locator('[data-post-id]').first().getAttribute('data-post-id');
			await page.evaluate(
				([k, id]) =>
					localStorage.setItem(
						k,
						JSON.stringify({ respostas: {}, curtidas: [], salvos: { [id]: '2026-09-30T15:00:00.000Z' }, vistos: {} })
					),
				[CHAVE_INTERACOES, id!] as const
			);
			await page.goto('/salvos');
			await expect(page.locator('[data-post-id]')).toHaveCount(1);
		}
	},
	{
		nome: '/painel',
		abrir: async (page) => {
			await page.goto('/painel');
			await expect(page.getByRole('heading', { level: 1, name: 'Seu Painel de Estudos' })).toBeVisible();
			await expect(page.getByRole('group', { name: 'Aparência' })).toBeVisible();
		}
	},
	{
		nome: '/ferramenta/questoes-discursivas',
		abrir: async (page) => {
			await page.goto('/ferramenta/questoes-discursivas');
			await expect(page.getByRole('heading', { level: 1, name: 'Questões Discursivas' })).toBeVisible();
		}
	}
];

interface CorColetada {
	onde: string;
	prop: string;
	cor: string;
	rgb: [number, number, number];
	tema: string;
}

/**
 * Cores de token por tema (lidas de uma sonda com `data-tema`, contrato §1) e todas as cores
 * calculadas dos elementos visíveis, com o tema que vale para cada um (o `[data-tema]` mais
 * próximo: a prévia do seletor aplica outro tema só no trecho dela).
 *
 * Coletado: `color`, `background-color`, `border-*-color` (só lado com borda visível) e as cores
 * de `box-shadow`, nos elementos e nos seus `::before`/`::after` com `content`.
 * Exceções documentadas (não aparecem na coleta, não são filtradas depois):
 * - `transparent` e `rgba(…, 0)`: não pintam nada.
 * - `color-mix()` não é usado em src/ (conferido com grep em 2026-09-30).
 * - As cores de sistema do `<select>` aberto não aparecem: ele fica fechado.
 * - Scrollbar, `::selection` e o anel de foco não entram (não estão nas propriedades do contrato).
 */
async function coletarCores(page: Page): Promise<{ tokens: Record<string, [number, number, number][]>; cores: CorColetada[] }> {
	return page.evaluate(
		([temas, nomesTokens]) => {
			const rgbDe = (s: string): [number, number, number, number] | null => {
				const m = s.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/);
				if (!m) return null;
				return [Math.round(+m[1]), Math.round(+m[2]), Math.round(+m[3]), m[4] === undefined ? 1 : +m[4]];
			};

			const tokens: Record<string, [number, number, number][]> = {};
			const sonda = document.createElement('div');
			sonda.setAttribute('aria-hidden', 'true');
			sonda.style.cssText = 'position:absolute;left:-9999px;top:0';
			document.body.appendChild(sonda);
			for (const t of temas) {
				const caixa = document.createElement('div');
				caixa.dataset.tema = t;
				sonda.appendChild(caixa);
				tokens[t] = nomesTokens.map((nome) => {
					const s = document.createElement('span');
					s.style.color = `var(${nome})`;
					caixa.appendChild(s);
					const c = rgbDe(getComputedStyle(s).color)!;
					return [c[0], c[1], c[2]];
				});
			}
			sonda.remove();

			const descrever = (el: Element) => {
				const id = el.id ? `#${el.id}` : '';
				const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
				const texto = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 30);
				return `${el.tagName.toLowerCase()}${id}${cls}${texto ? ` "${texto}"` : ''}`;
			};

			const cores: CorColetada[] = [];
			const anotar = (onde: string, prop: string, valor: string, tema: string) => {
				const c = rgbDe(valor);
				if (!c || c[3] === 0) return;
				cores.push({ onde, prop, cor: valor, rgb: [c[0], c[1], c[2]], tema });
			};
			const LADOS = ['top', 'right', 'bottom', 'left'] as const;
			const lerEstilo = (e: CSSStyleDeclaration, onde: string, tema: string, pintaTexto: boolean) => {
				if (pintaTexto) anotar(onde, 'color', e.color, tema);
				anotar(onde, 'background-color', e.backgroundColor, tema);
				for (const lado of LADOS) {
					const largura = parseFloat(e.getPropertyValue(`border-${lado}-width`));
					const estilo = e.getPropertyValue(`border-${lado}-style`);
					if (largura > 0 && estilo !== 'none' && estilo !== 'hidden') {
						anotar(onde, `border-${lado}-color`, e.getPropertyValue(`border-${lado}-color`), tema);
					}
				}
				if (e.boxShadow && e.boxShadow !== 'none') {
					for (const m of e.boxShadow.match(/rgba?\([^)]*\)/g) ?? []) anotar(onde, 'box-shadow', m, tema);
				}
			};

			for (const el of document.body.querySelectorAll('*')) {
				const r = el.getBoundingClientRect();
				if (r.width === 0 || r.height === 0) continue;
				if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
				const tema = (el.closest('[data-tema]') as HTMLElement | null)?.dataset.tema ?? 'aventura';
				const onde = descrever(el);
				// `color` só pinta onde há texto próprio, ícone SVG (currentColor) ou controle de
				// formulário; num contêiner sem texto ela é só herança e não aparece na tela.
				const pintaTexto =
					el instanceof SVGElement ||
					el.matches('input, select, textarea, button') ||
					[...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim() !== '');
				lerEstilo(getComputedStyle(el), onde, tema, pintaTexto);
				for (const pseudo of ['::before', '::after']) {
					const p = getComputedStyle(el, pseudo);
					if (p.content && p.content !== 'none' && p.content !== 'normal' && p.display !== 'none') {
						lerEstilo(p, `${onde}${pseudo}`, tema, p.content !== '""' && p.content !== "''");
					}
				}
			}
			return { tokens, cores };
		},
		[TEMAS, TOKENS_COR] as const
	);
}

const perto = (a: number[], b: number[]) => a.every((v, i) => Math.abs(v - b[i]) <= 2);

/** Saturação HSL em %, como em CSS Color 4. */
function saturacaoHsl([r, g, b]: [number, number, number]): number {
	const max = Math.max(r, g, b) / 255;
	const min = Math.min(r, g, b) / 255;
	const l = (max + min) / 2;
	if (max === min) return 0;
	return ((max - min) / (1 - Math.abs(2 * l - 1))) * 100;
}

for (const tema of TEMAS) {
	test.describe(`[${tema}] cores`, () => {
		for (const tela of TELAS) {
			test(`${tela.nome}: toda cor calculada é token do tema (FR-004, SC-001)`, async ({ page }) => {
				await fixarTema(page, tema);
				await tela.abrir(page);
				await expect(page.locator('html')).toHaveAttribute('data-tema', tema);
				const { tokens, cores } = await coletarCores(page);
				expect(cores.length).toBeGreaterThan(0);
				const fora = cores
					.filter((c) => !tokens[c.tema]?.some((t) => perto(c.rgb, t)))
					.map((c) => `${c.onde} → ${c.prop} → ${c.cor} (tema ${c.tema})`);
				expect([...new Set(fora)], `cores fora dos tokens em ${tela.nome}`).toEqual([]);
			});

			if (tema === 'kindle') {
				// D5 (spec, 2026-09-30): o Kindle é papel quente, não cinza neutro. O Cenário 4.3 passa a
				// ser "toda cor calculada no Kindle pertence aos tokens do Kindle" (substitui a saturação
				// HSL ≤ 8%, que contradizia o data-model; as saturações medidas ficam em medicoes.md).
				test(`${tela.nome}: no Kindle, nenhuma cor fora dos tokens do tema Kindle (Cenário 4.3, D5)`, async ({ page }) => {
					await fixarTema(page, tema);
					await tela.abrir(page);
					const { tokens, cores } = await coletarCores(page);
					// Exceção documentada: a prévia dos outros temas no seletor do painel (FR-003 pede
					// uma prévia de cada opção) leva o próprio data-tema e fica fora desta conta.
					const doKindle = cores.filter((c) => c.tema === 'kindle');
					expect(doKindle.length).toBeGreaterThan(0);
					const fora = doKindle
						.filter((c) => !tokens.kindle.some((t) => perto(c.rgb, t)))
						.map((c) => `${c.onde} → ${c.prop} → ${c.cor} (S=${saturacaoHsl(c.rgb).toFixed(1)}%)`);
					expect([...new Set(fora)], `cores fora dos tokens do Kindle em ${tela.nome}`).toEqual([]);
				});
			}
		}
	});
}

/** Elementos (e pseudo) com transição ou animação de duração diferente de zero. */
async function comMovimento(page: Page): Promise<string[]> {
	return page.evaluate(() => {
		const naoZero = (v: string, nome?: string) =>
			v.split(',').some((d) => {
				const s = d.trim();
				// `auto` é o valor inicial de animation-duration (CSS Animations 2) e vale 0 s
				// para animação por tempo; só conta se houver animação nomeada.
				if (s === 'auto') return nome !== undefined && nome !== 'none';
				return parseFloat(s) !== 0;
			});
		const achados: string[] = [];
		for (const el of document.querySelectorAll('*')) {
			for (const pseudo of [null, '::before', '::after']) {
				const e = getComputedStyle(el, pseudo);
				if (pseudo && (e.content === 'none' || e.content === 'normal')) continue;
				const nome = `${el.tagName.toLowerCase()}${typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/)[0] : ''}${pseudo ?? ''}`;
				if (naoZero(e.transitionDuration)) achados.push(`${nome} transition-duration=${e.transitionDuration}`);
				if (naoZero(e.animationDuration, e.animationName)) achados.push(`${nome} animation-duration=${e.animationDuration}`);
			}
		}
		return [...new Set(achados)];
	});
}

const animacoes = (page: Page) =>
	page.evaluate(() => document.getAnimations().map((a) => `${a.constructor.name} ${(a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? ''} ${a.playState}`));

for (const tema of ['kindle', 'kindle-escuro'] as const) {
	test(`[${tema}] sem movimento depois de curtir, virar e deslizar (FR-008, SC-004)`, async ({ page }) => {
		test.setTimeout(60_000);
		await fixarTema(page, tema);
		const conferir = async (acao: string) => {
			expect(await comMovimento(page), `durações depois de ${acao}`).toEqual([]);
			expect(await animacoes(page), `getAnimations depois de ${acao}`).toEqual([]);
		};

		// Curtir: botão e duplo toque (lei seca: fora de questão o duplo toque vale desde o início).
		await page.goto('/?tipo=lei');
		const post = page.locator('[data-post-id]').nth(1);
		await expect(post).toBeVisible();
		await conferir('abrir o feed');
		const curtir = page.locator('[data-post-id]').first().getByRole('button', { name: 'Curtir' });
		await curtir.click();
		await expect(curtir).toHaveAttribute('aria-pressed', 'true');
		await conferir('curtir pelo botão');
		await post.scrollIntoViewIfNeeded();
		await post.locator('.conteudo').dblclick({ position: { x: 20, y: 20 } });
		await expect(post.getByRole('button', { name: 'Curtir' })).toHaveAttribute('aria-pressed', 'true');
		await conferir('curtir por duplo toque');

		// Virar um flashcard.
		await page.goto('/?tipo=flashcard');
		const cartao = page.locator('[data-post-id]').getByRole('button').filter({ hasText: 'Toque para ver a resposta' }).first();
		await cartao.scrollIntoViewIfNeeded();
		await cartao.click();
		await expect(cartao).toHaveAttribute('aria-pressed', 'true');
		await conferir('virar o flashcard');

		// Avançar um carrossel.
		await page.goto('/?tipo=resumo');
		const dono = page.locator('[data-post-id]').filter({ has: page.getByRole('button', { name: 'Próxima tela' }) }).first();
		const proxima = dono.getByRole('button', { name: 'Próxima tela' });
		await proxima.scrollIntoViewIfNeeded();
		await expect(dono.getByText(/^1\/\d+$/)).toBeVisible();
		await proxima.click();
		await expect(dono.getByText(/^2\/\d+$/)).toBeVisible();
		await conferir('avançar o carrossel');
	});
}

test('[aventura] parado por 2 s, nenhuma animação rodando (plan §6, FR-008)', async ({ page }) => {
	await fixarTema(page, 'aventura');
	await page.goto('/');
	await expect(page.locator('[data-post-id]').first()).toBeVisible();
	// Relógio fixo só congela Date; as animações seguem o tempo real da página.
	await page.waitForTimeout(2_000);
	const rodando = await page.evaluate(() =>
		document
			.getAnimations()
			.filter((a) => a.playState === 'running')
			.map((a) => `${(a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? a.constructor.name}`)
	);
	expect(rodando).toEqual([]);
});

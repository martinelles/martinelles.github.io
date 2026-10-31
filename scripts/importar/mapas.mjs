/**
 * Mapas mentais por subitem (planos/2026-10-31-mapas-mentais-nas-missoes.md): os
 * `Resumo <cód> <tema>.excalidraw.svg` do vault (auto-export do plugin do Obsidian no
 * Excalidraw, ou o lote inicial de 2026-10-31) viram `mapas/<slug>.svg` em `static/conteudo/`,
 * e a chave do edital aponta o slug. O caminho até o cid do plano é o mesmo do `qc`
 * (`mapasDoPlano` em missoes.mjs).
 *
 * Nome → chaves: itens de B/C são comuns aos cargos (`Resumo B1 8.2 …` → `B1-8.2`); itens de
 * E são da P3 e precisam do dono — sem prefixo vale Ciência de Dados (`CD:E2-1.2`), com
 * `AUD ` vale Auditoria. Faixa como `E2 4.1-4.2` cobre os dois subitens. `:` não existe em
 * nome de arquivo no Windows: o slug troca por hífen (`cd-e2-1.2`), e é ele quem nomeia o
 * arquivo e a rota `/mapa/<slug>`.
 */

/**
 * `Resumo E2 1.2 Tema.excalidraw.svg` → chaves do edital cobertas pelo mapa.
 * Fora do padrão é `null`: quem chama que avise, um nome torto não derruba o import.
 * @param {string} nome
 * @returns {string[] | null}
 */
export function chavesDoNome(nome) {
	const m = /^Resumo (AUD )?([BCE])(\d+) (\d+\.\d+)(?:-(\d+\.\d+))? /.exec(nome);
	if (!m) return null;
	const prefixo = m[2] === 'B' || m[2] === 'C' ? '' : m[1] ? 'AUD:' : 'CD:';
	const chave = (/** @type {string} */ n) => `${prefixo}${m[2]}${m[3]}-${n}`;
	return m[5] ? [chave(m[4]), chave(m[5])] : [chave(m[4])];
}

/** `CD:E2-1.2` → `cd-e2-1.2`; `B1-8.2` → `b1-8.2`. */
export const slugDe = (/** @type {string} */ chave) => chave.toLowerCase().replace(':', '-');

/**
 * Valida e encaixa os SVGs encontrados no vault.
 * @param {{ nome: string, conteudo: string }[]} svgs `.excalidraw.svg` lidos do vault
 * @param {Set<string>} chavesValidas chaves que existem nos planos (a cargo do chamador)
 * @returns {{ arquivos: { arquivo: string, conteudo: string }[], mapa: Record<string, string>, avisos: string[] }}
 */
export function montarMapas(svgs, chavesValidas) {
	/** @type {{ arquivo: string, conteudo: string }[]} */
	const arquivos = [];
	/** @type {Record<string, string>} */
	const mapa = {};
	/** @type {string[]} */
	const avisos = [];
	for (const { nome, conteudo } of svgs) {
		const chaves = chavesDoNome(nome);
		if (!chaves) {
			avisos.push(`resumos/${nome}: nome fora do padrão "Resumo <cód> <tema>"`);
			continue;
		}
		const fora = chaves.filter((c) => !chavesValidas.has(c));
		if (fora.length) {
			avisos.push(`resumos/${nome}: subitem fora do plano (${fora.join(', ')})`);
			continue;
		}
		const slug = slugDe(chaves[0]);
		arquivos.push({ arquivo: `mapas/${slug}.svg`, conteudo });
		for (const c of chaves) mapa[c] = slug;
	}
	return { arquivos, mapa, avisos };
}

/**
 * Ponte entre o catálogo da mentoria e os códigos do guia: a aula que cobre cada código de
 * subitem (`E2 1.1` → aula `E2·1` do cargo), para o plano descobrir conteúdo em aberto cuja aula
 * nem está no plano. Puro, sem runas: o Worker também usa.
 */

export interface AulaDoCatalogo {
	/** Id da aula na plataforma (o `cid` de item-aula). */
	id: string;
	/** Código como `E2·1`. */
	cod: string;
	titulo: string;
}

/** As aulas do catálogo que valem para o cargo, por código do guia do subitem que cobrem. */
export function aulasPorCod(
	aulas: readonly { id: string; disciplina: string; titulo: string; subitens: string[] }[],
	cargo: 'cd' | 'aud'
): Map<string, AulaDoCatalogo> {
	const pref = `${cargo.toUpperCase()}:`;
	const mapa = new Map<string, AulaDoCatalogo>();
	for (const a of aulas) {
		if (a.disciplina.endsWith(':DISC')) continue; // placeholder de disciplina sem aula
		if (a.disciplina.includes(':') && !a.disciplina.startsWith(pref)) continue; // outro cargo
		const disc = a.disciplina.split(':')[1] ?? a.disciplina;
		const n = a.titulo.match(/^\d+/)?.[0];
		if (!n) continue;
		for (const chave of a.subitens) {
			const semPref = chave.startsWith(pref) ? chave.slice(pref.length) : chave;
			if (semPref.includes(':')) continue; // subitem do outro cargo
			const cod = semPref.replace('-', ' ');
			mapa.set(cod, { id: a.id, cod: `${disc}·${n}`, titulo: a.titulo });
		}
	}
	return mapa;
}

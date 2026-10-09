/**
 * Texto das telas do plano: durações, cronômetro, horas e porcentagens em pt-BR.
 * O motor (`$lib/plano`) devolve frações 0–1 e minutos; aqui só se escreve.
 */

const pct = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 });
const pctInteiro = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 0 });
const umaCasa = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

/** Tempo estimado: 180 → "3 h", 135 → "2 h 15 min", 45 → "45 min". */
export function duracao(minutos: number): string {
	const m = Math.max(0, Math.round(minutos));
	const h = Math.floor(m / 60);
	const r = m % 60;
	if (h === 0) return `${r} min`;
	return r === 0 ? `${h} h` : `${h} h ${r} min`;
}

/** Cronômetro: menos de 1 h em "mm:ss"; a partir dela, "h:mm:ss". */
export function relogio(ms: number): string {
	const s = Math.max(0, Math.floor(ms / 1000));
	const dois = (n: number) => String(n).padStart(2, '0');
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	return h > 0 ? `${h}:${dois(m)}:${dois(s % 60)}` : `${dois(m)}:${dois(s % 60)}`;
}

/** O mesmo tempo por extenso, para leitor de tela: "12 minutos e 5 segundos". */
export function relogioFalado(ms: number): string {
	const s = Math.max(0, Math.floor(ms / 1000));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const seg = s % 60;
	const partes: string[] = [];
	if (h) partes.push(`${h} ${h === 1 ? 'hora' : 'horas'}`);
	if (m) partes.push(`${m} ${m === 1 ? 'minuto' : 'minutos'}`);
	if (seg || partes.length === 0) partes.push(`${seg} ${seg === 1 ? 'segundo' : 'segundos'}`);
	return partes.join(' e ');
}

/** Horas com uma casa: 0.5 → "0,5 h"; 243 → "243 h". Trunca para não anunciar tempo não estudado. */
export function horas(h: number): string {
	return `${umaCasa.format(Math.floor(Math.max(0, h) * 10 + 1e-9) / 10)} h`;
}

/** Fração 0–1 do plano, com uma casa (1 de 236 tarefas aparece como "0,4%", não "0%"). */
export function porcento(fracao: number): string {
	return pct.format(fracao);
}

/** Fração 0–1 da missão, sem casa (são poucas tarefas). */
export function porcentoInteiro(fracao: number): string {
	return pctInteiro.format(fracao);
}

/** "1. Bancos… › 1.1 SGBD… › 1.1.1 Conceitos básicos." → folha e o caminho até ela. */
export function partesTopico(topico: string): { folha: string; caminho: string[] } {
	const partes = topico
		.split('›')
		.map((p) => p.trim())
		.filter(Boolean);
	const folha = partes.pop() ?? topico;
	return { folha, caminho: partes };
}

export function tarefas(n: number): string {
	return `${n} ${n === 1 ? 'tarefa' : 'tarefas'}`;
}

/** Modo da tarefa por extenso (emenda D4): texto, não só cor. */
export const ROTULO_MODO = { leitura: 'Leitura', questoes: 'Questões' } as const;

/** Bloco do edital por extenso (emenda D4). */
export const ROTULO_BLOCO = { basicos: 'Básicos', complementares: 'Complementares', especificos: 'Específicos' } as const;

/** Itens C/E que fecham a tarefa de Questões (o mesmo bloco do HOJE.md). */
export const ITENS_QUESTOES = 10;

/** O que fazer, em uma linha, para a lista da missão. */
export const FAZER_CURTO = {
	leitura: 'estudar o tópico e anotar dúvidas',
	questoes: `${ITENS_QUESTOES} itens C/E do tópico`
} as const;

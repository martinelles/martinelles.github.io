const DIA_MS = 86_400_000;

const doisDigitos = (n: number) => String(n).padStart(2, '0');

/** AAAA-MM-DD no fuso do aparelho (não usa toISOString, que é UTC). Única função que lê o relógio. */
export function hojeLocal(agora: Date = new Date()): string {
	return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`;
}

export type Prazo =
	| { tipo: 'dias'; dias: number; texto: string }
	| { tipo: 'indefinido'; texto: 'Data a definir' }
	| { tipo: 'realizada'; texto: 'Prova realizada' };

/** 'AAAA-MM-DD' como meia-noite UTC: diferença em dias de calendário sem erro de horário de verão. */
function utc(iso: string): number {
	const [a, m, d] = iso.split('-').map(Number);
	return Date.UTC(a, m - 1, d);
}

export function diasParaProva(dataProva: string | undefined, hoje: string): Prazo {
	if (!dataProva) return { tipo: 'indefinido', texto: 'Data a definir' };
	const dias = Math.round((utc(dataProva) - utc(hoje)) / DIA_MS);
	if (dias < 0) return { tipo: 'realizada', texto: 'Prova realizada' };
	const texto = dias === 0 ? 'É hoje!' : dias === 1 ? 'Falta 1 dia' : `Faltam ${dias} dias`;
	return { tipo: 'dias', dias, texto };
}

const formatoData = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });

/** '2026-11-15' -> '15/11/2026'. */
export function formatarData(iso: string): string {
	return formatoData.format(new Date(utc(iso)));
}

/**
 * Tipos mínimos das APIs do Node usadas pela importação (scripts/importar) e por estes testes.
 * O projeto não tem @types/node e o charter pede justificativa para cada dependência nova;
 * estas declarações cobrem só o que é usado. Se @types/node entrar um dia, apagar este arquivo.
 */

declare module 'node:fs' {
	interface Stats {
		isFile(): boolean;
		isDirectory(): boolean;
		mtimeMs: number;
	}
	export function existsSync(caminho: string): boolean;
	export function statSync(caminho: string): Stats;
	export function readFileSync(caminho: string): Uint8Array;
	export function readFileSync(caminho: string, codificacao: 'utf8'): string;
	export function writeFileSync(caminho: string, dados: string | Uint8Array, codificacao?: 'utf8'): void;
	export function readdirSync(caminho: string): string[];
	export function mkdirSync(caminho: string, opcoes?: { recursive?: boolean }): void;
	export function mkdtempSync(prefixo: string): string;
	export function renameSync(de: string, para: string): void;
	export function rmSync(caminho: string, opcoes?: { recursive?: boolean; force?: boolean }): void;
	export function cpSync(de: string, para: string, opcoes?: { recursive?: boolean }): void;
}

declare module 'node:path' {
	export function join(...partes: string[]): string;
	export function resolve(...partes: string[]): string;
	export const sep: string;
}

declare module 'node:url' {
	export function fileURLToPath(url: string | URL): string;
}

declare module 'node:os' {
	export function tmpdir(): string;
}

declare module 'node:zlib' {
	export function gzipSync(dados: string | Uint8Array, opcoes?: { level?: number }): Uint8Array;
}

declare var process: {
	argv: string[];
	env: Record<string, string | undefined>;
	pid: number;
	exit(codigo?: number): never;
};

declare var Buffer: {
	from(texto: string, codificacao: 'utf8'): Uint8Array;
};

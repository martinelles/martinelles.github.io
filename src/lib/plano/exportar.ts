/**
 * Exportação do progresso (FR-011, FR-015; contracts/registro.md "Exportação"; research R4).
 * CSV UTF-8 com BOM, separador vírgula, fim de linha CRLF (como o `ESTUDO.csv`), aspas só quando
 * o campo tem vírgula, aspas ou quebra de linha.
 *
 * Emenda D4: **uma linha por tópico** (`topicoId`, tirado do id da tarefa — vale também para
 * tarefas que sumiram do plano numa nova importação) com ao menos uma tarefa concluída:
 * - `minutos` = soma, arredondada, do tempo das tarefas concluídas do tópico (`:L` e `:Q`);
 *   tarefa ainda não concluída não entra (a exportação é de trabalho fechado e não lê o relógio);
 * - `questoes_feitas`/`questoes_certas` = as da `:Q` (vazios se não concluída ou não lançadas);
 * - `ultima_sessao` = dia local da conclusão mais recente do tópico;
 * - `status_sugerido` = `estudado` só com `:L` e `:Q` concluídas, senão vazio;
 * - ordem pela primeira conclusão do tópico (empate pelo `topicoId`).
 */
import { diaLocalDe } from './dias';
import { minutosEstudados } from './horas';
import { idTarefa, topicoDe } from './ids';
import type { DadosPlano, Plano, RegistroTarefa } from './tipos';

export const BOM = '﻿';
export const CABECALHO_EXPORTACAO = 'id,ultima_sessao,minutos,questoes_feitas,questoes_certas,status_sugerido';
export const STATUS_SUGERIDO = 'estudado';

type Concluido = RegistroTarefa & { concluidaEm: string };

function campo(v: string | number | null): string {
	if (v === null) return '';
	const s = String(v);
	return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** `plano` fica na assinatura do contrato; a exportação sai só dos registros (C-003). */
export function exportarCsv(_plano: Plano, dados: DadosPlano): string {
	const porTopico = new Map<string, { primeira: number; ultima: number; minutos: number }>();
	for (const [id, r] of Object.entries(dados.registros)) {
		if (r.concluidaEm === null) continue;
		const quando = Date.parse(r.concluidaEm);
		// Concluída não tem trecho em curso; `agora` = conclusão por segurança.
		const minutos = minutosEstudados(r, quando);
		const t = topicoDe(id);
		const acc = porTopico.get(t);
		if (!acc) porTopico.set(t, { primeira: quando, ultima: quando, minutos });
		else {
			acc.primeira = Math.min(acc.primeira, quando);
			acc.ultima = Math.max(acc.ultima, quando);
			acc.minutos += minutos;
		}
	}
	const ordem = [...porTopico].sort(([ta, a], [tb, b]) => (a.primeira !== b.primeira ? a.primeira - b.primeira : ta < tb ? -1 : ta > tb ? 1 : 0));
	const concluido = (id: string): Concluido | null => {
		const r = dados.registros[id];
		return r && r.concluidaEm !== null ? (r as Concluido) : null;
	};
	const linhas = [CABECALHO_EXPORTACAO];
	for (const [topico, acc] of ordem) {
		const leitura = concluido(idTarefa(topico, 'leitura'));
		const questoes = concluido(idTarefa(topico, 'questoes'));
		linhas.push(
			[
				topico,
				diaLocalDe(new Date(acc.ultima).toISOString()),
				Math.round(acc.minutos),
				questoes?.questoes ?? null,
				questoes?.certas ?? null,
				leitura && questoes ? STATUS_SUGERIDO : null
			]
				.map(campo)
				.join(',')
		);
	}
	return BOM + linhas.map((l) => l + '\r\n').join('');
}

export function nomeArquivoExportacao(dia: string): string {
	return `progresso-plano-${dia}.csv`;
}

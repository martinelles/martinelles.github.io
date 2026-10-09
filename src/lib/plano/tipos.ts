/**
 * Tipos do plano de estudos — `static/conteudo/plano.json` (contracts/plano.schema.json) e o
 * registro no aparelho (contracts/registro.md, data-model.md).
 */

export type StatusTopico = 'nao_iniciado' | 'estudado' | 'revisado' | 'travado';

/** Emenda D4: cada tópico gera uma tarefa de Leitura (`:L`) e, logo depois na fila, uma de Questões (`:Q`). */
export type ModoTarefa = 'leitura' | 'questoes';

/** Bloco do edital (estimado por disciplina até o edital sair). */
export type BlocoTarefa = 'basicos' | 'complementares' | 'especificos';

export interface Tarefa {
	/** `<topicoId>:L` ou `<topicoId>:Q` (ex.: `CDA-01:L`), único. */
	id: string;
	/** `id` do `ESTUDO.csv` (ex.: `CDA-01`). */
	topicoId: string;
	modo: ModoTarefa;
	bloco: BlocoTarefa;
	disciplina: string;
	/** Id de matéria do feed, ou `null` quando a disciplina não tem mapa. */
	materia: string | null;
	/** Texto literal do edital. */
	topico: string;
	minutos: number;
	prioridade: number;
	/** Status no `ESTUDO.csv` no momento da importação. */
	status: StatusTopico;
}

export interface Plano {
	versao: 1;
	geradoEm: string;
	/** `AAAA-MM-DD`, `inicio ≤ fim`. */
	inicio: string;
	fim: string;
	horasPorDia: number;
	/** Minutos de cada tarefa de Leitura (padrão 25). */
	minutosLeitura: number;
	/** Minutos de cada tarefa de Questões (padrão 20). */
	minutosQuestoes: number;
	/** Ordem = fila. */
	tarefas: Tarefa[];
}

/** Intervalo cronometrado fechado, em epoch ms: `[inicio, fim]`. */
export type Intervalo = [number, number];

export interface RegistroTarefa {
	/** Dia (local) em que a tarefa começou; o tempo conta para ele mesmo se o relógio virar o dia. */
	dia: string;
	intervalos: Intervalo[];
	/** Epoch ms do início do trecho em curso, ou `null` se o cronômetro não está rodando. */
	rodandoDesde: number | null;
	/** ISO; definitivo (não volta a `null`). */
	concluidaEm: string | null;
	/** Só em tarefa `:Q` (emenda D4); `null` quando não lançadas. */
	questoes: number | null;
	certas: number | null;
}

export interface DadosPlano {
	registros: Record<string, RegistroTarefa>;
	/** Missão fotografada por dia: `{ 'AAAA-MM-DD': [ids] }`. */
	fotos: Record<string, string[]>;
}

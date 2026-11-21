/**
 * Entrada do pacote da derivação das Missões para a página do artefato: o importador empacota
 * este arquivo com o esbuild em `artefatos/vendor/derivacao-missoes.js`, e a página da régua usa
 * quando o pacote carrega (no claude.ai ele não existe e a régua segue com o plano estático).
 * Assim a página e o painel (`src/lib/missoes/calculos.ts`) aplicam as mesmas regras: revisão na
 * data real, aula que desliza, recuperação de conteúdo em aberto e conclusão em outro dia.
 */
import {
	blocoCumprido,
	blocoFeito,
	diaCumprido,
	itemCumprido,
	itemFeito,
	mudancasDaAulaNova,
	mudancasDoBloco,
	mudancasDoBlocoAtrasado,
	mudancasDoItem,
	planoAjustado,
	progressoDoDia,
	soPonteiros
} from '../../src/lib/missoes/calculos';
import { aulasPorCod } from '../../src/lib/missoes/catalogo';
import mentoria from '../../src/lib/dados/mentoria.json' with { type: 'json' };

const aulas = (mentoria as { aulas?: Parameters<typeof aulasPorCod>[0] }).aulas ?? [];

(globalThis as unknown as { MissoesDerivacao: unknown }).MissoesDerivacao = {
	planoAjustado,
	blocoCumprido,
	blocoFeito,
	itemCumprido,
	itemFeito,
	diaCumprido,
	progressoDoDia,
	soPonteiros,
	mudancasDoBloco,
	mudancasDoItem,
	mudancasDoBlocoAtrasado,
	mudancasDaAulaNova,
	CATALOGOS: { cd: aulasPorCod(aulas, 'cd'), aud: aulasPorCod(aulas, 'aud') }
};

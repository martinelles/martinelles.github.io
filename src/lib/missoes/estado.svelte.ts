/**
 * Plano das Missões do cargo escolhido em Ajustes, para as telas (painel e feed). Trocar a
 * especialidade troca o plano; resposta atrasada do cargo anterior é descartada. Especialidade sem
 * plano (Infraestrutura) deixa `cargo` indefinido e nada é buscado. O plano já sai ajustado pelas
 * marcações e extras (`planoAjustado`): revisões na data real das aulas e aula não feita que
 * desliza para o dia seguinte.
 * Chamar na inicialização de um componente (usa `$effect`).
 */
import { foco } from '$lib/feed/foco.svelte';
import { dados } from '$lib/dados';
import { hojeLocal } from '$lib/datas';
import { planoAjustado } from './calculos';
import { aulasPorCod } from './catalogo';
import { carregarMissoes } from './carregar';
import { extrasMissoes } from './extras.svelte';
import { marcasMissoes } from './marcas.svelte';
import type { Cargo, PlanoMissoes } from './tipos';

export function usarPlanoMissoes() {
	let bruto = $state.raw<PlanoMissoes | null>(null);
	let erro = $state('');
	const cargo = $derived<Cargo | undefined>(foco.especialidade.ancora);
	$effect(() => {
		const c = cargo;
		bruto = null;
		erro = '';
		if (!c) return;
		carregarMissoes(c).then(
			(p) => {
				if (cargo === c) bruto = p;
			},
			(e) => {
				if (cargo === c) erro = e instanceof Error ? e.message : String(e);
			}
		);
	});
	const plano = $derived(
		bruto && cargo
			? planoAjustado(bruto, extrasMissoes.todas(), cargo, marcasMissoes.todas(), hojeLocal(), aulasPorCod(dados.mentoria?.aulas ?? [], cargo))
			: bruto
	);
	return {
		get plano() {
			return plano;
		},
		get erro() {
			return erro;
		},
		get cargo() {
			return cargo;
		}
	};
}

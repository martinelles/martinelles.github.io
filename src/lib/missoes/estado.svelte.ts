/**
 * Plano das Missões do cargo escolhido em Ajustes, para as telas (painel e feed). Trocar a
 * especialidade troca o plano; resposta atrasada do cargo anterior é descartada. Especialidade sem
 * plano (Infraestrutura) deixa `cargo` indefinido e nada é buscado. O plano já sai com as revisões
 * na data real das aulas novas feitas fora da missão (`planoAjustado`).
 * Chamar na inicialização de um componente (usa `$effect`).
 */
import { foco } from '$lib/feed/foco.svelte';
import { planoAjustado } from './calculos';
import { carregarMissoes } from './carregar';
import { extrasMissoes } from './extras.svelte';
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
	const plano = $derived(bruto && cargo ? planoAjustado(bruto, extrasMissoes.todas(), cargo) : bruto);
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

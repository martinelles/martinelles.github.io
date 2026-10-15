/**
 * Plano das Missões do cargo escolhido em Ajustes, para as telas (painel e feed). Trocar a
 * especialidade troca o plano; resposta atrasada do cargo anterior é descartada. Especialidade sem
 * plano (Infraestrutura) deixa `cargo` indefinido e nada é buscado.
 * Chamar na inicialização de um componente (usa `$effect`).
 */
import { foco } from '$lib/feed/foco.svelte';
import { carregarMissoes } from './carregar';
import type { Cargo, PlanoMissoes } from './tipos';

export function usarPlanoMissoes() {
	let plano = $state.raw<PlanoMissoes | null>(null);
	let erro = $state('');
	const cargo = $derived<Cargo | undefined>(foco.especialidade.ancora);
	$effect(() => {
		const c = cargo;
		plano = null;
		erro = '';
		if (!c) return;
		carregarMissoes(c).then(
			(p) => {
				if (cargo === c) plano = p;
			},
			(e) => {
				if (cargo === c) erro = e instanceof Error ? e.message : String(e);
			}
		);
	});
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

<script lang="ts">
	// Traçados adaptados de Lucide (ISC), https://lucide.dev
	// Círculos e retângulos do original foram convertidos em arcos/linhas de <path>, para
	// cada ícone caber num único atributo `d`. "whatsapp" é um balão de conversa genérico
	// (message-circle), não a marca do aplicativo.
	import type { NomeIcone } from '$lib/dados';

	let {
		nome,
		tamanho = 24,
		rotulo
	}: { nome: NomeIcone; tamanho?: number; rotulo?: string } = $props();

	const CORACAO =
		'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z';
	const MARCADOR = 'm19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z';

	// Record<NomeIcone, …>: o compilador acusa se algum nome de ICONES ficar sem desenho.
	const TRACADOS: Record<NomeIcone, string> = {
		balanca:
			'm16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Zm-14 0 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1ZM7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2',
		escudo:
			'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
		moeda: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 18V6',
		predio: 'M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4Z',
		martelo: 'm14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8M16 16l6-6M8 8l6-6M9 7l8 8M21 11l-8-8',
		grafico: 'M3 3v16a2 2 0 0 0 2 2h16M18 17V9M13 17V5M8 17v-3',
		livro:
			'M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3Z',
		caderno:
			'M2 6h4M2 10h4M2 14h4M2 18h4M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM16 2v20',
		mapa: 'M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0ZM15 5.764v15M9 3.236v15',
		documento:
			'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7ZM14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8',
		lista: 'M3 6h.01M3 12h.01M3 18h.01M8 6h13M8 12h13M8 18h13',
		raio: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14Z',
		cartas:
			'M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2ZM4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2',
		cronometro: 'M10 2h4M12 14l3-3M20 14a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
		calendario: 'M8 2v4M16 2v4M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM3 10h18',
		busca: 'm21 21-4.34-4.34M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
		whatsapp: 'M7.9 20A9 9 0 1 0 4 16.1L2 22Z',
		voltar: 'm12 19-7-7 7-7M19 12H5',
		'seta-baixo': 'm6 9 6 6 6-6',
		'seta-cima': 'm18 15-6-6-6 6',
		edital:
			'M15 12h-5M15 8h-5M19 17V5a2 2 0 0 0-2-2H4M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3',
		pessoas:
			'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
		relogio: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 6v6l4 2',
		trocar: 'm8 3-4 4 4 4M4 7h16m-4 14 4-4-4-4M20 17H4',
		coracao: CORACAO,
		'coracao-cheio': CORACAO,
		marcador: MARCADOR,
		'marcador-cheio': MARCADOR,
		casa: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z',
		grade:
			'M4 3h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm11 0h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm0 11h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1ZM4 14h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1Z',
		'seta-esquerda': 'm15 18-6-6 6-6',
		'seta-direita': 'm9 18 6-6-6-6',
		virar: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5',
		check: 'M20 6 9 17l-5-5',
		x: 'M18 6 6 18M6 6l12 12',
		// Sinal de parágrafo (§) desenhado à mão: dois "S" encaixados.
		lei: 'M15 5.5A3 3 0 0 0 12 3c-1.7 0-3 1.1-3 2.5 0 3 6 3 6 6 0 1.4-1.3 2.5-3 2.5M9 18.5a3 3 0 0 0 3 2.5c1.7 0 3-1.1 3-2.5 0-3-6-3-6-6 0-1.4 1.3-2.5 3-2.5',
		lampada:
			'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4',
		interrogacao: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01'
	};

	// Variantes "cheias": mesmo traçado, com preenchimento (estado ligado de curtir e salvar).
	const CHEIOS: ReadonlySet<NomeIcone> = new Set(['coracao-cheio', 'marcador-cheio']);
	const preenchimento = $derived(CHEIOS.has(nome) ? 'currentColor' : 'none');
</script>

{#if rotulo}
	<svg
		class="icone"
		width={tamanho}
		height={tamanho}
		viewBox="0 0 24 24"
		fill={preenchimento}
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		role="img"
		aria-label={rotulo}
	>
		<path d={TRACADOS[nome]} />
	</svg>
{:else}
	<svg
		class="icone"
		width={tamanho}
		height={tamanho}
		viewBox="0 0 24 24"
		fill={preenchimento}
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		focusable="false"
	>
		<path d={TRACADOS[nome]} />
	</svg>
{/if}

<style>
	.icone {
		display: block;
		flex-shrink: 0;
	}
</style>

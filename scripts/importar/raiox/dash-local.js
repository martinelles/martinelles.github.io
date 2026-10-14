/*
 * Substituto mínimo de `window.dash` (o runtime do tipo "dashboard" do claude.ai) para o Raio-X
 * servido pelo painel. Plano: planos/2026-10-14-artefatos-no-git.md, fase 2, decisão 3.
 *
 * Cobre só o que a página do Raio-X usa: data, onData, calc, colors, params, setParams, setLink.
 * Os atributos data-source e afins ficam como marcação: aqui não há o painel de fontes do tipo.
 *
 * Configuração, antes deste script: window.DASH_LOCAL = { datasets: { <id>: '<url do JSON>' } }.
 * Script comum (não módulo): usa só `window` e `fetch`, que o teste fornece falsos.
 */
(function () {
	var cfg = window.DASH_LOCAL || { datasets: {} };
	/** id → { status, data, columns, message } */
	var estado = {};
	/** id → { inputs, fn, memo: { chave, valor } } */
	var calcs = {};
	var ouvintes = [];
	var largura = window.innerWidth;

	// 8 cores de série: tokens definidos na página (claro e escuro).
	var colors = [];
	for (var i = 0; i < 8; i++) colors.push('var(--dash-cor-' + i + ')');

	function avisar() {
		ouvintes.forEach(function (fn) {
			fn();
		});
	}

	function colunas(linhas) {
		return linhas.length && typeof linhas[0] === 'object' ? Object.keys(linhas[0]) : [];
	}

	function carregar(id) {
		var url = cfg.datasets[id];
		if (!url) {
			estado[id] = { status: 'missing', data: [], columns: [], message: 'conjunto de dados desconhecido: ' + id };
			return;
		}
		estado[id] = { status: 'loading', data: [], columns: [] };
		fetch(url)
			.then(function (r) {
				if (!r.ok) throw new Error(url + ' respondeu ' + r.status);
				return r.json();
			})
			.then(function (j) {
				var linhas = Array.isArray(j) ? j : j.rows || j.data || j.results || [];
				estado[id] = { status: 'ok', data: linhas, columns: colunas(linhas) };
			})
			.catch(function (e) {
				estado[id] = { status: 'error', data: [], columns: [], message: String((e && e.message) || e) };
			})
			.then(avisar);
	}

	function dataDeCalc(id) {
		var c = calcs[id];
		var entradas = c.inputs.map(data);
		var erro = entradas.find(function (e) {
			return e.status === 'error' || e.status === 'missing';
		});
		if (erro) return { status: 'error', data: [], columns: [], message: erro.message };
		if (
			!entradas.every(function (e) {
				return e.status === 'ok';
			})
		)
			return { status: 'loading', data: [], columns: [] };
		var chave = entradas.map(function (e) {
			return e.data;
		});
		var mesma =
			c.memo &&
			c.memo.chave.length === chave.length &&
			c.memo.chave.every(function (d, k) {
				return d === chave[k];
			});
		if (!mesma) {
			var valor;
			try {
				valor = { status: 'ok', data: c.fn.apply(null, chave) };
			} catch (e) {
				valor = { status: 'error', data: [], message: String((e && e.message) || e) };
			}
			valor.columns = Array.isArray(valor.data) ? colunas(valor.data) : [];
			c.memo = { chave: chave, valor: valor };
		}
		return c.memo.valor;
	}

	function data(id) {
		if (calcs[id]) return dataDeCalc(id);
		if (!estado[id]) carregar(id);
		return estado[id];
	}

	function params() {
		var p = {};
		new URLSearchParams(window.location.search).forEach(function (v, k) {
			p[k] = v;
		});
		// Âncora dos links do painel (#cd, #aud) vale como cargo quando não há ?cargo=.
		if (!p.cargo && window.location.hash === '#aud') p.cargo = 'Auditoria';
		if (!p.cargo && window.location.hash === '#cd') p.cargo = 'Ciência de Dados';
		return p;
	}

	function setParams(novos) {
		var u = new URL(window.location.href);
		Object.keys(novos).forEach(function (k) {
			if (novos[k] === null || novos[k] === undefined) u.searchParams.delete(k);
			else u.searchParams.set(k, novos[k]);
		});
		window.history.replaceState(null, '', u.toString());
		avisar();
	}

	window.addEventListener('resize', function () {
		if (window.innerWidth === largura) return;
		largura = window.innerWidth;
		avisar();
	});

	window.dash = {
		colors: colors,
		data: data,
		calc: function (id, def) {
			calcs[id] = { inputs: def.inputs, fn: def.fn, memo: null };
		},
		onData: function (fn) {
			ouvintes.push(fn);
			fn();
		},
		params: params,
		setParams: setParams,
		resetParams: function () {
			var u = new URL(window.location.href);
			u.search = '';
			window.history.replaceState(null, '', u.toString());
			avisar();
		},
		setLink: function (nome) {
			var u = new URL(window.location.href);
			u.hash = nome;
			window.history.replaceState(null, '', u.toString());
		},
		refresh: function (id) {
			if (cfg.datasets[id]) carregar(id);
			avisar();
		}
	};
})();

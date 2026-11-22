"use strict";
(() => {
  // src/lib/datas.ts
  function utc(iso) {
    const [a, m, d] = iso.split("-").map(Number);
    return Date.UTC(a, m - 1, d);
  }
  var formatoData = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" });
  function formatarData(iso) {
    return formatoData.format(new Date(utc(iso)));
  }

  // src/lib/missoes/calculos.ts
  var chaveBloco = (cargo, data, indice) => `${cargo}~${data}~${indice}`;
  var blocoFeito = (marcas, cargo, dia, i) => !!marcas[chaveBloco(cargo, dia.data, i)];
  var diaCumprido = (marcas, cargo, dia) => dia.blocos.every((b, i) => soPonteiros(b) || blocoCumprido(marcas, cargo, dia, i, b));
  function progressoDoDia(marcas, cargo, dia) {
    let feitos = 0;
    let total = 0;
    dia.blocos.forEach((b, i) => {
      if (soPonteiros(b)) return;
      total++;
      if (blocoCumprido(marcas, cargo, dia, i, b)) feitos++;
    });
    return { feitos, total };
  }
  var soPonteiros = (b) => !!b.itens?.length && b.itens.every((it) => it.movida !== void 0 || it.suspensa === true);
  var itemCumprido = (marcas, cargo, dia, i, it) => it.feitaEm !== void 0 || itemFeito(marcas, cargo, dia, i, it.cid);
  var blocoCumprido = (marcas, cargo, dia, i, b) => blocoFeito(marcas, cargo, dia, i) || b.tipo === "novo" && !!b.itens?.length && b.itens.every((it) => itemCumprido(marcas, cargo, dia, i, it));
  var chaveItem = (cargo, data, indice, cid) => `${chaveBloco(cargo, data, indice)}~${cid}`;
  var itemFeito = (marcas, cargo, dia, i, cid) => blocoFeito(marcas, cargo, dia, i) || !!marcas[chaveItem(cargo, dia.data, i, cid)];
  function mudancasDoBloco(marcas, cargo, dia, i, feito) {
    const m = { [chaveBloco(cargo, dia.data, i)]: feito };
    if (!feito) for (const it of dia.blocos[i].itens ?? []) {
      const k = chaveItem(cargo, dia.data, i, it.cid);
      if (marcas[k]) m[k] = false;
    }
    return m;
  }
  function mudancasDoItem(marcas, cargo, dia, i, cid, feito) {
    const itens = dia.blocos[i].itens ?? [];
    const bloco = chaveBloco(cargo, dia.data, i);
    const m = { [chaveItem(cargo, dia.data, i, cid)]: feito };
    if (feito) {
      if (itens.every((it) => it.cid === cid || itemFeito(marcas, cargo, dia, i, it.cid))) m[bloco] = true;
    } else if (marcas[bloco]) {
      m[bloco] = false;
      for (const it of itens) if (it.cid !== cid) m[chaveItem(cargo, dia.data, i, it.cid)] = true;
    }
    return m;
  }
  function ocorrenciasDaAula(plano, cid) {
    const lista = [];
    for (const dia of plano.plan)
      dia.blocos.forEach((bloco, i) => {
        for (const item of bloco.itens ?? [])
          if (item.cid === cid) lista.push({ dia, bloco: i, tipo: bloco.tipo, item });
      });
    return lista;
  }
  function mudancasDaAulaNova(marcas, cargo, plano, cid) {
    const m = {};
    const simuladas = { ...marcas };
    for (const o of ocorrenciasDaAula(plano, cid)) {
      if (o.tipo !== "novo" || itemFeito(simuladas, cargo, o.dia, o.bloco, cid)) continue;
      const um = mudancasDoItem(simuladas, cargo, o.dia, o.bloco, cid, true);
      Object.assign(m, um);
      for (const [k, feito] of Object.entries(um)) {
        if (feito) simuladas[k] = true;
        else delete simuladas[k];
      }
    }
    return m;
  }
  function somarDias(iso, n) {
    const [a, m, d] = iso.split("-").map(Number);
    const t = new Date(Date.UTC(a, m - 1, d) + n * 864e5);
    const dois = (x) => String(x).padStart(2, "0");
    return `${t.getUTCFullYear()}-${dois(t.getUTCMonth() + 1)}-${dois(t.getUTCDate())}`;
  }
  var diasDoLab = (lab) => lab?.startsWith("D+") ? +lab.slice(2) : void 0;
  function planoAjustado(plano, extras, cargo, marcas, hoje, catalogo) {
    const real = /* @__PURE__ */ new Map();
    for (const [chave, tarefas] of Object.entries(extras)) {
      if (!chave.startsWith(`${cargo}~`)) continue;
      const dia = chave.slice(cargo.length + 1);
      for (const t of tarefas)
        if (t.tipo === "novo" && (!real.has(t.cid) || dia > real.get(t.cid))) real.set(t.cid, dia);
    }
    const previstos = plano.plan.map((d) => d.blocos.length);
    const abertas = /* @__PURE__ */ new Set();
    const minAberto = /* @__PURE__ */ new Map();
    const fimDe = /* @__PURE__ */ new Map();
    const codDe = /* @__PURE__ */ new Map();
    const aulasNoPlano = /* @__PURE__ */ new Set();
    const aulaDoTopico = /* @__PURE__ */ new Map();
    const topicosDaAula = /* @__PURE__ */ new Map();
    plano.plan.forEach(
      (dia) => dia.blocos.forEach((b, i) => {
        for (const it of b.itens ?? []) {
          if (b.tipo !== "novo") continue;
          codDe.set(it.cid, it.cod);
          if (!fimDe.has(it.cid) || dia.data > fimDe.get(it.cid)) fimDe.set(it.cid, dia.data);
          if (!itemFeito(marcas, cargo, dia, i, it.cid)) {
            abertas.add(it.cid);
            minAberto.set(it.cid, (minAberto.get(it.cid) ?? 0) + (it.min ?? 0));
          }
          if (it.subitens?.length) {
            aulasNoPlano.add(it.cid);
            topicosDaAula.set(it.cid, it.subitens);
            for (const s of it.subitens) aulaDoTopico.set(s.cid, it.cid);
          }
        }
      })
    );
    const concluidas = new Set(real.keys());
    for (const [chave, valor] of Object.entries(marcas)) {
      if (!valor) continue;
      const partes = chave.split("~");
      if (partes.length < 4 || partes[0] !== cargo) continue;
      const d = plano.plan.findIndex((x) => x.data === partes[1]);
      if (d < 0 || +partes[partes.length - 2] < previstos[d]) continue;
      const cid = partes.slice(3).join("~");
      if (!real.has(cid) || partes[1] > real.get(cid)) real.set(cid, partes[1]);
      concluidas.add(cid);
    }
    const aulaConcluida = (cid) => concluidas.has(cid) || aulasNoPlano.has(cid) && !abertas.has(cid);
    const sintetizadas = [];
    if (catalogo) {
      const grupos = /* @__PURE__ */ new Map();
      for (const cid of abertas) {
        if ((fimDe.get(cid) ?? "") >= hoje || aulaDoTopico.has(cid)) continue;
        const aula = catalogo.get(codDe.get(cid) ?? "");
        if (!aula || aulasNoPlano.has(aula.id)) continue;
        const g = grupos.get(aula.id) ?? [];
        g.push({ cid, cod: codDe.get(cid), min: minAberto.get(cid) ?? 0 });
        grupos.set(aula.id, g);
      }
      for (const [id, topicos] of grupos) {
        const aula = catalogo.get(topicos[0].cod);
        topicosDaAula.set(id, topicos);
        for (const t of topicos) aulaDoTopico.set(t.cid, id);
        if (aulaConcluida(id)) continue;
        sintetizadas.push({
          cid: id,
          cod: aula.cod,
          texto: aula.titulo,
          min: topicos.reduce((s, t) => s + t.min, 0),
          subitens: topicos.map(({ cid, cod }) => ({ cid, cod })),
          nota: "conte\xFAdo que passou em aberto"
        });
      }
    }
    for (const [aula, topicos] of topicosDaAula) {
      const data = real.get(aula);
      if (data) {
        for (const t of topicos) if (!real.has(t.cid)) real.set(t.cid, data);
      }
    }
    const feita = (cid) => concluidas.has(cid) || !abertas.has(cid) || aulaDoTopico.has(cid) && aulaConcluida(aulaDoTopico.get(cid));
    const fim = plano.plan[plano.plan.length - 1].data;
    const atrasou = plano.plan.some(
      (d) => d.data < hoje && d.blocos.some((b) => b.tipo === "novo" && b.itens?.some((it) => it.subitens && !feita(it.cid)))
    );
    const suspendeu = plano.plan.some(
      (d) => d.blocos.some(
        (b) => b.tipo === "rev" && b.itens?.some(
          (it) => diasDoLab(it.lab) !== void 0 && !feita(it.cid) && (fimDe.get(it.cid) ?? "") < hoje
        )
      )
    );
    if (!real.size && !atrasou && !suspendeu && !sintetizadas.length) return plano;
    const chegou = hoje >= plano.plan[0].data && hoje <= fim;
    const aulaNova = /* @__PURE__ */ new Map();
    for (const dia of plano.plan)
      for (const b of dia.blocos) {
        if (b.tipo !== "novo") continue;
        for (const it of b.itens ?? []) if (!aulaNova.has(it.cid)) aulaNova.set(it.cid, it);
      }
    for (const s of sintetizadas) aulaNova.set(s.cid, s);
    const entram = /* @__PURE__ */ new Map();
    const atrasadas = [];
    const encabe\u00E7a = /* @__PURE__ */ new Set();
    const labs = /* @__PURE__ */ new Map();
    const plan = plano.plan.map((dia) => ({
      ...dia,
      blocos: dia.blocos.map((b, i) => {
        if (b.tipo === "rev" && b.itens) {
          let mudou = false;
          const itens = b.itens.map((it) => {
            const n = diasDoLab(it.lab);
            if (n === void 0) return it;
            if (!feita(it.cid) && (fimDe.get(it.cid) ?? "") < hoje) {
              mudou = true;
              return { ...it, suspensa: true };
            }
            const diaReal = real.get(it.cid);
            if (!diaReal) return it;
            const doPlano = labs.get(it.cid) ?? /* @__PURE__ */ new Set();
            doPlano.add(it.lab);
            labs.set(it.cid, doPlano);
            const alvo = somarDias(diaReal, n);
            if (alvo === dia.data) return it;
            mudou = true;
            const fica = alvo <= fim;
            if (fica) {
              const lista = entram.get(alvo) ?? [];
              lista.push({ ...it, nota: `aula feita em ${formatarData(diaReal)}` });
              entram.set(alvo, lista);
            }
            return { ...it, movida: fica ? alvo : null };
          });
          return mudou ? { ...b, itens } : b;
        }
        if (b.tipo === "novo" && b.itens && dia.data < hoje) {
          let mudou = false;
          const itens = b.itens.map((it) => {
            if (itemFeito(marcas, cargo, dia, i, it.cid)) return it;
            let diaReal = real.get(it.cid);
            const aula = aulaDoTopico.get(it.cid);
            if (!diaReal && aula && aulaConcluida(aula)) diaReal = fimDe.get(aula) ?? dia.data;
            if (diaReal) {
              mudou = true;
              return { ...it, feitaEm: diaReal };
            }
            if (!it.subitens) return it;
            mudou = true;
            if (!encabe\u00E7a.has(it.cid)) {
              encabe\u00E7a.add(it.cid);
              atrasadas.push(it);
            }
            return { ...it, movida: chegou ? hoje : null };
          });
          return mudou ? { ...b, itens } : b;
        }
        return b;
      })
    }));
    for (const [cid, diaReal] of real) {
      const it = aulaNova.get(cid);
      if (!it) continue;
      for (const n of [1, 7, 30]) {
        const lab = `D+${n}`;
        if (labs.get(cid)?.has(lab)) continue;
        const alvo = somarDias(diaReal, n);
        if (alvo > fim) continue;
        const lista = entram.get(alvo) ?? [];
        lista.push({ cid, cod: it.cod, texto: it.texto, lab, nota: `aula feita em ${formatarData(diaReal)}` });
        entram.set(alvo, lista);
      }
    }
    const concluidasHoje = [];
    for (const [cid, data] of real) {
      if (data !== hoje) continue;
      const item = aulaNova.get(cid);
      if (!item || (fimDe.get(cid) ?? "") >= hoje) continue;
      concluidasHoje.push({ ...item, feitaEm: data });
    }
    return {
      ...plano,
      plan: plan.map((dia) => {
        const novos = entram.get(dia.data);
        let blocos = dia.blocos;
        if (novos?.length) {
          const rev = blocos.findIndex((b) => b.tipo === "rev");
          blocos = rev < 0 ? [
            ...blocos,
            { tipo: "rev", titulo: "Revis\xE3o remarcada", min: 15, itens: novos, det: "Aula feita em outro dia; a revis\xE3o segue a data real." }
          ] : blocos.map((b, i) => i === rev ? { ...b, itens: [...b.itens ?? [], ...novos] } : b);
        }
        const atraso = [...atrasadas, ...concluidasHoje, ...sintetizadas];
        if (atraso.length && dia.data === hoje)
          blocos = [
            ...blocos,
            {
              tipo: "novo",
              titulo: "Aulas atrasadas",
              min: atraso.reduce((s, it) => s + (it.min ?? 0), 0),
              itens: atraso,
              det: "Aula que passou do dia, ou conte\xFAdo em aberto cuja aula o plano n\xE3o trouxe; fica at\xE9 ser feita.",
              atrasado: true
            }
          ];
        return blocos === dia.blocos ? dia : { ...dia, blocos };
      })
    };
  }
  function mudancasDoBlocoAtrasado(marcas, cargo, dia, i, feito) {
    if (!feito) return mudancasDoBloco(marcas, cargo, dia, i, false);
    const m = {};
    const simuladas = { ...marcas };
    for (const it of dia.blocos[i].itens ?? []) {
      const um = mudancasDoItem(simuladas, cargo, dia, i, it.cid, true);
      Object.assign(m, um);
      for (const [k, f] of Object.entries(um)) {
        if (f) simuladas[k] = true;
        else delete simuladas[k];
      }
    }
    return m;
  }

  // src/lib/missoes/catalogo.ts
  function aulasPorCod(aulas2, cargo) {
    const pref = `${cargo.toUpperCase()}:`;
    const mapa = /* @__PURE__ */ new Map();
    for (const a of aulas2) {
      if (a.disciplina.endsWith(":DISC")) continue;
      if (a.disciplina.includes(":") && !a.disciplina.startsWith(pref)) continue;
      const disc = a.disciplina.split(":")[1] ?? a.disciplina;
      const n = a.titulo.match(/^\d+/)?.[0];
      if (!n) continue;
      for (const chave of a.subitens) {
        const semPref = chave.startsWith(pref) ? chave.slice(pref.length) : chave;
        if (semPref.includes(":")) continue;
        const cod = semPref.replace("-", " ");
        mapa.set(cod, { id: a.id, cod: `${disc}\xB7${n}`, titulo: a.titulo });
      }
    }
    return mapa;
  }

  // src/lib/dados/mentoria.json
  var mentoria_default = {
    curso: "Resumo Completo - CGU (Pietro Viecili, Plataforma Tutory)",
    playlists: {
      B1: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/e491375c-92aa-41f4-a703-f9a93528958c",
      B2: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/ebf1a293-b2c5-42cc-bc73-85ad0963074d",
      B3: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/c8df5ed3-1252-4e30-8f31-1f15e88d22ed",
      B4: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/f7cae9e9-2ac6-41e9-bceb-bc9d0d461735",
      C1: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/bd1a8d94-4f2a-404b-be1b-84014cb520d6",
      C2: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/7ba666fd-4f52-458e-8d12-e27d7367f159",
      C3: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/698c480a-1085-4978-ac7f-0c63ce25fefe",
      C4: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/6a7dba3a-3d54-4cec-b81a-bd1ce443a47e",
      C5: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/0bc7a2e5-67f9-455e-8277-896845c33f7d",
      "CD:E1": "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/2b107e3e-8317-49ff-9cd3-d810c8190549",
      "CD:E2": "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/a73ca465-f4f2-49df-b4fe-ff669d670434",
      "CD:E3": "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/eb8c9f6c-8af8-44d6-b826-fa6cc0ee8cdb",
      "CD:E4": "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/68877e22-b021-4869-9e97-23ed3feee2eb",
      "AUD:E1": "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/dee8b627-1894-4988-81a3-05d1d43da3f8",
      "AUD:E2": "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/e15a302e-39e6-4e2a-8f41-197c2c8189cb",
      "AUD:E3": "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/fa522028-e078-4e57-b370-889644adccbb",
      "AUD:E4": "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/8c6078bc-fc11-4cb6-a6b8-7b16dbee1190",
      "AUD:E5": "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/6fad600c-f14f-4055-af64-41ac0e941dca",
      "INFRA:E1": "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/2f8e9e0b-c6f1-4305-a742-20cfaef4d667",
      "INFRA:E2": "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/de97bae9-6162-4a63-a9e5-e01fd1f75374",
      "INFRA:E3": "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/ef103b63-d85c-470b-863a-48a897899827",
      "INFRA:E4": "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/7026a164-675a-49b2-a9c0-93c41418810e"
    },
    aulas: [
      {
        id: "cdb30a51-f9d8-4901-8e28-06316c41b35a",
        disciplina: "B1",
        titulo: "1. Estado e legitimidade",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/e491375c-92aa-41f4-a703-f9a93528958c/aulas/cdb30a51-f9d8-4901-8e28-06316c41b35a",
        tec: "https://www.tecconcursos.com.br/s/Q4pAiW",
        subitens: [
          "B1-1.1"
        ]
      },
      {
        id: "0dc27037-4df3-47ce-9861-43c0299ab331",
        disciplina: "B1",
        titulo: "2. Democracia e representa\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/e491375c-92aa-41f4-a703-f9a93528958c/aulas/0dc27037-4df3-47ce-9861-43c0299ab331",
        tec: "https://www.tecconcursos.com.br/s/Q4pDVz",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pBxb",
            rotulo: "Caderno extra 1",
            questoes: 29
          }
        ],
        subitens: [
          "B1-2.1"
        ]
      },
      {
        id: "82bc6d3e-6ae4-44d1-865d-8f34a015f4a1",
        disciplina: "B1",
        titulo: "3. Federalismo e capacidades estatais",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/e491375c-92aa-41f4-a703-f9a93528958c/aulas/82bc6d3e-6ae4-44d1-865d-8f34a015f4a1",
        tec: "https://www.tecconcursos.com.br/s/Q4p9tw",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4p9ud",
            rotulo: "Caderno extra 1",
            questoes: 28
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pT5h",
            rotulo: "Caderno extra 2",
            questoes: 9
          }
        ],
        subitens: [
          "B1-3.1"
        ]
      },
      {
        id: "638df406-97ff-482e-9877-9b0f2df9c7de",
        disciplina: "B1",
        titulo: "4. Ordem constitucional e direitos",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/e491375c-92aa-41f4-a703-f9a93528958c/aulas/638df406-97ff-482e-9877-9b0f2df9c7de",
        tec: "https://www.tecconcursos.com.br/s/Q4p9ov",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4p9sR",
            rotulo: "Caderno extra 1",
            questoes: 61
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4p9tV",
            rotulo: "Caderno extra 2",
            questoes: 62
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4p9sD",
            rotulo: "Caderno extra 3",
            questoes: 71
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4p9bA",
            rotulo: "Caderno extra 4",
            questoes: 157
          }
        ],
        subitens: [
          "B1-4.1"
        ]
      },
      {
        id: "d998d901-ecf7-48bc-b916-bd1cebb9750e",
        disciplina: "B1",
        titulo: "5. Valor p\xFAblico e controle",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/e491375c-92aa-41f4-a703-f9a93528958c/aulas/d998d901-ecf7-48bc-b916-bd1cebb9750e",
        tec: "https://www.tecconcursos.com.br/s/Q4pBxr",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q76KUE",
            rotulo: "Caderno extra 1",
            questoes: 10
          }
        ],
        subitens: [
          "B1-5.1"
        ]
      },
      {
        id: "f0f7b5ee-bab9-4399-825c-b8c6ac8ac339",
        disciplina: "B1",
        titulo: "6. Corrup\xE7\xE3o como fen\xF4meno pol\xEDtico e social",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/e491375c-92aa-41f4-a703-f9a93528958c/aulas/f0f7b5ee-bab9-4399-825c-b8c6ac8ac339",
        subitens: [
          "B1-6.1",
          "B1-6.2"
        ]
      },
      {
        id: "329c831f-21ca-4851-8cd2-31f58a87b911",
        disciplina: "B2",
        titulo: "1. Fundamentos sociol\xF3gicos",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/ebf1a293-b2c5-42cc-bc73-85ad0963074d/aulas/329c831f-21ca-4851-8cd2-31f58a87b911",
        subitens: [
          "B2-1.1"
        ]
      },
      {
        id: "004cd919-0712-4d96-881c-4b1477d49132",
        disciplina: "B2",
        titulo: "2. Forma\xE7\xE3o social e cidadania no Brasil",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/ebf1a293-b2c5-42cc-bc73-85ad0963074d/aulas/004cd919-0712-4d96-881c-4b1477d49132",
        subitens: [
          "B2-2.1"
        ]
      },
      {
        id: "7e90dd26-5cb7-4f2f-a53f-9e347989d059",
        disciplina: "B2",
        titulo: "3. Popula\xE7\xE3o, territ\xF3rio e trabalho",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/ebf1a293-b2c5-42cc-bc73-85ad0963074d/aulas/7e90dd26-5cb7-4f2f-a53f-9e347989d059",
        subitens: [
          "B2-3.1"
        ]
      },
      {
        id: "f7cb2a04-b3bf-4ba0-8c7b-6f538b2d8198",
        disciplina: "B2",
        titulo: "4. Diversidade e acesso a direitos",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/ebf1a293-b2c5-42cc-bc73-85ad0963074d/aulas/f7cb2a04-b3bf-4ba0-8c7b-6f538b2d8198",
        subitens: [
          "B2-4.1"
        ]
      },
      {
        id: "1e129759-9a85-4e43-aa58-d78920059b3a",
        disciplina: "B2",
        titulo: "5. Desenvolvimento e realidade brasileira",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/ebf1a293-b2c5-42cc-bc73-85ad0963074d/aulas/1e129759-9a85-4e43-aa58-d78920059b3a",
        subitens: [
          "B2-5.1"
        ]
      },
      {
        id: "4ae0d937-55df-4c3b-9e44-f24d1eb3f691",
        disciplina: "B3",
        titulo: "1. Fundamentos da \xE9tica p\xFAblica",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/c8df5ed3-1252-4e30-8f31-1f15e88d22ed/aulas/4ae0d937-55df-4c3b-9e44-f24d1eb3f691",
        tec: "https://www.tecconcursos.com.br/s/Q71Fz9",
        subitens: [
          "B3-1.1"
        ]
      },
      {
        id: "a9176ae5-3d96-4932-8ecc-2b1d416c8432",
        disciplina: "B3",
        titulo: "2. Deveres profissionais",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/c8df5ed3-1252-4e30-8f31-1f15e88d22ed/aulas/a9176ae5-3d96-4932-8ecc-2b1d416c8432",
        tec: "https://www.tecconcursos.com.br/s/Q71FzB",
        subitens: [
          "B3-2.1",
          "B3-2.2"
        ]
      },
      {
        id: "c564fbe2-da31-4bd9-a1ee-3fb59ae480ee",
        disciplina: "B3",
        titulo: "3. Conflitos de interesses e imparcialidade",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/c8df5ed3-1252-4e30-8f31-1f15e88d22ed/aulas/c564fbe2-da31-4bd9-a1ee-3fb59ae480ee",
        subitens: [
          "B3-3.1",
          "B3-3.2"
        ]
      },
      {
        id: "5542acf9-bd80-42bc-9265-33f3b3af98b8",
        disciplina: "B3",
        titulo: "4. Rela\xE7\xF5es de trabalho e atendimento",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/c8df5ed3-1252-4e30-8f31-1f15e88d22ed/aulas/5542acf9-bd80-42bc-9265-33f3b3af98b8",
        subitens: [
          "B3-4.1",
          "B3-4.2"
        ]
      },
      {
        id: "0fd55953-13af-4e6c-bcfb-0553c3ba522e",
        disciplina: "B3",
        titulo: "5. Integridade como responsabilidade institucional",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/c8df5ed3-1252-4e30-8f31-1f15e88d22ed/aulas/0fd55953-13af-4e6c-bcfb-0553c3ba522e",
        tec: "https://www.tecconcursos.com.br/s/Q6j8hJ",
        subitens: [
          "B3-5.1"
        ]
      },
      {
        id: "c010df39-2d13-4d0b-89e2-f309f7c35675",
        disciplina: "B4",
        titulo: "1. Organiza\xE7\xE3o administrativa",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/f7cae9e9-2ac6-41e9-bceb-bc9d0d461735/aulas/c010df39-2d13-4d0b-89e2-f309f7c35675",
        tec: "https://www.tecconcursos.com.br/s/Q6li0m",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q6li1Q",
            rotulo: "Caderno extra 1",
            questoes: 71
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q6li2L",
            rotulo: "Caderno extra 2",
            questoes: 48
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q6li34",
            rotulo: "Caderno extra 3",
            questoes: 45
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q6li5N",
            rotulo: "Caderno extra 4",
            questoes: 63
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pAeF",
            rotulo: "Caderno extra 5",
            questoes: 127
          }
        ],
        subitens: [
          "B4-1.1"
        ]
      },
      {
        id: "705854f2-6543-4c90-a1a4-1058f9b017ec",
        disciplina: "B4",
        titulo: "2. Modelos de administra\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/f7cae9e9-2ac6-41e9-bceb-bc9d0d461735/aulas/705854f2-6543-4c90-a1a4-1058f9b017ec",
        tec: "https://www.tecconcursos.com.br/s/Q4pByb",
        subitens: [
          "B4-2.1"
        ]
      },
      {
        id: "f5f4b449-cdf5-4b35-8d4d-6350a0f55936",
        disciplina: "B4",
        titulo: "3. Pol\xEDticas p\xFAblicas",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/f7cae9e9-2ac6-41e9-bceb-bc9d0d461735/aulas/f5f4b449-cdf5-4b35-8d4d-6350a0f55936",
        tec: "https://www.tecconcursos.com.br/s/Q4pByL",
        subitens: [
          "B4-3.1"
        ]
      },
      {
        id: "557c878b-8373-42c3-afbc-792c490c609d",
        disciplina: "B4",
        titulo: "4. Planejamento e recursos",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/f7cae9e9-2ac6-41e9-bceb-bc9d0d461735/aulas/557c878b-8373-42c3-afbc-792c490c609d",
        tec: "https://www.tecconcursos.com.br/s/Q76KTR",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q76KTW",
            rotulo: "Caderno extra 1",
            questoes: 84
          }
        ],
        subitens: [
          "B4-4.1"
        ]
      },
      {
        id: "4d2103ce-5aae-4b31-8829-a5cc56da7863",
        disciplina: "B4",
        titulo: "5. Servi\xE7os e transforma\xE7\xE3o digital",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/f7cae9e9-2ac6-41e9-bceb-bc9d0d461735/aulas/4d2103ce-5aae-4b31-8829-a5cc56da7863",
        tec: "https://www.tecconcursos.com.br/s/Q4pC2N",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pAnE",
            rotulo: "Caderno extra 1",
            questoes: 102
          }
        ],
        subitens: [
          "B4-5.1"
        ]
      },
      {
        id: "94343c95-037e-496c-9536-7c20ad4789db",
        disciplina: "C1",
        titulo: "1. Governan\xE7a e responsabilidades",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/bd1a8d94-4f2a-404b-be1b-84014cb520d6/aulas/94343c95-037e-496c-9536-7c20ad4789db",
        subitens: [
          "C1-1.1"
        ]
      },
      {
        id: "84433923-a53e-4584-b6bd-81e872d11099",
        disciplina: "C1",
        titulo: "2. Riscos e controles essenciais",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/bd1a8d94-4f2a-404b-be1b-84014cb520d6/aulas/84433923-a53e-4584-b6bd-81e872d11099",
        subitens: [
          "C1-2.1",
          "C1-2.2"
        ]
      },
      {
        id: "292113de-32ac-4db1-9089-c4fbdc696f5f",
        disciplina: "C1",
        titulo: "3. Integridade p\xFAblica",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/bd1a8d94-4f2a-404b-be1b-84014cb520d6/aulas/292113de-32ac-4db1-9089-c4fbdc696f5f",
        subitens: [
          "C1-3.1",
          "C1-3.2"
        ]
      },
      {
        id: "df96e71e-80a1-4a1e-bec1-090db5cf8355",
        disciplina: "C1",
        titulo: "4. Integridade privada",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/bd1a8d94-4f2a-404b-be1b-84014cb520d6/aulas/df96e71e-80a1-4a1e-bec1-090db5cf8355",
        subitens: [
          "C1-4.1",
          "C1-4.2"
        ]
      },
      {
        id: "df15fa2c-eaad-43a7-b4ed-e86f7d851ea0",
        disciplina: "C1",
        titulo: "5. Preven\xE7\xE3o e melhoria institucional",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/bd1a8d94-4f2a-404b-be1b-84014cb520d6/aulas/df15fa2c-eaad-43a7-b4ed-e86f7d851ea0",
        subitens: [
          "C1-5.1",
          "C1-5.2",
          "C1-5.3"
        ]
      },
      {
        id: "301ad507-de5a-4974-a671-aec72c37489e",
        disciplina: "C2",
        titulo: "1. Acesso \xE0 informa\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/7ba666fd-4f52-458e-8d12-e27d7367f159/aulas/301ad507-de5a-4974-a671-aec72c37489e",
        tec: "https://www.tecconcursos.com.br/s/Q7Bm69",
        subitens: [
          "C2-1.1",
          "C2-1.2"
        ]
      },
      {
        id: "20da6da0-d1f0-49d7-b6db-300bbb9d60d0",
        disciplina: "C2",
        titulo: "2. Transpar\xEAncia e prote\xE7\xE3o de dados",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/7ba666fd-4f52-458e-8d12-e27d7367f159/aulas/20da6da0-d1f0-49d7-b6db-300bbb9d60d0",
        tec: "https://www.tecconcursos.com.br/s/Q76KVB",
        subitens: [
          "C2-2.1",
          "C2-2.2"
        ]
      },
      {
        id: "caf2052c-7259-4622-9cb7-b9702481ac9f",
        disciplina: "C2",
        titulo: "3. Ouvidoria e prote\xE7\xE3o das pessoas",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/7ba666fd-4f52-458e-8d12-e27d7367f159/aulas/caf2052c-7259-4622-9cb7-b9702481ac9f",
        tec: "https://www.tecconcursos.com.br/s/Q6j8fN",
        subitens: [
          "C2-3.1",
          "C2-3.2",
          "C2-3.3"
        ]
      },
      {
        id: "8fa4c3ef-ac03-4da3-baaa-a0f526e0b577",
        disciplina: "C2",
        titulo: "4. Participa\xE7\xE3o e melhoria de servi\xE7os",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/7ba666fd-4f52-458e-8d12-e27d7367f159/aulas/8fa4c3ef-ac03-4da3-baaa-a0f526e0b577",
        subitens: [
          "C2-4.1",
          "C2-4.2",
          "C2-4.3",
          "C2-4.4"
        ]
      },
      {
        id: "3d270ccb-4764-47ee-a061-2954e5f3d556",
        disciplina: "C2",
        titulo: "5. Integridade da informa\xE7\xE3o e comunica\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/7ba666fd-4f52-458e-8d12-e27d7367f159/aulas/3d270ccb-4764-47ee-a061-2954e5f3d556",
        tec: "https://www.tecconcursos.com.br/s/Q4p9ro",
        subitens: [
          "C2-5.1",
          "C2-5.2",
          "C2-5.3"
        ]
      },
      {
        id: "9974c415-a81d-4096-b89c-f9a51eff953e",
        disciplina: "C3",
        titulo: "1. Decis\xE3o administrativa",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/698c480a-1085-4978-ac7f-0c63ce25fefe/aulas/9974c415-a81d-4096-b89c-f9a51eff953e",
        tec: "https://www.tecconcursos.com.br/s/Q4pAla",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pAkx",
            rotulo: "Caderno extra 1",
            questoes: 117
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q76KV0",
            rotulo: "Caderno extra 2",
            questoes: 99
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q76KVE",
            rotulo: "Caderno extra 3",
            questoes: 3
          }
        ],
        subitens: [
          "C3-1.1",
          "C3-1.2"
        ]
      },
      {
        id: "86f4aaef-37f3-4308-b7a9-98162e9052e9",
        disciplina: "C3",
        titulo: "2. Processo e garantias",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/698c480a-1085-4978-ac7f-0c63ce25fefe/aulas/86f4aaef-37f3-4308-b7a9-98162e9052e9",
        tec: "https://www.tecconcursos.com.br/s/Q4pAfd",
        subitens: [
          "C3-2.1",
          "C3-2.2"
        ]
      },
      {
        id: "a96b9dad-6b84-498e-8bd6-e9db65cfc691",
        disciplina: "C3",
        titulo: "3. Fun\xE7\xF5es de controle e melhoria da gest\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/698c480a-1085-4978-ac7f-0c63ce25fefe/aulas/a96b9dad-6b84-498e-8bd6-e9db65cfc691",
        tec: "https://www.tecconcursos.com.br/s/Q71Fk8",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4p9bb",
            rotulo: "Caderno extra 1",
            questoes: 91
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4p9dX",
            rotulo: "Caderno extra 2",
            questoes: 72
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pAd3",
            rotulo: "Caderno extra 3",
            questoes: 210
          }
        ],
        subitens: [
          "C3-3.1",
          "C3-3.2",
          "C3-3.3",
          "C3-3.4"
        ]
      },
      {
        id: "4e721c11-956c-4f11-8e34-3ce3c288ae82",
        disciplina: "C3",
        titulo: "4. Responsabiliza\xE7\xE3o em n\xEDvel introdut\xF3rio",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/698c480a-1085-4978-ac7f-0c63ce25fefe/aulas/4e721c11-956c-4f11-8e34-3ce3c288ae82",
        tec: "https://www.tecconcursos.com.br/s/Q76KUy",
        subitens: [
          "C3-4.1",
          "C3-4.2"
        ]
      },
      {
        id: "17ba738c-3bab-4d3b-b802-4ff29f8cc4f1",
        disciplina: "C3",
        titulo: "5. Prote\xE7\xE3o e encaminhamento",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/698c480a-1085-4978-ac7f-0c63ce25fefe/aulas/17ba738c-3bab-4d3b-b802-4ff29f8cc4f1",
        subitens: [
          "C3-5.1"
        ]
      },
      {
        id: "553ee9ed-b71b-41ba-92d0-7439dccfecfd",
        disciplina: "C4",
        titulo: "1. Perguntas e fontes",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/6a7dba3a-3d54-4cec-b81a-bd1ce443a47e/aulas/553ee9ed-b71b-41ba-92d0-7439dccfecfd",
        subitens: [
          "C4-1.1",
          "C4-1.2"
        ]
      },
      {
        id: "111e0c68-3ccb-429e-b522-2259f4127ca9",
        disciplina: "C4",
        titulo: "2. Leitura de dados e indicadores",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/6a7dba3a-3d54-4cec-b81a-bd1ce443a47e/aulas/111e0c68-3ccb-429e-b522-2259f4127ca9",
        subitens: [
          "C4-2.1",
          "C4-2.2"
        ]
      },
      {
        id: "8853ed35-f8fc-4ed9-be56-ad5052403d38",
        disciplina: "C4",
        titulo: "3. Infer\xEAncias e erros de racioc\xEDnio",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/6a7dba3a-3d54-4cec-b81a-bd1ce443a47e/aulas/8853ed35-f8fc-4ed9-be56-ad5052403d38",
        subitens: [
          "C4-3.1",
          "C4-3.2"
        ]
      },
      {
        id: "a16bbdff-49a9-47eb-b3d7-df5b66103cbd",
        disciplina: "C4",
        titulo: "4. Integridade da evid\xEAncia e prote\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/6a7dba3a-3d54-4cec-b81a-bd1ce443a47e/aulas/a16bbdff-49a9-47eb-b3d7-df5b66103cbd",
        subitens: [
          "C4-4.1",
          "C4-4.2",
          "C4-4.3"
        ]
      },
      {
        id: "25c5bc57-9d91-4893-9aa5-30dd59e0e873",
        disciplina: "C4",
        titulo: "5. Uso respons\xE1vel de intelig\xEAncia artificial",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/6a7dba3a-3d54-4cec-b81a-bd1ce443a47e/aulas/25c5bc57-9d91-4893-9aa5-30dd59e0e873",
        subitens: [
          "C4-5.1",
          "C4-5.2",
          "C4-5.3"
        ]
      },
      {
        id: "72f0e332-9d09-41cf-a759-3b4d83957f29",
        disciplina: "C5",
        titulo: "1. Prop\xF3sito, servi\xE7os e pap\xE9is",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/0bc7a2e5-67f9-455e-8277-896845c33f7d/aulas/72f0e332-9d09-41cf-a759-3b4d83957f29",
        tec: "https://www.tecconcursos.com.br/s/Q71FkN",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q71Fmr",
            rotulo: "Caderno extra 1",
            questoes: 10
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q71FnE",
            rotulo: "Caderno extra 2",
            questoes: 32
          }
        ],
        subitens: [
          "C5-1.1",
          "C5-1.2",
          "C5-1.3",
          "C5-1.4"
        ]
      },
      {
        id: "4617b363-479e-4234-9d56-2a00f6ea33ed",
        disciplina: "C5",
        titulo: "2. Ciclo do trabalho",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/0bc7a2e5-67f9-455e-8277-896845c33f7d/aulas/4617b363-479e-4234-9d56-2a00f6ea33ed",
        subitens: [
          "C5-2.1",
          "C5-2.2",
          "C5-2.3"
        ]
      },
      {
        id: "4ed9e0ba-8826-4e4e-92c3-ea7c523e4bcf",
        disciplina: "C5",
        titulo: "3. Evid\xEAncia e conclus\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/0bc7a2e5-67f9-455e-8277-896845c33f7d/aulas/4ed9e0ba-8826-4e4e-92c3-ea7c523e4bcf",
        subitens: [
          "C5-3.1",
          "C5-3.2"
        ]
      },
      {
        id: "b0228549-d150-4fc3-b8bb-735f77475f7e",
        disciplina: "C5",
        titulo: "4. Comunica\xE7\xE3o e acompanhamento",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/0bc7a2e5-67f9-455e-8277-896845c33f7d/aulas/b0228549-d150-4fc3-b8bb-735f77475f7e",
        tec: "https://www.tecconcursos.com.br/s/Q71Fll",
        subitens: [
          "C5-4.1",
          "C5-4.2"
        ]
      },
      {
        id: "a7b5a4ca-0f61-4fd8-bba9-c4bc3a27a899",
        disciplina: "C5",
        titulo: "5. Integra\xE7\xE3o entre fun\xE7\xF5es da CGU",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/0bc7a2e5-67f9-455e-8277-896845c33f7d/aulas/a7b5a4ca-0f61-4fd8-bba9-c4bc3a27a899",
        tec: "https://www.tecconcursos.com.br/s/Q6j8XT",
        subitens: [
          "C5-5.1",
          "C5-5.2"
        ]
      },
      {
        id: "9d250484-e1d2-42c9-81a9-2cf38dc53b76",
        disciplina: "CD:E1",
        titulo: "1. Explora\xE7\xE3o e descri\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/2b107e3e-8317-49ff-9cd3-d810c8190549/aulas/9d250484-e1d2-42c9-81a9-2cf38dc53b76",
        tec: "https://www.tecconcursos.com.br/s/Q4pSoh",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pSp4",
            rotulo: "Caderno extra 1",
            questoes: 113
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pSpd",
            rotulo: "Caderno extra 2",
            questoes: 160
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pSq2",
            rotulo: "Caderno extra 3",
            questoes: 163
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pSqO",
            rotulo: "Caderno extra 4",
            questoes: 86
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pSxb",
            rotulo: "Caderno extra 5",
            questoes: 73
          }
        ],
        subitens: [
          "CD:E1-1.1"
        ]
      },
      {
        id: "72287eb6-0ff5-4f0c-a5b5-4bff6375c9b2",
        disciplina: "CD:E1",
        titulo: "2. Probabilidade e infer\xEAncia",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/2b107e3e-8317-49ff-9cd3-d810c8190549/aulas/72287eb6-0ff5-4f0c-a5b5-4bff6375c9b2",
        tec: "https://www.tecconcursos.com.br/s/Q4pSr2",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pSrl",
            rotulo: "Caderno extra 1",
            questoes: 152
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pSsB",
            rotulo: "Caderno extra 2",
            questoes: 162
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pSsq",
            rotulo: "Caderno extra 3",
            questoes: 257
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pSuX",
            rotulo: "Caderno extra 4",
            questoes: 72
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7BauO",
            rotulo: "Caderno extra 5",
            questoes: 84
          }
        ],
        subitens: [
          "CD:E1-2.1",
          "CD:E1-2.2"
        ]
      },
      {
        id: "dffe2a30-790e-40e1-9565-88bfce8395fb",
        disciplina: "CD:E1",
        titulo: "3. Rela\xE7\xF5es entre vari\xE1veis",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/2b107e3e-8317-49ff-9cd3-d810c8190549/aulas/dffe2a30-790e-40e1-9565-88bfce8395fb",
        tec: "https://www.tecconcursos.com.br/s/Q4pSvD",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pT17",
            rotulo: "Caderno extra 1",
            questoes: 48
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pSvp",
            rotulo: "Caderno extra 2",
            questoes: 7
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bax2",
            rotulo: "Caderno extra 3",
            questoes: 23
          }
        ],
        subitens: [
          "CD:E1-3.1",
          "CD:E1-3.2"
        ]
      },
      {
        id: "7eb9dd64-07bd-4922-a54d-30172662df85",
        disciplina: "CD:E1",
        titulo: "4. Programa\xE7\xE3o para an\xE1lise",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/2b107e3e-8317-49ff-9cd3-d810c8190549/aulas/7eb9dd64-07bd-4922-a54d-30172662df85",
        tec: "https://www.tecconcursos.com.br/s/Q4pFIz",
        subitens: [
          "CD:E1-4.1"
        ]
      },
      {
        id: "b0b0e90b-c3ca-4357-bf05-c13bc87daffe",
        disciplina: "CD:E1",
        titulo: "5. Prepara\xE7\xE3o e transforma\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/2b107e3e-8317-49ff-9cd3-d810c8190549/aulas/b0b0e90b-c3ca-4357-bf05-c13bc87daffe",
        tec: "https://www.tecconcursos.com.br/s/Q4pFH2",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pFJP",
            rotulo: "Caderno extra 1",
            questoes: 68
          }
        ],
        subitens: [
          "CD:E1-5.1"
        ]
      },
      {
        id: "659837d3-14c0-48e3-8ae4-6aaa5bc2ff49",
        disciplina: "CD:E2",
        titulo: "1. Modelagem e arquiteturas",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/a73ca465-f4f2-49df-b4fe-ff669d670434/aulas/659837d3-14c0-48e3-8ae4-6aaa5bc2ff49",
        tec: "https://www.tecconcursos.com.br/s/Q4pFFV",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pFG1",
            rotulo: "Caderno extra 1",
            questoes: 78
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pFKA",
            rotulo: "Caderno extra 2",
            questoes: 98
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pFGL",
            rotulo: "Caderno extra 3",
            questoes: 287
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q6MSQr",
            rotulo: "Caderno extra 4",
            questoes: 125
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bcgq",
            rotulo: "Caderno extra 5",
            questoes: 48
          }
        ],
        subitens: [
          "CD:E2-1.1",
          "CD:E2-1.2"
        ]
      },
      {
        id: "b2d3273c-3041-4085-bf17-7c9919b8135c",
        disciplina: "CD:E2",
        titulo: "2. SQL e consultas anal\xEDticas",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/a73ca465-f4f2-49df-b4fe-ff669d670434/aulas/b2d3273c-3041-4085-bf17-7c9919b8135c",
        tec: "https://www.tecconcursos.com.br/s/Q4pFGE",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bax6",
            rotulo: "Caderno extra 1",
            questoes: 204
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bax8",
            rotulo: "Caderno extra 2",
            questoes: 85
          }
        ],
        subitens: [
          "CD:E2-2.1",
          "CD:E2-2.2"
        ]
      },
      {
        id: "78abb037-89d4-48ec-8116-a021668d0d3f",
        disciplina: "CD:E2",
        titulo: "3. Ingest\xE3o e integra\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/a73ca465-f4f2-49df-b4fe-ff669d670434/aulas/78abb037-89d4-48ec-8116-a021668d0d3f",
        tec: "https://www.tecconcursos.com.br/s/Q4pEGQ",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pEDR",
            rotulo: "Caderno extra 1",
            questoes: 92
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7BaxC",
            rotulo: "Caderno extra 2",
            questoes: 16
          }
        ],
        subitens: [
          "CD:E2-3.1"
        ]
      },
      {
        id: "23cfffb2-51fa-4000-b96c-c2787e8fbd08",
        disciplina: "CD:E2",
        titulo: "4. Processamento distribu\xEDdo",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/a73ca465-f4f2-49df-b4fe-ff669d670434/aulas/23cfffb2-51fa-4000-b96c-c2787e8fbd08",
        tec: "https://www.tecconcursos.com.br/s/Q4pFIV",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pFKr",
            rotulo: "Caderno extra 1",
            questoes: 62
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q6bLwD",
            rotulo: "Caderno extra 2",
            questoes: 45
          }
        ],
        subitens: [
          "CD:E2-4.1",
          "CD:E2-4.2",
          "CD:E2-4.3",
          "CD:E2-4.4"
        ]
      },
      {
        id: "5e202dbd-f4b9-4fef-8361-a549e3825c8c",
        disciplina: "CD:E2",
        titulo: "5. Qualidade e rastreabilidade",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/a73ca465-f4f2-49df-b4fe-ff669d670434/aulas/5e202dbd-f4b9-4fef-8361-a549e3825c8c",
        tec: "https://www.tecconcursos.com.br/s/Q6bLx8",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pFE3",
            rotulo: "Caderno extra 1",
            questoes: 20
          }
        ],
        subitens: [
          "CD:E2-5.1",
          "CD:E2-5.2",
          "CD:E2-5.3",
          "CD:E2-5.4",
          "CD:E2-5.5"
        ]
      },
      {
        id: "b33bd424-d062-4ac3-8dd2-c3a04d20ce5e",
        disciplina: "CD:E2",
        titulo: "6. Compartilhamento e prote\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/a73ca465-f4f2-49df-b4fe-ff669d670434/aulas/b33bd424-d062-4ac3-8dd2-c3a04d20ce5e",
        tec: "https://www.tecconcursos.com.br/s/Q4pFJv",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q6lhbw",
            rotulo: "Caderno extra 1",
            questoes: 12
          }
        ],
        subitens: [
          "CD:E2-6.1",
          "CD:E2-6.2",
          "CD:E2-6.3",
          "CD:E2-6.4",
          "CD:E2-6.5"
        ]
      },
      {
        id: "eb39643e-c14d-4b7d-a999-fa0fcb6a952f",
        disciplina: "CD:E3",
        titulo: "1. Sele\xE7\xE3o e constru\xE7\xE3o de modelos",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/eb8c9f6c-8af8-44d6-b826-fa6cc0ee8cdb/aulas/eb39643e-c14d-4b7d-a999-fa0fcb6a952f",
        tec: "https://www.tecconcursos.com.br/s/Q6bLxK",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pSx8",
            rotulo: "Caderno extra 1",
            questoes: 36
          }
        ],
        subitens: [
          "CD:E3-1.1",
          "CD:E3-1.2"
        ]
      },
      {
        id: "7ba0d06b-a9a5-4a83-9077-ee6b5987f14b",
        disciplina: "CD:E3",
        titulo: "2. Valida\xE7\xE3o e generaliza\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/eb8c9f6c-8af8-44d6-b826-fa6cc0ee8cdb/aulas/7ba0d06b-a9a5-4a83-9077-ee6b5987f14b",
        tec: "https://www.tecconcursos.com.br/s/Q7BcgR",
        subitens: [
          "CD:E3-2.1",
          "CD:E3-2.2",
          "CD:E3-2.3",
          "CD:E3-2.4",
          "CD:E3-2.5",
          "CD:E3-2.6"
        ]
      },
      {
        id: "e31f9e35-312a-4b18-8438-4c6bc2f59634",
        disciplina: "CD:E3",
        titulo: "3. M\xE9tricas e efeitos das decis\xF5es",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/eb8c9f6c-8af8-44d6-b826-fa6cc0ee8cdb/aulas/e31f9e35-312a-4b18-8438-4c6bc2f59634",
        tec: "https://www.tecconcursos.com.br/s/Q7BcgR",
        subitens: [
          "CD:E3-3.1",
          "CD:E3-3.2",
          "CD:E3-3.3",
          "CD:E3-3.4",
          "CD:E3-3.5"
        ]
      },
      {
        id: "cd4ce925-f8a7-42d6-9565-c6cc2090f44f",
        disciplina: "CD:E3",
        titulo: "4. Redes neurais",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/eb8c9f6c-8af8-44d6-b826-fa6cc0ee8cdb/aulas/cd4ce925-f8a7-42d6-9565-c6cc2090f44f",
        tec: "https://www.tecconcursos.com.br/s/Q7BcgT",
        subitens: [
          "CD:E3-4.1",
          "CD:E3-4.2",
          "CD:E3-4.3",
          "CD:E3-4.4",
          "CD:E3-4.5"
        ]
      },
      {
        id: "42e6c0a3-cb53-4c20-8bdb-5437f38c8335",
        disciplina: "CD:E3",
        titulo: "5. Linguagem natural e modelos generativos",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/eb8c9f6c-8af8-44d6-b826-fa6cc0ee8cdb/aulas/42e6c0a3-cb53-4c20-8bdb-5437f38c8335",
        tec: "https://www.tecconcursos.com.br/s/Q4pFHX",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7BcgY",
            rotulo: "Caderno extra 1",
            questoes: 18
          }
        ],
        subitens: [
          "CD:E3-5.1",
          "CD:E3-5.2",
          "CD:E3-5.3",
          "CD:E3-5.4",
          "CD:E3-5.5"
        ]
      },
      {
        id: "effa9cc6-73f9-4c60-b811-8d78409256d1",
        disciplina: "CD:E3",
        titulo: "6. Agentes e uso seguro de ferramentas",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/eb8c9f6c-8af8-44d6-b826-fa6cc0ee8cdb/aulas/effa9cc6-73f9-4c60-b811-8d78409256d1",
        tec: "https://www.tecconcursos.com.br/s/Q7BcgY",
        subitens: [
          "CD:E3-6.1",
          "CD:E3-6.2",
          "CD:E3-6.3",
          "CD:E3-6.4"
        ]
      },
      {
        id: "a9802db4-3741-4b2d-b49a-77a050f7c64f",
        disciplina: "CD:E4",
        titulo: "1. Ciclo de vida e MLOps",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/68877e22-b021-4869-9e97-23ed3feee2eb/aulas/a9802db4-3741-4b2d-b49a-77a050f7c64f",
        tec: "https://www.tecconcursos.com.br/s/Q7BaxG",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7BcgZ",
            rotulo: "Caderno extra 1",
            questoes: 123
          }
        ],
        subitens: [
          "CD:E4-1.1",
          "CD:E4-1.2",
          "CD:E4-1.3",
          "CD:E4-1.4",
          "CD:E4-1.5",
          "CD:E4-1.6"
        ]
      },
      {
        id: "ae8f3025-828d-488f-9bce-7dea61f45742",
        disciplina: "CD:E4",
        titulo: "2. Sustenta\xE7\xE3o de solu\xE7\xF5es anal\xEDticas",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/68877e22-b021-4869-9e97-23ed3feee2eb/aulas/ae8f3025-828d-488f-9bce-7dea61f45742",
        tec: "https://www.tecconcursos.com.br/s/Q4pFIh",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7BaxL",
            rotulo: "Caderno extra 1",
            questoes: 173
          }
        ],
        subitens: [
          "CD:E4-2.1",
          "CD:E4-2.2",
          "CD:E4-2.3",
          "CD:E4-2.4"
        ]
      },
      {
        id: "8b3ccdf6-3b57-4397-9059-2c8f1338b49d",
        disciplina: "CD:E4",
        titulo: "3. Governan\xE7a e responsabilidade",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/68877e22-b021-4869-9e97-23ed3feee2eb/aulas/8b3ccdf6-3b57-4397-9059-2c8f1338b49d",
        subitens: [
          "CD:E4-3.1",
          "CD:E4-3.2",
          "CD:E4-3.3",
          "CD:E4-3.4",
          "CD:E4-3.5"
        ]
      },
      {
        id: "d4ee2a4e-77d3-405c-80dd-8c510382d36e",
        disciplina: "CD:E4",
        titulo: "4. Gest\xE3o de produtos de dados",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/68877e22-b021-4869-9e97-23ed3feee2eb/aulas/d4ee2a4e-77d3-405c-80dd-8c510382d36e",
        tec: "https://www.tecconcursos.com.br/s/Q4pEBc",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pE2r",
            rotulo: "Caderno extra 1",
            questoes: 49
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7BaxU",
            rotulo: "Caderno extra 2",
            questoes: 14
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bcge",
            rotulo: "Caderno extra 3",
            questoes: 43
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pEB2",
            rotulo: "Caderno extra 4",
            questoes: 267
          }
        ],
        subitens: [
          "CD:E4-4.1",
          "CD:E4-4.2",
          "CD:E4-4.3",
          "CD:E4-4.4",
          "CD:E4-4.5",
          "CD:E4-4.6"
        ]
      },
      {
        id: "50df59b9-bb7e-4dd3-b723-0f95dbbdb76c",
        disciplina: "CD:E4",
        titulo: "5. Contrata\xE7\xE3o e controle de solu\xE7\xF5es",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/68877e22-b021-4869-9e97-23ed3feee2eb/aulas/50df59b9-bb7e-4dd3-b723-0f95dbbdb76c",
        tec: "https://www.tecconcursos.com.br/s/Q6bLxX",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7BaxZ",
            rotulo: "Caderno extra 1",
            questoes: 55
          }
        ],
        subitens: [
          "CD:E4-5.1",
          "CD:E4-5.2",
          "CD:E4-5.3",
          "CD:E4-5.4",
          "CD:E4-5.5",
          "CD:E4-5.6",
          "CD:E4-5.7"
        ]
      },
      {
        id: "1c68971d-5ad6-4a21-a243-ea748020930d",
        disciplina: "AUD:E1",
        titulo: "1. Avalia\xE7\xE3o, consultoria e apura\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/dee8b627-1894-4988-81a3-05d1d43da3f8/aulas/1c68971d-5ad6-4a21-a243-ea748020930d",
        tec: "https://www.tecconcursos.com.br/s/Q71FkN",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q71FlR"
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q71FlR"
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q6j8dT"
          }
        ],
        subitens: [
          "AUD:E1-1.1",
          "AUD:E1-1.2",
          "AUD:E1-1.3",
          "AUD:E1-1.4",
          "AUD:E1-1.5"
        ]
      },
      {
        id: "fc985c2a-e232-4961-9309-7a74901ee6c3",
        disciplina: "AUD:E1",
        titulo: "2. Planejamento t\xE9cnico do trabalho",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/dee8b627-1894-4988-81a3-05d1d43da3f8/aulas/fc985c2a-e232-4961-9309-7a74901ee6c3",
        subitens: [
          "AUD:E1-2.1",
          "AUD:E1-2.2",
          "AUD:E1-2.3"
        ]
      },
      {
        id: "ef675c65-1b54-4379-abf3-54f9ce641068",
        disciplina: "AUD:E1",
        titulo: "3. Testes e amostragem",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/dee8b627-1894-4988-81a3-05d1d43da3f8/aulas/ef675c65-1b54-4379-abf3-54f9ce641068",
        subitens: [
          "AUD:E1-3.1"
        ]
      },
      {
        id: "4d67d1d4-d61b-4f27-b7ac-498d4f2300f7",
        disciplina: "AUD:E1",
        titulo: "4. Achados documenta\xE7\xE3o e revis\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/dee8b627-1894-4988-81a3-05d1d43da3f8/aulas/4d67d1d4-d61b-4f27-b7ac-498d4f2300f7",
        subitens: [
          "AUD:E1-4.1"
        ]
      },
      {
        id: "be0a502b-0828-4cf3-ac91-5dcbf865d70e",
        disciplina: "AUD:E1",
        titulo: "5. Auditoria de dados e IA",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/dee8b627-1894-4988-81a3-05d1d43da3f8/aulas/be0a502b-0828-4cf3-ac91-5dcbf865d70e",
        subitens: [
          "AUD:E1-5.1"
        ]
      },
      {
        id: "e847315a-78e5-4beb-878f-4cce9bb79295",
        disciplina: "AUD:E1",
        titulo: "6. Comunica\xE7\xE3o monitoramento e qualidade",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/dee8b627-1894-4988-81a3-05d1d43da3f8/aulas/e847315a-78e5-4beb-878f-4cce9bb79295",
        subitens: [
          "AUD:E1-6.1",
          "AUD:E1-6.2"
        ]
      },
      {
        id: "cb9ffda5-9103-4c6a-81cd-667e659d9254",
        disciplina: "AUD:E2",
        titulo: "1. Economia e finan\xE7as do setor p\xFAblico",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/e15a302e-39e6-4e2a-8f41-197c2c8189cb/aulas/cb9ffda5-9103-4c6a-81cd-667e659d9254",
        tec: "https://www.tecconcursos.com.br/s/Q4pT33",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pT53",
            rotulo: "Caderno extra 1",
            questoes: 85
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pT3a",
            rotulo: "Caderno extra 2",
            questoes: 19
          }
        ],
        subitens: [
          "AUD:E2-1.1",
          "AUD:E2-1.2"
        ]
      },
      {
        id: "11a8d7b7-2c7f-4d54-beb6-811b9a46bc8e",
        disciplina: "AUD:E2",
        titulo: "2. Or\xE7amento e planejamento",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/e15a302e-39e6-4e2a-8f41-197c2c8189cb/aulas/11a8d7b7-2c7f-4d54-beb6-811b9a46bc8e",
        tec: "https://www.tecconcursos.com.br/s/Q76KTb",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q76KTU",
            rotulo: "Caderno extra 1",
            questoes: 48
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q76KTY",
            rotulo: "Caderno extra 2",
            questoes: 68
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q76KTr",
            rotulo: "Caderno extra 3",
            questoes: 136
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q76KTv",
            rotulo: "Caderno extra 4",
            questoes: 144
          }
        ],
        subitens: [
          "AUD:E2-2.1",
          "AUD:E2-2.2"
        ]
      },
      {
        id: "becfd77d-863a-4f1d-ac78-6068b8a778e6",
        disciplina: "AUD:E2",
        titulo: "3. Execu\xE7\xE3o e responsabilidade fiscal",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/e15a302e-39e6-4e2a-8f41-197c2c8189cb/aulas/becfd77d-863a-4f1d-ac78-6068b8a778e6",
        tec: "https://www.tecconcursos.com.br/s/Q76KTe",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q76KTg",
            rotulo: "Caderno extra 1",
            questoes: 131
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q76KTi",
            rotulo: "Caderno extra 2",
            questoes: 61
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q76KTs",
            rotulo: "Caderno extra 3",
            questoes: 182
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pBC2",
            rotulo: "Caderno extra 4",
            questoes: 180
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pB18",
            rotulo: "Caderno extra 5",
            questoes: 40
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q76KU1",
            rotulo: "Caderno extra 6",
            questoes: 117
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q76KU5",
            rotulo: "Caderno extra 7",
            questoes: 53
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q76KU8",
            rotulo: "Caderno extra 8",
            questoes: 96
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q76KUC",
            rotulo: "Caderno extra 9",
            questoes: 39
          }
        ],
        subitens: [
          "AUD:E2-3.1",
          "AUD:E2-3.2"
        ]
      },
      {
        id: "dc5ed74b-98c0-4007-a6f2-696d20718989",
        disciplina: "AUD:E2",
        titulo: "4. Informa\xE7\xE3o cont\xE1bil aplicada ao controle",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/e15a302e-39e6-4e2a-8f41-197c2c8189cb/aulas/dc5ed74b-98c0-4007-a6f2-696d20718989",
        tec: "https://www.tecconcursos.com.br/s/Q4pJvV",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pJxZ",
            rotulo: "Caderno extra 1",
            questoes: 88
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pJxr",
            rotulo: "Caderno extra 2",
            questoes: 47
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pJy6",
            rotulo: "Caderno extra 3",
            questoes: 49
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pJzb",
            rotulo: "Caderno extra 4",
            questoes: 56
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pJzu",
            rotulo: "Caderno extra 5",
            questoes: 43
          }
        ],
        subitens: [
          "AUD:E2-4.1",
          "AUD:E2-4.2"
        ]
      },
      {
        id: "1ba2da2a-5d00-4568-901d-70a94467cc4c",
        disciplina: "AUD:E2",
        titulo: "5. Custos e an\xE1lise da execu\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/e15a302e-39e6-4e2a-8f41-197c2c8189cb/aulas/1ba2da2a-5d00-4568-901d-70a94467cc4c",
        tec: "https://www.tecconcursos.com.br/s/Q4pK29",
        subitens: [
          "AUD:E2-5.1",
          "AUD:E2-5.2",
          "AUD:E2-5.3"
        ]
      },
      {
        id: "f464d44a-7ae3-4952-b2bb-aede0fb6758a",
        disciplina: "AUD:E2",
        titulo: "6. Informa\xE7\xE3o societ\xE1ria de empresas estatais",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/e15a302e-39e6-4e2a-8f41-197c2c8189cb/aulas/f464d44a-7ae3-4952-b2bb-aede0fb6758a",
        tec: "https://www.tecconcursos.com.br/s/Q76KUd",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q76KUg",
            rotulo: "Caderno extra 1",
            questoes: 27
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q76KUl",
            rotulo: "Caderno extra 2",
            questoes: 19
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q76KUn",
            rotulo: "Caderno extra 3",
            questoes: 9
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pK2k",
            rotulo: "Caderno extra 4",
            questoes: 1
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q76KUr",
            rotulo: "Caderno extra 5",
            questoes: 12
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pJx0",
            rotulo: "Caderno extra 6",
            questoes: 97
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pKlt",
            rotulo: "Caderno extra 7",
            questoes: 28
          }
        ],
        subitens: [
          "AUD:E2-6.1",
          "AUD:E2-6.2",
          "AUD:E2-6.3"
        ]
      },
      {
        id: "31083702-4730-4067-9dbc-102dec2bc346",
        disciplina: "AUD:E3",
        titulo: "1. Problema, desenho e avaliabilidade",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/fa522028-e078-4e57-b370-889644adccbb/aulas/31083702-4730-4067-9dbc-102dec2bc346",
        tec: "https://www.tecconcursos.com.br/s/Q76KVM",
        subitens: [
          "AUD:E3-1.1",
          "AUD:E3-1.2",
          "AUD:E3-1.3"
        ]
      },
      {
        id: "359dc91c-4ceb-4add-b568-3076ebffb28b",
        disciplina: "AUD:E3",
        titulo: "2. Implementa\xE7\xE3o gest\xE3o e coordena\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/fa522028-e078-4e57-b370-889644adccbb/aulas/359dc91c-4ceb-4add-b568-3076ebffb28b",
        subitens: [
          "AUD:E3-2.1",
          "AUD:E3-2.2",
          "AUD:E3-2.3"
        ]
      },
      {
        id: "0eb75fd7-4abe-4a87-9bc6-a2f684f27b43",
        disciplina: "AUD:E3",
        titulo: "3. Monitoramento e desenhos de avalia\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/fa522028-e078-4e57-b370-889644adccbb/aulas/0eb75fd7-4abe-4a87-9bc6-a2f684f27b43",
        subitens: [
          "AUD:E3-3.1",
          "AUD:E3-3.2",
          "AUD:E3-3.3",
          "AUD:E3-3.4"
        ]
      },
      {
        id: "1f691557-88b6-4dcd-a558-7e96d41814e8",
        disciplina: "AUD:E3",
        titulo: "4. Estrat\xE9gias qualitativas e mistas",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/fa522028-e078-4e57-b370-889644adccbb/aulas/1f691557-88b6-4dcd-a558-7e96d41814e8",
        subitens: [
          "AUD:E3-4.1",
          "AUD:E3-4.2"
        ]
      },
      {
        id: "e21d4a16-094d-4216-8d6a-e9c00134afdf",
        disciplina: "AUD:E3",
        titulo: "5. Identifica\xE7\xE3o causal e an\xE1lise econ\xF4mica",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/fa522028-e078-4e57-b370-889644adccbb/aulas/e21d4a16-094d-4216-8d6a-e9c00134afdf",
        subitens: [
          "AUD:E3-5.1",
          "AUD:E3-5.2",
          "AUD:E3-5.3"
        ]
      },
      {
        id: "6140e097-977e-4db1-958b-6fe897eb76b8",
        disciplina: "AUD:E3",
        titulo: "6. Conclus\xF5es, recomenda\xE7\xF5es e uso dos resultados",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/fa522028-e078-4e57-b370-889644adccbb/aulas/6140e097-977e-4db1-958b-6fe897eb76b8",
        subitens: [
          "AUD:E3-6.1",
          "AUD:E3-6.2",
          "AUD:E3-6.3"
        ]
      },
      {
        id: "e2d8966b-f86a-4d3d-837d-197571e5d7e2",
        disciplina: "AUD:E4",
        titulo: "1. Planejamento e sele\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/8c6078bc-fc11-4cb6-a6b8-7b16dbee1190/aulas/e2d8966b-f86a-4d3d-837d-197571e5d7e2",
        tec: "https://www.tecconcursos.com.br/s/Q4pTjf",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q6liKs",
            rotulo: "Caderno extra 1",
            questoes: 297
          }
        ],
        subitens: [
          "AUD:E4-1.1"
        ]
      },
      {
        id: "273b58c7-a9be-4212-b5f3-ffc2ff1663fd",
        disciplina: "AUD:E4",
        titulo: "2. Execu\xE7\xE3o contratual",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/8c6078bc-fc11-4cb6-a6b8-7b16dbee1190/aulas/273b58c7-a9be-4212-b5f3-ffc2ff1663fd",
        tec: "https://www.tecconcursos.com.br/s/Q4pTk4",
        subitens: [
          "AUD:E4-2.1"
        ]
      },
      {
        id: "ecf64884-352e-424e-9f88-1d14ff4647ee",
        disciplina: "AUD:E4",
        titulo: "3. Transfer\xEAncias e parcerias",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/8c6078bc-fc11-4cb6-a6b8-7b16dbee1190/aulas/ecf64884-352e-424e-9f88-1d14ff4647ee",
        tec: "https://www.tecconcursos.com.br/s/Q4pB0i",
        subitens: [
          "AUD:E4-3.1"
        ]
      },
      {
        id: "521416ea-9e57-4ab6-8006-7d7cf8ce1808",
        disciplina: "AUD:E4",
        titulo: "4. Testes e sinais de irregularidade",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/8c6078bc-fc11-4cb6-a6b8-7b16dbee1190/aulas/521416ea-9e57-4ab6-8006-7d7cf8ce1808",
        subitens: [
          "AUD:E4-4.1"
        ]
      },
      {
        id: "1a11beb6-ae9b-4393-b541-fc0abf8e7300",
        disciplina: "AUD:E4",
        titulo: "5. Encaminhamentos e resultados",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/8c6078bc-fc11-4cb6-a6b8-7b16dbee1190/aulas/1a11beb6-ae9b-4393-b541-fc0abf8e7300",
        tec: "https://www.tecconcursos.com.br/s/Q4pAfD",
        subitens: [
          "AUD:E4-5.1"
        ]
      },
      {
        id: "b2941ecf-58fb-4028-810e-178ba7a694b0",
        disciplina: "AUD:E5",
        titulo: "1. Direito p\xFAblico aplicado \xE0s respostas de controle",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/6fad600c-f14f-4055-af64-41ac0e941dca/aulas/b2941ecf-58fb-4028-810e-178ba7a694b0",
        subitens: [
          "AUD:E5-1.1",
          "AUD:E5-1.2",
          "AUD:E5-1.3"
        ]
      },
      {
        id: "d62a91dc-d62c-44b6-a334-c25b1505a0d4",
        disciplina: "AUD:E5",
        titulo: "2. Informa\xE7\xE3o, participa\xE7\xE3o e qualidade dos servi\xE7os",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/6fad600c-f14f-4055-af64-41ac0e941dca/aulas/d62a91dc-d62c-44b6-a334-c25b1505a0d4",
        tec: "https://www.tecconcursos.com.br/s/Q4pTl8",
        subitens: [
          "AUD:E5-2.1",
          "AUD:E5-2.2",
          "AUD:E5-2.3",
          "AUD:E5-2.4",
          "AUD:E5-2.5"
        ]
      },
      {
        id: "49b93860-1711-4e57-9dd5-38cc64584868",
        disciplina: "AUD:E5",
        titulo: "3. Prote\xE7\xE3o do denunciante e tratamento seguro dos relatos",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/6fad600c-f14f-4055-af64-41ac0e941dca/aulas/49b93860-1711-4e57-9dd5-38cc64584868",
        subitens: [
          "AUD:E5-3.1",
          "AUD:E5-3.2",
          "AUD:E5-3.3",
          "AUD:E5-3.4"
        ]
      },
      {
        id: "68e81725-c6a7-42de-8d4f-3e3fe2319b34",
        disciplina: "AUD:E5",
        titulo: "4. Avalia\xE7\xE3o e aperfei\xE7oamento da integridade p\xFAblica e privada",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/6fad600c-f14f-4055-af64-41ac0e941dca/aulas/68e81725-c6a7-42de-8d4f-3e3fe2319b34",
        subitens: [
          "AUD:E5-4.1",
          "AUD:E5-4.2",
          "AUD:E5-4.3",
          "AUD:E5-4.4",
          "AUD:E5-4.5"
        ]
      },
      {
        id: "bdb08bca-e7cf-4bf0-96de-09b82b07707d",
        disciplina: "AUD:E5",
        titulo: "5. Admissibilidade, prova e requisitos da responsabiliza\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/6fad600c-f14f-4055-af64-41ac0e941dca/aulas/bdb08bca-e7cf-4bf0-96de-09b82b07707d",
        subitens: [
          "AUD:E5-5.1",
          "AUD:E5-5.2",
          "AUD:E5-5.3",
          "AUD:E5-5.4",
          "AUD:E5-5.5"
        ]
      },
      {
        id: "1c1c01b3-c646-4fe3-9778-63162555df60",
        disciplina: "AUD:E5",
        titulo: "6. Instrumentos de responsabiliza\xE7\xE3o e solu\xE7\xF5es consensuais",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/6fad600c-f14f-4055-af64-41ac0e941dca/aulas/1c1c01b3-c646-4fe3-9778-63162555df60",
        subitens: [
          "AUD:E5-6.1",
          "AUD:E5-6.2",
          "AUD:E5-6.3",
          "AUD:E5-6.4",
          "AUD:E5-6.5"
        ]
      },
      {
        id: "6b583167-f70f-4991-8f0b-773f97b3c098",
        disciplina: "INFRA:E1",
        titulo: "1. Redes e comunica\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/2f8e9e0b-c6f1-4305-a742-20cfaef4d667/aulas/6b583167-f70f-4991-8f0b-773f97b3c098",
        tec: "https://www.tecconcursos.com.br/s/Q7BlxD",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7BlxJ",
            rotulo: "Caderno extra 1",
            questoes: 93
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7BlxQ",
            rotulo: "Caderno extra 2",
            questoes: 45
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7BlxV",
            rotulo: "Caderno extra 3",
            questoes: 42
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Blxb",
            rotulo: "Caderno extra 4",
            questoes: 167
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Blxj",
            rotulo: "Caderno extra 5",
            questoes: 9
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q6MS9B",
            rotulo: "Caderno extra 6",
            questoes: 16
          }
        ],
        subitens: []
      },
      {
        id: "d2b1ddf1-cd8f-4160-a98a-1907fc8f0b22",
        disciplina: "INFRA:E1",
        titulo: "2. Sistemas e diret\xF3rios",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/2f8e9e0b-c6f1-4305-a742-20cfaef4d667/aulas/d2b1ddf1-cd8f-4160-a98a-1907fc8f0b22",
        tec: "https://www.tecconcursos.com.br/s/Q7Blxq",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7Blxy",
            rotulo: "Caderno extra 1",
            questoes: 78
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bly4",
            rotulo: "Caderno extra 2",
            questoes: 86
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7BlyF",
            rotulo: "Caderno extra 3",
            questoes: 106
          }
        ],
        subitens: []
      },
      {
        id: "8f562cfc-3894-4612-a963-d1393dc7114d",
        disciplina: "INFRA:E1",
        titulo: "3. Armazenamento",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/2f8e9e0b-c6f1-4305-a742-20cfaef4d667/aulas/8f562cfc-3894-4612-a963-d1393dc7114d",
        tec: "https://www.tecconcursos.com.br/s/Q7Blyd",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7Blyp",
            rotulo: "Caderno extra 1",
            questoes: 14
          }
        ],
        subitens: []
      },
      {
        id: "0f2dfc5e-eced-4684-a601-6fdaf6e6a465",
        disciplina: "INFRA:E1",
        titulo: "4. Plataformas de bancos de dados",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/2f8e9e0b-c6f1-4305-a742-20cfaef4d667/aulas/0f2dfc5e-eced-4684-a601-6fdaf6e6a465",
        tec: "https://www.tecconcursos.com.br/s/Q6MSQr",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7BlzC",
            rotulo: "Caderno extra 1",
            questoes: 44
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bcgq",
            rotulo: "Caderno extra 2",
            questoes: 48
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bax8",
            rotulo: "Caderno extra 3",
            questoes: 85
          }
        ],
        subitens: []
      },
      {
        id: "cc98455c-e76e-4397-bd86-37e16a0fbbd5",
        disciplina: "INFRA:E1",
        titulo: "5. SQL e sustenta\xE7\xE3o de dados",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/2f8e9e0b-c6f1-4305-a742-20cfaef4d667/aulas/cc98455c-e76e-4397-bd86-37e16a0fbbd5",
        tec: "https://www.tecconcursos.com.br/s/Q4pFGE",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bax6",
            rotulo: "Caderno extra 1",
            questoes: 204
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7BlzI",
            rotulo: "Caderno extra 2",
            questoes: 45
          }
        ],
        subitens: []
      },
      {
        id: "512ce1db-7c5d-4df3-a8e7-0701df571e36",
        disciplina: "INFRA:E2",
        titulo: "1. Modelos e arquitetura de nuvem",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/de97bae9-6162-4a63-a9e5-e01fd1f75374/aulas/512ce1db-7c5d-4df3-a8e7-0701df571e36",
        tec: "https://www.tecconcursos.com.br/s/Q4pFIh",
        subitens: []
      },
      {
        id: "4a228ed6-55b7-44b9-b07d-5d49cfbbab85",
        disciplina: "INFRA:E2",
        titulo: "2. Virtualiza\xE7\xE3o e cont\xEAineres",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/de97bae9-6162-4a63-a9e5-e01fd1f75374/aulas/4a228ed6-55b7-44b9-b07d-5d49cfbbab85",
        tec: "https://www.tecconcursos.com.br/s/Q7BaxL",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7BlzR",
            rotulo: "Caderno extra 1",
            questoes: 25
          }
        ],
        subitens: []
      },
      {
        id: "4ae4663b-d70f-4922-bf6c-0eee9d32a180",
        disciplina: "INFRA:E2",
        titulo: "3. Arquiteturas de servi\xE7os",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/de97bae9-6162-4a63-a9e5-e01fd1f75374/aulas/4ae4663b-d70f-4922-bf6c-0eee9d32a180",
        tec: "https://www.tecconcursos.com.br/s/Q7BlzV",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q6bLwD",
            rotulo: "Caderno extra 1",
            questoes: 45
          }
        ],
        subitens: []
      },
      {
        id: "99d3184c-de82-43a2-be07-b8c7d2caca6d",
        disciplina: "INFRA:E2",
        titulo: "4. Infraestrutura como c\xF3digo",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/de97bae9-6162-4a63-a9e5-e01fd1f75374/aulas/99d3184c-de82-43a2-be07-b8c7d2caca6d",
        tec: "https://www.tecconcursos.com.br/s/Q7BcgZ",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7BaxG",
            rotulo: "Caderno extra 1",
            questoes: 74
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Blze",
            rotulo: "Caderno extra 2",
            questoes: 21
          }
        ],
        subitens: []
      },
      {
        id: "dfe548ae-ec94-4526-8dff-480d5d23ff22",
        disciplina: "INFRA:E2",
        titulo: "5. Migra\xE7\xE3o e moderniza\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/de97bae9-6162-4a63-a9e5-e01fd1f75374/aulas/dfe548ae-ec94-4526-8dff-480d5d23ff22",
        subitens: []
      },
      {
        id: "67c2f649-9a3d-4c52-b16c-a15f200a17b7",
        disciplina: "INFRA:E3",
        titulo: "1. Riscos e arquitetura de seguran\xE7a",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/ef103b63-d85c-470b-863a-48a897899827/aulas/67c2f649-9a3d-4c52-b16c-a15f200a17b7",
        tec: "https://www.tecconcursos.com.br/s/Q7Blzo",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7Blzy",
            rotulo: "Caderno extra 1",
            questoes: 180
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm09",
            rotulo: "Caderno extra 2",
            questoes: 49
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm0N",
            rotulo: "Caderno extra 3",
            questoes: 106
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm0W",
            rotulo: "Caderno extra 4",
            questoes: 93
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm0b",
            rotulo: "Caderno extra 5",
            questoes: 46
          }
        ],
        subitens: []
      },
      {
        id: "2aed1aa0-0365-4c5b-8ae4-8bdc3faf87be",
        disciplina: "INFRA:E3",
        titulo: "2. Identidades e prote\xE7\xE3o criptogr\xE1fica",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/ef103b63-d85c-470b-863a-48a897899827/aulas/2aed1aa0-0365-4c5b-8ae4-8bdc3faf87be",
        tec: "https://www.tecconcursos.com.br/s/Q7Bm0h",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm0l",
            rotulo: "Caderno extra 1",
            questoes: 70
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm19",
            rotulo: "Caderno extra 2",
            questoes: 178
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm1I",
            rotulo: "Caderno extra 3",
            questoes: 108
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm1V",
            rotulo: "Caderno extra 4",
            questoes: 33
          }
        ],
        subitens: []
      },
      {
        id: "c9c8b24f-9af1-4a87-b8ef-acb480900f03",
        disciplina: "INFRA:E3",
        titulo: "3. Vulnerabilidades e opera\xE7\xE3o de seguran\xE7a",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/ef103b63-d85c-470b-863a-48a897899827/aulas/c9c8b24f-9af1-4a87-b8ef-acb480900f03",
        tec: "https://www.tecconcursos.com.br/s/Q7Bm1f",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm1k",
            rotulo: "Caderno extra 1",
            questoes: 23
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm1r",
            rotulo: "Caderno extra 2",
            questoes: 8
          }
        ],
        subitens: []
      },
      {
        id: "a5563d0a-97d7-4b6c-8c0b-ec6f511bb258",
        disciplina: "INFRA:E3",
        titulo: "4. Resposta a incidentes",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/ef103b63-d85c-470b-863a-48a897899827/aulas/a5563d0a-97d7-4b6c-8c0b-ec6f511bb258",
        tec: "https://www.tecconcursos.com.br/s/Q7Bm24",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm29",
            rotulo: "Caderno extra 1",
            questoes: 24
          }
        ],
        subitens: []
      },
      {
        id: "751d7c61-7671-4cb2-9b1a-44ccb14a27e1",
        disciplina: "INFRA:E3",
        titulo: "5. Privacidade e prote\xE7\xE3o operacional",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/ef103b63-d85c-470b-863a-48a897899827/aulas/751d7c61-7671-4cb2-9b1a-44ccb14a27e1",
        tec: "https://www.tecconcursos.com.br/s/Q4pFJv",
        subitens: []
      },
      {
        id: "e60e2584-e1b9-46db-8b13-f8c41332eebf",
        disciplina: "INFRA:E3",
        titulo: "6. Continuidade e recupera\xE7\xE3o",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/ef103b63-d85c-470b-863a-48a897899827/aulas/e60e2584-e1b9-46db-8b13-f8c41332eebf",
        tec: "https://www.tecconcursos.com.br/s/Q6Jy6Y",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm2H",
            rotulo: "Caderno extra 1",
            questoes: 67
          }
        ],
        subitens: []
      },
      {
        id: "4b418818-1247-4b89-bf0e-94e00a5f0098",
        disciplina: "INFRA:E4",
        titulo: "1. Confiabilidade e observabilidade",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/7026a164-675a-49b2-a9c0-93c41418810e/aulas/4b418818-1247-4b89-bf0e-94e00a5f0098",
        tec: "https://www.tecconcursos.com.br/s/Q6Jy8l",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm2O",
            rotulo: "Caderno extra 1",
            questoes: 24
          }
        ],
        subitens: []
      },
      {
        id: "d6ea1336-3446-459c-b44b-1ffd8455b3d1",
        disciplina: "INFRA:E4",
        titulo: "2. Capacidade, custos e infraestrutura de IA",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/7026a164-675a-49b2-a9c0-93c41418810e/aulas/d6ea1336-3446-459c-b44b-1ffd8455b3d1",
        subitens: []
      },
      {
        id: "508da821-ae11-4ff3-88cf-0bd322c59b6a",
        disciplina: "INFRA:E4",
        titulo: "3. Gest\xE3o de servi\xE7os e mudan\xE7as",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/7026a164-675a-49b2-a9c0-93c41418810e/aulas/508da821-ae11-4ff3-88cf-0bd322c59b6a",
        tec: "https://www.tecconcursos.com.br/s/Q4pE0V",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm2Z",
            rotulo: "Caderno extra 1",
            questoes: 16
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pEBc",
            rotulo: "Caderno extra 2",
            questoes: 162
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bcge",
            rotulo: "Caderno extra 3",
            questoes: 43
          }
        ],
        subitens: []
      },
      {
        id: "286e2f4c-12f3-4216-89cd-956d9e35a547",
        disciplina: "INFRA:E4",
        titulo: "4. Governan\xE7a e controle",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/7026a164-675a-49b2-a9c0-93c41418810e/aulas/286e2f4c-12f3-4216-89cd-956d9e35a547",
        tec: "https://www.tecconcursos.com.br/s/Q7Bm2l",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q4pDzx",
            rotulo: "Caderno extra 1",
            questoes: 116
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q4pE2r",
            rotulo: "Caderno extra 2",
            questoes: 49
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7BaxU",
            rotulo: "Caderno extra 3",
            questoes: 14
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q6lhbw",
            rotulo: "Caderno extra 4",
            questoes: 12
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q6Jy4w",
            rotulo: "Caderno extra 5",
            questoes: 129
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm2q",
            rotulo: "Caderno extra 6",
            questoes: 151
          },
          {
            url: "https://www.tecconcursos.com.br/s/Q7Bm3E",
            rotulo: "Caderno extra 7",
            questoes: 13
          }
        ],
        subitens: []
      },
      {
        id: "6f4bbe22-f5cc-4cfd-a176-68efd6b3859f",
        disciplina: "INFRA:E4",
        titulo: "5. Contrata\xE7\xF5es e gest\xE3o de fornecedores",
        url: "https://mentoria.plataformatutory.com.br/dash/cursos/d3ef2108-f695-41a3-bd84-8b95d35c60b3/playlists/7026a164-675a-49b2-a9c0-93c41418810e/aulas/6f4bbe22-f5cc-4cfd-a176-68efd6b3859f",
        tec: "https://www.tecconcursos.com.br/s/Q6bLxX",
        tecExtras: [
          {
            url: "https://www.tecconcursos.com.br/s/Q7BaxZ",
            rotulo: "Caderno extra 1",
            questoes: 55
          }
        ],
        subitens: []
      }
    ]
  };

  // scripts/importar/derivacao-missoes.ts
  var aulas = mentoria_default.aulas ?? [];
  globalThis.MissoesDerivacao = {
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
    CATALOGOS: { cd: aulasPorCod(aulas, "cd"), aud: aulasPorCod(aulas, "aud") }
  };
})();

# Login só com o nome, com back no Cloudflare: plano de implementação

Id: `2026-10-13-login-por-nome`. O projeto não tem `ESTADO.csv`; o trabalho anterior vive em
`kitty-specs/`. Este plano fica rastreado só neste arquivo até virar missão ou linha de estado.

## Visão geral

Uma tela de entrada pede só o nome do usuário. O Worker em `cgu.solarpunk.workers.dev` guarda
no D1 o progresso de cada nome (interações, registro do plano, foco e tema), e o mesmo nome em
outro aparelho abre o mesmo progresso. Sem login, o app segue funcionando como hoje, só no
aparelho.

## Estado atual (conferido em 2026-10-13)

- **Não existe back.** O build é estático (`svelte.config.js:7`, `adapter-static` com `fallback:
  'index.html'`) e não há `+server.*`, `+page.server.*` nem `hooks.server.*` em `src/`.
  `src/routes/+layout.ts:1` fixa `ssr = false`.
- **Deploy duplo.** O GitHub Pages publica a cada push (`.github/workflows/pages.yml:5-7`). O
  Cloudflare publica o mesmo `build/` como assets de Worker (`wrangler.jsonc:4-8`), sem `main`
  e sem bindings (`wrangler deploy --dry-run`: "No bindings found").
- **Progresso: só `localStorage`, em quatro chaves:**
  - `painel-concurso:interacoes:v1`: respostas, curtidas, salvos e vistos (`src/lib/feed/interacoes.svelte.ts:9`, gravação em `:72-80`)
  - `painel-concurso:plano:v1`: registros e fotos (`src/lib/plano/registro.svelte.ts:13`, gravação em `:78-85`)
  - `painel-concurso:preferencias:v2`: disciplina e especialidade (`src/lib/feed/foco.svelte.ts:9`, `:72-78`)
  - `painel-concurso:tema:v1` (`src/lib/tema.svelte.ts:14`, `:118-124`)
- **Ponto de encaixe pronto.** Os quatro carregadores recebem o armazenamento por parâmetro:
  `carregarInteracoes(arm)` (`interacoes.svelte.ts:91`), `carregarRegistro(arm)`
  (`registro.svelte.ts:96`), `carregarFoco(arm)` (`foco.svelte.ts:81`) e `carregarTema(arm, …)`
  (`tema.svelte.ts:76`). Um objeto com a interface `Storage` que grava local e agenda o envio
  ao servidor sincroniza tudo sem mexer na lógica de nenhum dos quatro.
- **Quem carrega.** Interações e tema, no layout raiz (`src/routes/+layout.svelte:15-17`); foco,
  via `garantirFoco()` (`foco.svelte.ts:98-100`); registro, via `garantirRegistro()`
  (`src/lib/componentes/plano/estado.svelte.ts:31-35`). Os dois `garantir*` leem uma única vez
  por aba.
- **Service worker.** Só intercepta GET da mesma origem (`src/service-worker.ts:134-137`). Um
  GET fora de navegação e de `/conteudo/` cai em `caches.match(req) ?? fetch(req)` (`:172`), então
  `/api/*` chega à rede, mas só porque nunca vai para o cache, e não por regra explícita.
- **Verificação existente:** `npm test` (vitest), `npm run check` (svelte-check) e
  `npx playwright test`, que sobe `vite preview` sem Worker (`playwright.config.ts:7-12`).

## Decisões tomadas neste plano (em 2026-10-13)

Elas fecham as dúvidas que a leitura do código não resolve. Cada uma tem o gatilho que obriga a reabri-la.

1. **O nome é a credencial: risco aceito.** Quem digitar o seu nome entra no seu progresso e
   pode alterá-lo. Isso fica aceito porque o dado é progresso de estudo, sem nada pessoal nem
   sensível. **Reabrir** se o app passar a guardar dado pessoal, se mais alguém começar a usar
   ou se aparecer gravação que você não fez.
2. **Formato do nome:** minúsculas, `a-z`, `0-9` e `-`, de 3 a 30 caracteres, normalizado na
   entrada (sem acento, espaço vira `-`). O mesmo nome sempre leva ao mesmo usuário, e não há
   tela de cadastro: o primeiro login cria o usuário.
3. **Conflito: vale a última gravação, chave por chave.** Cada uma das quatro chaves leva
   `atualizadoEm`, e o servidor fica com a mais nova. Com isso você perde o que um aparelho
   fez offline numa chave que o outro também mexeu antes de sincronizar. **Reabrir** (mesclar
   item a item) se isso acontecer na prática.
4. **Rota da API:** `/api/*` passa pelo Worker (`run_worker_first`); o resto continua servido
   como asset. A tela de login fica em `/entrar`.
5. **GitHub Pages continua no ar, sem login.** Lá não existe `/api`: o app detecta e segue só
   local. Desligar o Pages fica fora deste plano.
6. **Banco: D1**, no plano gratuito (100 mil gravações por dia; um usuário estudando grava na
   casa das centenas). Não é KV porque o KV grátis aceita só mil gravações por dia, e cada
   resposta grava.

## Estado final desejado

- `cgu.solarpunk.workers.dev/entrar`: um campo de nome e o botão "Entrar". Depois de entrar,
  o app abre o progresso daquele nome, inclusive em outro aparelho.
- Em Ajustes: "Entrou como **<nome>**" e o botão "Sair". Sair apaga o nome e a cópia local.
- Sem login, nada muda em relação a hoje.
- Offline com login: grava local e envia quando a rede volta.
- Ao entrar pela primeira vez num aparelho que já tem progresso local e com o servidor
  vazio para esse nome, o progresso local sobe. Com o servidor já preenchido, vale o
  servidor para as chaves mais novas lá (decisão 3).

## O que NÃO vamos fazer

- Senha, PIN, e-mail, OAuth ou Cloudflare Access (decisão 1).
- Mesclar item a item (decisão 3).
- Sincronização em tempo real entre aparelhos abertos ao mesmo tempo: o outro aparelho só
  pega as mudanças ao abrir ou recarregar o app.
- Migrar do `adapter-static` para o `adapter-cloudflare`: o Worker fica ao lado do build
  estático.
- Tirar o GitHub Pages do ar.
- Painel administrativo, lista de usuários, exclusão de conta pelo app.

## Abordagem

O Worker serve só `/api/*` e entrega todo o resto aos assets, que continuam do jeito que
estão. No cliente, um `Storage` sincronizado embrulha o `localStorage`: `getItem` lê local,
`setItem` grava local e agenda um PUT da chave (debounce de 2 s, reenvio no evento `online`).
O login baixa as quatro chaves, grava local e recarrega a página. Recarregar evita reinicializar
os quatro stores na mão: os `garantir*` leem uma vez por aba, e a recarga começa uma aba nova.

---

## Fase 1: Worker e banco

### Mudanças

**`migrations/0001_progresso.sql`** (novo)
```sql
CREATE TABLE progresso (
  usuario TEXT NOT NULL,
  chave TEXT NOT NULL,
  valor TEXT NOT NULL,          -- JSON exatamente como o localStorage guarda
  atualizado_em INTEGER NOT NULL, -- ms desde a época, do relógio do cliente
  PRIMARY KEY (usuario, chave)
);
```

**`worker/index.ts`** (novo), com a lógica pura num módulo separado para o vitest:
- `GET /api/progresso/:usuario` → `{ [chave]: { valor, atualizadoEm } }`
- `PUT /api/progresso/:usuario/:chave` com o corpo `{ valor, atualizadoEm }` → grava só se
  `atualizadoEm` for maior que o guardado (`INSERT … ON CONFLICT DO UPDATE … WHERE excluded.atualizado_em > progresso.atualizado_em`);
  responde `{ gravado: boolean, atual: {…} }`.
- Valida o nome (decisão 2), a chave (só as quatro da lista branca), o `valor` (JSON válido,
  até 512 KB) e o `atualizadoEm` (inteiro). Qualquer outra coisa recebe 400; rota que não
  existe, 404.
- Qualquer caminho fora de `/api/` → `env.ASSETS.fetch(request)`.

**`wrangler.jsonc`**: `main: "worker/index.ts"`, `assets.binding: "ASSETS"`,
`assets.run_worker_first: ["/api/*"]` e `d1_databases: [{ binding: "DB", database_name: "cgu", database_id: "…" }]`.
O `database_id` sai do `npx wrangler d1 create cgu`, que você roda logada, com a saída colada aqui.

**`package.json`**: `wrangler` nas devDependencies e `@cloudflare/workers-types` para o
`check` aceitar `D1Database`.

### Critérios de aceite

#### Automáticos
- [x] `npm test`: testes novos em `tests/unit/worker.test.ts` cobrem nome válido e inválido, chave
      fora da lista, gravação mais nova vence, gravação mais velha é ignorada e corpo grande demais
      recebe 400, com o D1 trocado por um falso em memória.
- [x] `npm run check` sem erro.
- [x] `npx wrangler deploy --dry-run` lista os bindings `DB` e `ASSETS`.

#### Manuais
- [ ] `npx wrangler d1 migrations apply cgu --remote` aplicado.
- [ ] Depois do deploy, `curl https://cgu.solarpunk.workers.dev/api/progresso/teste` responde `{}`,
      e `/painel` continua abrindo o app.

### Nota de execução (2026-10-13)

Três mudanças em relação ao texto acima, por causa do que apareceu na execução:

- **Sem `migrations/` e sem `wrangler d1 migrations apply`.** O deploy é feito pela integração
  Git do Cloudflare, que roda só `npx wrangler deploy`, e o wrangler local não está logado. Por
  isso a tabela nasce com `CREATE TABLE IF NOT EXISTS` na primeira requisição de cada isolate
  (`worker/index.ts`, `ESQUEMA`).
- **Sem `database_id`.** O binding leva só `database_name: "cgu"`, e o wrangler 4.150 cria o
  banco no primeiro deploy. Se o token do build não tiver permissão de D1, o deploy falha e
  mostra isso no log; nesse caso, cria-se o banco no painel e o id entra no `wrangler.jsonc`.
- **Sem `@cloudflare/workers-types`.** Os tipos do D1 que o Worker usa estão declarados em
  `worker/index.ts`, para não misturar os tipos do Worker com os do DOM no `svelte-check`.
  As regras divididas com o app (nome e chaves) moram em `src/lib/conta/regras.ts`, e os testes
  ficaram em `tests/unit/conta/` (`worker.test.ts`, `regras.test.ts`).

Verificação extra, fora da lista: `wrangler dev` com o D1 local. Testado: GET vazio → `{}`;
PUT com carimbo 100 grava; com 50 é ignorado e devolve o de 100; com 200 grava; GET devolve
o de 200; e `/painel` continua 200 em HTML.

**Pausa**: confirme os manuais antes da fase 2.

---

## Fase 2: Sincronização no cliente

### Mudanças

**`src/lib/conta/sessao.svelte.ts`** (novo): `usuario` reativo, lido de
`painel-concurso:usuario:v1`, mais `entrar(nome)`, `sair()` e `normalizarNome(texto)`.
- `entrar`: normaliza, faz GET em `/api/progresso/:nome` e aplica a regra de entrada do
  "Estado final desejado" (servidor vazio → sobe o local; senão, por chave, fica o mais novo).
  Depois grava o nome e chama `location.assign('/painel')`. Se o GET falhar com erro de rede
  ou 404 (GitHub Pages), lança o erro, e a tela mostra "Login indisponível neste endereço".
- `sair`: apaga as quatro chaves, o nome e os carimbos (`painel-concurso:sinc:v1`) e recarrega.

**`src/lib/conta/armazenamento.ts`** (novo): `armazenamentoSincronizado(local, usuario, fetch)`
implementa `Storage`. O `setItem` de uma das quatro chaves grava local, carimba `atualizadoEm` em
`painel-concurso:sinc:v1` e agenda o PUT. Falha de rede deixa a chave pendente, que é reenviada
no evento `online` e na próxima carga. Sem usuário, devolve o próprio `localStorage`.

**Carregadores:** os quatro pontos de carga (`+layout.svelte:15-17`, `foco.svelte.ts:99`,
`estado.svelte.ts:34`) passam a receber `armazenamentoAtual()`, que é o sincronizado com login e
o `localStorage` sem login. A assinatura dos carregadores não muda.

**`src/service-worker.ts`**: `if (url.pathname.startsWith('/api/')) return;` logo depois do
teste de origem (`:137`), deixando explícito que a API nunca passa pelo cache.

### Critérios de aceite

#### Automáticos
- [ ] `npm test`: `tests/unit/armazenamento.test.ts` cobre o setItem que grava local e agenda o
      PUT, a falha de rede que deixa a chave pendente e o reenvio no `online`, a chave fora da
      lista que não sobe e a regra de entrada (servidor vazio; servidor mais novo; local mais novo).
- [ ] `npm run check` sem erro.
- [ ] Os testes atuais seguem passando sem alteração (281 unitários).

#### Manuais
- [ ] Nenhum nesta fase: ela ainda não tem tela.

---

## Fase 3: Telas

### Mudanças

- **`src/routes/entrar/+page.svelte`** (novo): campo "Seu nome", que mostra ao vivo o nome
  normalizado ("você vai entrar como `maria-silva`"), botão "Entrar" e mensagem de erro. Segue
  os temas Aventura e Kindle e os alvos de 44 px dos testes de `responsivo.spec.ts`.
- **`src/routes/painel/ajustes/+page.svelte`**: seção "Conta". Com login, mostra "Entrou como
  <nome>" e o botão "Sair"; sem login, um link para `/entrar`.
- **`src/routes/+layout.svelte`**: nada obriga ao login. O app abre normal, e o login fica como
  opção nos Ajustes.

### Critérios de aceite

#### Automáticos
- [ ] `npx playwright test`: `tests/e2e/conta.spec.ts`, com `/api` simulada por `page.route`
      (o `vite preview` não roda Worker), cobre entrar, ver o nome nos Ajustes, sair e voltar ao
      estado vazio. Também cobre o erro "Login indisponível" quando `/api` responde 404.
- [ ] `/entrar` e os Ajustes com a seção Conta entram nas listas de rotas de
      `tests/e2e/responsivo.spec.ts` (rolagem horizontal, texto a 200%, alvos de 44 px).
- [ ] `npm test` e `npm run check` sem erro.

#### Manuais
- [ ] No celular, entrar como `teste-cel`, responder uma questão e salvar um post.
- [ ] No PC, entrar como `teste-cel`: a resposta e o salvo aparecem.
- [ ] Sem rede no celular, responder outra questão, voltar a rede e recarregar o PC: a
      resposta aparece.
- [ ] Em `martinelles.github.io/entrar`: aparece "Login indisponível neste endereço" e o
      resto do app funciona.

---

## Estratégia de teste

- **Unitários:** a lógica do Worker sai do `fetch` como funções puras que recebem um D1 falso.
  O `Storage` sincronizado recebe `fetch` e o relógio por parâmetro, no mesmo padrão dos stores
  atuais, que já aceitam `agora` e `dia` só para teste.
- **E2E:** a API é simulada por `page.route`. A ida e volta real com D1 fica para os passos
  manuais da fase 3, porque subir `wrangler dev` dentro do Playwright mudaria o `webServer` de
  todos os 221 testes.

## Migração de dados

O progresso que já existe no aparelho não muda. No primeiro login com servidor vazio, ele
sobe inteiro. Quem nunca fizer login não percebe diferença.

## Referências

- Deploy atual: `wrangler.jsonc`, `.github/workflows/pages.yml`
- Stores: `src/lib/feed/interacoes.svelte.ts`, `src/lib/plano/registro.svelte.ts`,
  `src/lib/feed/foco.svelte.ts`, `src/lib/tema.svelte.ts`
- Carga: `src/routes/+layout.svelte:15-17`, `src/lib/componentes/plano/estado.svelte.ts:31-35`
- Service worker: `src/service-worker.ts:134-172`

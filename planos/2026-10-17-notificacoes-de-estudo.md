# Lembrete de estudo por notificação — plano de implementação

Id: `2026-10-17-notificacoes-de-estudo` (datado: o repositório não tem `ESTADO.csv` nem issue
tracker, e ela escolheu seguir sem; o plano não tem rastro fora deste arquivo).

## Visão geral

O app passa a mandar uma notificação diária, como a do Duolingo, na hora que ela escolhe, e só se
a missão de hoje ainda não estiver cumprida. O canal é o Web Push do PWA, que chega com o app
fechado. O Worker do Cloudflare guarda a inscrição de cada aparelho no D1, e um cron de hora em
hora decide quem recebe.

## Decisões dela (2026-10-17)

1. **Plano com id datado**, sem montar `ESTADO.csv`.
2. **Hora escolhida, só se faltar.** Uma notificação por dia, na hora que ela marcar nos Ajustes,
   e nenhuma se todos os blocos de hoje estiverem marcados.
3. **Exige login.** A inscrição fica ligada ao nome, e é por ele que o Worker lê as marcações da
   conta.

## Estado atual (conferido)

- **Worker:**
  - só tem o handler `fetch` (`worker/index.ts:66-70`). Não existe `scheduled`;
  - `wrangler.jsonc` não tem `triggers` (`wrangler.jsonc:1-19`);
  - o `Env` tem só `DB` e `ASSETS` (`worker/index.ts:22-25`).
- **API:** `tratarApi` responde 404 a tudo que não é `/api/progresso/...` (`worker/progresso.ts:69`).
  A API fica sem nada do Cloudflare, para ser testada com banco em memória
  (`worker/progresso.ts:1-3`, `tests/unit/conta/worker.test.ts:37`).
- **D1:**
  - o esquema nasce na primeira requisição com `CREATE TABLE IF NOT EXISTS`, porque o deploy pela
    integração Git não aplica migração (`worker/index.ts:27-36`);
  - as marcações das Missões ficam na tabela `progresso`, chave `missoes-cgu-2026`
    (`src/lib/conta/regras.ts:7`, `:18-23`);
  - a especialidade fica na chave `painel-concurso:preferencias:v2` (`src/lib/feed/foco.svelte.ts:14`).
- **O que o Worker já consegue importar do app:**
  - importa `src/lib/conta/regras.ts` por caminho relativo (`worker/progresso.ts:10`);
  - `src/lib/missoes/calculos.ts` só importa tipos (`calculos.ts:5`), então dá para importar
    `diaDeHoje` (`:12`), `diaCumprido` (`:23`) e `progressoDoDia` (`:51`);
  - `carregar.ts` puxa `$lib/feed/conteudo` (`carregar.ts:6`) e não entra no Worker;
  - `ESPECIALIDADES` (`foco.svelte.ts:40-66`) mora num módulo com runas e também não entra;
  - `hojeLocal` lê o fuso do aparelho (`src/lib/datas.ts:6-8`). No Worker o fuso é UTC, e ela não serve.
- **Service worker:** não trata `push` nem `notificationclick` (`src/service-worker.ts:108-184`).
  Nada no `src/` nem no `worker/` usa `Notification`, `PushManager` ou `scheduled`.
- **Manifesto:** `display: standalone` e ícones em `/icones/` (`static/manifest.webmanifest:12-16`).
  É o que o iPhone exige para o push de app instalado.
- **Ajustes:** a tela `/painel/ajustes` monta `FocoEstudo`, `SeletorTema` e `ContaAjustes`
  (`src/routes/painel/ajustes/+page.svelte:28-37`).
- **Sessão:** `conta.sair()` em `src/lib/conta/sessao.svelte.ts:107`.
- **Deploy:** só no Cloudflare desde `bcf5643`. A integração Git roda `npx wrangler deploy` (README, seção Deploy).

## Estado final desejado

- Nos Ajustes, logada, ela liga "Lembrete de estudo" e escolhe a hora (de 6h a 23h). O navegador
  pede a permissão, e o aparelho fica inscrito.
- Na hora escolhida (fuso America/Sao_Paulo), se faltar bloco na missão de hoje, chega a
  notificação "Missão de hoje: faltam 2 de 4 blocos (1 h 30 min)". Tocar nela abre `/painel`.
- Com a missão cumprida, fora da janela do plano ou com o lembrete desligado, nada chega.
- Sair da conta ou desligar o lembrete apaga a inscrição do aparelho no D1.
- Inscrição que o serviço de push dá como morta (404 ou 410) sai do D1 no próprio envio.

### Descobertas que sustentam o plano

- **Criptografia sem dependência nova.** O `web-push` do npm depende do `crypto` do Node e não
  roda no Worker. WebCrypto cobre tudo:
  - VAPID: JWT ES256. O `sign` ECDSA P-256 devolve `r||s`, que já é o formato JOSE;
  - corpo: `aes128gcm` (RFC 8188 + RFC 8291), com ECDH P-256 e HKDF.

  O apêndice A da RFC 8291 traz um vetor completo, com as chaves, o salt e o corpo cifrado
  esperado, e ele vira o teste unitário. O Node 24 do vitest tem o mesmo WebCrypto.
- **Precedente para regra duplicada:** quando o Worker não pode importar o store, a regra é
  escrita de novo e um teste confere que bate (`regras.ts:10-13`). O mapa
  especialidade → cargo segue esse padrão.
- **Plano no Worker:** `env.ASSETS.fetch` lê `/conteudo/missoes-<cargo>.json` do próprio build,
  sem rede externa.

## O que NÃO vamos fazer

- **Lembrete sem login, ou fora do app.** Nada de e-mail ou WhatsApp.
- **Mais de uma notificação por dia.** A "última chamada" das 21h foi descartada.
- **Sequência de dias ("ofensiva") e textos variados.** Podem vir depois, em cima da mesma entrega.
- **Hora sincronizada entre aparelhos.** Cada aparelho tem a sua inscrição e a sua hora.
- **Push no `npm run dev`.** Lá não há `/api`, e o Ajustes mostra o lembrete indisponível,
  como o login.
- **Especialidade Infraestrutura.** Ela não tem plano nas Missões, então não há como saber se
  falta bloco. O lembrete aparece desabilitado, com essa explicação, até existir plano.

## Abordagem

A API de lembrete fica em `worker/lembrete.ts`, pura como `progresso.ts`: recebe um banco e
devolve a resposta. O envio fica em `worker/push.ts`, também puro: recebe a inscrição, o texto e
as chaves, e devolve o `Request` pronto. A decisão de quem recebe fica em `worker/agenda.ts`,
puro: recebe a hora, as inscrições, as marcações e o plano, e devolve a lista de envios. O
`worker/index.ts` só liga essas peças ao D1, aos assets e ao `fetch`. Assim a criptografia, a
regra e a API se testam no vitest sem Cloudflare.

---

## Fase 1 — Envio no Worker (criptografia e API de inscrição)

### Mudanças

#### Push
**Arquivo**: `worker/push.ts` (novo)

- `b64url` e `deB64url`.
- `assinarVapid(audiencia, assunto, chavePrivada, agora)`: o JWT
  `{"typ":"JWT","alg":"ES256"}.{aud, exp: agora+12h, sub}`.
- `cifrar(texto, { p256dh, auth }, opcoes?)`. As opções aceitam `chaveEfemera` e `salt` só para o
  teste com o vetor da RFC. O corpo é montado assim:
  - `salt(16) || rs=4096 (4 bytes) || idlen=65 || chave pública efêmera (65)`, seguido do texto
    cifrado;
  - o texto vai com o delimitador `0x02`;
  - a CEK e o nonce saem do HKDF com `"WebPush: info\0" || ua_pub || as_pub` e depois com
    `"Content-Encoding: aes128gcm\0"` e `"Content-Encoding: nonce\0"`.
- `montarEnvio(inscricao, carga, vapid)` devolve o `Request` com:
  - `POST` para o endpoint;
  - `Content-Encoding: aes128gcm`, `TTL: 14400` e `Urgency: normal`;
  - `Authorization: vapid t=<jwt>, k=<pública>`.

```ts
export interface Inscricao { endpoint: string; p256dh: string; auth: string }
export interface Vapid { publica: string; privada: JsonWebKey; assunto: string }
export async function montarEnvio(i: Inscricao, carga: string, v: Vapid, agora = Date.now()): Promise<Request>
```

#### API de inscrição
**Arquivo**: `worker/lembrete.ts` (novo)

| Rota | Corpo | Resposta |
|---|---|---|
| `GET /api/lembrete` | — | `{ chave: VAPID_PUBLICA }` |
| `PUT /api/lembrete/:usuario` | `{ endpoint, keys: { p256dh, auth }, hora }` | grava ou atualiza, `{ ok: true }` |
| `DELETE /api/lembrete/:usuario` | `{ endpoint }` | apaga, `{ ok: true }` |

- **Validação:**
  - `nomeValido(usuario)`;
  - `hora` inteira de 6 a 23;
  - `p256dh` com 65 bytes e `auth` com 16 depois do base64url;
  - `endpoint` em `https:` com host numa lista fechada: `fcm.googleapis.com`,
    `updates.push.services.mozilla.com`, `*.push.apple.com` e `*.notify.windows.com`. Sem essa
    lista, o Worker faria POST para qualquer URL que alguém cadastrasse.
- **Interface do banco:** `BancoLembretes` com `gravar`, `apagar`, `daHora(hora, data)` e
  `marcarEnvio(endpoint, data)`.

**Arquivo**: `worker/progresso.ts:69`. Trocar o 404 fixo por uma delegação: `partes[0] === 'lembrete'`
vai para `tratarLembrete`, e o resto continua 404.

#### D1
**Arquivo**: `worker/index.ts`

Na mesma promessa do `ESQUEMA` atual, entra um segundo `CREATE TABLE IF NOT EXISTS`:

```sql
CREATE TABLE IF NOT EXISTS lembretes (
  endpoint TEXT PRIMARY KEY, usuario TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL,
  hora INTEGER NOT NULL, ultimo_envio TEXT
)
```

O `ultimo_envio` (AAAA-MM-DD) impede envio duplicado se o cron rodar duas vezes na mesma hora.
O `Env` ganha `VAPID_PUBLICA`, `VAPID_PRIVADA` (segredo) e `VAPID_ASSUNTO`.

### Critérios de aceite

#### Verificação automática
- [x] `npm test`, com os testes novos:
  - `tests/unit/conta/push.test.ts`: a cifra com a chave efêmera e o salt do apêndice A da RFC
    8291 dá exatamente o corpo do apêndice. Também confere que o JWT verifica com a chave
    pública, com `aud` = origem do endpoint e `exp` ≤ 24 h;
  - `tests/unit/conta/lembrete.test.ts`, com o banco em memória:
    - PUT válido grava, e PUT de novo troca a hora;
    - recusa endpoint fora da lista, `hora` 5 ou 24, chaves com tamanho errado e nome inválido;
    - DELETE apaga;
    - `/api/progresso` continua igual (os testes de `worker.test.ts` passam sem mudança).
- [x] `npm run check`

#### Verificação manual
- [ ] `npm run build && npx wrangler dev`, depois `curl localhost:8787/api/lembrete`, que
  devolve a chave pública do `.dev.vars`.

**Pausa**: terminada a verificação automática, pare e peça a confirmação manual antes da fase 2.

### Execução (2026-10-17)

Duas diferenças em relação ao texto acima:

- **Roteamento:** o `worker/progresso.ts:69` ficou como estava. O `worker/index.ts` chama
  `tratarLembrete` antes de `tratarApi`, do mesmo jeito que `tratarApi` devolve `null` fora da
  rota dele. Com isso, `progresso.ts` só passou a exportar `json` e `erro`.
- **Segredos locais:** o `.dev.vars` entrou no `.gitignore`, porque ainda não estava lá. O
  arquivo guarda as chaves VAPID de teste do `wrangler dev`.

`npm test` passou com 316 testes. O vetor do apêndice A da RFC 8291 bateu byte a byte, e os
intermediários também.

---

## Fase 2 — Cron que decide e envia

### Mudanças

#### Agenda
**Arquivo**: `worker/agenda.ts` (novo, puro)

- `agoraEmSaoPaulo(instante)` devolve `{ data, hora }` via
  `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', ... })`. O Brasil está sem
  horário de verão desde 2019, mas o `Intl` cobre se isso voltar.
- `CARGO_DA_ESPECIALIDADE = { 'ciencia-de-dados': 'cd', auditoria: 'aud' }`. É a cópia da
  `ancora` de `ESPECIALIDADES`, e um teste confere que bate. Especialidade ausente vale
  `ciencia-de-dados`, como em `foco.svelte.ts:3-4`.
- `lembreteDoDia(plano, marcas, cargo, data)` devolve `{ titulo, corpo, url: '/painel' }` ou
  `null`. Usa `diaDeHoje` e `progressoDoDia` de `src/lib/missoes/calculos.ts`. É `null` fora da
  janela, em dia sem missão ou com o dia cumprido.
  - Texto: título "Missão de hoje"; corpo "Faltam 2 de 4 blocos (1 h 30 min)".
  - O tempo somado é só o dos blocos que faltam.
- `lerMarcas` e `lerEspecialidade` com o mesmo tratamento de corrompido do app
  (`marcas.svelte.ts:15-25`, `foco.svelte.ts:98-113`). Escritos de novo, porque os originais
  moram em módulos com runas.

#### Handler agendado
**Arquivo**: `worker/index.ts`

`scheduled(controle, env, ctx)` faz, nesta ordem:

1. calcula `{ data, hora }` de `controle.scheduledTime`;
2. busca `daHora(hora, data)`: as inscrições dessa hora com `ultimo_envio` diferente de `data`;
3. agrupa por usuário e lê, uma vez por usuário, as chaves `missoes-cgu-2026` e
   `painel-concurso:preferencias:v2` em `progresso`;
4. lê o plano do cargo por `env.ASSETS.fetch(new Request('https://assets/conteudo/missoes-cd.json'))`,
   uma vez por cargo;
5. chama `lembreteDoDia`; se o resultado for `null`, só marca `ultimo_envio`;
6. se houver lembrete, faz `fetch(await montarEnvio(...))`:
   - 201 marca `ultimo_envio`;
   - 404 ou 410 apaga a inscrição;
   - qualquer outro código só vai para o log, e a inscrição fica para a próxima hora.
     O `ultimo_envio` não é marcado, mas a hora já passou, então não há reenvio no mesmo dia.

Os envios vão em `ctx.waitUntil(Promise.allSettled(...))`.

**Arquivo**: `wrangler.jsonc`:

- `"triggers": { "crons": ["0 * * * *"] }`;
- `"vars": { "VAPID_PUBLICA": "<da fase 4>", "VAPID_ASSUNTO": "https://cgu.solarpunk.workers.dev" }`.
  O assunto é uma URL e não um `mailto:`, para não pôr e-mail no repositório.

### Critérios de aceite

#### Verificação automática
- [ ] `npm test`, com `tests/unit/conta/agenda.test.ts`:
  - 2026-10-14T12:00Z dá `{ data: '2026-10-14', hora: 9 }`, e 02:30Z dá o dia anterior, 23h;
  - dia com 1 de 4 blocos marcados dá "Faltam 3 de 4 blocos" e soma só os minutos que faltam;
  - dia cumprido dá `null`; antes de 13/10 e depois de 12/12 também dão `null`;
  - preferências corrompidas valem Ciência de Dados, e `infraestrutura` dá `null`;
  - `CARGO_DA_ESPECIALIDADE` bate com as `ancora` de `ESPECIALIDADES`.
- [ ] Teste do handler com D1 e `fetch` falsos:
  - 410 apaga a inscrição;
  - 201 marca `ultimo_envio`;
  - uma segunda execução na mesma hora não envia de novo;
  - usuário com o dia cumprido não gera `fetch`.
- [ ] `npm run check`

#### Verificação manual
- [ ] `npx wrangler dev --test-scheduled`, depois `curl "localhost:8787/__scheduled?cron=0+*+*+*+*"`
  com uma inscrição de teste no D1 local: o log mostra o envio ou o motivo de não ter enviado.

**Pausa**: confirmação manual antes da fase 3.

---

## Fase 3 — App: receber, mostrar e configurar

### Mudanças

#### Service worker
**Arquivo**: `src/service-worker.ts`. Os listeners novos vão depois do `fetch` (`:133`).

- `push`: lê `e.data?.json()` e mostra a notificação com
  `showNotification(titulo, { body, icon: '/icones/icone-192.png', tag: 'lembrete-estudo', data: { url } })`.
  - O `tag` faz um lembrete novo substituir o anterior, sem empilhar.
  - Sem carga ou com carga inválida, mostra "Hora de estudar". O iOS cancela a inscrição de quem
    recebe push sem notificação visível.
- `notificationclick`: fecha a notificação e foca uma janela do app já aberta, navegando para
  `url`. Sem janela aberta, chama `clients.openWindow(url)`.

#### Lógica do lembrete
**Arquivo**: `src/lib/conta/lembrete.ts` (novo), com as dependências injetáveis para o teste.

- `suporte()` devolve um destes estados:
  - `'sem-push'`: falta `PushManager` ou `Notification`;
  - `'instalar'`: iPhone ou iPad fora de `display-mode: standalone`;
  - `'negado'`: a permissão foi negada;
  - `'ok'`.
- `ligar(usuario, hora)`, que roda dentro do toque:
  1. `Notification.requestPermission()`;
  2. `GET /api/lembrete` para pegar a chave;
  3. `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`;
  4. `PUT /api/lembrete/:usuario`;
  5. guarda `{ hora }` em `painel-concurso:lembrete:v1`, só no aparelho e fora de
     `CHAVES_SINCRONIZADAS`.
- `trocarHora(usuario, hora)` faz um PUT com a inscrição atual (`getSubscription()`).
- `desligar(usuario)` faz `unsubscribe()` e `DELETE`, e apaga a chave local.

**Arquivo**: `src/lib/conta/sessao.svelte.ts:107`. O `sair()` chama `desligar` antes de esquecer
o nome. Se falhar, sem rede, o próximo cron limpa a inscrição quando der 404 ou 410; se não der,
ela fica até o fim da janela do plano, sem efeito.

#### Tela
**Arquivo**: `src/lib/componentes/LembreteAjustes.svelte` (novo), montado em
`src/routes/painel/ajustes/+page.svelte` logo depois de `<ContaAjustes />` (`:37`).

| Estado | O que aparece |
|---|---|
| sem login | "Entre para receber o lembrete", com o link do popup |
| `sem-push` | "Este navegador não recebe notificações" |
| `instalar` | "No iPhone, o lembrete só chega com o app na tela de início: Compartilhar → Adicionar à Tela de Início" |
| `negado` | como reativar nas configurações do navegador |
| especialidade Infraestrutura | desabilitado, "ainda sem plano nas Missões" |
| ligado | seletor de hora (6h a 23h) e "Desligar" |
| desligado | botão "Ligar lembrete" |

- **Sem API** (`ApiIndisponivel`, `src/lib/conta/armazenamento.ts:48`): aparece o mesmo aviso
  do login.
- **Tamanho dos controles:** alvos de 44 px, como o resto dos Ajustes (`tests/e2e/responsivo.spec.ts`
  confere isso).

### Critérios de aceite

#### Verificação automática
- [ ] `npm test`, com `tests/unit/conta/lembrete.test.ts`:
  - `suporte()` em cada caso;
  - `ligar` chama permissão, chave, subscribe e PUT, nessa ordem, e grava a hora;
  - permissão negada não faz PUT;
  - `desligar` faz unsubscribe, DELETE e apaga a chave local.
- [ ] `npm run test:e2e`, com `tests/e2e/lembrete.spec.ts`. `PushManager` e `Notification` são
  falsos via `addInitScript` e a API é simulada, como em `missao.spec.ts:13-28`:
  - sem login, pede login;
  - ligar faz PUT com a hora e o endpoint;
  - trocar a hora refaz o PUT;
  - desligar faz o DELETE;
  - Infraestrutura deixa o lembrete desabilitado;
  - em 360 px, nenhum controle tem menos de 44 px.
- [ ] O `npm run test:e2e` inteiro continua verde, incluindo os testes offline do service worker.
- [ ] `npm run check`

#### Verificação manual
- [ ] No Chrome do computador, com `wrangler dev` e as chaves locais: ligar e disparar o
  `__scheduled` faz a notificação chegar, e clicar nela abre `/painel`.

**Pausa**: confirmação manual antes da fase 4.

---

## Fase 4 — Ativação em produção e teste nos aparelhos

### Mudanças

**Arquivo**: `scripts/gerar-vapid.mjs` (novo). Gera o par P-256 com WebCrypto e imprime duas coisas:
- a pública, em base64url com 65 bytes, que vai para o `wrangler.jsonc`;
- a privada, em JWK, que vira segredo.

O script não grava nada em disco.

**Passos dela**, porque só ela tem acesso ao Cloudflare:

1. `node scripts/gerar-vapid.mjs`;
2. colocar a pública em `wrangler.jsonc` (`VAPID_PUBLICA`) e fazer o commit;
3. no painel do Cloudflare, abrir o Worker `cgu` em Settings → Variables and Secrets e criar o
   segredo `VAPID_PRIVADA` com o JWK. A alternativa é `npx wrangler secret put VAPID_PRIVADA`;
4. fazer o push, para a integração Git publicar com o cron.

**Atenção:** trocar o par de chaves depois invalida todas as inscrições. Cada aparelho precisa
desligar e ligar de novo.

### Critérios de aceite

#### Verificação automática
- [ ] `npm test`, `npm run check` e `npm run test:e2e` verdes no commit que liga a chave pública.

#### Verificação manual
- [ ] No painel do Cloudflare, o Worker `cgu` mostra o Cron Trigger `0 * * * *`.
- [ ] `curl https://cgu.solarpunk.workers.dev/api/lembrete` devolve a chave pública.
- [ ] **Android (Chrome):**
  - ligar o lembrete para a próxima hora cheia, com a missão de hoje incompleta, faz a
    notificação chegar com o app fechado, e tocar nela abre o painel;
  - no dia seguinte, com a missão cumprida antes da hora, nada chega.
- [ ] **iPhone:**
  - no Safari, os Ajustes mostram a instrução de instalar;
  - instalado na tela de início, o mesmo teste do Android passa.
- [ ] Sair da conta apaga a inscrição: com o D1 consultado no painel do Cloudflare, a linha some
  de `lembretes`.

## Estratégia de teste

### Unitários
- **Criptografia:** o vetor do apêndice A da RFC 8291 dá o corpo byte a byte. O JWT tem o
  cabeçalho e as claims certos e verifica com a chave pública.
- **Agenda:**
  - fuso nas viradas de dia, 02:30Z e 03:00Z;
  - dia parcial, dia cumprido e fora da janela;
  - preferências e marcações corrompidas;
  - o mapa de cargo bate com o do app.
- **API:** validações de endpoint, hora, chaves e nome; PUT idempotente; DELETE.
- **Handler:**
  - 201, 404, 410 e 500;
  - envio duplicado na mesma hora;
  - um usuário com dois aparelhos recebe nos dois.

### Manuais
1. Cron local com `wrangler dev --test-scheduled`.
2. Chrome no computador.
3. Android de verdade.
4. iPhone instalado na tela de início.

## Limites conhecidos

- **Subrequests por execução:** o plano grátis do Workers tem um teto de subrequests em cada
  execução do cron. Cada push é um `fetch`, e o plano de cada cargo é outro. Com um punhado de
  aparelhos isso não chega perto do teto. Se um dia passar de algumas dezenas de inscrições na
  mesma hora, o envio precisa ser dividido. O teste do handler registra quantos `fetch` saem
  por execução.
- **iPhone:** sem o app na tela de início, não há push, e essa é uma regra do iOS.
- **Atraso do serviço de push:** o serviço pode atrasar a entrega. O `TTL` de 4 h descarta
  lembrete que chegaria tarde demais.

## Migração de dados

Nenhuma. A tabela `lembretes` nasce vazia, e `progresso` não muda. O lembrete começa desligado em
todo aparelho.

## Referências

- `worker/index.ts:27-36` (esquema na primeira requisição) e `:66-70` (`fetch`)
- `worker/progresso.ts:64-83` (`tratarApi`)
- `src/lib/conta/regras.ts:7-23` (chaves) e `:10-13` (precedente de regra duplicada)
- `src/lib/missoes/calculos.ts:12`, `:23` e `:51`
- `src/lib/feed/foco.svelte.ts:14` e `:40-66`
- `src/service-worker.ts:133`
- `src/routes/painel/ajustes/+page.svelte:37`
- `src/lib/conta/sessao.svelte.ts:107`
- RFC 8291 (Message Encryption for Web Push), apêndice A; RFC 8292 (VAPID); RFC 8188 (aes128gcm)

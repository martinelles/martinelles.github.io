# Contrato: tela de Ajustes

O que os testes e2e usam para achar as coisas. Mudar algo aqui exige atualizar os testes na mesma mudança.

## Rota

- Endereço: `/painel/ajustes`. Título da aba do navegador: `Ajustes · Painel de Concurso`.
- Abre por navegação interna, link direto, recarga e offline (depois da primeira visita).
- Barra de abas: `a.aba[aria-current="page"]` com `href="/painel"`.

## No painel (`/painel`)

| Elemento | Papel / seletor | Nome acessível |
|---|---|---|
| Acesso aos ajustes, no canto do cabeçalho | `link` | `Ajustes` (`href="/painel/ajustes"`, caixa ≥ 44 × 44) |
| Foco atual | texto dentro do `banner`/cabeçalho | começa com `Foco:` seguido do nome da matéria de foco |
| (não existe mais) | `group` | ~~`Aparência`~~ |
| (não existe mais) | campo | ~~`Disciplina`~~ |

## Na tela de Ajustes (`/painel/ajustes`)

Ordem no documento:

1. `heading` nível 1 `Ajustes`
2. `link` `Voltar ao painel` (`href="/painel"`)
3. Seção Foco de Estudo: `heading` `Foco de Estudo` e o campo `Disciplina` (componente `FocoEstudo`, sem mudança)
4. Seção Aparência: `group` `Aparência` com 4 `radio` (componente `SeletorTema`, sem mudança)

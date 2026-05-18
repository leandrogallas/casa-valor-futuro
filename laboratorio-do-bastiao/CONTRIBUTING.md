# Contribuindo com o Laboratório do Bastião

Obrigado pelo interesse em contribuir. Este guia descreve o fluxo mínimo para configurar o ambiente, abrir PRs e seguir as convenções do projeto.

## Setup local

Pré-requisitos:

- Node.js **20+** (use `nvm use` com o `.nvmrc` da raiz)
- pnpm **9+** (`corepack enable && corepack prepare pnpm@9 --activate`)
- Git **2.40+**

Passos:

```bash
git clone git@github.com:leandrogallas/casa-valor-futuro.git
cd casa-valor-futuro/laboratorio-do-bastiao
pnpm install
pnpm -r typecheck
```

## Workspaces

O monorepo usa **pnpm workspaces** com Turborepo orquestrando tarefas:

| Pacote     | Descrição                                                            |
| ---------- | -------------------------------------------------------------------- |
| `client`   | Cliente Phaser 3 + Vite + TypeScript (web e embutido no Tauri)       |
| `server`   | Servidor Colyseus autoritativo (Node + TS)                           |
| `agents`   | Runtime dos agentes (MCP server + A2A transport)                     |
| `shared`   | Tipos e contratos compartilhados entre client/server/agents          |
| `desktop`  | Wrapper Tauri para distribuição desktop                              |

Rodar tarefa em todos os pacotes: `pnpm -r <script>`.
Rodar tarefa em um pacote: `pnpm --filter @bastiao/client dev`.

## Branches

- `main` — branch protegida, somente via PR.
- `feat/<slug>`, `fix/<slug>`, `docs/<slug>`, `chore/<slug>` — branches de trabalho.

## Conventional Commits

Mensagens de commit devem seguir [Conventional Commits 1.0](https://www.conventionalcommits.org/pt-br/v1.0.0/).

Tipos aceitos: `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `test`, `build`, `ci`, `style`.

Exemplos:

```
feat(client): adiciona cena OfficeScene com tilemap base
fix(server): corrige race condition no estado do OfficeRoom
docs(adr): adiciona ADR 0004 sobre persistência
```

## Como abrir um ADR

ADRs (Architecture Decision Records) vivem em `docs/adr/` e seguem o formato Nygard:

1. Numere sequencialmente (`0004-<slug>.md`).
2. Use as seções: **Status**, **Contexto**, **Decisão**, **Consequências**.
3. Status inicial: `Proposto`. Após merge: `Aceito`. Decisões substituídas: `Substituído por NNNN`.

## Como abrir um PR

1. Abra como **draft** enquanto trabalha.
2. Inclua descrição com: o quê, por quê, como testar.
3. Garanta que `pnpm -r typecheck` e `pnpm -r lint` passam.
4. Para mudanças que afetam mais de um pacote, descreva a ordem de leitura sugerida.
5. Marque para revisão quando estiver pronto.

## Code review

- Discussão técnica > preferência pessoal.
- Sugestões com `code suggestion` quando possível.
- Aprovação requer pelo menos 1 revisor que não seja o autor.
- Comentários em PT-BR; código em inglês (identificadores).

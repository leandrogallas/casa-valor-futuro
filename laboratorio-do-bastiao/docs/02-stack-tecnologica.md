# 02 — Stack Tecnológica

Decisões técnicas com justificativas. Toda mudança nesta lista deve virar um ADR.

## Visão de alto nível

| Camada               | Escolha                                                |
| -------------------- | ------------------------------------------------------ |
| Cliente 2D            | **Phaser 3** + Vite + TypeScript                      |
| UI overlay            | HTML/CSS sobre canvas (vanilla TS por simplicidade)   |
| Multiplayer           | **Colyseus** (Node + `@colyseus/schema`)              |
| API REST              | Express embarcado no servidor Colyseus                |
| Agentes               | Node 20 + **MCP SDK** + transporte A2A interno (WS)   |
| Tipos compartilhados  | TypeScript estrito em `@bastiao/shared`               |
| Persistência          | **PostgreSQL** 15+                                    |
| Cache/Fila/Presença   | **Redis** 7+ (BullMQ para filas)                      |
| Desktop               | **Tauri** 2.x (Rust + WebView)                        |
| Build                 | pnpm workspaces + **Turborepo**                       |
| Lint/Format           | ESLint flat config + Prettier                         |
| Testes                | Vitest (unit) + Playwright (E2E)                      |
| Container             | Docker + docker-compose para infra local              |
| Observabilidade       | OpenTelemetry (logs/traces) → Grafana/Loki/Tempo      |

## Cliente — Phaser 3 + Vite + TS

**Por que Phaser 3:**

- Maduro (10+ anos), ativo, grande comunidade.
- Suporte first-class a tilemaps (Tiled), arcade physics, animações.
- Tamanho de bundle razoável (~1.2 MB gzip) e roda bem em hardware modesto.
- Documentação extensa e abundância de exemplos públicos.

**Alternativas rejeitadas:** PixiJS é mais leve mas pediria reimplementar tilemap/physics; Excalibur tem comunidade menor; Godot Web exige toolchain própria e não casa com nosso stack TS.
Veja [ADR 0001](adr/0001-escolha-engine-2d.md).

**Por que Vite:** HMR rápido, ES Modules nativo, configuração mínima, integração trivial com TS.

## Servidor — Colyseus

**Por que Colyseus:**

- Modelo de **Room** encapsula state + lógica + ciclo de vida de forma idiomática.
- `@colyseus/schema` faz sync delta com binário compacto.
- Suporte a interest management e reconexão out of the box.
- Compatível com Node TS, deploys padrão (Docker, k8s).

**Alternativas rejeitadas:** Socket.IO seria mais low-level (re-inventaria sync); Hathora é proprietário; servidores autorais elevam custo de manutenção.
Veja [ADR 0003](adr/0003-multiplayer-authoritative.md).

## Linguagem — TypeScript estrito em todo lugar

- `strict: true`, `noImplicitAny`, `noFallthroughCasesInSwitch`.
- Um único `tsconfig.base.json` na raiz com paths para `@bastiao/shared`.
- Sem any salvo em fronteiras com bibliotecas sem tipos (e marcado com `// @ts-expect-error`).

## Protocolo de agentes — MCP + A2A

- **MCP (Model Context Protocol)** primário para expor tools ao LLM do agente.
- **A2A** para mensagens agente-a-agente, evitando passar pelo modelo quando a comunicação é factual/estruturada.
- SDK: `@modelcontextprotocol/sdk` (oficial Anthropic).

Veja [ADR 0002](adr/0002-protocolo-agentes-mcp-a2a.md) e `04-protocolo-agentes.md`.

## Persistência — PostgreSQL + Redis

- PG armazena entidades de domínio (`Usuario`, `Agente`, `Tarefa`, `Audit Log`).
- Redis cobre presença, cache "quente" de estado e filas BullMQ (rotinas agendadas).
- Audit log: tabela append-only com índices por agente e por janela temporal.
- Migrações via [drizzle-kit](https://orm.drizzle.team/) ou [Prisma](https://www.prisma.io/) — decisão final em ADR futuro (default tentativo: Drizzle, por afinidade com TS estrito e SQL explícito).

## Desktop — Tauri 2

- Frontend = mesmo `client/` Phaser servido localmente.
- Bundle nativo macOS/Win/Linux, sem Electron.
- Auto-update via Tauri updater + assinatura.
- Em primeira fase, apenas wrapper; bridges Rust entram quando precisarmos de integrações de sistema (notificação, system tray, deep links).

## Build/Monorepo — pnpm + Turborepo

- **pnpm workspaces** para link rápido e diskspace eficiente.
- **Turborepo** orquestra `build/typecheck/lint/test` com cache local (e remote no futuro).
- Single `tsconfig.base.json` com `references` por pacote para incremental builds.

## Lint/Format — ESLint flat + Prettier

- Flat config (`eslint.config.js`) — padrão do ESLint 9+.
- Prettier integrado, sem regras de formatação no ESLint para evitar conflito.
- `.editorconfig` para garantir consistência fora do ecossistema Node.

## Testes

- **Vitest** em todos os pacotes TS (unit/integration).
- **Playwright** em `client/` para E2E (smoke test do login + entrada no escritório).
- Cobertura mínima alvo: 60% em `shared`, 50% em `server`/`agents`, smoke-only no client.

## Observabilidade

- **Pino** para logs estruturados em JSON.
- **OpenTelemetry** para traces e métricas; exportadores OTLP.
- Audit log de agentes vai pra PG (não para Loki) porque é evidência de auditoria, não só sinal operacional.

## Versões pinned (alvo inicial)

| Dependência              | Versão alvo |
| ------------------------ | ----------- |
| Node                     | 20 LTS      |
| pnpm                     | 9.x         |
| TypeScript               | 5.5+        |
| Phaser                   | 3.80+       |
| Colyseus                 | 0.16+       |
| Vite                     | 5.4+        |
| Vitest                   | 2.x         |
| Tauri                    | 2.x         |
| `@modelcontextprotocol/sdk` | 1.x      |
| PostgreSQL               | 15+         |
| Redis                    | 7+          |

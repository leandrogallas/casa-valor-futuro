# Prompt de Continuidade — Laboratório do Bastião

Copie o bloco abaixo e cole como **primeira mensagem** numa nova sessão do Claude Code para retomar o projeto com contexto completo.

---

```
Estou continuando o desenvolvimento do projeto Laboratório do Bastião.

## O que é
Escritório virtual 2D multiplayer (estilo Gather.town/WorkAdventure, mas com
visual próprio) onde humanos e agentes de IA convivem. Agentes conectam por
protocolos abertos — MCP primário + A2A complementar —, recebem tarefas,
executam rotinas, participam de reuniões e são observáveis em tempo real.

## Onde vive
O projeto está em `laboratorio-do-bastiao/` dentro do repositório
`leandrogallas/casa-valor-futuro` (o `main` desse repo é um simulador
imobiliário não-relacionado; a pasta do Bastião é isolada e auto-contida).
Branch de trabalho: `claude/bastion-lab-docs-bthxg`.

## Estado atual (PR #1, draft)
- Documentação completa em PT-BR em `laboratorio-do-bastiao/docs/`:
  visao, arquitetura (C4 ASCII), stack, modelo de dados, protocolo de
  agentes (MCP+A2A), mapa-e-salas, netcode, rotinas-e-tarefas, ui-ux,
  segurança-sandbox, roadmap, api-spec, glossário.
- ADRs 0001–0003 em `docs/adr/` (formato Nygard).
- Scaffold monorepo pnpm + Turborepo em:
  `client/` (Phaser 3 + Vite + TS, cenas stub),
  `server/` (Colyseus + Node + TS, OfficeRoom stub),
  `agents/` (MCP + A2A runtime stub),
  `shared/` (tipos canônicos do domínio em src/types.ts),
  `desktop/` (Tauri 2 placeholder),
  `assets/` (pipeline de arte documentado, sem binários).
- Demo standalone em `demo/index.html` (Phaser via CDN, sem build):
  6 salas, avatar humano controlável (WASD/setas), 3 agentes IA pré-
  roteirizados (Bia/Mauro/Léo), painel lateral com atribuição de tarefa
  e audit log ao vivo. Abrir direto no navegador para ver a visão.

## Convenções a seguir
- Documentação em **PT-BR**; identificadores de código em **inglês**.
- **Conventional Commits** com escopo `bastiao` (ex.: `feat(bastiao): ...`).
- TS **strict** em todos os pacotes; sem `any` salvo em fronteiras com
  bibliotecas sem tipos (marcado com `// @ts-expect-error`).
- Toda mudança no modelo de dados precisa atualizar tanto
  `shared/src/types.ts` quanto `docs/03-modelo-de-dados.md`.
- Mudanças arquiteturais relevantes viram **ADR** novo em `docs/adr/`,
  formato Nygard (Status / Contexto / Decisão / Consequências).

## Restrição do ambiente cloud (relevante só nas sessões web do Claude Code)
O assinador de commits está autorizado APENAS para
`/home/user/casa-valor-futuro`. Mantenha todo o trabalho dentro de
`laboratorio-do-bastiao/` (subpasta) — não tente criar diretório fora
desse caminho ou commits falharão com "missing source".

## Próximos passos prioritários (alinhar comigo antes de codar muito)
Conforme `docs/10-roadmap.md` — Fase MVP "Sala única, primeiro agente":

1. Subir o `client/` Phaser de verdade: substituir o stub em
   `client/src/main.ts` por uma cena com tilemap funcional (pode começar
   procedural como no `demo/`), movimento WASD/setas e colisão.
2. Subir o `server/` Colyseus de verdade: implementar `OfficeRoom`
   estendendo `Room<OfficeState>`, popular o schema com `@colyseus/schema`,
   processar mensagens `move`/`chat`.
3. Conectar `client/` ao `server/` via `colyseus.js`; ver dois browsers
   simultâneos andando na mesma sala (multiplayer humano-humano).
4. Implementar 1 agente real em `agents/`: worker headless que entra no
   OfficeRoom como cliente Colyseus + MCP server expondo 3 tools
   (`tarefa.atualizar`, `mensagem.enviar`, `artefato.criar`) + LLM driver
   chamando a API Anthropic (claude-opus-4-7 default).
5. Endpoint REST `/v1/agentes` para criar/configurar agentes; persistência
   inicial em SQLite (postergar PostgreSQL pro Beta).

Cada passo deve sair em PR separado, com testes mínimos (Vitest) e
audit log básico funcionando antes de mergear.

## Como começar
Leia primeiro, em ordem:
1. `laboratorio-do-bastiao/docs/00-visao.md`
2. `laboratorio-do-bastiao/docs/01-arquitetura.md`
3. `laboratorio-do-bastiao/docs/10-roadmap.md` (foco na seção MVP)
4. `laboratorio-do-bastiao/shared/src/types.ts`
5. PR #1 em https://github.com/leandrogallas/casa-valor-futuro/pull/1

Depois me proponha um plano para o próximo passo do MVP antes de codar.
```

---

## Como usar

1. Numa nova sessão do Claude Code, cole o bloco acima como primeira mensagem.
2. O Claude lerá o contexto, examinará os arquivos referenciados e proporá um plano antes de codar.
3. Se quiser pular para um passo específico do MVP, troque a frase final do prompt por algo como `"Comece pelo passo 2 (servidor Colyseus real)"`.

## Dicas extras

- Se mudar de repositório (extrair a pasta com `git subtree split`), troque as referências de caminho no prompt.
- Para mudanças arquiteturais, peça explicitamente um ADR antes de codar: *"Antes de implementar X, abra um ADR em docs/adr/ no formato Nygard explicando a decisão."*
- Se quiser focar só em documentação (não código), termine o prompt com: *"Não codifique nada nesta sessão; apenas atualize/crie docs."*

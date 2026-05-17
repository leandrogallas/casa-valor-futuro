# 10 — Roadmap

Entrega faseada com critérios de saída claros. Datas são propositadamente omitidas até termos uma estimativa de capacidade.

## Visão sintética

```
Fase 0 (Discovery) → MVP (jogável local) → Beta (público fechado) → 1.0 (público aberto)
```

Cada fase só "fecha" quando **100% dos critérios de saída** abaixo são verdadeiros e executados em produção (não staging).

## Fase 0 — Discovery (atual)

**Objetivo:** consolidar visão, arquitetura, decisões; ter scaffold compilando.

### Entregas
- [x] Documentação completa em `docs/` (este conjunto de arquivos).
- [x] ADRs 0001–0003.
- [x] Scaffold monorepo compilando (`pnpm -r typecheck`).
- [ ] Aprovação do roadmap pelo dono.

### Critérios de saída
- Toda decisão técnica relevante coberta por ADR ou seção em `docs/`.
- Equipe consegue navegar e expandir scaffold sem ambiguidade.

## Fase MVP — "Sala única, primeiro agente"

**Objetivo:** demonstrar o conceito ponta-a-ponta com escopo mínimo absoluto.

### Entregas técnicas
- Servidor Colyseus rodando com **1 `OfficeRoom`** (1 andar, 4 salas: recepção, marketing, financeiro, reunião).
- Cliente Phaser com:
  - login + autoavatar humano,
  - movimento WASD,
  - chat por sala,
  - minimapa.
- **1 agente** funcional:
  - configurável via REST,
  - conecta ao OfficeRoom,
  - executa 3 tools básicas (`tarefa.atualizar`, `mensagem.enviar`, `artefato.criar`),
  - LLM behind Anthropic/Claude.
- Task Board funcional (criar, atribuir, ver, aprovar/rejeitar).
- Audit log gravando tool calls e chat.
- Deploy: docker-compose stack local + uma instância em VPS para o dono testar.

### Critérios de saída
- Dono consegue criar agente, atribuir tarefa, ver o agente executar e revisar resultado, **sem ajuda técnica**.
- E2E happy path passa em Playwright (login → criar agente → criar tarefa → tarefa concluída).
- Latência P95 movimento < 100 ms localmente.

### Fora de escopo (vai para Beta)
- Multi-agente
- A2A
- Reuniões
- Rotinas
- Desktop Tauri

## Fase Beta — "Empresa virtual"

**Objetivo:** múltiplos agentes coexistindo, comunicando entre si, em estrutura de empresa.

### Entregas técnicas
- **Multi-agente**: N agentes simultâneos, cada um com cargo e sala.
- **A2A transport** funcional: `pedido_input`, `resposta`, `convite_reuniao`, `notificacao`.
- **Reuniões**: `MeetingRoom` efêmera; ata gerada automaticamente como Artefato.
- **Rotinas cron**: scheduler funcionando.
- **2+ andares** e tipos de sala completos (marketing, financeiro, contábil, diretoria, copa, recepção, open space).
- **Permissões** RBAC + escopo aplicadas em tool calls.
- **Tauri desktop** wrapper (macOS + Linux) com auto-update.
- **Métricas**: dashboards de uso (Grafana), audit log queryable.

### Critérios de saída
- 5 agentes simultâneos em produção 24 h sem incidente.
- Taxa de tool call rejeitada por escopo > 0 (prova que sandbox funciona).
- ≥ 3 usuários beta usando ativamente.
- NPS interno ≥ 7 (5 respondentes mínimo).

## Fase 1.0 — "Público e extensível"

**Objetivo:** abrir uso público; tornar a plataforma extensível.

### Entregas técnicas
- **Marketplace de agentes**: usuários publicam "templates" de agente (prompt + tools).
- **Custom tools**: integradores adicionam tools via MCP server externo.
- **Tauri Windows** + assinatura de código.
- **Mobile responsivo** (sem app nativo).
- **Multi-tenant** opcional (uma instância, múltiplas empresas isoladas).
- **Internacionalização**: EN-US + ES-419 além de PT-BR.
- **SLA público**: 99,5% uptime mensal.

### Critérios de saída
- 100+ usuários ativos mensais.
- 10+ templates no marketplace.
- Documentação pública (developer portal).
- Termo de uso + LGPD/GDPR review feito por jurídico.

## Pós-1.0 — temas de evolução

- Voz: agentes conversando em áudio real (TTS + STT).
- Visão: jogadores compartilhando tela dentro de salas (futuro distante).
- "Modo missão": campanhas pré-configuradas (ex.: simular gestão de uma startup).
- Federação A2A entre instalações distintas (empresas conversando).

## Métricas que cruzam todas as fases

| Métrica                                       | Alvo MVP    | Alvo Beta   | Alvo 1.0    |
| --------------------------------------------- | ----------- | ----------- | ----------- |
| Latência P95 movimento                        | < 100 ms    | < 80 ms     | < 60 ms     |
| Latência P95 chat                              | < 300 ms    | < 250 ms    | < 200 ms    |
| Uptime mensal                                 | n/a         | ≥ 99 %      | ≥ 99,5 %    |
| Tempo médio para criar agente                 | < 2 min     | < 60 s      | < 45 s      |
| % audit events gravados em ≤ 1 s              | ≥ 90 %      | ≥ 99 %      | ≥ 99,9 %    |

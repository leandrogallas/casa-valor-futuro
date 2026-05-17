# ADR 0002 — Protocolo de agentes: MCP primário + A2A complementar

## Status

Aceito — 2026-05-17

## Contexto

Os Agentes IA do Laboratório do Bastião precisam interagir com:

1. **Ferramentas/contexto** — bancos, APIs, ações no jogo (mover, atualizar tarefa, criar artefato).
2. **Outros agentes** — para hand-offs, coordenação, divisão de trabalho.
3. **Humanos** — via chat na sala (não é objeto deste ADR).

Para (1) e (2) consideramos:

| Opção                            | Cobre tools? | Cobre A2A? | Aberto? | Maturidade | Lock-in    |
| -------------------------------- | ------------ | ---------- | ------- | ---------- | ---------- |
| MCP (Anthropic)                  | sim          | não diretamente | sim     | alta       | nenhum     |
| A2A (Google)                     | parcial      | sim        | sim     | crescente  | nenhum     |
| OpenAI Function calling          | sim          | não        | parcial | alta       | OpenAI     |
| LangChain agents                 | sim          | sim        | sim (lib) | média    | framework  |
| Stack proprietário (autoral)     | sim          | sim        | sim     | zero       | total      |

O usuário do projeto sinalizou explicitamente preferência por protocolos abertos ("open claw" foi a expressão usada). Queremos **interoperabilidade**: trocar o LLM, ou conectar agentes de fornecedores diferentes, sem rewrite.

## Decisão

Usar **MCP como protocolo primário** para conectar Agentes a tools e contexto, e **A2A como protocolo complementar** para comunicação direta entre agentes.

- O **MCP server interno** vive dentro do worker do agente (`agents/src/mcp/server.ts`) e expõe tools com escopo.
- O **A2A transport** (`agents/src/a2a/transport.ts`) roteia mensagens entre agentes via WebSocket interno (futuramente NATS).
- Mensagens A2A **não** passam pelo LLM no roteamento — são estruturadas. Apenas o destinatário decide se vai consultar seu LLM ao processar.

### Pacote `Agente.protocolo`

Modelado em `shared/src/types.ts` como `'mcp' | 'a2a' | 'mcp+a2a'`. Default e recomendado: `'mcp+a2a'`.

## Consequências

### Positivas

- Liberdade de escolha de LLM por agente.
- Tools versionadas e tipadas (JSONSchema) — auditoria limpa.
- A2A reduz custo de tokens em hand-offs (mensagens estruturadas, não-LLM-mediadas).
- Caminho natural para "marketplace de agentes" na Fase 1.0: agente é um conjunto de prompt + tools MCP, portável.

### Negativas

- Dois protocolos para manter. **Mitigação:** wrappers internos no `agents/` isolam código de aplicação dos detalhes de protocolo.
- A2A é mais novo; espec ainda evolui. **Mitigação:** começar com subset estável; reservar branch para upgrades.
- Implementar gatekeeper de escopo nas tools é trabalho extra obrigatório (ver `09-seguranca-sandbox.md`). Não é opcional.

### Reversibilidade

Trocar MCP por outro protocolo de tools afetaria `agents/src/mcp/`. Tools em si têm assinatura `MCPTool` que abstrai o transporte — refactor seria sobre o transporte, não sobre as tools. A2A é encapsulado em `A2ATransport`, igualmente substituível.

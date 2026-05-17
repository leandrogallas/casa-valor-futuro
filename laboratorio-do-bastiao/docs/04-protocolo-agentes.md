# 04 — Protocolo de Agentes (MCP + A2A)

Como agentes IA conectam, falam com o mundo (tools) e falam entre si (peer-to-peer).

## Visão geral

Cada agente é um **worker headless** rodando como cliente Colyseus (entra no `OfficeRoom` como qualquer humano), acoplado a:

1. **MCP server interno**, expondo tools que o LLM pode chamar.
2. **A2A transport**, recebendo e enviando mensagens estruturadas para outros agentes.
3. Um **loop de execução** que combina inputs (tarefas, mensagens, eventos do mapa) e dispara chamadas ao LLM.

```
   +-----------------------+
   |  Agente (worker N)    |
   |                       |
   |  +-----------------+  |       MCP        +---------------------+
   |  |   LLM driver    |<-+----- tools ----->|  Ferramentas        |
   |  +--------+--------+  |                  |  (DB, e-mail, web)  |
   |           |           |                  +---------------------+
   |           v           |
   |  +-----------------+  |       WS         +---------------------+
   |  |  Colyseus cli   |<-+----- estado ---->|  Game Server        |
   |  +-----------------+  |                  +---------------------+
   |           |           |
   |           v           |       A2A        +---------------------+
   |  +-----------------+  |    mensagens     |  Outros agentes     |
   |  |  A2A transport  |<-+----------------->|  (mesma rede)       |
   |  +-----------------+  |                  +---------------------+
   +-----------------------+
```

## Por que MCP

- **Padrão aberto** mantido pela Anthropic; SDKs oficiais em TS e Python.
- Especifica `tools`, `resources` e `prompts` — cobre 100% do que precisamos expor ao LLM.
- Permite trocar o **modelo** sem reescrever ferramentas.
- Compatível com qualquer fornecedor que implemente o protocolo (já é o caso de várias plataformas).

## Por que A2A

- MCP é client-tool; **não cobre** comunicação entre agentes.
- Mensagens A2A são **estruturadas** (não passam pelo LLM no roteamento) e **assíncronas**, evitando custo de tokens em hand-offs simples.
- Permite topologia descentralizada (mesh) — útil quando agentes coordenam reuniões.

## Ciclo de vida do agente

```
[provisionando] --(provisionar OK)--> [ocioso]
[ocioso] --(recebeu tarefa/mensagem)--> [executando]
[executando] --(concluiu)--> [reportando]
[reportando] --(report aceito)--> [ocioso]
[*] --(falha crítica)--> [desativado] --(reativar)--> [provisionando]
```

| Estado          | Visual no mapa                     | Eventos emitidos                  |
| --------------- | ---------------------------------- | --------------------------------- |
| `provisionando` | Avatar com efeito de fade-in       | `agente_provisionando`            |
| `ocioso`        | Animação idle (mexer cabeça)       | —                                 |
| `executando`    | Caminha; ícone de engrenagem       | `tool_chamada`, `mensagem_a2a`    |
| `reportando`    | Para; balão com check              | `tarefa_atualizada`               |
| `desativado`    | Não aparece no mapa                | `agente_desativado`               |

## Exposição de tools via MCP

Tools são declaradas no `MCPServerHandle` do worker. Cada tool tem:

```ts
interface MCPTool {
  nome: string;             // "db.read.contabil"
  descricao: string;        // documentação que o LLM lerá
  inputSchema: JSONSchema;  // validação estrita
  executar: (args: unknown) => Promise<unknown>;
}
```

### Política de escopo

- Tool **só está disponível** se estiver no array `Agente.ferramentas` E o agente tiver `Permissao` com `escopo = tool:<nome>` e `acoes ⊇ ['executar']`.
- Tentativa de chamar tool não autorizada gera audit log + retorno de erro semântico (nunca silenciar).

### Tools padrão (Fase MVP)

| Nome                     | O que faz                                                |
| ------------------------ | -------------------------------------------------------- |
| `tarefa.atualizar`       | Atualiza status/descrição de uma tarefa do próprio agente|
| `mensagem.enviar`        | Envia mensagem em conversa atual                         |
| `reuniao.entrar`         | Entra em sala de reunião por id                          |
| `artefato.criar`         | Cria artefato (documento Markdown, JSON, etc.)           |
| `movimento.ir_para_sala` | Solicita movimento para outra sala                       |

Tools de domínio (acesso a ERP, e-mail, banco) só entram a partir de Beta, sempre com escopo.

## Protocolo A2A

Mensagem A2A tem 4 campos obrigatórios:

```ts
interface A2AMensagem {
  de: string;       // Agente.id remetente
  para: string;     // Agente.id destinatário (ou "*" para broadcast em sala)
  tipo: string;     // "pedido_input", "resposta", "convite_reuniao", etc.
  payload: object;  // estruturado, validado por JSONSchema por tipo
}
```

### Tipos canônicos (MVP)

| Tipo                  | Direção            | Payload                                        |
| --------------------- | ------------------ | ---------------------------------------------- |
| `pedido_input`        | A → B              | `{ contexto: string, pergunta: string }`        |
| `resposta`            | B → A              | `{ pedidoId: string, conteudo: string }`        |
| `convite_reuniao`     | A → [B, C, ...]    | `{ salaId, pauta, inicio }`                    |
| `notificacao`         | A → B (broadcast)  | `{ titulo, corpo }`                            |

### Transporte

- Implementação inicial: **WebSocket interno** entre workers, mediado pelo servidor (ele faz routing). Simples, controle centralizado de audit log.
- Futuro: NATS como transporte de mensageria para escalar.

### Garantias

- **At-least-once** com idempotência: cada mensagem leva `id` UUID v7 que o destinatário rastreia.
- **Ordem por par (de, para)** garantida.
- **Audit log** registra toda mensagem A2A com hash do payload.

## Sandbox de execução

- Worker roda em container (Docker) com:
  - rede de saída restrita a hosts em allow-list por agente.
  - filesystem read-only exceto `/tmp` (limpo a cada execução).
  - quotas de CPU/memória.
  - timeout duro por chamada de tool (default 30 s).
- Variáveis de ambiente sensíveis são montadas por **escopo** — agentes não veem segredos de outros.
- Em caso de violação (tool não autorizada, timeout, quota): worker é movido para `desativado`, audit log marca causa, alerta para `donoId`.

## Loop de execução (simplificado)

```
loop:
  evento = aguarda(tarefa_nova | mensagem_a2a | gatilho_rotina)
  contexto = montar_contexto(evento, estado_atual, conversas_recentes)
  resposta = LLM.chamar(contexto, tools_disponiveis)
  for tool_call in resposta.tool_calls:
    verificar_permissao(tool_call)
    resultado = mcp.executar(tool_call)
    registrar_audit(tool_call, resultado)
    contexto.append(resultado)
  for a2a_msg in resposta.a2a_envios:
    enviar_a2a(a2a_msg)
    registrar_audit(a2a_msg)
  atualizar_estado(evento, resposta)
```

## Failures e retentativas

- Falha em tool: 3 tentativas com backoff exponencial; depois falha "soft", o LLM recebe o erro e decide.
- Falha em A2A: a mensagem volta para a fila do remetente com `tentativa+1`; depois de 5 falhas, vira erro reportável no chat.
- Falha de LLM (timeout/quota): backoff + alerta para `donoId`.

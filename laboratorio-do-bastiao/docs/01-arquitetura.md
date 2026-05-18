# 01 — Arquitetura

Visão arquitetural ponta a ponta. Use junto com os ADRs em `docs/adr/` para entender o **porquê** das escolhas.

## Princípios arquiteturais

- **Servidor é a fonte da verdade.** Cliente apenas renderiza e envia inputs.
- **Pacotes desacoplados via `shared/`.** Tipos vivem em `@bastiao/shared`; nenhum runtime cruza entre client/server/agents sem passar por tipo declarado.
- **Protocolos sobre frameworks.** MCP e A2A são contratos de interoperabilidade; nossas escolhas (Phaser, Colyseus, Tauri) são detalhes substituíveis.
- **Observabilidade ≥ funcionalidade.** Sem audit log e métricas, nada vai pra produção.

## Diagrama C4 — Contexto

```
                        +---------------------------+
                        |        Pessoa (Dono)      |
                        +-------------+-------------+
                                      |
                                      | navegador / app desktop
                                      v
+------------------+        +-------------------------+        +--------------------+
|   Pessoa (Gestor)|------->|  Laboratório do Bastião |<------>|  Modelo de IA (LLM)|
+------------------+        |  (ambiente virtual 2D)  |  HTTPS |  (Anthropic, OpenAI,|
                            +------------+------------+        |   Google, locais)  |
                                  ^      |                     +--------------------+
                                  |      | A2A / MCP                 ^
                                  |      v                            | tool calls
+------------------+      +--------------------+           +----------+----------+
|   Pessoa (Colab.)|----->|   Agente IA (N)    |---------->|  Ferramentas externas|
+------------------+      |  (worker headless) |    MCP    |  (DB, e-mail, ERP,   |
                          +--------------------+           |   buscas web, etc.)  |
                                                           +---------------------+
```

## Diagrama C4 — Contêineres

```
+--------------------------------------------------------------------------------+
|                          LABORATÓRIO DO BASTIÃO                                |
|                                                                                |
|  +-----------------+        +----------------+        +--------------------+   |
|  |  Client Web     |        |  Desktop App   |        |  Agente IA (N)     |   |
|  |  Phaser 3 + Vite|        |  Tauri wrap    |        |  Node + MCP + A2A  |   |
|  |  (TS)           |        |  do client     |        |  worker container  |   |
|  +--------+--------+        +----+-----------+        +----------+---------+   |
|           | WebSocket            | WebSocket                     | WebSocket   |
|           |  (Colyseus)          |  (Colyseus)                   |  (Colyseus) |
|           v                      v                               v             |
|        +-------------------------------------------------------------+         |
|        |                Game Server  (Colyseus + Node + TS)           |        |
|        |   - OfficeRoom autoritativo (tick 20 Hz)                     |        |
|        |   - LobbyRoom (matchmaking entre salas)                      |        |
|        |   - MeetingRoom (instanciada sob demanda)                    |        |
|        |   - Audit Log Writer (append-only)                           |        |
|        +-------+--------------------------------+----------------------+        |
|                |                                |                              |
|         SQL    v                                v  Queue                       |
|        +------------------+              +----------------+                    |
|        |   PostgreSQL     |              |     Redis      |                    |
|        |  (estado durável)|              | (presença,     |                    |
|        |  - usuarios      |              |  cache de      |                    |
|        |  - agentes       |              |  estado, fila  |                    |
|        |  - tarefas       |              |  BullMQ)       |                    |
|        |  - audit log     |              +----------------+                    |
|        +------------------+                                                    |
+--------------------------------------------------------------------------------+
```

## Componentes-chave

### Client (`client/`)

- **Phaser 3** renderiza o mapa (tilemap), avatares, animações, partículas.
- **Vite** serve em dev e empacota em build.
- **Colyseus client (`colyseus.js`)** mantém WebSocket com o servidor, recebe patches de estado, envia inputs.
- **UI overlay** em HTML/CSS sobre o canvas Phaser para HUD, chat, painéis (mais simples e acessível que UI feita dentro do canvas).

### Server (`server/`)

- **Colyseus** orquestra salas (`OfficeRoom`, `LobbyRoom`, `MeetingRoom`).
- Estado é declarado via `@colyseus/schema` e sincronizado por delta.
- Tick autoritativo: 20 Hz (movimentação) + eventos discretos (chat, ações).
- Persistência: write-through para PostgreSQL nos eventos de domínio; Redis para presença e cache "quente".

### Agents (`agents/`)

- Worker headless em Node. Cada agente é uma instância.
- **MCP server** expõe tools que o LLM do agente pode chamar (DB read, e-mail send, etc.) com escopos.
- **A2A transport** envia/recebe mensagens entre agentes.
- O worker também é cliente Colyseus: entra no `OfficeRoom`, anda, fala — como um humano.

### Shared (`shared/`)

- Tipos e contratos. Source of truth do modelo de dados (`03-modelo-de-dados.md`).

### Desktop (`desktop/`)

- Tauri carrega o `client/dist` como webview. Adiciona system tray, autoupdate e bridges nativas para notificação.

## Fluxos críticos

### F-01 Login + entrada no escritório

```
Browser -> /auth (REST) -> token JWT
Browser -> WS Colyseus.joinOrCreate('office_room', { token })
Server  -> valida token, lê usuário do PG, instancia avatar em this.state.jogadores
Server  -> broadcast 'jogador_entrou' aos demais clientes
Browser -> recebe snapshot inicial, renderiza
```

### F-02 Criar agente

```
Gestor   -> POST /agentes (REST) { nome, cargo, modelo, prompt, tools, salaId }
Server   -> persiste em PG, publica evento 'agente_criado' em Redis
AgentMgr -> spawna worker container para o novo agente
Worker   -> conecta MCP server + A2A transport
Worker   -> entra no OfficeRoom como cliente Colyseus, posiciona-se na sala configurada
Clientes -> veem novo avatar aparecer no mapa
```

### F-03 Atribuir e executar tarefa

```
Gestor   -> POST /tarefas { agenteId, titulo, ... }
Server   -> persiste, publica em Redis BullMQ
Worker   -> consumer pega tarefa, atualiza estado para 'executando'
Worker   -> caminha até a sala apropriada (movimento real no mapa)
Worker   -> chama tools via MCP (LLM decide), trocando mensagens
Worker   -> ao concluir, gera artefato, posta no chat, atualiza tarefa
```

### F-04 Reunião

```
Quem chama -> /reunioes { salaId, pauta, participantes }
Server     -> cria MeetingRoom efêmera ligada à sala física
Participan -> recebem convite, podem aceitar; ao entrar, mensagens são linkadas
Após sair  -> server consolida ata, salva como Artefato em PG, fecha MeetingRoom
```

### F-05 Hand-off A2A entre agentes

```
Agente A -> A2A.enviar({ para: agenteB.id, tipo: 'pedido_input', payload: {...} })
Transport-> roteia (NATS/WS interno), entrega ao worker do Agente B
Agente B -> processa, responde via A2A; ambos logam tool calls/respostas
Mapa     -> animação visual: linha pontilhada ou ícone flutuante entre os avatares
```

## Decisões transversais (resumo, ver ADRs)

| Decisão                                 | Escolha            | ADR                                       |
| --------------------------------------- | ------------------ | ----------------------------------------- |
| Engine 2D                                | Phaser 3            | [ADR 0001](adr/0001-escolha-engine-2d.md) |
| Protocolo de agentes                     | MCP + A2A           | [ADR 0002](adr/0002-protocolo-agentes-mcp-a2a.md) |
| Modelo de multiplayer                    | Autoritativo (Colyseus) | [ADR 0003](adr/0003-multiplayer-authoritative.md) |

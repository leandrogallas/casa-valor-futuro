# 06 — Multiplayer / Netcode

Modelo de rede, sincronização de estado, autoridade e tolerância a falha.

## Modelo

**Cliente-servidor autoritativo.** O servidor é fonte da verdade. Cliente apenas envia inputs e renderiza estado recebido.

Razões resumidas:

- Anti-cheat trivial (não confiamos em coordenadas que o cliente reportar).
- Audit log limpo: estado vem do servidor, com timestamps consistentes.
- Reconexão simples: cliente pede snapshot e segue.

Detalhes da decisão em [ADR 0003](adr/0003-multiplayer-authoritative.md).

## Rooms Colyseus

| Room               | Quando                                              | Estado central                                   |
| ------------------ | --------------------------------------------------- | ------------------------------------------------ |
| `LobbyRoom`        | Sempre. Cliente entra ao autenticar.                | Lista de prédios/andares disponíveis             |
| `OfficeRoom`       | Uma por **andar** instanciado.                      | `predioId`, `andarId`, mapa de jogadores, eventos|
| `MeetingRoom`      | Efêmera, instanciada quando uma reunião começa.     | `pauta`, `participantes`, mensagens linkadas     |

### State schema (resumido)

```ts
class JogadorState {
  id: string;
  nome: string;
  x: number;
  y: number;
  salaAtualId: string;
  estadoVisual: 'andando' | 'parado' | 'falando' | 'pensando';
  ehAgente: boolean;
}

class OfficeState {
  predioId: string;
  andarId: string;
  jogadores: MapSchema<JogadorState>;
  conversasAtivas: MapSchema<ConversaState>;
}
```

## Tick rate

- **Movimento:** servidor avalia a 20 Hz (50 ms por tick). Cliente envia inputs a 30 Hz (mais frequente para reduzir jitter, mas amostrado pelo servidor).
- **Eventos discretos** (entrar em sala, falar, criar tarefa): processados imediatamente, sem aguardar tick.

## Mensagens cliente ↔ servidor

### Cliente → Servidor (inputs)

| Mensagem      | Payload                                       | Quando                              |
| ------------- | --------------------------------------------- | ----------------------------------- |
| `move`        | `{ direcao: 'N' \| 'S' \| 'L' \| 'O', t }`     | A cada input contínuo de movimento  |
| `interagir`   | `{ alvo: ObjetoId }`                          | Clique em mesa/quadro/porta         |
| `chat`        | `{ conteudo, escopo: 'sala' \| 'dm', dmAlvo? }`| Enviar mensagem                     |
| `entrar_sala` | `{ salaId }`                                  | Selecionou sala no minimapa         |

### Servidor → Cliente (broadcasts)

| Mensagem            | Payload                                              |
| ------------------- | ---------------------------------------------------- |
| `jogador_entrou`    | `JogadorState`                                       |
| `jogador_saiu`      | `{ id }`                                             |
| `chat_recebido`     | `{ autorId, conteudo, salaId?, dm?, t }`             |
| `tarefa_atualizada` | `{ tarefaId, status, atualizadoPor }`                |
| `meeting_aberta`    | `{ meetingId, salaId, pauta, participantes }`        |
| `agente_evento`     | `{ agenteId, tipo: 'tool_chamada' \| 'a2a' \| ..., resumo }` |
| `audit_event`       | `{ id, autorId, acao, hash }`  (apenas para admins)  |

## Sincronização de estado

- Colyseus serializa o `OfficeState` como diff binário sobre WebSocket.
- Cliente aplica patches e roda interpolação visual (60 FPS) entre estados recebidos.
- Reconciliação client-side é **opcional** no MVP (basta corrigir posição quando snapshot chegar). Predição local fica para Beta.

## Interest Management (AoI)

- Sala = andar inteiro pode ter 64+ avatares simultâneos.
- Estratégia: filtrar updates de posição por **raio de visão** (default 12 tiles do avatar do cliente).
- Eventos não-locais (chat, entrada/saída de jogador, eventos de tarefa) continuam globais à room.
- Reduz banda em ~70 % em testes simulados com 64 avatares.

## Reconexão

- Token JWT armazenado no cliente (HttpOnly cookie em web, secure storage em desktop).
- Reconexão automática com backoff: 1 s, 2 s, 4 s, 8 s, 16 s; máximo 5 tentativas.
- Server mantém o "shell" do jogador por **30 s** após drop — se reconectar nesse intervalo, retoma posição exata.
- Após 30 s, jogador é despawnado e precisa entrar de novo via Lobby.

## Anti-cheat (MVP)

- Servidor descarta `move` com `|delta|` maior que `velocidadeMax * deltaT`.
- Rate limit por cliente: 60 inputs/s por tipo de mensagem. Excedeu? Drop + warn audit.
- Chat: rate limit 5 msgs/2 s; mensagens vazias ou maiores que 1 KB rejeitadas.

## Erros e recuperação

| Situação                              | Reação do servidor                                       |
| ------------------------------------- | -------------------------------------------------------- |
| Cliente envia mensagem desconhecida   | Ignora silenciosamente; conta no audit                   |
| Schema mismatch (versão antiga)       | Servidor responde `versao_incompativel`; cliente recarrega |
| Crash em handler                      | Captura, loga, evento `erro_interno` ao cliente afetado  |
| Estado divergente persistente         | Servidor envia snapshot completo (`resync`)              |

## Escala

- 1 instância Colyseus suporta tipicamente ~2.000 conexões.
- Para mais: presence layer via Redis (Colyseus já suporta `RedisPresence`), múltiplas instâncias.
- Audit log e persistência são serviços separados; não bloqueiam o tick loop.

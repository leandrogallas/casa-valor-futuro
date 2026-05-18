# ADR 0003 — Modelo multiplayer: servidor autoritativo (Colyseus)

## Status

Aceito — 2026-05-17

## Contexto

O Laboratório do Bastião é multiplayer por design: humanos e agentes coexistem no mesmo mapa. Precisamos decidir o modelo de rede e o framework.

Modelos considerados:

| Modelo                       | Custo de infra | Anti-cheat | Latência percebida | Complexidade |
| ---------------------------- | -------------- | ---------- | ------------------ | ------------ |
| P2P (WebRTC mesh)            | baixíssimo     | inviável   | boa em LAN, ruim WAN | alta de sync |
| Lockstep determinístico      | médio          | bom        | alta latência (alto RTT) | muito alta |
| **Cliente-servidor autoritativo** | médio    | excelente  | boa                | média        |
| Hospedagem proprietária (Hathora etc.) | baixo (custo $) | excelente | ótima | baixa, mas lock-in |

Frameworks considerados para autoritativo:

| Framework         | Stack          | Idiomático para nós? | Maturidade | Schema sync |
| ----------------- | -------------- | -------------------- | ---------- | ----------- |
| **Colyseus**      | Node + TS      | sim                  | alta       | nativo (`@colyseus/schema`) |
| Socket.IO custom  | Node           | só transporte; sync seria autoral | alta | manual |
| Nakama            | Go, com SDK    | requer outra stack   | alta       | nativo      |
| PlayFab/GameLift  | proprietário   | lock-in cloud        | alta       | n/a         |

## Decisão

Usar **modelo cliente-servidor autoritativo** sobre **Colyseus** (Node + TS).

- Estado canônico vive no servidor (`Room.state`).
- Cliente envia inputs (`move`, `interagir`, `chat`); servidor valida e propaga estado via delta binário.
- `OfficeRoom` representa **um andar inteiro** (não uma sala-por-room) — humanos circulam sem reentrar em Rooms.
- `MeetingRoom` é efêmera, criada quando uma reunião começa.

## Consequências

### Positivas

- **Anti-cheat trivial**: cliente não decide nada sobre estado.
- **Auditoria limpa**: todos os eventos do mundo carimbados pelo servidor.
- **Reconexão simples**: pedir snapshot é uma chamada padrão do Colyseus.
- **Stack alinhada**: Colyseus + Node + TS bate com o resto do projeto.
- **Interest management nativo** para conter banda em rooms cheias.

### Negativas

- Custo de hosting do game server (CPU + memória + WS). **Mitigação:** começar com VPS modesta; Colyseus suporta horizontal scaling com Redis Presence quando necessário.
- Latência maior que P2P para usuários geograficamente distantes do servidor. **Mitigação:** futuro deploy multi-região quando o produto justificar.
- Ponto único de falha. **Mitigação:** healthcheck + auto-restart; estado de domínio crítico vive em PostgreSQL.

### Reversibilidade

- Trocar Colyseus por outro framework de game server afetaria `server/src/rooms/` e o `colyseusClient.ts` no cliente. Os contratos (`OfficeStateShape`, mensagens) estão em `shared/`, facilitando troca.
- Sair do modelo autoritativo é inviável sem reescrever segurança e auditoria — assumimos como decisão de longo prazo.

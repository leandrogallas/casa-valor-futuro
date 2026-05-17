# 11 — Especificação da API

REST para CRUD/comando, WebSocket (Colyseus) para tempo real. Esta especificação é a "fonte" enquanto OpenAPI não é gerado automaticamente.

## Convenções

- Base URL: `https://api.<seu-dominio>`.
- Conteúdo: `application/json; charset=utf-8`.
- Datas: ISO-8601 com fuso `Z`.
- IDs: UUID v7 (string).
- Autenticação: `Authorization: Bearer <jwt>` em todas as rotas exceto `/auth/*`.
- Erros: payload `{ error: { code, message, details? } }` com HTTP status apropriado.
- Versionamento: prefixo `/v1`. Quebrar contrato → `/v2` em paralelo, deprecation header `Sunset`.

## Códigos de erro canônicos

| HTTP | code                     | Significado                                |
| ---- | ------------------------ | ------------------------------------------ |
| 400  | `validation_failed`      | Body/query inválido                        |
| 401  | `unauthenticated`        | Sem token ou token expirado                |
| 403  | `forbidden`              | Sem permissão                              |
| 404  | `not_found`              | Recurso não existe                         |
| 409  | `conflict`               | Estado incompatível (ex.: status inválido) |
| 429  | `rate_limited`           | Rate limit excedido                        |
| 500  | `internal_error`         | Falha do servidor                          |

## REST

### Auth

- `POST /v1/auth/login`
  - body: `{ email, senha }`
  - 200: `{ token, refreshToken, usuario }`
- `POST /v1/auth/refresh`
  - body: `{ refreshToken }`
  - 200: `{ token }`
- `POST /v1/auth/logout`
  - 204: sem corpo

### Usuários

- `GET /v1/usuarios/me` → `Usuario`
- `GET /v1/usuarios` (admin) → `Usuario[]`
- `POST /v1/usuarios` (admin) → `Usuario`
- `PATCH /v1/usuarios/{id}` (admin) → `Usuario`

### Agentes

- `GET /v1/agentes` → `Agente[]`
  - query: `donoId?`, `cargo?`, `estado?`
- `POST /v1/agentes`
  - body: `{ nome, cargo, modelo, promptDeSistema, ferramentas[], salaId, rotinaId? }`
  - 201: `Agente`
- `GET /v1/agentes/{id}` → `Agente`
- `PATCH /v1/agentes/{id}` → `Agente`
- `POST /v1/agentes/{id}/pausar` → 204
- `POST /v1/agentes/{id}/retomar` → 204
- `POST /v1/agentes/{id}/desativar` → 204

### Tarefas

- `GET /v1/tarefas` → `Tarefa[]`
  - query: `responsavelId?`, `status?`, `prioridade?`, `prazoAntes?`
- `POST /v1/tarefas`
  - body: `{ titulo, descricao, responsavelId, prioridade, prazo? }`
  - 201: `Tarefa`
- `GET /v1/tarefas/{id}` → `Tarefa`
- `PATCH /v1/tarefas/{id}` → `Tarefa`
  - body parcial; mudanças de status validadas pela máquina de estados.
- `POST /v1/tarefas/{id}/aprovar` → 204
- `POST /v1/tarefas/{id}/rejeitar`
  - body: `{ motivo }`
  - 204

### Rotinas

- `GET /v1/rotinas` → `Rotina[]`
- `POST /v1/rotinas` → `Rotina`
- `PATCH /v1/rotinas/{id}` → `Rotina`
- `DELETE /v1/rotinas/{id}` → 204

### Salas e Prédios

- `GET /v1/predios` → `Predio[]`
- `GET /v1/predios/{id}` → `Predio` (com andares e salas)
- `GET /v1/salas/{id}` → `Sala`

### Reuniões

- `GET /v1/reunioes` → `Reuniao[]`
- `POST /v1/reunioes`
  - body: `{ salaId, pauta, participantes[], inicio }`
  - 201: `Reuniao`
- `POST /v1/reunioes/{id}/encerrar` → 204
- `GET /v1/reunioes/{id}/ata` → `Artefato`

### Artefatos

- `POST /v1/artefatos`
  - multipart: arquivo + `tipo`
  - 201: `Artefato` (com `uri` para download)
- `GET /v1/artefatos/{id}` → `Artefato`

### Audit

- `GET /v1/audit` (admin/auditor)
  - query: `autorId?`, `acao?`, `from`, `to`, `limit`, `cursor?`
  - 200: `{ eventos, cursor? }`

## WebSocket (Colyseus)

Conexão: `wss://api.<dominio>` (handshake gerencia rooms).

### Salas

- `lobby_room` — auto-join ao conectar
- `office_room` — `joinOrCreate('office_room', { andarId, token })`
- `meeting_room` — `join('meeting_room', { meetingId, token })`

### Mensagens cliente → servidor (em `office_room`)

| Tipo          | Payload                                              |
| ------------- | ---------------------------------------------------- |
| `move`        | `{ direcao: 'N'\|'S'\|'L'\|'O', t: number }`         |
| `interagir`   | `{ alvoTipo: 'porta'\|'mesa'\|'quadro', alvoId }`    |
| `chat`        | `{ conteudo, escopo: 'sala'\|'dm', dmAlvo? }`        |
| `entrar_sala` | `{ salaId }`                                         |

### Mensagens servidor → cliente

| Tipo                 | Payload                                                   |
| -------------------- | --------------------------------------------------------- |
| `state`              | (patches binários do `OfficeState`)                       |
| `jogador_entrou`     | `JogadorState`                                            |
| `jogador_saiu`       | `{ id }`                                                  |
| `chat_recebido`      | `{ autorId, conteudo, salaId?, dmAlvo?, t }`              |
| `tarefa_atualizada`  | `{ tarefaId, status, atualizadoPor, t }`                  |
| `meeting_aberta`     | `{ meetingId, salaId, pauta, participantes }`             |
| `agente_evento`      | `{ agenteId, tipo, resumo }`                              |
| `erro`               | `{ code, message }`                                       |
| `versao_incompativel`| `{ esperado, recebido }`                                  |

### Mensagens em `meeting_room`

| Tipo (cli → srv) | Payload                  |
| ---------------- | ------------------------ |
| `chat`           | `{ conteudo }`           |
| `levantar_mao`   | `{}`                     |
| `votar`          | `{ pautaId, valor }`     |

| Tipo (srv → cli)    | Payload                                |
| ------------------- | -------------------------------------- |
| `participante_in`   | `{ id, papel }`                        |
| `participante_out`  | `{ id }`                               |
| `mensagem`          | `{ autorId, conteudo, t }`             |
| `ata_atualizada`    | `{ snapshot: string }`                 |

## Versionamento

- Cada mensagem WS pode evoluir aditivamente; campos novos opcionais não quebram clientes antigos.
- Mudanças breaking exigem incremento do número de versão no handshake (`?v=2`).

## Limites e quotas (resumo)

| Recurso                  | Limite                                |
| ------------------------ | ------------------------------------- |
| Tamanho de chat          | 1 KB                                  |
| Tamanho de descrição tarefa | 16 KB                              |
| Anexos artefato          | 25 MB                                 |
| Agentes por dono         | 50 (configurável)                     |
| Tarefas abertas por agente | 200                                 |

(Limites se relacionam diretamente aos rate limits em `09-seguranca-sandbox.md`.)

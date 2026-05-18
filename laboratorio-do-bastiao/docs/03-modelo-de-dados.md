# 03 — Modelo de Dados

Entidades de domínio. Source of truth em código: `shared/src/types.ts`. Sempre que esta página mudar, o tipo correspondente deve mudar — e vice-versa.

## Diagrama ER (ASCII)

```
   +-----------+        +-------------+        +----------+
   |  Usuario  |--------|  Permissao  |        |  Predio  |
   +-----------+ 1    * +-------------+        +----+-----+
        | 1                                        | 1
        | possui                                   | tem
        | *                                        v *
   +----+------+        +-----------+         +----+-----+
   |  Agente   |------->|  Rotina   |         |  Andar   |
   +----+------+ 1    1 +-----------+         +----+-----+
        | 1                                        | 1
        | executa                                  | tem
        | *                                        v *
   +----+------+        +-----------+         +----+-----+
   |  Tarefa   |        | Conversa  |         |  Sala    |
   +----+------+        +-----+-----+         +----+-----+
        | gera                | tem                | hospeda
        v *                   v *                  v *
   +----+------+        +-----+-----+         +----+-----+
   | Artefato  |        | Mensagem  |         | Reuniao  |
   +-----------+        +-----------+         +----------+
```

## Entidades

### Usuario

Pessoa real autenticada no sistema.

| Campo       | Tipo        | Obrig. | Notas                                            |
| ----------- | ----------- | ------ | ------------------------------------------------ |
| `id`        | UUID         | sim    | PK                                               |
| `nome`      | string       | sim    |                                                  |
| `email`     | string       | sim    | único; usado para login                          |
| `avatarUrl` | string       | não    | URL CDN; default = sprite genérico               |
| `papel`     | enum         | sim    | `admin` \| `gestor` \| `colaborador` \| `visitante` |
| `criadoEm`  | ISO datetime | sim    |                                                  |

**Invariantes:** existe ao menos 1 `admin` por instalação.

### Agente

Funcionário virtual baseado em LLM.

| Campo            | Tipo         | Obrig. | Notas                                                  |
| ---------------- | ------------ | ------ | ------------------------------------------------------ |
| `id`             | UUID          | sim    | PK                                                     |
| `nome`           | string        | sim    | nome amigável ("Bia, Analista Financeira")             |
| `cargo`          | string        | sim    | ex.: "Analista Financeira"                             |
| `donoId`         | UUID          | sim    | FK Usuario; humano responsável                         |
| `protocolo`      | enum          | sim    | `mcp` \| `a2a` \| `mcp+a2a`                            |
| `modelo`         | string        | sim    | ex.: `claude-opus-4-7`, `gpt-4.1`, `local:llama-3-70b` |
| `promptDeSistema`| text          | sim    | persona/diretrizes                                     |
| `ferramentas`    | string[]      | sim    | nomes lógicos de tools MCP autorizadas                 |
| `rotinaId`       | UUID          | não    | FK Rotina                                              |
| `estado`         | enum          | sim    | `provisionando` \| `ocioso` \| `executando` \| `reportando` \| `desativado` |
| `criadoEm`       | ISO datetime  | sim    |                                                        |

**Invariantes:**

- `donoId` deve ser papel `admin` ou `gestor`.
- Lista de `ferramentas` é subconjunto de tools disponíveis para o papel do dono.

### Predio / Andar / Sala

Espaço físico do escritório virtual.

**Predio**

| Campo    | Tipo   | Obrig. | Notas                |
| -------- | ------ | ------ | -------------------- |
| `id`     | UUID    | sim    | PK                   |
| `nome`   | string  | sim    | ex.: "Sede Central"  |
| `andares`| Andar[] | sim    | mínimo 1             |

**Andar**

| Campo     | Tipo   | Obrig. | Notas                  |
| --------- | ------ | ------ | ---------------------- |
| `id`      | UUID    | sim   | PK                     |
| `numero`  | int     | sim   | 0 = térreo             |
| `predioId`| UUID    | sim   | FK Predio              |
| `salas`   | Sala[]  | sim   | mínimo 1               |

**Sala**

| Campo      | Tipo   | Obrig. | Notas                                                                 |
| ---------- | ------ | ------ | --------------------------------------------------------------------- |
| `id`       | UUID    | sim   | PK                                                                    |
| `nome`     | string  | sim   | ex.: "Sala de Reuniões 1"                                             |
| `tipo`     | enum    | sim   | `reuniao` \| `marketing` \| `diretoria` \| `financeiro` \| `contabil` \| `copa` \| `recepcao` \| `open_space` |
| `andarId`  | UUID    | sim   | FK Andar                                                              |
| `capacidade`| int    | sim   | limite de avatares simultâneos                                        |
| `tilemap`  | string  | sim   | caminho relativo do JSON Tiled                                        |

**Invariantes:** uma sala `recepcao` por prédio é exigida (ponto de spawn).

### Tarefa

Unidade de trabalho atribuída a um agente (ou humano).

| Campo          | Tipo         | Obrig. | Notas                                                          |
| -------------- | ------------ | ------ | -------------------------------------------------------------- |
| `id`           | UUID          | sim    | PK                                                             |
| `titulo`       | string        | sim    |                                                                |
| `descricao`    | text          | sim    | Markdown permitido                                             |
| `responsavelId`| UUID          | sim    | Usuario.id ou Agente.id                                        |
| `autorId`      | UUID          | sim    | Usuario.id                                                     |
| `status`       | enum          | sim    | `aberta` \| `em_andamento` \| `em_revisao` \| `concluida` \| `cancelada` |
| `prioridade`   | enum          | sim    | `baixa` \| `media` \| `alta` \| `urgente`                      |
| `prazo`        | ISO datetime  | não    |                                                                |
| `artefatos`    | UUID[]        | sim    | FKs Artefato                                                   |
| `criadaEm`     | ISO datetime  | sim    |                                                                |

**Invariantes:** transição de status segue máquina linear `aberta → em_andamento → em_revisao → concluida` (ou `cancelada` a qualquer momento).

### Rotina

Agendamento periódico de tarefas para um agente.

| Campo      | Tipo                 | Obrig. | Notas                                  |
| ---------- | -------------------- | ------ | -------------------------------------- |
| `id`       | UUID                  | sim   | PK                                     |
| `agenteId` | UUID                  | sim   | FK Agente                              |
| `cron`     | string                | sim   | expressão cron padrão                  |
| `payload`  | object (JSON)         | sim   | template da tarefa a ser criada        |
| `ativa`    | boolean               | sim   |                                        |

### Conversa / Mensagem

**Conversa**

| Campo         | Tipo     | Obrig. | Notas                            |
| ------------- | -------- | ------ | -------------------------------- |
| `id`          | UUID      | sim   | PK                               |
| `salaId`      | UUID      | não   | quando associada a uma sala      |
| `participantes`| UUID[]   | sim   | Usuario.id ∪ Agente.id           |
| `mensagens`   | Mensagem[]| sim   |                                  |

**Mensagem**

| Campo      | Tipo         | Obrig. | Notas                            |
| ---------- | ------------ | ------ | -------------------------------- |
| `id`       | UUID          | sim   | PK                               |
| `autorId`  | UUID          | sim   | Usuario.id ou Agente.id          |
| `conteudo` | text          | sim   | Markdown limitado                |
| `enviadaEm`| ISO datetime  | sim   |                                  |

### Reuniao

Sessão temporal numa sala física, com ata.

| Campo          | Tipo          | Obrig. | Notas                                  |
| -------------- | ------------- | ------ | -------------------------------------- |
| `id`           | UUID           | sim   | PK                                     |
| `salaId`       | UUID           | sim   | FK Sala                                |
| `pauta`        | text           | sim   |                                        |
| `participantes`| UUID[]         | sim   |                                        |
| `inicio`       | ISO datetime   | sim   |                                        |
| `fim`          | ISO datetime   | não   |                                        |
| `ata`          | UUID           | não   | FK Artefato                            |

### Artefato

Saída/insumo gerado por uma tarefa ou reunião.

| Campo     | Tipo         | Obrig. | Notas                                              |
| --------- | ------------ | ------ | -------------------------------------------------- |
| `id`      | UUID          | sim   | PK                                                 |
| `tipo`    | enum          | sim   | `documento` \| `imagem` \| `planilha` \| `log` \| `outro` |
| `uri`     | string        | sim   | object storage (S3 compatível)                      |
| `autorId` | UUID          | sim   | Usuario.id ou Agente.id                            |
| `criadoEm`| ISO datetime  | sim   |                                                    |

### Permissao

Concessão de capacidade a um titular (usuario ou agente).

| Campo     | Tipo         | Obrig. | Notas                                            |
| --------- | ------------ | ------ | ------------------------------------------------ |
| `id`      | UUID          | sim   | PK                                               |
| `titularId`| UUID         | sim   | Usuario.id ou Agente.id                          |
| `escopo`  | string        | sim   | ex.: `sala:finance:*`, `tool:db.read.contabil`   |
| `acoes`   | array         | sim   | subset de `ler` \| `escrever` \| `executar`      |
| `expiraEm`| ISO datetime  | não   | suporte a permissão temporária                   |

## Convenções

- IDs são UUID v7 (ordenáveis).
- Datas são ISO-8601 com fuso `Z`.
- Tudo que vira histórico (mensagens, tarefas, audit log) é **append-only** — nunca apague, apenas marque `cancelada/desativada`.
- Soft-delete (`desativado`) em entidades com aproveitamento futuro (Agente, Rotina, Permissao); hard-delete vetado para `Audit Log`, `Mensagem`, `Artefato`.

## Migrações

- Ferramenta: **Drizzle** (decisão tentativa, formalizar em ADR).
- Versões numeradas (`migrations/0001_init.sql` etc.) no `server/` ou em pacote separado `db/`.
- Política: migrações sempre forward-only em produção; rollback via nova migração inversa.

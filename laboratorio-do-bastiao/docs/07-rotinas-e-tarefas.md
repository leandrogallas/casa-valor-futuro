# 07 — Rotinas e Tarefas

Como o trabalho é descrito, distribuído, executado e auditado.

## Conceitos

- **Tarefa**: unidade discreta de trabalho, com responsável (humano ou agente), prazo, status.
- **Rotina**: regra de criação automática de tarefas com cadência cron (ex.: toda segunda às 8h, criar tarefa de relatório semanal).
- **Hand-off**: passagem de responsabilidade entre agentes (via A2A) ou entre agente e humano (via menção em chat).

## Ciclo de vida de uma tarefa

```
                +----------------+
                |    Aberta      |   <-- criada por humano ou rotina
                +-------+--------+
                        | agente/humano aceita ou rotina dispara
                        v
                +----------------+
                | Em andamento   |
                +-------+--------+
                        | conclusão de execução
                        v
                +----------------+
                | Em revisão     |  <-- humano valida output
                +---+--------+---+
                    |        |
        aprovada    |        | rejeitada -> volta a "em_andamento"
                    v        
                +---+--------+
                | Concluída  |
                +------------+
```

A qualquer momento: → `Cancelada`. Transições inválidas falham com erro semântico.

## Modelo da tarefa (resumo de `03-modelo-de-dados.md`)

```ts
interface Tarefa {
  id: UUID;
  titulo: string;
  descricao: string;       // Markdown
  responsavelId: UUID;     // Usuario.id | Agente.id
  autorId: UUID;
  status: 'aberta' | 'em_andamento' | 'em_revisao' | 'concluida' | 'cancelada';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  prazo?: ISODateString;
  artefatos: UUID[];
  criadaEm: ISODateString;
}
```

## Fila de execução

- **BullMQ** sobre Redis.
- Cada agente tem uma **fila exclusiva** (`queue:agent:<agenteId>`); priorização por `prioridade`.
- Concurrency padrão: **1** por agente (evita conflito de tools); pode subir por agente que não tem efeitos colaterais.

### Lifecycle no consumidor

```
1. Worker dequeue.
2. Atualiza Tarefa.status = 'em_andamento'.
3. Movimenta avatar até a sala apropriada (pathfind no Colyseus client).
4. Monta contexto (descrição + conversas recentes + estado prévio).
5. LLM resolve passos; chama tools via MCP / mensagens via A2A.
6. Ao concluir, cria artefato(s), atualiza tarefa para 'em_revisao' ou 'concluida' (conforme política).
7. Posta resumo no chat da sala.
```

## Rotinas

Rotinas geram tarefas automaticamente.

```ts
interface Rotina {
  id: UUID;
  agenteId: UUID;
  cron: string;        // ex.: "0 8 * * 1" (toda segunda 8h)
  payload: object;     // template da Tarefa, com placeholders {{data}}, {{semana}}
  ativa: boolean;
}
```

### Agendamento

- Um scheduler único (singleton lock no Redis) verifica rotinas a cada minuto.
- Para cada rotina ativa cujo cron casa, cria tarefa, enfileira, registra audit.
- Idempotência: hash `(rotinaId, slotDeTempo)` previne duplicação se múltiplos schedulers rodarem.

## Feedback humano

Toda tarefa em `em_revisao` aparece no **Task Board** dos humanos relevantes:

- Dono do agente sempre vê.
- Autor da tarefa sempre vê.
- Gestores da área (definido por sala do agente) veem como copia.

### Ações disponíveis

| Ação                | Efeito                                                     |
| ------------------- | ---------------------------------------------------------- |
| Aprovar             | `em_revisao → concluida`                                   |
| Solicitar mudanças  | `em_revisao → em_andamento`, com nota anexada              |
| Reatribuir          | troca `responsavelId`                                       |
| Cancelar            | `*` → `cancelada`, requer justificativa                    |

Feedback do humano vai pro contexto do agente na próxima chamada do LLM (memória curta), e fica em audit log.

## Hand-off

### Agente → Agente (A2A)

Agente A precisa de input do Agente B:

```
A2A.enviar({ de: A.id, para: B.id, tipo: 'pedido_input', payload: { contexto, pergunta } })
```

B processa, responde com `tipo: 'resposta'`. A retoma a tarefa original.

### Agente → Humano

Agente menciona humano no chat da sala (`@nome`). UI sinaliza notificação. Humano pode responder direto; opcionalmente isso vira nova tarefa.

### Humano → Agente

Humano cria Tarefa via UI; agente recebe via fila.

## SLA e prioridade

- **Urgente** (`urgente`): consumo imediato, fila pula head-of-queue.
- **Alta**: dentro de 1 hora útil.
- **Média**: dentro do dia.
- **Baixa**: best-effort.
- Tarefas vencidas (passou do `prazo`) recebem badge "atrasada" e sobem visibilidade no Task Board.

## Histórico e auditoria

- Toda mudança de status registra evento em `audit_log` (action: `tarefa.status_changed`, before/after).
- Artefatos têm versão imutável; quando uma "revisão" gera novo artefato, o antigo permanece.

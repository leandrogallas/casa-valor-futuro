# 09 — Segurança e Sandbox

Modelo de ameaças, permissões, sandbox de execução e auditoria.

## Modelo de permissão (RBAC + escopo)

Cada **Permissao** concede um par `(escopo, ações)` ao **titular** (humano ou agente).

```
Escopo é hierárquico, separado por ":":
  sala:financeiro:*           # tudo dentro de financeiro
  tool:db.read.contabil       # uma tool específica
  agente:bia:configurar       # configurar a agente Bia
  audit:read                  # ler audit log
```

Ações: `ler`, `escrever`, `executar`.

### Papéis padrão

| Papel        | Permissões padrão                                              |
| ------------ | -------------------------------------------------------------- |
| `admin`      | `*` (tudo)                                                     |
| `gestor`     | `sala:*:*` (ler/escrever), `agente:*:*` exceto criar admin     |
| `colaborador`| `sala:<próprias>:*` (ler), `tarefa:<próprias>:escrever`        |
| `visitante`  | `sala:<convidada>:ler`                                         |
| agente IA    | conjunto explícito por configuração (default: vazio)           |

## Tools com escopo

Cada chamada de tool MCP passa por **gatekeeper** no MCP server interno do agente:

```
gatekeeper(toolCall):
  if toolCall.nome not in Agente.ferramentas:        -> rejeitar (configuração)
  if not permissao_existe(agente, "tool:" + nome, "executar"):  -> rejeitar (permissão)
  if rate_limiter_excedeu(agente, nome):              -> rejeitar (rate)
  audit_log.append({ agente, tool, args_hash, t });
  return executar(toolCall)
```

Rejeições retornam erro **semântico** ao LLM (não silenciam), para que o modelo decida o próximo passo.

## Audit log

- Tabela append-only em PostgreSQL (`audit_events`).
- Cada evento: `id, t, autorId, autorTipo, acao, alvo, hashPayload, traceId, salaId?`.
- Eventos cobertos (lista mínima):
  - Login/logout.
  - Criação/atualização/desativação de agente.
  - Tool call de agente (sempre, com hash dos argumentos, não payload completo).
  - Mensagem A2A (sempre, com hash).
  - Mensagem de chat (com hash).
  - Mudança de status de tarefa.
  - Acessos a `audit:read`.
- Retenção mínima: 1 ano.
- Acesso restrito a `admin` (e `audit:read` para auditores específicos).

## Sandbox do worker

Cada agente roda em container isolado:

| Aspecto       | Política padrão                                             |
| ------------- | ----------------------------------------------------------- |
| CPU           | `0.5` core hard limit, `1.0` burstable                      |
| Memória       | `512 MiB` hard limit                                        |
| Filesystem    | Imagem read-only; `/tmp` tmpfs limpo por execução           |
| Rede saída    | Allow-list por agente (default: só servidor + endpoints MCP) |
| Capabilities  | Drop ALL exceto `NET_BIND_SERVICE` (não precisa nem disso)   |
| User          | non-root (`uid:gid` ≥ 1000)                                 |
| Seccomp       | Profile default Docker; bloqueio explícito de `mount`, `ptrace` |

Timeouts:

- Tool call individual: 30 s (default; configurável por tool até 5 min).
- LLM call: 60 s (configurável até 3 min para modelos lentos).
- Loop completo de uma tarefa: 30 min default; após isso, marca falha.

## Segredos

- Vault: HashiCorp Vault ou alternativa cloud (AWS Secrets Manager etc.).
- Worker recebe segredos via **mount** de tmpfs montado pelo runtime, escopado ao agente — nunca por variável de ambiente persistente.
- Segredos nunca aparecem em audit log; apenas o **nome do segredo** referenciado.

## Rate limits

| Sujeito           | Limite                                                |
| ----------------- | ----------------------------------------------------- |
| Tool call por agente | 30/min default; configurável por tool             |
| Mensagem A2A      | 60/min por par `(de, para)`                           |
| Chat humano       | 5 msgs / 2 s                                          |
| Tarefas criadas por humano | 100/dia                                       |
| Logins falhos     | 5/15min por IP/email; depois CAPTCHA                  |

## Ameaças (resumo STRIDE)

| Ameaça                       | Mitigação                                                |
| ---------------------------- | -------------------------------------------------------- |
| **S** spoofing (humano)      | Auth JWT com expiração curta + refresh                   |
| **S** spoofing (agente)      | Cada worker recebe credencial mTLS curta                 |
| **T** tampering              | Estado autoritativo no servidor; cliente não é confiado  |
| **R** repudiation            | Audit log com hash imutável; correlação por `traceId`    |
| **I** info disclosure        | Escopo de permissão + sala; segredos nunca em log        |
| **D** DoS                    | Rate limits + circuit breakers; auto-scaling do Colyseus |
| **E** elevation              | RBAC estrito; mudança de papel exige `admin`              |

## Resposta a incidentes

- **Agente comprometido** (output suspeito, tool fora de escopo): scheduler congela worker, marca `desativado`, alerta dono e admin.
- **Vazamento de segredo**: rotação automática via Vault + audit retrospectivo dos últimos 7 dias.
- **Ataque ao servidor**: shutdown gracioso de OfficeRooms (state persistido); reabertura sob proteção.

## Conformidade

- LGPD: dados pessoais minimizados (email + nome). Direito de exclusão honrado por soft-delete de Usuario + anonimização de mensagens (substituir autor por `usuario_removido`).
- Trilha de auditoria preservada para fins regulatórios; PII em audit log é hash + masked.

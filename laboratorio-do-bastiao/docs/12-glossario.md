# 12 — Glossário

Vocabulário canônico em PT-BR. Quando houver dúvida sobre como chamar uma coisa em código ou documentação, consulte esta página.

| Termo                       | Definição                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------- |
| **A2A**                     | *Agent-to-Agent.* Protocolo aberto para comunicação direta entre agentes de IA. Aqui é o transporte de mensagens estruturadas entre agentes na mesma instalação. |
| **Agente**                  | Funcionário virtual movido por LLM, com cargo, sala, dono humano, ferramentas autorizadas e prompt de sistema. |
| **Andar**                   | Subdivisão vertical de um Prédio; comporta múltiplas Salas. Cada andar é um `OfficeRoom`.            |
| **Artefato**                | Saída/insumo persistente: documento, planilha, imagem, log. Versão imutável.                       |
| **Audit log**               | Tabela append-only com registro de toda ação relevante. Evidência para auditoria.                  |
| **Avatar**                  | Representação visual de um Usuário ou Agente no mapa (sprite 32x48).                               |
| **BullMQ**                  | Fila baseada em Redis usada para tarefas agendadas e execução assíncrona de Agentes.               |
| **Cargo**                   | Papel narrativo do Agente (ex.: "Analista Financeira"). Diferente de `papel` do Usuário.            |
| **Colyseus**                | Framework de multiplayer authoritative escolhido. Estado vive em `Room`s.                          |
| **Conversa**                | Conjunto ordenado de Mensagens entre participantes (humanos e/ou agentes), opcionalmente em uma sala.|
| **Dono**                    | Usuário humano responsável por um Agente. Tem permissões privilegiadas sobre ele.                  |
| **Escritório virtual**      | O conjunto Prédio + Andares + Salas onde a operação acontece.                                       |
| **Ferramenta** (tool)       | Função discreta exposta ao Agente via MCP (ex.: `db.read.contabil`).                               |
| **Gestor**                  | Papel humano com permissão para criar agentes e atribuir tarefas. Subordinado ao admin.            |
| **HUD**                     | *Heads-Up Display.* Interface sobreposta ao canvas (chat, painéis, dock).                          |
| **Interest management**     | Política de filtrar updates de estado para enviar só o relevante ao cliente (raio de visão).        |
| **MCP**                     | *Model Context Protocol.* Padrão aberto da Anthropic para conectar LLMs a ferramentas e contextos. |
| **MeetingRoom**             | Sala Colyseus efêmera criada quando uma `Reuniao` começa.                                          |
| **Mensagem**                | Unidade de chat ou A2A com autor, conteúdo e timestamp.                                            |
| **Mensagem A2A**            | Mensagem agente-a-agente (não chat). Estruturada, com `tipo` e `payload`.                          |
| **OfficeRoom**              | Sala Colyseus correspondente a **um andar inteiro** do escritório.                                 |
| **Permissão**               | Concessão `(titular, escopo, ações)`. Base do RBAC + escopo.                                       |
| **Predio**                  | Container raiz do espaço; contém Andares.                                                          |
| **RBAC**                    | *Role-Based Access Control.* Modelo de permissão por papéis, complementado por escopos.            |
| **Recepção**                | Sala obrigatória do tipo `recepcao`, ponto de spawn dos avatares.                                  |
| **Reunião**                 | Sessão temporal em uma sala física, com pauta, participantes e ata. Suporta humanos + agentes.     |
| **Room**                    | Estrutura do Colyseus que encapsula estado + lógica + ciclo de vida de uma sala virtual.           |
| **Rotina**                  | Regra cron que cria tarefas automaticamente para um agente.                                        |
| **Sala**                    | Subdivisão funcional de um Andar (`reuniao`, `marketing`, `financeiro`, etc.). Não é Room Colyseus por si só. |
| **Sandbox**                 | Conjunto de restrições (CPU, rede, FS, capabilities) onde um worker de agente roda.                |
| **SLA**                     | *Service-Level Agreement.* Acordo de níveis de serviço (latência, uptime).                         |
| **Spawn point**             | Coordenada nomeada na sala onde um avatar surge.                                                   |
| **Tarefa**                  | Unidade de trabalho com responsável, prazo, status. Pode ser atribuída a humano ou agente.         |
| **Tarefa atrasada**         | Tarefa cujo `prazo` passou e status não é terminal.                                                |
| **Task Board**              | Painel kanban com tarefas agrupadas por status.                                                    |
| **Tauri**                   | Framework Rust + WebView para empacotar o cliente como desktop app.                                |
| **Tick**                    | Atualização periódica do servidor (20 Hz para movimento neste projeto).                            |
| **Tile**                    | Bloco 32x32 px do mapa. Mapas são grids de tiles.                                                  |
| **Tiled**                   | Editor de mapas usado para criar `.tmx` (exportados como JSON).                                    |
| **Topbar**                  | Barra superior da UI (logo, contexto, configurações).                                              |
| **Worker**                  | Processo headless que hospeda um agente (MCP server + A2A transport + Colyseus client).            |
| **Workspaces**              | Convenção pnpm que permite múltiplos pacotes no mesmo repositório (`client`, `server`, ...).       |

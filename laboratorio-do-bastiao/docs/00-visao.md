# 00 — Visão

## Problema

Equipes que adotam agentes de IA hoje trabalham num modelo invisível: cada agente é uma chamada de API isolada, com prompt próprio, ferramentas próprias e nenhum contexto compartilhado. Não existe um **palco comum** onde humanos e agentes coexistam, conversem, troquem informação e tenham o trabalho deles observado em tempo real. O resultado é falta de governança, redundância entre agentes, dificuldade para auditar decisões e zero senso de "operação" — como se cada agente fosse um freelancer remoto sem escritório.

## Visão

O **Laboratório do Bastião** é um escritório virtual 2D — web e instalável — onde humanos e agentes de IA convivem no mesmo espaço. Os agentes são funcionários virtuais: cada um tem cargo, sala de origem, rotina, ferramentas autorizadas e responsável humano. Eles caminham pelo mapa, entram em salas de reunião, executam tarefas, conversam entre si por A2A, reportam progresso. O dono da empresa virtual vê tudo acontecendo em tempo real, como se estivesse circulando por uma sede.

> **Em uma frase:** Gather.town para agentes de IA, com governança, observabilidade e protocolos abertos.

## Personas

| Persona            | Quem é                                              | O que quer                                                          |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------------------- |
| **Dono**           | Empresário que quer ver sua "empresa de agentes"    | Visualizar a operação inteira, criar e demitir agentes, ver KPIs    |
| **Gestor**         | Líder de área (marketing, financeiro, etc.)         | Atribuir tarefas, revisar feedback, configurar rotinas              |
| **Colaborador**    | Humano operacional que trabalha com agentes         | Trocar mensagens com agentes, juntar-se a reuniões, anexar artefatos|
| **Agente IA**      | Persona não-humana, cliente headless                | Receber tarefas, executar tools, conversar A2A, reportar resultados |
| **Visitante**      | Pessoa convidada (cliente, parceiro)                | Entrar em uma sala específica, observar, conversar pontualmente     |

## Princípios de design

1. **Protocolos abertos.** MCP (ferramentas/contexto) e A2A (entre agentes). Nada de lock-in a um fornecedor de modelo.
2. **Servidor autoritativo.** Estado da operação vive no servidor; cliente é renderizador. Trapaça e dessincronização são tratadas como bug do cliente.
3. **Observabilidade nativa.** Toda ação de agente (mensagem, tool call, decisão) é registrada em audit log append-only.
4. **Sandbox por padrão.** Agente só executa o que foi explicitamente autorizado, escopo por sala e por permissão.
5. **Visual identitário.** Pixel art 2D próprio, não Gather.town. O ambiente é parte da experiência.
6. **PT-BR primeira classe.** Documentação, glossário e interface em português. Identificadores de código em inglês.
7. **Mínimo viável evolui.** Comece com 1 sala + 1 agente + 1 humano. Escala vem nas fases seguintes do roadmap.

## Casos de uso prioritários

- **CU-01 Provisionar agente.** Dono cria um agente "Analista Financeiro", define modelo, prompt, tools, sala de origem. Agente aparece no mapa em seguida.
- **CU-02 Atribuir tarefa.** Gestor abre o quadro, cria uma tarefa "Fechar conciliação de abril", atribui ao analista. Agente recebe via fila, sai da sala dele, vai para a sala da Contabilidade.
- **CU-03 Reunião híbrida.** Humanos e agentes entram na sala de reunião. Chat geral é capturado como ata. Decisões viram tarefas.
- **CU-04 Hand-off A2A.** Analista Financeiro precisa de input do Marketing. Envia mensagem A2A para o Estrategista de Marketing. Conversa fica visível no mapa (ícones flutuantes).
- **CU-05 Observação ao vivo.** Dono entra no escritório a qualquer momento, vê quem está conversando com quem, quais tarefas estão em andamento, último audit log.

## Métricas de sucesso

- **Engajamento** Tempo médio do dono dentro do ambiente por sessão (> 15 min é bom sinal).
- **Cobertura** Percentual de tarefas executadas por agentes vs delegadas para fora.
- **Auditoria** 100% das tool calls e mensagens persistidas em audit log dentro de 1 s.
- **Latência** P95 de movimento de avatar < 80 ms; P95 de mensagem chat < 250 ms.
- **Estabilidade** < 1 desconexão/usuário/hora.

## Não-objetivos (escopo fora desta versão)

- Marketplace público de agentes (planejado para 1.0+, ver `10-roadmap.md`).
- Mobile app nativo (responsivo web sim, app nativo não).
- Vídeo/áudio em tempo real (chat texto e voz sintética por agente são suficientes na fase atual).
- Modo single-player offline (o produto é fundamentalmente multiplayer/observatório).

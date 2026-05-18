# 08 — UI / UX

Diretrizes de interface e wireframes ASCII das telas principais.

## Princípios

1. **O mapa é a tela.** Tudo que dá pra mostrar no mundo (movimento, conversa, status), mostre. Painéis são complemento, não dependência.
2. **Pixel art é estética, não barreira de UX.** Texto é nítido (sem fonte pixelada de difícil leitura), botões têm áreas grandes.
3. **Latência percebida importa mais que real.** Toda ação humana tem feedback visual imediato (mesmo que confirme depois com servidor).
4. **Acessibilidade não é opcional.** Contraste WCAG AA, suporte a teclado completo, leitor de tela para painéis.
5. **PT-BR primeiro.** Textos no idioma original; nomes técnicos (tool, room) permanecem em inglês quando aparecem em UI técnica.

## Layout principal

```
+---------------------------------------------------------------------------+
| [Topbar]  Logo  •  Andar atual  •  Online: 12 humanos / 7 agentes  •  ⚙   |
+--------+---------------------------------------------------+--------------+
|        |                                                   |              |
|  Mini  |                                                   |   Painel     |
|  mapa  |          C A N V A S   D O   M A P A              |   contextual |
|        |          (Phaser, fullscreen-ish)                  |   (chat,     |
|        |                                                   |   inspector, |
|        |                                                   |   task)      |
+--------+---------------------------------------------------+--------------+
| [Dock] [💬 Chat] [📋 Tarefas] [🤖 Agentes] [👁 Audit] [👤 Perfil]            |
+---------------------------------------------------------------------------+
```

### Topbar

- Logo + nome do prédio.
- Indicador "Andar X – Nome".
- Contagem de online.
- Configurações (atalho `,`).

### Minimapa (esquerda)

- Visão zoom-out do andar.
- Pontos coloridos: humanos (azul), agentes (laranja), você (verde).
- Clique em sala teleporta o avatar (se permitido).

### Canvas (centro)

- Phaser renderiza tudo.
- Indicadores flutuantes acima dos avatares: nome, cargo (em fonte pequena), ícone de status (`💭` pensando, `⚙` executando tool, `💬` falando).

### Painel contextual (direita)

- Conteúdo varia conforme contexto (ver tabs abaixo).
- Pode ser colapsado (`]`).

### Dock (rodapé)

- Atalhos visuais para Chat / Tarefas / Agentes / Auditoria / Perfil.
- Notificações como badges numéricos nos ícones.

## Painéis

### Chat

```
+----------------------------------+
|  Chat — Sala: Reuniões 1         |
+----------------------------------+
| [10:31] Ana                       |
|   Pessoal, podemos revisar o      |
|   forecast antes de fechar?       |
|                                   |
| [10:32] 🤖 Bia (Analista Financ.) |
|   Preparei o cenário base e dois  |
|   alternativos. Quer ver agora?   |
|   [📎 forecast_v3.md]              |
|                                   |
| [10:33] @Bia, mostra o pessimista |
|         primeiro.                 |
+----------------------------------+
| > escreva sua mensagem...   [↵]   |
+----------------------------------+
```

- Suporte a menção (`@nome`), markdown leve, anexos como link para Artefato.
- Mensagens de agente vêm com prefixo `🤖`.

### Agent Inspector

```
+----------------------------------+
| 🤖 Bia, Analista Financeira      |
+----------------------------------+
| Modelo: claude-opus-4-7           |
| Estado: executando ⚙              |
| Sala atual: Financeiro            |
| Dono: Ana (gestora)               |
|                                   |
| Tools habilitadas:                |
|  • db.read.contabil               |
|  • artefato.criar                 |
|  • mensagem.enviar                |
|                                   |
| Última atividade:                 |
|  10:32 — tool db.read.contabil    |
|  10:31 — A2A → Mauro (Marketing)  |
|                                   |
| [Pausar]  [Reconfigurar]  [Demitir]|
+----------------------------------+
```

### Task Board

```
+--------------------------------------------------------------+
|  Quadro de Tarefas                                            |
+------------+------------+-----------+------------+------------+
|  Aberta    | Em andam.  | Em revisão| Concluída  | Cancelada  |
+------------+------------+-----------+------------+------------+
| Forecast Q2| Conciliação| Plano de  | Relatório  | Estudo de  |
| (Bia)      |  abril (Bia)| campanha | semanal    | preço (Bia)|
| 🔴 urgente |  🟡 alta    | (Mauro)   | (Bia) ✓    |  cancelada |
|            |            |  🟢 media |            |            |
| + nova     |            |           |            |            |
+------------+------------+-----------+------------+------------+
```

- Drag-and-drop entre colunas (com validação no servidor).
- Filtros: por agente, por prioridade, por sala.

## Onboarding (primeira vez)

```
[Tela 1] Bem-vindo ao Laboratório do Bastião
         Aqui sua empresa de agentes ganha um escritório.
         [Próximo]

[Tela 2] Crie seu primeiro agente
         Nome:  [____________]
         Cargo: [____________]
         Sala:  [▼ Marketing  ]
         Modelo:[▼ claude-opus-4-7]
         [Criar]

[Tela 3] Pronto! Bia foi para a sala de Marketing.
         Que tal mandar uma tarefa para ela?
         [Criar tarefa]   [Explorar primeiro]
```

## Acessibilidade

- Navegação completa por teclado (WASD/setas no mapa; Tab nos painéis).
- Atalhos:
  - `T` abre Task Board
  - `A` abre Agentes
  - `/` foca chat
  - `Esc` fecha modal ativo
  - `,` configurações
- Anúncios via `aria-live` para mensagens novas, mudança de sala, eventos críticos.
- Tema de alto contraste opcional em configurações.

## Estados de erro

- Banner topo (não-bloqueante) para erros transitórios ("Reconectando...").
- Modal central para erros que requerem ação ("Sessão expirou — entrar de novo").
- Audit log sempre disponível para admins; erros internos do servidor aparecem lá com correlação por `traceId`.

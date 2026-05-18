# Demo single-file

Demonstração visual standalone do **Laboratório do Bastião** em um único `index.html`. **Sem build, sem servidor, sem LLM** — só Phaser 3 via CDN simulando a experiência.

## Como abrir

### Modo 1 — clicar duas vezes
```
laboratorio-do-bastiao/demo/index.html
```
Funciona em Chrome, Firefox, Safari e Edge modernos. Precisa de conexão pra baixar Phaser do CDN (uma vez).

### Modo 2 — servidor estático local (mais confiável em alguns ambientes)
```bash
cd laboratorio-do-bastiao/demo
python3 -m http.server 8000
# acesse http://localhost:8000
```

Ou com Node:
```bash
npx serve laboratorio-do-bastiao/demo
```

## O que está implementado

- **Mapa 2D top-down** com 6 salas tematizadas: Marketing, Reuniões, Financeiro, Recepção, Copa, Contábil — separadas por paredes com portas e um corredor central.
- **Avatar do jogador** (verde) movível com `WASD` ou setas, com colisão.
- **3 agentes IA** (laranja/azul/rosa) com persona pré-roteirizada:
  - **Bia** — Analista Financeira (`claude-opus-4-7`)
  - **Mauro** — Estrategista de Marketing (`claude-sonnet-4-6`)
  - **Léo** — Contador (`claude-haiku-4-5`)
- **Painel lateral** com:
  - Lista de agentes (clicáveis) com estado em tempo real: `ocioso` → `executando` → `reportando`
  - Área de **atribuição de tarefa** (textarea + botão)
  - **Audit log** ao vivo com cores por tipo de evento (tool calls, A2A, artefatos, conclusão)
- **Balões de fala** sobre os avatares (small-talk ocasional + reações a eventos)
- **Roteiro de execução** quando você atribui tarefa: o agente caminha até a sala apropriada, chama tools (mock), troca mensagens A2A com outros agentes, gera artefato fake, volta pra base. Tudo refletido no audit log.

## Como interagir

1. Mova seu avatar com `WASD` ou setas.
2. Aproxime-se dos agentes para ver as falas idle.
3. Clique em um agente no painel direito.
4. Escreva uma tarefa qualquer (ex.: "Faça o relatório de abril") e clique em **Atribuir tarefa**.
5. Observe o agente caminhar, chamar tools, conversar com colegas via A2A, criar artefato — e o audit log preencher.

## Limitações conscientes

| Limitação | Motivo |
|-----------|--------|
| Single-player | Sem servidor multiplayer real (Colyseus virá no MVP) |
| Sem LLM | Roteiros são determinísticos; nada chama API de modelo |
| Sem persistência | Recarregar a página zera tudo |
| Pathfinding ingênuo | Cada agente usa heurística "saída → corredor → entrada"; não A* real |
| Visual placeholder | Retângulos coloridos no lugar da pixel art definitiva |

Esses pontos serão resolvidos no MVP descrito em [`docs/10-roadmap.md`](../docs/10-roadmap.md).

## Por que esse demo existe

Comunicar a visão do produto **antes** de investir nas semanas de engenharia do MVP. Você vê a "alma" da experiência: agentes coexistindo no mesmo espaço, executando trabalho observável, comunicando-se entre si — sem precisar instalar nada nem aguardar.

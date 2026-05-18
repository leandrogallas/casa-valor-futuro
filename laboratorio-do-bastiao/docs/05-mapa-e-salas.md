# 05 — Mapa e Salas

Como o espaço físico do escritório é estruturado, renderizado e usado pelo jogo.

## Princípios

- **Top-down**, perspectiva levemente isométrica (45°) para dar profundidade sem 3D.
- **Tile system 32x32 px** — escolha clássica para pixel art, casa bem com sprites 32x48.
- **Camadas separadas** em cada mapa: chão, parede, decoração, colisão, gatilhos (zonas).
- **Tiled** como editor (formato `.tmx` no fonte, export `.json` para o jogo).

## Estrutura física

Um **Prédio** tem N **Andares**, cada andar tem N **Salas**.

```
+--------------------------------------------------------+
| Predio "Sede Central"                                  |
| +----------------------------------------------------+ |
| | Andar 0 (térreo)                                   | |
| |   - Recepcao (sala obrigatória)                    | |
| |   - Copa                                           | |
| |   - Open Space                                     | |
| +----------------------------------------------------+ |
| +----------------------------------------------------+ |
| | Andar 1                                            | |
| |   - Sala de Reuniões 1                             | |
| |   - Sala de Reuniões 2                             | |
| |   - Marketing                                      | |
| |   - Financeiro                                     | |
| |   - Contábil                                       | |
| +----------------------------------------------------+ |
| +----------------------------------------------------+ |
| | Andar 2                                            | |
| |   - Diretoria                                      | |
| +----------------------------------------------------+ |
+--------------------------------------------------------+
```

## Tipos de sala (Fase MVP+)

| Tipo         | Capacidade típica | Função                                          |
| ------------ | ----------------- | ----------------------------------------------- |
| `recepcao`   | 16                | Spawn point; portas para todas as outras áreas  |
| `reuniao`    | 8                 | Suporta sessão `Reuniao` com ata automática     |
| `marketing`  | 6                 | Mesa de campanhas; painéis de KPI               |
| `financeiro` | 6                 | Mesa de fluxo de caixa; dashboards              |
| `contabil`   | 6                 | Mesa de conciliação                             |
| `diretoria`  | 4                 | Sala fechada; só admin/gestor podem entrar      |
| `copa`       | 8                 | Sala social; sem trabalho — usada para small talk humano-humano (e easter eggs com agentes) |
| `open_space` | 16                | Mesas livres, baias                             |

## Camadas do tilemap (convenção Tiled)

```
Camada              Tipo Tiled      Conteúdo
-----------------   -------------   --------------------------------------
ground              tile layer      Pisos, tapetes
walls               tile layer      Paredes, divisórias
decor               tile layer      Mesas, plantas, quadros (não-colidíveis visualmente diferenciados)
collision           tile layer      Tiles invisíveis com property `colide=true`
spawn_points        object layer    Pontos nomeados onde avatares aparecem
triggers            object layer    Zonas com `type` em {porta, gatilho_reuniao, mesa, etc.}
```

## Convenções de assets

- Tilesets em `assets/tilesets/<tema>.png` + `.json` (Aseprite/Tiled).
- Sprites de avatar em `assets/characters/<id>.png` + sheet JSON.
- Cada sala tem um arquivo `assets/maps/<sala-id>.json` exportado do Tiled.

## Mapa ASCII de exemplo — Sala de Reuniões 1

Escala simbólica (cada caractere ~ 1 tile):

```
##########################
#............R...........#
#............R...........#
#............R...........#
#............R...........#
#.MMMMMMMMMMMRMMMMMMMMM..#
#............R...........#
#............R...........#
#............R...........#
#............R...........#
##########################

Legenda:
  # = parede
  . = piso (caminhável)
  M = mesa (não caminhável)
  R = TV / projeção central (não caminhável)
```

Em produção, todas as salas serão modeladas no Tiled — este ASCII é só ilustrativo.

## Gatilhos / zonas

Objetos da camada `triggers` permitem comportamento contextual:

| Tipo objeto         | Comportamento                                                       |
| ------------------- | ------------------------------------------------------------------- |
| `porta`             | Transição para outra sala (`destinoSalaId`)                         |
| `gatilho_reuniao`   | Entrar nesta zona convida o avatar à `MeetingRoom` ativa            |
| `mesa_de_trabalho`  | Avatar pode "trabalhar" — animação focada + bônus visual            |
| `quadro_kpi`        | Mostra dashboard popup quando o avatar interage                     |

## Spawn

- Todo avatar (humano ou agente) entra primeiro na `recepcao` do prédio.
- A partir daí, jogador navega normalmente ou usa um atalho de minimapa para teleportar a salas autorizadas.
- Agentes seguem a sala definida em `Agente.salaId` na configuração (path-finding A* até o spawn point).

## Colisão

- Pathfinding server-side com matriz binária derivada da camada `collision`.
- Cliente faz interpolação visual; servidor é autoridade.
- Avatares colidem com tiles `colide=true` e com objetos `mesa_de_trabalho`/`mesa` (jogadores não passam pela mesa).
- Avatares **não** colidem entre si (multiplayer fluido > realismo).

## Performance

- Cada `OfficeRoom` representa **um andar inteiro**. Salas dentro são zonas, não rooms separadas. Razão: humanos circulam livremente; criar Room por sala explodiria reconexões.
- `MeetingRoom` é separada e efêmera — só nasce quando uma reunião é convocada.
- Interest management: cliente só recebe updates de avatares dentro de raio R do seu (ver `06-multiplayer-netcode.md`).

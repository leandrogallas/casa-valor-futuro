# Laboratório do Bastião

> Escritório virtual 2D multiplayer onde humanos e agentes de IA trabalham lado a lado.

![status](https://img.shields.io/badge/status-alpha--scaffold-orange)
![node](https://img.shields.io/badge/node-20%2B-339933)
![pnpm](https://img.shields.io/badge/pnpm-9%2B-F69220)
![license](https://img.shields.io/badge/license-MIT-blue)
![docs](https://img.shields.io/badge/docs-PT--BR-009C3B)

O **Laboratório do Bastião** é um ambiente virtual 2D — web e instalável (desktop) — que simula um escritório real com salas de reunião, marketing, diretoria, financeiro, contábil, copa e recepção. Múltiplos jogadores (humanos) e múltiplos **agentes de IA** convivem no mesmo mapa: humanos criam, configuram e atribuem tarefas aos agentes; agentes executam rotinas, trocam mensagens, participam de reuniões e reportam resultados. Tudo isso é **observável em tempo real** como se fosse uma empresa virtual em operação.

Os agentes se conectam por protocolos abertos (**MCP** para ferramentas/contexto e **A2A** para comunicação agente-a-agente), o que mantém o ecossistema interoperável com modelos e fornecedores diferentes.

## Por que isto existe

Equipes que operam com agentes de IA hoje os tratam como caixa-preta: chama-se uma API, recebe-se um resultado. Falta um **palco compartilhado** onde múltiplos agentes possam coexistir, conversar entre si, ser supervisionados e ter o trabalho deles **visualizado** por humanos. O Laboratório do Bastião é esse palco.

## Quickstart

Pré-requisitos: Node **20+**, pnpm **9+**.

```bash
git clone git@github.com:leandrogallas/casa-valor-futuro.git
cd casa-valor-futuro/laboratorio-do-bastiao
pnpm install
pnpm -r typecheck   # garante que o scaffold está saudável
```

> Este projeto vive como subpasta de `casa-valor-futuro` na branch `claude/bastion-lab-docs-bthxg` por enquanto. Para extrair em repositório próprio com histórico preservado, use `git subtree split -P laboratorio-do-bastiao -b bastiao-only` e empurre `bastiao-only` para o repo dedicado.

Comandos do workspace:

| Comando             | O que faz                                       |
| ------------------- | ----------------------------------------------- |
| `pnpm dev`          | Sobe todos os pacotes em modo desenvolvimento   |
| `pnpm build`        | Build de produção de todos os pacotes           |
| `pnpm -r typecheck` | Type-check em todos os pacotes                  |
| `pnpm -r lint`      | Lint em todos os pacotes                        |

## Estrutura do monorepo

```
labgallasmacbook/
├── client/    # Phaser 3 + Vite (cliente 2D)
├── server/    # Colyseus (multiplayer autoritativo)
├── agents/    # Runtime dos agentes (MCP + A2A)
├── shared/    # Tipos compartilhados
├── desktop/   # Wrapper Tauri (build desktop)
├── assets/    # Pipeline de arte (sem binários no git)
└── docs/      # Documentação completa em PT-BR
```

## Documentação

| Documento                                         | Conteúdo                                            |
| ------------------------------------------------- | --------------------------------------------------- |
| [Visão](docs/00-visao.md)                         | Problema, personas, princípios, casos de uso        |
| [Arquitetura](docs/01-arquitetura.md)             | Diagramas C4 e fluxos críticos                      |
| [Stack tecnológica](docs/02-stack-tecnologica.md) | Phaser 3, Colyseus, Tauri, MCP — escolhas e razões  |
| [Modelo de dados](docs/03-modelo-de-dados.md)     | Entidades, relações, invariantes                    |
| [Protocolo de agentes](docs/04-protocolo-agentes.md) | MCP + A2A, ciclo de vida, sandbox                |
| [Mapa e salas](docs/05-mapa-e-salas.md)           | Layout do prédio, tile system, colisão              |
| [Multiplayer / netcode](docs/06-multiplayer-netcode.md) | Rooms Colyseus, sync de estado                |
| [Rotinas e tarefas](docs/07-rotinas-e-tarefas.md) | Fila, agendamento, feedback humano                  |
| [UI/UX](docs/08-ui-ux.md)                         | HUD, chat, inspector, task board                    |
| [Segurança & sandbox](docs/09-seguranca-sandbox.md) | Permissões, audit log, rate limits                |
| [Roadmap](docs/10-roadmap.md)                     | MVP → Beta → 1.0 com critérios de saída             |
| [Especificação da API](docs/11-api-spec.md)       | REST + WebSocket                                    |
| [Glossário](docs/12-glossario.md)                 | Vocabulário canônico em PT-BR                       |
| [ADRs](docs/adr/)                                 | Architecture Decision Records (formato Nygard)      |

## Contribuindo

Leia [CONTRIBUTING.md](CONTRIBUTING.md). Commits seguem [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/).

## Licença

[MIT](LICENSE).

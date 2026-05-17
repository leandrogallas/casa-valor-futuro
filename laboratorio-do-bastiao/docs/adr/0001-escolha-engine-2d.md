# ADR 0001 — Escolha da engine 2D para o cliente

## Status

Aceito — 2026-05-17

## Contexto

Precisamos de uma engine 2D para renderizar o escritório virtual no browser (e, via Tauri, no desktop). Os requisitos:

- Tilemap robusto (suporte a Tiled).
- Sprites animados, físicas leves (apenas colisão de tile).
- TypeScript first-class.
- Bundle aceitável (< 2 MB gzip para alvo web).
- Comunidade ativa e documentação ampla.
- Roda bem em hardware modesto e em WebView do Tauri.

Avaliamos quatro candidatos: **Phaser 3**, **PixiJS**, **Excalibur** e **Godot Web export**.

| Critério                 | Phaser 3       | PixiJS         | Excalibur      | Godot Web      |
| ------------------------ | -------------- | -------------- | -------------- | -------------- |
| Suporte tilemap Tiled    | nativo, maduro | via plugin     | suporte parcial| nativo         |
| Tipos TS                 | excelentes     | excelentes     | bons           | C#/GDScript    |
| Bundle                   | ~1.2 MB gzip   | ~400 KB gzip   | ~600 KB gzip   | runtime ~6 MB  |
| Maturidade/comunidade    | grande         | grande         | média          | grande (geral) |
| Documentação             | extensa        | extensa        | razoável       | ampla, mas web export tem peculiaridades |
| Curva de aprendizado     | baixa-média    | média-alta     | baixa          | média          |
| Fit com TS strict + Vite | excelente      | excelente      | bom            | indireto       |

## Decisão

Adotamos **Phaser 3** como engine 2D do `client/`.

## Consequências

### Positivas

- Implementação rápida do MVP graças a tilemap nativo + arcade physics.
- Comunidade ativa: muitos plugins e exemplos para o que precisarmos depois (UI in-canvas, partículas).
- TS first-class casa com nossa política de `strict: true`.
- Roda bem em WebView do Tauri.

### Negativas

- Bundle ~3× maior que PixiJS puro. **Mitigação:** code splitting e lazy load de cenas não-críticas.
- Phaser não tem ECS embutido — se a complexidade crescer, podemos precisar adicionar um (ex.: `bitecs`). Aceitamos o risco; entra em ADR específico se ocorrer.
- API de UI dentro do canvas é desconfortável; **decisão correlata:** UI de painéis fica em HTML/CSS sobre o canvas (ver `08-ui-ux.md`).

### Reversibilidade

A camada `client/` é isolada por `@bastiao/shared`. Trocar Phaser por outra engine no futuro afeta apenas `client/src/` — esforço estimado de uma semana de eng. para reescrever cenas básicas, mais reimport de mapas.

# Pipeline de Arte

O Laboratório do Bastião tem **visual próprio 2D top-down**, pixel art em paleta limitada, com personagens humanos e variações para agentes IA (efeitos sutis: contorno luminoso, ícone flutuante de cargo, partículas quando "pensando").

## Convenções

- **Tiles:** 32x32 px.
- **Personagens:** 32x48 px (3 quadros por direção, 4 direções — total 12 frames por avatar).
- **Cor:** paleta máxima de 32 cores, exportada como `palette.gpl`.
- **Formato fonte:** `.aseprite` (não versionar binário grande — manter fora do repositório ou em LFS futuramente).
- **Formato runtime:** PNG + JSON (Aseprite export) para sprites; mapas em `.tmx` (Tiled) exportados como `.json`.

## Estrutura prevista

```
assets/
├── README.md          # este arquivo
├── tilesets/          # PNG + JSON exportados do Tiled
├── characters/        # PNGs + JSON sheets de avatares (humanos e agentes)
├── ui/                # ícones de HUD, balões, indicadores
├── audio/             # SFX (foco ambiente, ações) e música ambiente
├── palette.gpl        # paleta canônica
└── credits.md         # créditos de arte (autoria interna ou licenças externas)
```

## Pipeline

1. **Concepção** — esboços em Aseprite, mantidos no Drive do time (não no git).
2. **Produção** — sprites e tilesets finais exportados em PNG + JSON.
3. **Mapas** — montados no [Tiled](https://www.mapeditor.org/), exportados em JSON.
4. **Importação** — colocados em `assets/` com nomes em `kebab-case`. O cliente carrega via `phaser.load.image` / `load.tilemapTiledJSON`.

## Política de binários

Por ora, **não comitamos PNG/áudio neste repositório**. Quando o volume justificar, migrar para [Git LFS](https://git-lfs.com/) com filtros explícitos.

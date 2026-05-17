# Desktop (Tauri)

Wrapper [Tauri](https://tauri.app/) que empacota o `client` como aplicação desktop nativa para macOS, Windows e Linux.

## Por que Tauri

- Binário leve (sem Chromium embutido — usa WebView do sistema).
- Backend em Rust com IPC tipado para o frontend.
- Suporte cross-platform com assinatura e auto-update.

## Configuração futura

Quando o desktop entrar em desenvolvimento ativo:

```bash
# Pré-requisitos
cargo install create-tauri-app
rustup target add x86_64-apple-darwin aarch64-apple-darwin

# Bootstrap
cd desktop
pnpm create tauri-app --template vanilla-ts
# Em src-tauri/tauri.conf.json, apontar build.beforeBuildCommand para 'pnpm --filter @bastiao/client build'
# e build.distDir para '../client/dist'.
```

## Estrutura prevista

```
desktop/
├── src-tauri/
│   ├── tauri.conf.json   # configuração principal
│   ├── Cargo.toml        # deps Rust
│   └── src/main.rs       # entrada Tauri
└── README.md             # este arquivo
```

Por ora, este pacote contém apenas placeholders para que `desktop/` apareça na estrutura.

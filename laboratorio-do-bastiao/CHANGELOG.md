# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added

- Scaffold inicial do monorepo (pnpm workspaces): `client`, `server`, `agents`, `shared`.
- Wrapper Tauri para distribuição desktop em `desktop/`.
- Suíte de documentação em PT-BR sob `docs/` (visão, arquitetura, stack, modelo de dados, protocolo de agentes, mapa, netcode, rotinas, UI/UX, segurança, roadmap, API, glossário).
- ADRs 0001 (engine 2D), 0002 (protocolo de agentes MCP+A2A), 0003 (multiplayer autoritativo).
- Convenções: Conventional Commits, ESLint flat config, Prettier, TS strict, EditorConfig.

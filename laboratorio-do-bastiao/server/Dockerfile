# Build context: workspace root (laboratorio-do-bastiao/)
FROM node:24-alpine AS build
WORKDIR /app

RUN apk add --no-cache git && npm install -g pnpm@9 --quiet

# Copy workspace manifests so pnpm understands the monorepo layout
COPY pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json package.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY agents/package.json ./agents/
COPY client/package.json ./client/
COPY e2e/package.json ./e2e/

# Install all deps (dev included — needed for tsc)
RUN pnpm install --frozen-lockfile --filter @bastiao/server...

# Copy source
COPY shared/src ./shared/src
COPY shared/tsconfig.json ./shared/
COPY server ./server

# Compile TypeScript
RUN pnpm --filter @bastiao/server run build

# pnpm deploy creates a standalone flat node_modules (resolves workspace symlinks)
# --prod excludes devDependencies from the deployment bundle
RUN pnpm --filter @bastiao/server deploy /release --prod

# ── Runtime image ──────────────────────────────────────────────────────────
FROM node:24-alpine
WORKDIR /app

# /release contains dist/ + flat node_modules/ from pnpm deploy
COPY --from=build /release ./
# schema.sql must be alongside dist/ for initDb() to find it at startup
COPY server/src/db/schema.sql ./dist/db/schema.sql

EXPOSE 2567
CMD ["node", "dist/index.js"]

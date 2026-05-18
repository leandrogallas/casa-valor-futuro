# Build context: workspace root (laboratorio-do-bastiao/)
FROM node:24-alpine AS build
WORKDIR /app

RUN npm install -g pnpm@9 --quiet

COPY pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json package.json ./
COPY shared/package.json ./shared/
COPY agents/package.json ./agents/
COPY server/package.json ./server/
COPY client/package.json ./client/
COPY e2e/package.json ./e2e/

RUN pnpm install --frozen-lockfile

COPY shared/src ./shared/src
COPY shared/tsconfig.json ./shared/
COPY agents ./agents

RUN pnpm --filter @bastiao/agents run build
RUN pnpm --filter @bastiao/agents deploy /release --prod

# ── Runtime image ──────────────────────────────────────────────────────────
FROM node:24-alpine
WORKDIR /app

COPY --from=build /release ./

ENV SERVER_URL=http://server:2567

CMD ["node", "dist/index.js"]

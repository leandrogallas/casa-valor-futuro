# Build context: workspace root (laboratorio-do-bastiao/)
# Run one container per agent; pass AGENT_ID + ANTHROPIC_API_KEY via env.
FROM node:24-alpine AS build
WORKDIR /app

RUN npm install -g pnpm@9 --quiet

COPY pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json package.json ./
COPY shared/package.json ./shared/
COPY agents/package.json ./agents/
COPY server/package.json ./server/
COPY client/package.json ./client/
COPY e2e/package.json ./e2e/

RUN pnpm install --frozen-lockfile --filter @bastiao/agents...

COPY shared/src ./shared/src
COPY shared/tsconfig.json ./shared/
COPY agents ./agents

RUN pnpm --filter @bastiao/agents run build

# ── Runtime image ──────────────────────────────────────────────────────────
FROM node:24-alpine
WORKDIR /app

COPY --from=build /app/agents/dist ./dist
COPY --from=build /app/agents/node_modules ./node_modules
COPY agents/package.json .

# Required env vars (no defaults — container exits if missing):
# AGENT_ID, ANTHROPIC_API_KEY
# Optional:
# SERVER_URL (default: http://server:2567)
ENV SERVER_URL=http://server:2567

CMD ["node", "dist/index.js"]

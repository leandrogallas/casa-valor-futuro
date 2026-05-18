# Build context: workspace root (laboratorio-do-bastiao/)
FROM node:24-alpine AS build
WORKDIR /app

RUN npm install -g pnpm@9 --quiet

COPY pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json package.json ./
COPY shared/package.json ./shared/
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY agents/package.json ./agents/
COPY e2e/package.json ./e2e/

RUN pnpm install --frozen-lockfile --filter @bastiao/client...

COPY shared/src ./shared/src
COPY shared/tsconfig.json ./shared/
COPY client ./client

# VITE_SERVER_URL must be set at build time (Vite embeds it into JS bundle)
# Default points to same host on port 2567; override via docker-compose build args.
ARG VITE_SERVER_URL=ws://localhost:2567
ENV VITE_SERVER_URL=$VITE_SERVER_URL

RUN pnpm --filter @bastiao/client run build

# ── Runtime: nginx static file server ──────────────────────────────────────
FROM nginx:alpine
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

# ---------- base ----------
FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable
WORKDIR /app

# ---------- deps (all dependencies, cached) ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# ---------- dev (used by docker compose, hot reload) ----------
FROM deps AS dev
COPY . .
EXPOSE 5000
CMD ["pnpm", "dev"]

# ---------- build ----------
FROM deps AS build
COPY . .
RUN pnpm build

# ---------- prod ----------
FROM base AS prod
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist ./dist
USER node
EXPOSE 5000
CMD ["node", "dist/server.js"]
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS prerelease
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch
COPY . .
RUN pnpm install --offline
RUN pnpm run build --preset bun

FROM oven/bun:1-alpine AS release

USER root
RUN mkdir -p /data/config /data/cache && chown -R bun:bun /data

USER bun
COPY --chown=bun:bun --from=prerelease /app/.output /app

WORKDIR /app

ENV HOST=0.0.0.0
ENV SERVER_CONFIG_DIR=/data/config
ENV SERVER_PACKAGES_CACHE_DIR=/data/cache

EXPOSE 3000

ENTRYPOINT [ "bun", "/app/server/index.mjs" ]
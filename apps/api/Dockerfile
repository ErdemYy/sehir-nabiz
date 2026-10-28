# ==============================================================================
# ŞehirNabız — NestJS API Multi-stage Dockerfile
# ==============================================================================
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@12.6.0 --activate
RUN apk add --no-cache curl

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ packages/
COPY apps/api/package.json apps/api/
COPY apps/api/ apps/api/
RUN pnpm install --frozen-lockfile

FROM dependencies AS builder
WORKDIR /app
RUN pnpm --filter @sehir-nabiz/shared run build
RUN pnpm --filter sehir-nabiz-api run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=staging
ENV PORT=3000

# Built artifacts and node_modules
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages
COPY --from=dependencies /app/package.json ./package.json
COPY --from=dependencies /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

WORKDIR /app/apps/api
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health/ready || exit 1

CMD ["node", "dist/main.js"]

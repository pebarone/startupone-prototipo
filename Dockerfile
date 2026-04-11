FROM oven/bun:1.3.12-alpine AS frontend-builder
WORKDIR /app/frontend

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_OAUTH_PROVIDER=google
ARG VITE_API_BASE_URL=/api

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_OAUTH_PROVIDER=$VITE_SUPABASE_OAUTH_PROVIDER
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile

COPY frontend/ ./
RUN bun run build

FROM oven/bun:1.3.12-alpine AS backend-deps
WORKDIR /app/backend

COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1.3.12-alpine AS runtime
WORKDIR /app/backend

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

COPY --chown=bun:bun backend/package.json backend/bun.lock backend/tsconfig.json ./
COPY --chown=bun:bun backend/openapi.yaml ./openapi.yaml
COPY --chown=bun:bun backend/src ./src
COPY --chown=bun:bun --from=backend-deps /app/backend/node_modules ./node_modules
COPY --chown=bun:bun --from=frontend-builder /app/frontend/dist ./public

USER bun
EXPOSE 3333
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD ["bun", "-e", "const port = process.env.PORT || '3333'; const response = await fetch('http://127.0.0.1:' + port + '/api/health'); if (!response.ok) { throw new Error('unhealthy'); }"]

CMD ["bun", "src/server.ts"]

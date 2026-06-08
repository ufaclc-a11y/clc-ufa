# ─── Stage 1: все зависимости для сборки ────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ─── Stage 2: сборка ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Отладка: проверяем что файлы скопировались
RUN echo "=== components ===" && ls components/ && echo "=== data ===" && ls data/

# Переменные окружения нужны только для сборки если используются в getStaticProps
ARG TG_BOT_TOKEN
ARG TG_CHAT_ID
ENV TG_BOT_TOKEN=$TG_BOT_TOKEN
ENV TG_CHAT_ID=$TG_CHAT_ID

RUN npm run build

# ─── Stage 3: продакшн-образ ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Системный пользователь для безопасности
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Копируем только нужное из standalone-сборки
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

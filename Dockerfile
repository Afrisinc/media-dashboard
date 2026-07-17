# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10 --activate

COPY package.json pnpm-lock.yaml ./
RUN npm_config_ignore_scripts=true pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

RUN pnpm build:server

# ---------- Runtime Config ----------
FROM alpine:3.18 AS config-generator
WORKDIR /config

RUN apk add --no-cache envsubst

COPY public/config.json .
COPY public/env-config.js .

# ---------- Serve with SSR ----------
FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10 --activate

COPY package.json pnpm-lock.yaml ./
RUN npm_config_ignore_scripts=true pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=config-generator /config/config.json ./public/config.json
COPY --from=config-generator /config/env-config.js ./public/env-config.js

ENV NODE_ENV=production
ENV PORT=8019

EXPOSE 8019

CMD ["node", "dist-server/server/index.js"]

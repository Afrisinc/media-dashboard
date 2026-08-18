# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10 --activate

COPY package.json pnpm-lock.yaml ./
RUN npm_config_ignore_scripts=true pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# ---------- Static Server ----------
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY public/env-config.js /usr/share/nginx/html/env-config.js

COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

ENV PORT=8019
EXPOSE 8019

ENTRYPOINT ["/docker-entrypoint.sh"]

# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=http://localhost:8091
ARG VITE_NOTIFY_URL=""
ARG VITE_NOTIFY_APP_ID=""
ARG VITE_GA_MEASUREMENT_ID=""
ARG VITE_GA_DEBUG=false
ARG VITE_FB_APP_ID=""

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10 --activate

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the Vite client app
RUN VITE_API_URL=${VITE_API_URL} \
    VITE_NOTIFY_URL=${VITE_NOTIFY_URL} \
    VITE_NOTIFY_APP_ID=${VITE_NOTIFY_APP_ID} \
    VITE_GA_MEASUREMENT_ID=${VITE_GA_MEASUREMENT_ID} \
    VITE_GA_DEBUG=${VITE_GA_DEBUG} \
    VITE_FB_APP_ID=${VITE_FB_APP_ID} \
    pnpm build

# Build the SSR server
RUN pnpm build:server

# ---------- Serve with SSR ----------
FROM node:20-alpine AS runner
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy package files and install production dependencies only
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy built client assets
COPY --from=builder /app/dist ./dist

# Copy built server
COPY --from=builder /app/dist-server ./dist-server

# Copy config
COPY --from=builder /app/dist/config.json ./dist/config.json

ENV NODE_ENV=production
ENV PORT=8090

EXPOSE 8090

CMD ["node", "dist-server/server/index.js"]

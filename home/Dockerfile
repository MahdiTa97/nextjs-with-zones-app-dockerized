# Stage 1: Base image
FROM node:18-alpine AS base

RUN apk add --no-cache libc6-compat curl

# Stage 2: Install dependencies
FROM base AS deps

WORKDIR /app
COPY ./home/package.json ./home/package-lock.json ./
ARG BLOG_URL
ENV BLOG_URL=${BLOG_URL}
RUN npm ci

# Stage 3: Build the application
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY ./home .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
RUN npm prune --production && rm -rf ./node_modules/.cache

# Stage 4: Production server
FROM base AS runner

WORKDIR /app
ARG BLOG_URL
ENV BLOG_URL=${BLOG_URL}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4001
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
USER nextjs

EXPOSE 4001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD curl -f http://localhost:4001/ || exit 1

CMD ["node", "server.js"]

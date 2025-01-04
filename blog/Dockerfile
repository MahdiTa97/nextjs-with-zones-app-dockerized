# 1. Base image to install dependencies
FROM node:18-alpine AS deps

# Install essential tools (combine commands to reduce layers)
RUN apk add --no-cache libc6-compat curl

# Set working directory and define app name (can be overridden)
WORKDIR /opt/app
ARG APP_NAME=blog
ENV APP_NAME=${APP_NAME}

# Copy package files and install dependencies
COPY ./blog/package.json ./apps/${APP_NAME}/
COPY ./blog/package-lock.json ./apps/${APP_NAME}/
WORKDIR /opt/app/apps/${APP_NAME}
RUN npm ci

# -------------------------------------------------------------------

# 2. Build stage
FROM deps AS builder

# Copy application source code
WORKDIR /opt/app
COPY ./blog ./apps/${APP_NAME}

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application with standalone output
WORKDIR /opt/app/apps/${APP_NAME}
RUN npm run build

# Remove unnecessary files
RUN npm prune --production && rm -rf ./node_modules/.cache

# -------------------------------------------------------------------

# 3. Production stage
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /opt/app

# Define app name and production environment
ARG APP_NAME=blog
ENV APP_NAME=${APP_NAME}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT=4000

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy the standalone build output
COPY --from=builder /opt/app/apps/${APP_NAME}/.next/standalone ./
COPY --from=builder /opt/app/apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static
# COPY --from=builder /opt/app/apps/${APP_NAME}/public ./apps/${APP_NAME}/public

# Ensure the container runs as a non-root user
USER nextjs

# Expose the application port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD curl -f http://localhost:4000/ || exit 1

# Command to run the application
CMD ["node", "server.js"]

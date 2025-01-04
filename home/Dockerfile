# 1. Base image to install dependencies
FROM node:18-alpine AS deps

# Install essential tools
RUN apk add --no-cache libc6-compat curl

# Define the blog URL dynamically
ARG BLOG_URL
ENV BLOG_URL=${BLOG_URL}

# Set working directory and define app name
WORKDIR /opt/app
ARG APP_NAME=home
ENV APP_NAME=${APP_NAME}

# Copy package files for dependency installation
COPY ./home/package.json ./apps/${APP_NAME}/
COPY ./home/package-lock.json ./apps/${APP_NAME}/

# Install dependencies
WORKDIR /opt/app/apps/${APP_NAME}
RUN npm ci

# -------------------------------------------------------------------

# 2. Build stage
FROM deps AS builder

# Copy application source code
WORKDIR /opt/app
COPY ./home ./apps/${APP_NAME}

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
WORKDIR /opt/app/apps/${APP_NAME}
RUN npm run build

# Remove unnecessary files and prune development dependencies
RUN npm prune --production && rm -rf ./node_modules/.cache

# -------------------------------------------------------------------

# 3. Production stage
FROM node:18-alpine AS runner

# Install essential tools
RUN apk add --no-cache libc6-compat curl

# Set working directory and define app settings
WORKDIR /opt/app
ARG BLOG_URL
ENV BLOG_URL=${BLOG_URL}
ARG APP_NAME=home
ENV APP_NAME=${APP_NAME}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4001

# Create a non-root user for running the app
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy the build output from the builder stage
COPY --from=builder /opt/app/apps/${APP_NAME}/.next/standalone ./
COPY --from=builder /opt/app/apps/${APP_NAME}/.next/static ./apps/${APP_NAME}/.next/static
COPY --from=builder /opt/app/apps/${APP_NAME}/components ./apps/${APP_NAME}/components
# COPY --from=builder /opt/app/apps/${APP_NAME}/public ./apps/${APP_NAME}/public

# Ensure the container runs as a non-root user
USER nextjs

# Expose the application port
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD curl -f http://localhost:4001/ || exit 1

# Start the application
CMD ["node", "server.js"]

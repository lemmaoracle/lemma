# =============================================================================
# Lemma Relay - Production Dockerfile
# Multi-stage build optimized for security, size, and build speed
# =============================================================================

# -----------------------------------------------------------------------------
# Stage: base
# Common base with pnpm setup for reuse across stages
# -----------------------------------------------------------------------------
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# -----------------------------------------------------------------------------
# Stage: deps
# Install dependencies with cache optimization
# Separated for better layer caching when only code changes
# -----------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

# Copy workspace root config files first (better cache efficiency)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy package.json for each package (needed for pnpm to resolve dependencies)
COPY packages/spec/package.json ./packages/spec/
COPY packages/sdk/package.json ./packages/sdk/
COPY packages/relay/package.json ./packages/relay/

# Install all dependencies with mount cache for pnpm store
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# Stage: builder
# Build the application
# -----------------------------------------------------------------------------
FROM deps AS builder
WORKDIR /app

# Copy source code (after dependencies for better caching)
COPY packages/spec ./packages/spec
COPY packages/sdk ./packages/sdk
COPY packages/relay ./packages/relay

# Build in dependency order
RUN pnpm --filter "@lemmaoracle/spec" run build
RUN pnpm --filter "@lemmaoracle/sdk" run build
RUN pnpm --filter "@lemmaoracle/relay" run build

# Deploy production dependencies to isolated directory
RUN pnpm --filter "@lemmaoracle/relay" --prod deploy /prod/relay

# -----------------------------------------------------------------------------
# Stage: production
# Minimal runtime image with security hardening
# -----------------------------------------------------------------------------
FROM node:22-alpine AS production

# OCI image labels for metadata
LABEL org.opencontainers.image.title="Lemma Relay"
LABEL org.opencontainers.image.description="Lemma Oracle Relay Service"
LABEL org.opencontainers.image.source="https://github.com/lemmaoracle/lemma"
LABEL org.opencontainers.image.authors="Lemma Oracle Team"

# Create non-root user for security (node user exists in node:alpine)
# Ensure proper home directory and permissions
RUN mkdir -p /home/node/app && \
    chown -R node:node /home/node/app

WORKDIR /home/node/app

# Environment configuration
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Enable corepack for pnpm
RUN corepack enable

# Copy production artifacts with proper ownership
COPY --from=builder --chown=node:node /prod/relay ./

# Switch to non-root user for security
USER node

# Expose application port
EXPOSE 3000

# Health check using wget (lightweight, available in alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run the application
CMD ["pnpm", "start"]

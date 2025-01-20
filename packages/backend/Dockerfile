FROM node:20-slim AS builder

WORKDIR /app

# Install necessary build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN corepack enable && \
    corepack prepare pnpm@8.15.4 --activate

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/backend/package.json packages/backend/tsconfig.json ./packages/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy backend source and build
COPY packages/backend ./packages/backend/
RUN cd packages/backend && pnpm build

# Production stage
FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN corepack enable && \
    corepack prepare pnpm@8.15.4 --activate

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/backend/package.json ./packages/backend/

# Copy built assets
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/packages/backend

EXPOSE 3001

CMD ["pnpm", "start"]

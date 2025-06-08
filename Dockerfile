# ---- Base Node Image ----
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# ---- Production Image ----
FROM base AS production

COPY --from=base /app /app

EXPOSE 5000

ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
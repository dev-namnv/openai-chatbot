# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy lock file
COPY package.json yarn.lock ./
COPY tsconfig*.json ./

# Cài dependencies bằng Yarn
RUN yarn install --frozen-lockfile

# Copy toàn bộ mã nguồn
COPY . .

# Build NestJS
RUN yarn build

# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./

# Tuỳ chọn: copy các .env.* nếu cần
COPY --from=builder /app/.env* ./

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]

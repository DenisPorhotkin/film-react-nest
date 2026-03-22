# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Устанавливаем все зависимости (dev + production)
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: production
FROM node:20-alpine
WORKDIR /app
# Копируем только production-зависимости и собранный код
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
# Для папки public со статическими файлами
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "dist/main"]
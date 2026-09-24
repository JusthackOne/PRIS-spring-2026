FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY backend/prisma backend/prisma
RUN npm ci --workspace backend --include-workspace-root=false
COPY backend backend
COPY scripts scripts
RUN npm run build -w backend
WORKDIR /app/backend
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run db:seed && npm start"]

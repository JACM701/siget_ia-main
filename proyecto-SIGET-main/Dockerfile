# Stage 1: Instalar dependencias
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Compilar el proyecto
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Deshabilitar telemetría de Next.js en compilación
ENV NEXT_TELEMETRY_DISABLED=1
# Variable de entorno de compilación necesaria para el enrutador
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ARG BACKEND_URL
ENV BACKEND_URL=${BACKEND_URL}
RUN npm run build

# Stage 3: Imagen de producción
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar archivos compilados y dependencias necesarias
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000

# Next.js corre por defecto en puerto 3000
CMD ["npm", "run", "start"]

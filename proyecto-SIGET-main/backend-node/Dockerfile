# Stage 1: Instalar dependencias de producción únicamente
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: Correr la aplicación
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Copiar dependencias y código fuente
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 4000

# Ejecutar el backend mediante el script start (node app.js)
CMD ["npm", "run", "start"]

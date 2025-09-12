# Etapa 1: Build
FROM node:24-alpine AS builder

# Carpeta de trabajo
WORKDIR /app

# Copiar package.json y lockfile primero para aprovechar la cache
COPY package*.json ./

# Instalar dependencias completas (dev + prod) para poder hacer el build
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Build de la aplicación
#RUN npm run build


# Etapa 2: Runtime
# FROM node:24-alpine AS runner

# WORKDIR /app

# # Definir entorno como producción
# ENV NODE_ENV=production

# # Copiar solo lo necesario desde el builder
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/next.config.* ./

# Puerto expuesto
EXPOSE 3000

# Comando de arranque (Next.js en prod usa "start")
CMD ["npm", "run", "dev"]

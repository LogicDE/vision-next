FROM node:22-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat openssl

WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (usa npm ci si existe package-lock.json)
RUN npm ci --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps

# Copiar código fuente (node_modules ya no se copia gracias a .dockerignore)
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

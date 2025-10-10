# Etapa base
FROM node:22-slim AS base
WORKDIR /usr/src/app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copiar solo package.json y lock para cache de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar el resto del proyecto
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando de desarrollo
CMD ["npm", "run", "dev"]

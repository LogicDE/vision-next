# Dockerfile para desarrollo
FROM node:24-alpine

# Actualizar paquetes de Alpine para parches de seguridad
RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Copiar package.json y lockfile para cache de dependencias
COPY package*.json ./

# Instalar dependencias (prod + dev)
RUN npm install --legacy-peer-deps

# Copiar resto del código
COPY . .

# Exponer puerto de Next.js
EXPOSE 3000

# Comando de desarrollo
CMD ["npm", "run", "dev"]

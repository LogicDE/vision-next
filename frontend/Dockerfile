# Imagen base Node.js estable y ligera
FROM node:24-alpine

# Carpeta de trabajo
WORKDIR /usr/src/app

# Copiar dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --production

# Copiar todo el código
COPY . .

# Exponer puerto de Next.js
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "dev"]

FROM node:24-alpine

# Actualizar Alpine para aplicar los últimos parches de seguridad
RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Copiar y hacer npm install solo de dependencias de desarrollo necesarias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Build opcional si tu start:dev lo requiere (algunos frameworks lo hacen en hot reload)
RUN npm run build

# Exponer puerto (coincide con tu .env/command)
EXPOSE 8000

# Comando de desarrollo
CMD ["npm", "run", "start:dev"]

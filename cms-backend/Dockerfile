FROM node:22-slim AS base
WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*


COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

# Crear carpeta para las credenciales
RUN mkdir -p /app/service-account

EXPOSE 8000

CMD ["npm", "run", "start:dev"]

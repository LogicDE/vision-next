# Vision Next

Proyecto Vision Next: Plataforma modular con frontend en Next.js, backend CMS en Node.js, microservicios en FastAPI, y bases de datos PostgreSQL, InfluxDB y Redis.

---

## 📌 Descripción

Vision Next es un proyecto full-stack que integra:

- **Frontend**: Next.js para la interfaz de usuario.
- **CMS Backend**: Node.js para la gestión de contenido.
- **Microservices Backend**: FastAPI para servicios independientes y APIs internas.
- **Bases de datos**:
  - PostgreSQL (principal y VitAnexo)
  - InfluxDB para métricas y series de tiempo
  - Redis para cache y coordinación de microservicios

El proyecto está completamente dockerizado y listo para desarrollo local.

---

## 🧰 Stack Tecnológico

| Componente             | Tecnología                   |
| ---------------------- | ---------------------------- |
| Frontend               | Next.js, Node.js             |
| CMS Backend            | Node.js, Express (si aplica) |
| Microservices Backend  | FastAPI, Python 3.13         |
| Base de datos primaria | PostgreSQL 16-alpine         |
| VitAnexo DB            | PostgreSQL 16-alpine         |
| Time-series DB         | InfluxDB 2.7                 |
| Cache / Mensajería     | Redis 7-alpine               |
| Contenerización        | Docker & Docker Compose      |

---

## 📂 Estructura de Carpetas

vision-next/
│
├─ cms-backend/ # Node.js backend
├─ microservices-backend/ # FastAPI backend
├─ frontend/ # Next.js frontend
├─ config/ # Archivos de configuración (.env)
├─ initdb/ # Scripts SQL iniciales para VitAnexo
├─ docker-compose.yml
├─ Dockerfile (en cada subproyecto)
└─ README.md

---

## ⚙️ Requisitos Previos

- Docker >= 24
- Docker Compose >= 2
- Node.js >= 24 (solo para desarrollo local)
- Python >= 3.13 (solo si trabajas microservices fuera de Docker)

---

## 🚀 Instalación y Ejecución

1. Clonar el repositorio:

```bash
git clone <tu-repo-url> vision-next
cd vision-next
docker-compose build
docker-compose up -d
docker ps

Deberías ver contenedores como:

    vision-next-db-1 (PostgreSQL principal)

    vitanexo-db (PostgreSQL VitAnexo)

    vision-next-influxdb-1

    vision-next-redis-1

    vision-next-cms-backend-1

    vision-next-microservices-backend-1

    vision-next-frontend-1

⚠️ Notas Importantes

Se omitió frontend.env en Docker Compose para evitar errores de archivo faltante. Si lo necesitas, crea un .env con las variables requeridas. Y las configuracion .env de cada servicio que utiliza el compose tampoco estan incluidas.

📖 Referencias

Docker Compose Documentation

Next.js Documentation Proximamente Qwik...

FastAPI Documentation

PostgreSQL Documentation

InfluxDB Documentation

Redis Documentation
```

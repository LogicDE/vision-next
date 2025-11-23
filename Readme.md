Vision Next

Proyecto Vision Next: Plataforma modular con frontend en Next.js, backend CMS en Node.js, microservicios en FastAPI, y bases de datos PostgreSQL, InfluxDB y Redis.

📌 Descripción

Vision Next es un proyecto full-stack que integra:

Frontend: Next.js para la interfaz de usuario.

CMS Backend: Node.js para la gestión de contenido y administración.

Microservices Backend: FastAPI para servicios independientes y APIs internas.

Bases de datos:

PostgreSQL (principal y VitAnexo)

InfluxDB para métricas y series de tiempo

Redis para cache y coordinación de microservicios

El proyecto está completamente dockerizado y listo para desarrollo local.

🧰 Stack Tecnológico
Componente Tecnología
Frontend Next.js, Node.js
CMS Backend Node.js, Express/NestJS
Microservices Backend FastAPI, Python 3.13
Base de datos primaria PostgreSQL 16-alpine
VitAnexo DB PostgreSQL 16-alpine
Time-series DB InfluxDB 2.7
Cache / Mensajería Redis 7-alpine
Contenerización Docker & Docker Compose
📂 Estructura de Carpetas
vision-next/
│
├─ cms-backend/ # Node.js / NestJS backend con CRUD y Redis
├─ biometric-microservice/ # FastAPI backend (biometric data & IoT ingestion)
├─ frontend/ # Next.js frontend y dashboard admin
├─ config/ # Archivos de configuración (.env)
├─ initdb/ # Scripts SQL iniciales para VitAnexo
├─ docker-compose.yml
├─ Dockerfile (en cada subproyecto)
└─ README.md

⚙️ Requisitos Previos

Docker >= 24

Docker Compose >= 2

Node.js >= 24 (solo para desarrollo local)

Python >= 3.13 (solo si trabajas microservices fuera de Docker)

🚀 Instalación y Ejecución

Clonar el repositorio:

Estos son los pasos generales y principales de ejecucion ya que se priorizo el funcionamiento de git clone en cualquier entorno:

git clone <tu-repo-url> vision-next
cd vision-next
docker-compose up -d --build
docker ps

Contenedores esperados:

vision-next-db-1 (PostgreSQL principal)

vitanexo-db (PostgreSQL VitAnexo)

vision-next-influxdb-1

vision-next-redis-1

vision-next-cms-backend-1

vision-next-biometric-microservice-1

vision-next-frontend-1

⚠️ Notas:

Los archivos .env del frontend y otros servicios no están incluidos en Docker Compose. Si los necesitas, crea un .env con las variables requeridas.

Dentro del entorno de los bucket es necesario la clave del bucket la cual no esta incluida.

Si hay problemas en la instalacion por favor veirfique su node_modules o las instalacione sque haya hecho del proyecto.

Para la version movil es necesario contar con Android Studio u Ajenos que le proporcionen la capacidad de ejecutar un dispositivo virtual para hacer las pruebas. Despues de Syncronizar el gradle

📝 Funcionalidades Implementadas

1. CRUD Completo

Se implementaron operaciones completas de creación, lectura, actualización y eliminación sobre las entidades principales:

Actions

Services

Interventions

Groups

Events

Todos los endpoints están mapeados y funcionando correctamente en NestJS (CMS backend).

Ejemplos de rutas:

POST /services
GET /services
GET /services/:id
PUT /services/:id
DELETE /services/:id

Y equivalentes para Actions, Interventions, Groups y Events.

2. Administración Web

El Admin Dashboard incluye:

Gestión de usuarios y roles (administrador, editor, usuario).

Gestión de empresas, grupos, alertas y audit logs.

Panel de KPIs bicognitivos con visualizaciones interactivas.

Interfaz responsiva y accesible para desktop y mobile.

3. Autenticación y Autorización

Login / Logout seguro con control de acceso por roles.

Badge de rol dinámico en la interfaz.

Sesión expirada y timeout controlado.

4. KPIs y Métricas Mejorado para implementacion con Modelo IA ademas de los presentes

Panel de métricas integradas con vistas y funciones en PostgreSQL:

Tiempo real (realtime): Ritmo cardíaco, estado mental, stress, usuarios activos.

Semanal (weekly): Promedios por día, alertas, satisfacción.

Radar (multidimensional): Salud cardiovascular, estado mental, estrés, sueño, actividad física, bienestar general.

Integración con Recharts en el frontend para gráficos interactivos:

Líneas, barras, área, radar.

6+ KPIs visibles en dashboard.

Actualización en tiempo real desde Redis y PostgreSQL.

5. Redis mejoraro para persistencia de datos proximos a implementar

Cache de métricas y coordinación de microservicios implementada en cms-backend/src/redis.

Advertencias de configuración de Redis registradas (default user does not require password, but a password was supplied) sin afectar funcionamiento.

6. Validaciones y Seguridad

Validación de datos en formularios antes de persistir en DB.

Conexión directa a la base de datos para métricas y administración.

Sesiones y roles protegidos mediante middleware y contextos de autenticación.

8. IA y Predicciones para generacion de Reportes

Microservicio de predicción de burnout

Integración con dashboard de predicciones (PredictionDashboard)

Generación de reportes automáticos con Sugerencias IA + Ajustes Locales mediante cacheo en Redis para mejorar persistencia

9. Para la version movil se actualiza automaticamente con Sync

📖 Referencias

Docker Compose Documentation

Next.js Documentation Proximamente Qwik...

FastAPI Documentation

PostgreSQL Documentation

InfluxDB Documentation

Redis Documentation

```

```

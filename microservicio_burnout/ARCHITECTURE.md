# Arquitectura del Microservicio de Burnout

## Diagrama de Arquitectura (Versión 2.0)

```
<<<<<<< Updated upstream
┌─────────────────────────────────────────────────────────────────┐
│                    MICROSERVICIO DE BURNOUT                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   FastAPI App   │    │  Burnout Model  │    │  Trained     │ │
│  │   (main.py)     │◄──►│ (burnout_model) │◄──►│  Model       │ │
│  │                 │    │                 │    │  (.pkl)      │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│           │                       │                             │
│           │                       │                             │
│           ▼                       ▼                             │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   REST API      │    │  ML Model       │                    │
│  │   Endpoints     │    │  (Gradient      │                    │
│  │                 │    │   Boosting)     │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
=======
┌────────────────────────────────────────────────────────────────────────┐
│                    MICROSERVICIO DE BURNOUT v2.0                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────┐     ┌──────────────────┐     ┌───────────────┐  │
│  │   FastAPI App    │────►│  Burnout Model   │────►│  Data / Model │  │
│  │   (main.py)      │     │ (burnout_model)  │     │     (ML)      │  │
│  └──────────────────┘     └──────────────────┘     └───────────────┘  │
│           │                                                            │
│           ├──────────┬──────────┬──────────┬─────────┐                │
│           ▼          ▼          ▼          ▼         ▼                │
│  ┌─────────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌────────────┐ │
│  │   Metrics   │ │ Alerts  │ │Dashboard│ │Intervention││  REST API  │ │
│  │   Client    │ │ Service │ │ Service │ │  Service  ││  Endpoints │ │
│  │             │ │         │ │         │ │           ││            │ │
│  └─────────────┘ └─────────┘ └─────────┘ └──────────┘ └────────────┘ │
│         │              │           │            │                      │
│         │              └───────────┴────────────┘                      │
│         ▼                          ▼                                   │
│  ┌─────────────┐         ┌──────────────────┐                         │
│  │ CMS Backend │         │  Análisis Burnout│                         │
│  │  (Metrics)  │         │   Completo       │                         │
│  └─────────────┘         └──────────────────┘                         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
>>>>>>> Stashed changes
                                │
                                ▼
                    ┌──────────────────────────┐
                    │   Docker Container       │
                    │   Port: 8001             │
                    │   Python 3.9+            │
                    └──────────────────────────┘
```

## Flujo de Datos

<<<<<<< Updated upstream
1. **Carga del Modelo**: El modelo pre-entrenado se carga desde `models/burnout_model.pkl`
2. **Recepción de Datos**: La API recibe datos del usuario vía HTTP
3. **Preprocesamiento**: Los datos se normalizan usando el scaler guardado
4. **Predicción**: El modelo Gradient Boosting predice probabilidad de burnout
5. **API Response**: Se devuelve JSON con la predicción
=======
### Flujo de Entrenamiento (Inicial)
1. **Entrada de Datos**: Los datos CSV se cargan desde la carpeta `data/`
2. **Preprocesamiento**: Los datos se limpian y normalizan
3. **Entrenamiento**: Se entrena un modelo Gradient Boosting
4. **Persistencia**: El modelo se guarda en `models/burnout_model.pkl`

### Flujo de Análisis (Runtime)
1. **Obtención de Métricas**: MetricsClient obtiene datos del usuario desde cms-backend
2. **Predicción ML**: BurnoutPredictor calcula probabilidad de burnout
3. **Generación de Alerta**: AlertsService evalúa riesgo y genera alertas
4. **Dashboard**: DashboardService crea resumen completo del estado
5. **Intervenciones**: InterventionService genera plan personalizado
6. **API Response**: Se devuelve JSON con análisis completo
>>>>>>> Stashed changes

## Endpoints de la API

### Información y Salud
```
GET  /                           # Información del microservicio
GET  /api/burnout/health         # Estado de salud del servicio
```

### Gestión del Modelo ML
```
POST /api/burnout/train          # Entrenar modelo de ML
GET  /api/burnout/metrics        # Obtener métricas del modelo
```

### Predicción Básica
```
GET  /api/burnout/predict/{id}   # Predicción simple de burnout
POST /api/burnout/predict/{id}   # Predicción con datos personalizados
```

### Análisis Completo (NUEVOS en v2.0)
```
GET  /api/burnout/analyze/{id}          # Análisis completo integrado
GET  /api/burnout/alerts/{id}           # Generación de alertas
GET  /api/burnout/dashboard/{id}        # Resumen de dashboard
GET  /api/burnout/interventions/{id}    # Plan de intervenciones
POST /api/burnout/analyze-custom        # Análisis con métricas manuales
```

## Estructura de Archivos (v2.0)

```
microservicio_burnout/
├── app/
│   ├── main.py                      # API FastAPI principal
│   ├── burnout_model.py             # Modelo ML para predicción
│   ├── AlertsService/               # ⭐ NUEVO: Servicio de alertas
│   │   ├── __init__.py
│   │   └── alerts_service.py
│   ├── DashboardService/            # ⭐ NUEVO: Servicio de dashboard
│   │   ├── __init__.py
│   │   └── dashboard_service.py
│   ├── InterventionService/         # ⭐ NUEVO: Servicio de intervenciones
│   │   ├── __init__.py
│   │   └── intervention_service.py
│   └── clients/                     # ⭐ NUEVO: Clientes HTTP
│       ├── __init__.py
│       └── metrics_client.py        # Cliente para cms-backend
├── tests/                           # ⭐ NUEVO: Tests automatizados
│   ├── __init__.py
<<<<<<< Updated upstream
│   ├── main.py              # API FastAPI
│   └── burnout_model.py     # Clase del modelo ML
├── models/
│   └── burnout_model.pkl    # Modelo entrenado guardado
├── requirements.txt         # Dependencias Python
├── Dockerfile              # Imagen Docker
├── README.md               # Documentación principal
└── ARCHITECTURE.md         # Este archivo
=======
│   ├── test_alerts_service.py
│   ├── test_dashboard_service.py
│   ├── test_intervention_service.py
│   └── test_integration.py
├── models/                          # Modelos ML entrenados
│   └── burnout_model.pkl
├── requirements.txt                 # Dependencias (actualizado)
├── Dockerfile                       # Imagen Docker
├── ARCHITECTURE.md                  # Este archivo
└── README.md                        # Documentación completa
>>>>>>> Stashed changes
```

## Estado del Microservicio

✅ **PRODUCCIÓN LISTA** - El microservicio está completamente funcional y optimizado:

- **Modelo pre-entrenado**: Gradient Boosting con 99.67% de precisión
- **Sin dependencias de datos**: No requiere archivos CSV para funcionar
- **Autocontenido**: Incluye solo archivos esenciales
- **Dockerizado**: Listo para despliegue en contenedores
- **API completa**: 6 endpoints REST documentados

## Tecnologías Utilizadas

- **FastAPI**: Framework web para la API REST
- **scikit-learn**: Machine learning (Gradient Boosting)
- **pandas**: Manipulación y análisis de datos
- **numpy**: Cálculos numéricos
- **joblib**: Persistencia del modelo ML
- **httpx**: Cliente HTTP async para integración con cms-backend
- **pytest**: Framework de testing
- **pytest-asyncio**: Testing de código async
- **Docker**: Contenedorización del servicio
- **uvicorn**: Servidor ASGI de alto rendimiento

## Componentes Principales

### 1. AlertsService
**Propósito**: Detectar y generar alertas de burnout

**Funcionalidades**:
- Evaluación de riesgo basada en probabilidad de burnout
- Clasificación de severidad (low, medium, high, critical)
- Identificación de factores contribuyentes
- Generación de acciones inmediatas
- Determinación de notificación a supervisor

**Umbrales**:
- Low: < 0.5
- Medium: 0.5 - 0.7
- High: 0.7 - 0.85
- Critical: ≥ 0.85

### 2. DashboardService
**Propósito**: Generar resumen completo del estado del empleado

**Funcionalidades**:
- Análisis de métricas clave (estrés, sueño, HRV, etc.)
- Cálculo de scores por categoría:
  - Fisiológico (HRV, pulso, sueño, recuperación)
  - Cognitivo (enfoque, estrés)
  - Bienestar (NPS, aceptación de intervenciones, ausentismo)
  - Carga laboral (reuniones, tiempo de enfoque)
- Identificación de causas principales del riesgo
- Generación de recomendaciones generales
- Visualización de tendencias

### 3. InterventionService
**Propósito**: Crear planes de intervención personalizados

**Funcionalidades**:
- Generación de intervenciones específicas por causa
- Clasificación por categoría:
  - Manejo de estrés
  - Mejora del sueño
  - Ajuste de carga laboral
  - Actividad física
  - Soporte social
  - Ayuda profesional
  - Ambiente de trabajo
  - Estrategias de recuperación
- Organización por timeframe:
  - Immediate (24-48 horas)
  - Short-term (1-2 semanas)
  - Medium-term (1-3 meses)
  - Long-term (3+ meses)
- Plan de acción en fases
- Definición de resultados esperados
- Recomendaciones de seguimiento

### 4. MetricsClient
**Propósito**: Integración con cms-backend

**Funcionalidades**:
- Obtención de métricas del usuario desde endpoints del cms-backend
- Soporte de autenticación JWT
- Transformación de datos al formato del modelo
- Manejo de errores con fallback a métricas por defecto
- Health check del servicio backend

## Integración con CMS Backend

El microservicio se integra con los siguientes endpoints del cms-backend:

```
GET /metrics/realtime  - Métricas en tiempo real
GET /metrics/weekly    - Métricas semanales agregadas
GET /metrics/radar     - Métricas para visualización radar
```

**Autenticación**: JWT Bearer token en header Authorization

**Transformación de datos**: El MetricsClient mapea los campos de la API a los esperados por el modelo ML.

## Flujo de Análisis Completo

```
Usuario (ID) ──►  GET /api/burnout/analyze/{user_id}
                        │
                        ▼
                  MetricsClient
                  Obtener métricas del cms-backend
                        │
                        ▼
                  BurnoutPredictor
                  Predecir probabilidad de burnout
                        │
                        ▼
                  AlertsService
                  ¿Probabilidad > 0.5? → Generar alerta
                        │
                        ▼
                  DashboardService
                  Analizar estado completo
                  - Calcular scores
                  - Identificar causas
                        │
                        ▼
                  InterventionService
                  Generar plan de intervenciones
                  - Basado en causas principales
                  - Organizado por prioridad
                        │
                        ▼
                  Respuesta JSON
                  {
                    prediction: {...},
                    alert: {...},
                    summary: {...},
                    interventions: {...}
                  }
```

## Testing

### Estrategia de Testing

1. **Tests Unitarios**: Cada servicio tiene su propio test suite
   - `test_alerts_service.py`: Tests de AlertsService
   - `test_dashboard_service.py`: Tests de DashboardService
   - `test_intervention_service.py`: Tests de InterventionService

2. **Tests de Integración**: `test_integration.py`
   - Flujo completo de análisis
   - Escenarios de alto, medio y bajo riesgo
   - Consistencia entre servicios

### Ejecutar Tests

```bash
# Todos los tests
pytest tests/ -v

# Tests específicos
pytest tests/test_alerts_service.py -v

# Con cobertura
pytest tests/ --cov=app --cov-report=html
```

## Despliegue

### Docker

El servicio se despliega como contenedor Docker:

```yaml
microservicio-burnout:
  build: ./microservicio_burnout
  ports:
    - "8001:8001"
  environment:
    - CMS_BACKEND_URL=http://cms-backend:3000
  depends_on:
    - cms-backend
```

### Variables de Entorno

- `CMS_BACKEND_URL`: URL del cms-backend (default: http://cms-backend:3000)

## Seguridad

- Autenticación mediante JWT tokens
- Validación de entrada con Pydantic
- Headers CORS configurables
- Sin almacenamiento de datos sensibles

## Rendimiento

- Predicción de burnout: < 100ms
- Análisis completo: < 500ms (sin latencia de red)
- Soporte para múltiples requests concurrentes
- Cache de modelo ML en memoria

## Próximas Mejoras

1. **Persistencia de Alertas**: Guardar historial de alertas en base de datos
2. **Métricas Históricas**: Análisis de tendencias con datos temporales
3. **Notificaciones**: Sistema de envío de alertas por email/SMS
4. **Personalización**: Ajuste de umbrales por organización/rol
5. **Dashboard Web**: Interface visual para explorar análisis
6. **API de Seguimiento**: Endpoints para registrar progreso de intervenciones

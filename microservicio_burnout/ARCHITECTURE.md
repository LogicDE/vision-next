# Arquitectura del Microservicio de Burnout

## Versión 2.0 - Producción

## 📊 Diagrama de Arquitectura

```
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
                                │
                                ▼
                    ┌──────────────────────────┐
                    │   Docker Container       │
                    │   Port: 8001             │
                    │   Python 3.9+            │
                    └──────────────────────────┘
```

## 🔄 Flujo de Datos

### Flujo de Análisis (Runtime)

1. **Obtención de Métricas**: MetricsClient obtiene datos del usuario desde cms-backend
2. **Predicción ML**: BurnoutPredictor calcula probabilidad de burnout
3. **Generación de Alerta**: AlertsService evalúa riesgo y genera alertas si probabilidad ≥ 0.5
4. **Dashboard**: DashboardService crea resumen completo del estado
5. **Intervenciones**: InterventionService genera plan personalizado
6. **API Response**: Se devuelve JSON con análisis completo

## 🌐 Endpoints de la API

### Información y Salud

```
GET  /                           # Información del microservicio
GET  /api/burnout/health         # Estado de salud del servicio
```

### Gestión del Modelo ML

```
POST /api/burnout/train          # Entrenar modelo (si hay datos disponibles)
POST /api/burnout/load-model     # Cargar/recargar modelo manualmente
GET  /api/burnout/metrics        # Obtener métricas del modelo
```

### Predicción Básica

```
GET  /api/burnout/predict/{id}   # Predicción simple de burnout
POST /api/burnout/predict/{id}   # Predicción con datos personalizados
```

### Análisis Completo

```
GET  /api/burnout/analyze/{id}          # Análisis completo integrado
GET  /api/burnout/alerts/{id}           # Solo generación de alertas
GET  /api/burnout/dashboard/{id}        # Solo resumen de dashboard
GET  /api/burnout/interventions/{id}    # Solo plan de intervenciones
POST /api/burnout/analyze-custom        # Análisis con métricas manuales
```

## 📁 Estructura de Archivos

```
microservicio_burnout/
├── app/
│   ├── main.py                      # API FastAPI principal
│   ├── burnout_model.py             # Modelo ML para predicción
│   ├── AlertsService/               # Servicio de alertas
│   │   ├── __init__.py
│   │   └── alerts_service.py
│   ├── DashboardService/            # Servicio de dashboard
│   │   ├── __init__.py
│   │   └── dashboard_service.py
│   ├── InterventionService/         # Servicio de intervenciones
│   │   ├── __init__.py
│   │   └── intervention_service.py
│   └── clients/                     # Clientes HTTP
│       ├── __init__.py
│       └── metrics_client.py        # Cliente para cms-backend
├── models/                          # Modelos ML entrenados
│   └── burnout_model.pkl
├── requirements.txt                 # Dependencias
├── Dockerfile                       # Imagen Docker
├── ARCHITECTURE.md                  # Este archivo
└── README.md                        # Documentación principal
```

## 🛠️ Tecnologías Utilizadas

- **FastAPI**: Framework web para la API REST
- **scikit-learn**: Machine learning (Gradient Boosting)
- **pandas**: Manipulación y análisis de datos
- **numpy**: Cálculos numéricos
- **joblib**: Persistencia del modelo ML
- **httpx**: Cliente HTTP async para integración con cms-backend
- **pydantic**: Validación de datos
- **Docker**: Contenedorización del servicio
- **uvicorn**: Servidor ASGI de alto rendimiento

## 🧩 Componentes Principales

### 1. AlertsService

**Propósito**: Detectar y generar alertas de burnout

**Funcionalidades**:

- Evaluación de riesgo basada en probabilidad de burnout
- Clasificación de severidad (low, medium, high, critical)
- Identificación de factores contribuyentes
- Generación de acciones inmediatas
- Determinación de notificación a supervisor

**Umbrales**:

- Critical: ≥ 0.85
- High: 0.70 - 0.85
- Medium: 0.50 - 0.70
- Low: 0.30 - 0.50

### 2. DashboardService


**Propósito**: Generar resumen completo del estado del empleado

**Funcionalidades**:

- Análisis de métricas clave (estrés, sueño, HRV, pulso, etc.)
- Cálculo de scores por categoría:
  - Fisiológico (HRV, pulso, sueño, recuperación)
  - Cognitivo (enfoque, estrés)
  - Bienestar (NPS, aceptación de intervenciones, ausentismo)
  - Carga laboral (reuniones, tiempo de enfoque)
- Identificación de causas principales del riesgo
- Generación de recomendaciones generales
- Resumen de alertas activas

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
- Plan de acción en 4 fases
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

## 🔗 Integración con CMS Backend

El microservicio se integra con los siguientes endpoints del cms-backend:

```
GET /metrics/realtime  - Métricas en tiempo real
GET /metrics/weekly    - Métricas semanales agregadas
GET /metrics/radar     - Métricas para visualización radar
```

**Autenticación**: JWT Bearer token en header Authorization

**Transformación de datos**: El MetricsClient mapea automáticamente los campos de la API del cms-backend a los 14 campos esperados por el modelo ML.

## 📊 Flujo de Análisis Completo

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
                  - Calcular scores por categoría
                  - Identificar causas principales
                        │
                        ▼
                  InterventionService
                  Generar plan de intervenciones
                  - Basado en causas principales
                  - Organizado por prioridad y timeframe
                        │
                        ▼
                  Respuesta JSON Completa
                  {
                    prediction: {...},
                    alert: {...},
                    summary: {...},
                    interventions: {...}
                  }
```

## 🐳 Despliegue

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
  networks:
    - vision-network
  restart: unless-stopped
```

### Variables de Entorno


| Variable          | Descripción         | Default                   |
| ----------------- | ------------------- | ------------------------- |
| `CMS_BACKEND_URL` | URL del cms-backend | `http://cms-backend:3000` |

## 🔒 Seguridad

- Autenticación mediante JWT tokens
- Validación de entrada con Pydantic
- Headers CORS configurables
- Sin almacenamiento de datos sensibles
- Comunicación segura entre microservicios

## ⚡ Rendimiento

- **Predicción de burnout**: < 100ms
- **Análisis completo**: < 500ms (sin latencia de red)
- **Soporte concurrente**: Múltiples requests simultáneos
- **Cache**: Modelo ML en memoria
- **Optimización**: Código asíncrono con FastAPI

## 📈 Métricas del Servicio

El servicio expone las siguientes métricas:

### Health Check (`/api/burnout/health`)

```json
{
  "status": "healthy",
  "model_loaded": true,
  "message": "Microservicio funcionando correctamente"
}
```

### Model Metrics (`/api/burnout/metrics`)

```json
{
  "cv_accuracy_mean": 0.85,
  "cv_accuracy_std": 0.05,
  "test_accuracy": 0.87,
  "test_precision": 0.83,
  "test_recall": 0.81,
  "test_f1": 0.82
}
```

## 🔄 Ciclo de Vida del Modelo

```
┌─────────────────────────────────────────────────────────────┐
│                   CICLO DE VIDA DEL MODELO                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Entrenamiento (offline)                                │
│     └─ Con datos CSV → burnout_model.pkl                   │
│                                                             │
│  2. Carga al inicio (startup event)                        │
│     └─ Modelo cargado en memoria                           │
│                                                             │
│  3. Inferencia (runtime)                                   │
│     └─ Predicciones en tiempo real                         │
│                                                             │
│  4. Recarga (opcional)                                     │
│     └─ POST /api/burnout/load-model                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Casos de Uso

### 1. Dashboard de Salud del Empleado

```
Frontend → GET /api/burnout/dashboard/{user_id}
        → Muestra panel completo con métricas y scores
```

### 2. Sistema de Alertas Temprano

```
Scheduler → GET /api/burnout/alerts/{user_id}
         → Si hay alerta → Notificar a RRHH/Supervisor
```

### 3. Generación de Plan de Intervención

```
Manager → GET /api/burnout/interventions/{user_id}
       → Plan detallado de acciones por prioridad
```

### 4. Análisis Completo para Evaluación

```
RRHH → GET /api/burnout/analyze/{user_id}
    → Informe completo: predicción + alertas + dashboard + intervenciones
```

## 📊 Tipos de Datos

### BurnoutPrediction
```typescript
{
  burnout_probability: number;      // 0-1
  burnout_prediction: 0 | 1;        // Binario
  burnout_level: string;            // none, low, moderate, high, severe
  risk_category: string;            // Descripción textual

}
```

### Alert

```typescript
{
  alert_id: string;                 // Identificador único
  severity: string;                 // low, medium, high, critical
  message: string;                  // Mensaje descriptivo
  immediate_actions: string[];      // Acciones recomendadas
  contributing_factors: Factor[];   // Factores de riesgo
  requires_intervention: boolean;   // Requiere acción
  notify_manager: boolean;          // Notificar supervisor
}
```

### DashboardSummary

```typescript
{
  overview: {
    burnout_level: string;
    burnout_probability: number;
    health_status: string;
    risk_category: string;
  };
  key_metrics: Metric[];
  category_scores: {
    physiological: Score;
    cognitive: Score;
    wellbeing: Score;
    workload: Score;
  };
  main_causes: Cause[];
  recommendations: string[];
}
```

### Interventions

```typescript
{
  total_interventions: number;
  interventions_by_timeframe: {
    immediate: Intervention[];
    short_term: Intervention[];
    medium_term: Intervention[];
    long_term: Intervention[];
  };
  action_plan: {
    phase_1_immediate: Phase;
    phase_2_short_term: Phase;
    phase_3_medium_term: Phase;
    phase_4_long_term: Phase;
  };
  follow_up_recommendations: FollowUp;
}
```

## 🚀 Roadmap Futuro

1. **Persistencia de Alertas**: Guardar historial en base de datos
2. **Análisis de Tendencias**: Métricas históricas y evolución temporal
3. **Notificaciones Push**: Sistema de envío de alertas por email/SMS
4. **Personalización**: Ajuste de umbrales por organización/rol
5. **Dashboard Web**: Interface visual integrada
6. **API de Seguimiento**: Endpoints para registrar progreso de intervenciones
7. **Machine Learning Avanzado**: Modelos de deep learning y predicción temporal

## 📝 Notas Técnicas

- **Modelo ML**: Gradient Boosting Classifier (scikit-learn)
- **Características**: 14 inputs (fisiológicas, cognitivas, comportamentales)
- **Output**: Probabilidad binaria de burnout
- **Normalización**: StandardScaler para todas las features
- **Persistencia**: joblib para serialización del modelo

## 🔍 Monitoreo y Logs

El servicio genera logs para:

- Inicio y carga del modelo
- Requests a endpoints
- Errores de conexión con cms-backend
- Fallbacks a métricas por defecto
- Generación de alertas críticas

Recomendación: Configurar agregación de logs (ELK, Splunk, etc.) para producción.

## 📚 Referencias

- **FastAPI**: https://fastapi.tiangolo.com/
- **scikit-learn**: https://scikit-learn.org/
- **Pydantic**: https://pydantic-docs.helpmanual.io/
- **Docker**: https://docs.docker.com/

---

**Versión**: 2.0.0  
**Estado**: Producción  
**Última actualización**: Noviembre 2025

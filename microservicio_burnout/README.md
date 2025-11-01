<<<<<<< Updated upstream
# Microservicio de Predicción de Burnout

Este microservicio utiliza machine learning para predecir la probabilidad de burnout en empleados basándose en datos biométricos y de comportamiento.

## 🚀 Estado del Proyecto

✅ **PRODUCCIÓN LISTA** - El microservicio está completamente funcional y optimizado para uso en producción.

## Características

- **Modelo**: Gradient Boosting Classifier pre-entrenado
- **Precisión**: 99.67% (validación cruzada)
- **API REST**: 6 endpoints documentados
- **Autocontenido**: No requiere archivos de datos externos
- **Dockerizado**: Listo para despliegue en contenedores

## Estructura del Proyecto
=======
# Microservicio de Burnout

## Descripción

Microservicio completo para análisis de burnout que integra:
- **Predicción de burnout** mediante Machine Learning (Gradient Boosting)
- **Sistema de alertas** automático basado en umbrales
- **Dashboard** con resumen completo del estado del empleado
- **Generación de intervenciones** personalizadas

## Arquitectura
>>>>>>> Stashed changes

```
microservicio_burnout/
├── app/
<<<<<<< Updated upstream
│   ├── __init__.py
│   ├── main.py              # API FastAPI
│   └── burnout_model.py     # Clase del modelo ML
├── models/
│   └── burnout_model.pkl    # Modelo entrenado guardado
├── requirements.txt         # Dependencias Python
├── Dockerfile              # Imagen Docker
├── README.md               # Este archivo
└── ARCHITECTURE.md         # Documentación técnica
```

## Instalación y Uso

### Opción 1: Ejecución Directa

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Ejecutar el microservicio
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Opción 2: Docker

```bash
# Construir imagen
docker build -t burnout-microservice .

# Ejecutar contenedor
docker run -p 8001:8001 burnout-microservice
```

### Opción 3: Docker Compose

```bash
# Ejecutar con docker-compose
docker-compose up burnout-microservice
```

**Nota**: El modelo ya está pre-entrenado y listo para usar. No es necesario entrenarlo nuevamente.
=======
│   ├── main.py                    # API FastAPI principal
│   ├── burnout_model.py           # Modelo de ML para predicción
│   ├── AlertsService/             # Servicio de generación de alertas
│   │   ├── __init__.py
│   │   └── alerts_service.py
│   ├── DashboardService/          # Servicio de resumen y dashboard
│   │   ├── __init__.py
│   │   └── dashboard_service.py
│   ├── InterventionService/       # Servicio de intervenciones
│   │   ├── __init__.py
│   │   └── intervention_service.py
│   └── clients/                   # Clientes HTTP
│       ├── __init__.py
│       └── metrics_client.py      # Cliente para cms-backend
├── tests/                         # Tests unitarios y de integración
│   ├── test_alerts_service.py
│   ├── test_dashboard_service.py
│   ├── test_intervention_service.py
│   └── test_integration.py
├── models/                        # Modelos ML entrenados
│   └── burnout_model.pkl
├── requirements.txt               # Dependencias Python
├── Dockerfile                     # Imagen Docker
└── README.md                      # Este archivo
```

## Características Principales

### 1. AlertsService
- Detecta riesgo de burnout basado en probabilidad y métricas
- Genera alertas con niveles de severidad: low, medium, high, critical
- Identifica factores contribuyentes específicos
- Genera acciones inmediatas recomendadas
- Determina necesidad de notificación a supervisor

### 2. DashboardService
- Genera resumen global del estado del empleado
- Analiza métricas fisiológicas, cognitivas y comportamentales
- Calcula scores por categoría (fisiológico, cognitivo, bienestar, carga laboral)
- Identifica principales causas del riesgo
- Genera recomendaciones generales

### 3. InterventionService
- Crea planes de intervención personalizados
- Organiza intervenciones por marco temporal (inmediato, corto, medio, largo plazo)
- Clasifica por prioridad (crítica, alta, media, baja)
- Genera plan de acción en fases
- Define resultados esperados y métricas de seguimiento

### 4. Integración con CMS Backend
- Cliente HTTP para obtener métricas del servicio `metrics` en cms-backend
- Soporta autenticación JWT
- Manejo de errores con métricas por defecto
>>>>>>> Stashed changes

## API Endpoints

### Información General
- `GET /` - Información del microservicio
<<<<<<< Updated upstream
- `GET /api/burnout/health` - Estado de salud

### Modelo
- `GET /api/burnout/metrics` - Obtener métricas del modelo

### Predicciones
- `GET /api/burnout/predict/{user_id}` - Predecir burnout (datos simulados)
- `POST /api/burnout/predict/{user_id}` - Predecir burnout (datos personalizados)

## Ejemplo de Uso

### Predicción con datos simulados
```bash
curl http://localhost:8001/api/burnout/predict/123
```

### Predicción con datos personalizados
```bash
curl -X POST "http://localhost:8001/api/burnout/predict/123" \
     -H "Content-Type: application/json" \
     -d '{
       "time_to_recover": 30.92,
       "high_stress_prevalence_perc": 0.0,
       "median_hrv": 44.01,
       "avg_pulse": 72.40,
       "sleep_score": 79.74,
       "media_hrv": 44.01,
       "eda_peaks": 14.28,
       "time_to_recover_hrv": 30.92,
       "weekly_hours_in_meetings": 17.32,
       "time_on_focus_blocks": 4.84,
       "absenteesim_days": 0.97,
       "high_stress_prevalence": 0.0,
       "nps_score": 8.34,
       "intervention_acceptance_rate": 0.37
     }'
```

### Respuesta
```json
{
  "user_id": 123,
  "burnout_probability": 0.76,
  "burnout_prediction": 1,
  "model_used": "GradientBoostingClassifier"
}
```

## Variables de Entrada

El modelo utiliza las siguientes variables para la predicción:

- `time_to_recover`: Tiempo de recuperación
- `high_stress_prevalence_perc`: Porcentaje de prevalencia de alto estrés
- `median_hrv`: HRV mediano
- `avg_pulse`: Pulso promedio
- `sleep_score`: Puntuación de sueño
- `media_hrv`: HRV media
- `eda_peaks`: Picos EDA
- `time_to_recover_hrv`: Tiempo de recuperación HRV
- `weekly_hours_in_meetings`: Horas semanales en reuniones
- `time_on_focus_blocks`: Tiempo en bloques de enfoque
- `absenteesim_days`: Días de ausentismo
- `high_stress_prevalence`: Prevalencia de alto estrés
- `nps_score`: Puntuación NPS
- `intervention_acceptance_rate`: Tasa de aceptación de intervenciones

## Métricas del Modelo

- **Precisión CV**: 99.67% (validación cruzada 10-fold)
- **Desviación estándar**: 1.00%
- **Precisión test**: 98.89%
- **Precisión**: 100%
- **Recall**: 92.31%
- **F1-Score**: 96%

## Notas Técnicas

- El modelo está basado en el notebook "P P2 601270.ipynb"
- Utiliza Gradient Boosting Classifier como algoritmo principal
- Los datos se normalizan usando StandardScaler
- El modelo se guarda en formato pickle para persistencia
- La variable objetivo es binaria: 1 si burnout_risk_score > 0.5, 0 en caso contrario
- **Estado**: Pre-entrenado y listo para producción
- **Dependencias**: No requiere archivos de datos externos

## 🎯 Inicio Rápido

```bash
# Clonar y ejecutar
cd microservicio_burnout
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001

# Probar
curl http://localhost:8001/api/burnout/predict/123
```

¡El microservicio está listo para usar! 🚀
=======
- `GET /api/burnout/health` - Health check

### Gestión del Modelo
- `POST /api/burnout/train` - Entrenar modelo
- `GET /api/burnout/metrics` - Métricas del modelo

### Predicción
- `GET /api/burnout/predict/{user_id}` - Predicción simple
- `POST /api/burnout/predict/{user_id}` - Predicción con datos personalizados

### Análisis Completo (NUEVOS)
- `GET /api/burnout/analyze/{user_id}` - Análisis completo integrando todos los servicios
- `GET /api/burnout/alerts/{user_id}` - Solo alertas
- `GET /api/burnout/dashboard/{user_id}` - Solo dashboard
- `GET /api/burnout/interventions/{user_id}` - Solo intervenciones
- `POST /api/burnout/analyze-custom` - Análisis con métricas manuales

## Instalación y Uso

### Requisitos
- Python 3.9+
- pip

### Instalación

```bash
cd microservicio_burnout
pip install -r requirements.txt
```

### Ejecutar el servicio

```bash
cd microservicio_burnout
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

O con Docker:

```bash
docker-compose up microservicio-burnout
```

### Variables de Entorno

- `CMS_BACKEND_URL` - URL del cms-backend (default: http://cms-backend:3000)

## Uso de la API

### Ejemplo: Análisis Completo

```bash
curl -X GET "http://localhost:8001/api/burnout/analyze/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Respuesta:
```json
{
  "user_id": 123,
  "generated_at": "2025-11-01T10:30:00",
  "prediction": {
    "burnout_probability": 0.65,
    "burnout_prediction": 1,
    "burnout_level": "moderate",
    "risk_category": "Riesgo Moderado"
  },
  "alert": {
    "alert_id": "ALERT-123-20251101103000",
    "severity": "medium",
    "message": "⚠️ ALERTA MEDIA: ...",
    "immediate_actions": [...],
    "contributing_factors": [...]
  },
  "summary": {
    "overview": {...},
    "key_metrics": [...],
    "category_scores": {...},
    "main_causes": [...],
    "recommendations": [...]
  },
  "interventions": {
    "total_interventions": 12,
    "interventions_by_timeframe": {...},
    "action_plan": {...},
    "follow_up_recommendations": {...}
  }
}
```

### Ejemplo: Solo Alertas

```bash
curl -X GET "http://localhost:8001/api/burnout/alerts/123"
```

### Ejemplo: Con Métricas Personalizadas

```bash
curl -X POST "http://localhost:8001/api/burnout/analyze-custom?user_id=123" \
  -H "Content-Type: application/json" \
  -d '{
    "time_to_recover": 45.0,
    "high_stress_prevalence_perc": 35.0,
    "median_hrv": 35.0,
    "avg_pulse": 80.0,
    "sleep_score": 60.0,
    "media_hrv": 35.0,
    "eda_peaks": 18.0,
    "time_to_recover_hrv": 45.0,
    "weekly_hours_in_meetings": 28.0,
    "time_on_focus_blocks": 3.0,
    "absenteesim_days": 1.5,
    "high_stress_prevalence": 0.30,
    "nps_score": 6.5,
    "intervention_acceptance_rate": 0.45
  }'
```

## Testing

### Ejecutar todos los tests

```bash
cd microservicio_burnout
pytest tests/ -v
```

### Ejecutar tests específicos

```bash
# Tests de AlertsService
pytest tests/test_alerts_service.py -v

# Tests de DashboardService
pytest tests/test_dashboard_service.py -v

# Tests de InterventionService
pytest tests/test_intervention_service.py -v

# Tests de integración
pytest tests/test_integration.py -v
```

### Cobertura de tests

```bash
pytest tests/ --cov=app --cov-report=html
```

## Flujo de Análisis

1. **Obtención de Métricas**
   - Se obtienen las métricas del usuario desde cms-backend/metrics
   - O se proporcionan manualmente para testing

2. **Predicción de Burnout**
   - El modelo ML analiza las métricas
   - Genera probabilidad de burnout (0-1)
   - Clasifica como burnout (1) o no burnout (0)

3. **Generación de Alerta**
   - Si probabilidad > 0.5, se genera alerta
   - Se determina severidad (low/medium/high/critical)
   - Se identifican factores contribuyentes
   - Se generan acciones inmediatas

4. **Creación de Dashboard**
   - Se analiza el estado general del empleado
   - Se calculan scores por categoría
   - Se identifican causas principales
   - Se generan recomendaciones

5. **Generación de Intervenciones**
   - Se crean intervenciones específicas para cada causa
   - Se organizan por timeframe y prioridad
   - Se genera plan de acción en fases
   - Se definen métricas de seguimiento

## Integración con el Sistema

### Desde el Frontend

```javascript
// Obtener análisis completo
const response = await fetch(
  `http://localhost:8001/api/burnout/analyze/${userId}`,
  {
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    }
  }
);
const analysis = await response.json();
```

### Desde el Backend (NestJS)

```typescript
import { HttpService } from '@nestjs/axios';

async getBurnoutAnalysis(userId: number) {
  const response = await this.httpService.get(
    `http://microservicio-burnout:8001/api/burnout/analyze/${userId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  ).toPromise();
  
  return response.data;
}
```

## Métricas Requeridas

El servicio espera las siguientes métricas del usuario:

### Métricas Fisiológicas
- `median_hrv` - Variabilidad cardíaca mediana (ms)
- `avg_pulse` - Pulso promedio (bpm)
- `sleep_score` - Puntuación de calidad del sueño (0-100)
- `time_to_recover` - Tiempo de recuperación (minutos)
- `eda_peaks` - Picos de actividad electrodérmica

### Métricas de Estrés
- `high_stress_prevalence_perc` - Porcentaje de tiempo en estrés alto
- `high_stress_prevalence` - Prevalencia de estrés alto (0-1)

### Métricas de Trabajo
- `weekly_hours_in_meetings` - Horas semanales en reuniones
- `time_on_focus_blocks` - Tiempo diario en bloques de enfoque (horas)
- `absenteesim_days` - Días de ausentismo

### Métricas de Satisfacción
- `nps_score` - Net Promoter Score (0-10)
- `intervention_acceptance_rate` - Tasa de aceptación de intervenciones (0-1)

## Desarrollo

### Agregar nuevas intervenciones

Edita `app/InterventionService/intervention_service.py` y agrega métodos para nuevos tipos de intervención:

```python
def _interventions_new_type(self, metrics, severity):
    return [
        {
            "id": "NEW-001",
            "category": "nueva_categoria",
            "priority": "high",
            "timeframe": "immediate",
            "title": "Título de la intervención",
            "description": "Descripción detallada",
            "action_steps": [
                "Paso 1",
                "Paso 2"
            ],
            "expected_benefit": "Beneficio esperado",
            "duration": "1 semana"
        }
    ]
```

### Agregar nuevos tipos de alerta

Edita `app/AlertsService/alerts_service.py` y modifica el enum `AlertType`:

```python
class AlertType(str, Enum):
    NUEVO_TIPO = "nuevo_tipo"
```

## Solución de Problemas

### Error: "Modelo no disponible"
- Entrenar el modelo: `curl -X POST http://localhost:8001/api/burnout/train`
- O colocar un modelo pre-entrenado en `models/burnout_model.pkl`

### Error de conexión con cms-backend
- Verificar que cms-backend está corriendo
- Verificar URL en variable de entorno `CMS_BACKEND_URL`
- El servicio continuará funcionando con métricas por defecto

### Tests fallan
- Instalar dependencias de test: `pip install pytest pytest-asyncio`
- Verificar que todos los módulos están instalados

## Licencia

Proyecto académico - Universidad [Nombre]

## Contacto

Para preguntas o soporte, contactar al equipo de desarrollo.

>>>>>>> Stashed changes

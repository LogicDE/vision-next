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

```
microservicio_burnout/
├── app/
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

## API Endpoints

### Información General
- `GET /` - Información del microservicio
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

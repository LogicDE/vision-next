# Microservicio de Predicción de Burnout

Este microservicio utiliza machine learning para predecir la probabilidad de burnout en empleados basándose en datos biométricos y de comportamiento.

## Características

- **Modelo**: Gradient Boosting Classifier (mejor rendimiento según validación cruzada)
- **Precisión**: ~80.6% (validación cruzada)
- **API REST**: Endpoints para predicción y métricas
- **Datos**: Basado en datasets de burnout, estrés y productividad

## Estructura del Proyecto

```
microservicio_burnout/
├── app/
│   ├── main.py              # API FastAPI
│   └── burnout_model.py     # Modelo de ML
├── data/                    # Datos CSV
├── models/                  # Modelos entrenados
├── requirements.txt         # Dependencias Python
├── Dockerfile              # Imagen Docker
├── train_model.py          # Script de entrenamiento
└── README.md               # Este archivo
```

## Instalación y Uso

### 1. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 2. Entrenar el modelo

```bash
python train_model.py
```

### 3. Ejecutar el microservicio

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### 4. Usar Docker

```bash
# Construir imagen
docker build -t burnout-microservice .

# Ejecutar contenedor
docker run -p 8001:8001 burnout-microservice
```

## API Endpoints

### Información General
- `GET /` - Información del microservicio
- `GET /api/burnout/health` - Estado de salud

### Modelo
- `POST /api/burnout/train` - Entrenar modelo
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

- **Precisión CV**: ~80.6% (validación cruzada 10-fold)
- **Desviación estándar**: ~0.9%
- **Precisión test**: ~79.7%
- **Recall**: Variable según el threshold
- **F1-Score**: Variable según el threshold

## Notas Técnicas

- El modelo está basado en el notebook "P P2 601270.ipynb"
- Utiliza Gradient Boosting Classifier como algoritmo principal
- Los datos se normalizan usando StandardScaler
- El modelo se guarda en formato pickle para persistencia
- La variable objetivo es binaria: 1 si burnout_risk_score > 0.5, 0 en caso contrario

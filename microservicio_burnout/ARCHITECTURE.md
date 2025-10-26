# Arquitectura del Microservicio de Burnout

## Diagrama de Arquitectura

```
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
                                │
                                ▼
                    ┌─────────────────────────┐
                    │     Docker Container    │
                    │     Port: 8001          │
                    └─────────────────────────┘
```

## Flujo de Datos

1. **Carga del Modelo**: El modelo pre-entrenado se carga desde `models/burnout_model.pkl`
2. **Recepción de Datos**: La API recibe datos del usuario vía HTTP
3. **Preprocesamiento**: Los datos se normalizan usando el scaler guardado
4. **Predicción**: El modelo Gradient Boosting predice probabilidad de burnout
5. **API Response**: Se devuelve JSON con la predicción

## Endpoints de la API

```
GET  /                           # Información del microservicio
GET  /api/burnout/health         # Estado de salud
POST /api/burnout/train          # Entrenar modelo
GET  /api/burnout/metrics        # Obtener métricas
GET  /api/burnout/predict/{id}   # Predicción simple
POST /api/burnout/predict/{id}   # Predicción con datos personalizados
```

## Estructura de Archivos

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
├── README.md               # Documentación principal
└── ARCHITECTURE.md         # Este archivo
```

## Estado del Microservicio

✅ **PRODUCCIÓN LISTA** - El microservicio está completamente funcional y optimizado:

- **Modelo pre-entrenado**: Gradient Boosting con 99.67% de precisión
- **Sin dependencias de datos**: No requiere archivos CSV para funcionar
- **Autocontenido**: Incluye solo archivos esenciales
- **Dockerizado**: Listo para despliegue en contenedores
- **API completa**: 6 endpoints REST documentados

## Tecnologías Utilizadas

- **FastAPI**: Framework web para la API
- **scikit-learn**: Machine learning
- **pandas**: Manipulación de datos
- **numpy**: Cálculos numéricos
- **joblib**: Persistencia del modelo
- **Docker**: Contenedorización
- **uvicorn**: Servidor ASGI

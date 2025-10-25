# Arquitectura del Microservicio de Burnout

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                    MICROSERVICIO DE BURNOUT                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   FastAPI App   │    │  Burnout Model  │    │   Data CSV   │ │
│  │   (main.py)     │◄──►│ (burnout_model) │◄──►│   (data/)    │ │
│  │                 │    │                 │    │              │ │
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

1. **Entrada de Datos**: Los datos CSV se cargan desde la carpeta `data/`
2. **Preprocesamiento**: Los datos se limpian y normalizan
3. **Entrenamiento**: Se entrena un modelo Gradient Boosting
4. **Predicción**: El modelo predice probabilidad de burnout
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
│   └── burnout_model.py     # Modelo ML
├── data/                    # Datos CSV
├── models/                  # Modelos entrenados
├── requirements.txt         # Dependencias
├── Dockerfile              # Imagen Docker
├── train_model.py          # Script entrenamiento
├── start.py                # Script inicio rápido
├── test_api.py             # Pruebas API
└── README.md               # Documentación
```

## Tecnologías Utilizadas

- **FastAPI**: Framework web para la API
- **scikit-learn**: Machine learning
- **pandas**: Manipulación de datos
- **numpy**: Cálculos numéricos
- **joblib**: Persistencia del modelo
- **Docker**: Contenedorización
- **uvicorn**: Servidor ASGI

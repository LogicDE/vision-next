"""
Microservicio de predicción de burnout
API REST para predecir probabilidad de burnout usando machine learning
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import os
import sys

# Agregar el directorio padre al path para importar el modelo
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.burnout_model import BurnoutPredictor

# Crear instancia de FastAPI
app = FastAPI(
    title="Microservicio de Predicción de Burnout",
    description="API para predecir probabilidad de burnout usando machine learning",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instancia global del predictor
burnout_predictor = BurnoutPredictor()

# Modelos Pydantic para validación de datos
class UserData(BaseModel):
    time_to_recover: float
    high_stress_prevalence_perc: float
    median_hrv: float
    avg_pulse: float
    sleep_score: float
    media_hrv: float
    eda_peaks: float
    time_to_recover_hrv: float
    weekly_hours_in_meetings: float
    time_on_focus_blocks: float
    absenteesim_days: float
    high_stress_prevalence: float
    nps_score: float
    intervention_acceptance_rate: float

class BurnoutPrediction(BaseModel):
    user_id: int
    burnout_probability: float
    burnout_prediction: int
    model_used: str

class ModelMetrics(BaseModel):
    cv_accuracy_mean: float
    cv_accuracy_std: float
    test_accuracy: float
    test_precision: float
    test_recall: float
    test_f1: float

# Endpoint raíz
@app.get("/")
async def root():
    return {
        "message": "Microservicio de Predicción de Burnout funcionando",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/api/burnout/predict/{user_id}",
            "metrics": "/api/burnout/metrics",
            "train": "/api/burnout/train",
            "health": "/api/burnout/health"
        }
    }

# Endpoint de salud
@app.get("/api/burnout/health")
async def health_check():
    """Verificar el estado del microservicio"""
    return {
        "status": "healthy",
        "model_loaded": burnout_predictor.model is not None,
        "message": "Microservicio funcionando correctamente"
    }

# Endpoint para entrenar el modelo
@app.post("/api/burnout/train")
async def train_model():
    """Entrenar el modelo de predicción de burnout"""
    try:
        metrics = burnout_predictor.train_model()
        burnout_predictor.save_model()
        
        return {
            "message": "Modelo entrenado exitosamente",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error entrenando el modelo: {str(e)}")

# Endpoint para obtener métricas del modelo
@app.get("/api/burnout/metrics", response_model=ModelMetrics)
async def get_model_metrics():
    """Obtener métricas del modelo entrenado"""
    if burnout_predictor.model is None:
        raise HTTPException(status_code=404, detail="Modelo no entrenado. Entrena el modelo primero.")
    
    metrics = burnout_predictor.get_model_metrics()
    return ModelMetrics(**metrics)

# Endpoint principal de predicción
@app.get("/api/burnout/predict/{user_id}", response_model=BurnoutPrediction)
async def predict_burnout(user_id: int):
    """
    Predecir probabilidad de burnout para un usuario específico
    
    Args:
        user_id: ID del usuario para el cual predecir burnout
        
    Returns:
        Predicción de burnout con probabilidad y modelo utilizado
    """
    if burnout_predictor.model is None:
        raise HTTPException(status_code=404, detail="Modelo no entrenado. Entrena el modelo primero.")
    
    try:
        # Simular datos del usuario (en un caso real, estos vendrían de una base de datos)
        # Basado en los datos de ejemplo del dataset
        user_data = {
            'time_to_recover': 30.92,
            'high_stress_prevalence_perc': 0.0,
            'median_hrv': 44.01,
            'avg_pulse': 72.40,
            'sleep_score': 79.74,
            'media_hrv': 44.01,
            'eda_peaks': 14.28,
            'time_to_recover_hrv': 30.92,
            'weekly_hours_in_meetings': 17.32,
            'time_on_focus_blocks': 4.84,
            'absenteesim_days': 0.97,
            'high_stress_prevalence': 0.0,
            'nps_score': 8.34,
            'intervention_acceptance_rate': 0.37
        }
        
        # Hacer predicción
        prediction_result = burnout_predictor.predict_burnout(user_data)
        
        return BurnoutPrediction(
            user_id=user_id,
            burnout_probability=prediction_result['burnout_probability'],
            burnout_prediction=prediction_result['burnout_prediction'],
            model_used=prediction_result['model_used']
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la predicción: {str(e)}")

# Endpoint para predicción con datos personalizados
@app.post("/api/burnout/predict/{user_id}", response_model=BurnoutPrediction)
async def predict_burnout_custom(user_id: int, user_data: UserData):
    """
    Predecir probabilidad de burnout con datos personalizados del usuario
    
    Args:
        user_id: ID del usuario
        user_data: Datos específicos del usuario
        
    Returns:
        Predicción de burnout con probabilidad y modelo utilizado
    """
    if burnout_predictor.model is None:
        raise HTTPException(status_code=404, detail="Modelo no entrenado. Entrena el modelo primero.")
    
    try:
        # Convertir datos Pydantic a diccionario
        user_data_dict = user_data.dict()
        
        # Hacer predicción
        prediction_result = burnout_predictor.predict_burnout(user_data_dict)
        
        return BurnoutPrediction(
            user_id=user_id,
            burnout_probability=prediction_result['burnout_probability'],
            burnout_prediction=prediction_result['burnout_prediction'],
            model_used=prediction_result['model_used']
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la predicción: {str(e)}")

# Cargar modelo al iniciar la aplicación
@app.on_event("startup")
async def startup_event():
    """Cargar modelo al iniciar la aplicación"""
    model_path = "models/burnout_model.pkl"
    if os.path.exists(model_path):
        try:
            burnout_predictor.load_model(model_path)
            print("Modelo cargado exitosamente al iniciar la aplicación")
        except Exception as e:
            print(f"Error cargando modelo: {e}")
            print("El modelo se entrenará cuando se llame al endpoint /api/burnout/train")
    else:
        print("Modelo no encontrado. Entrena el modelo llamando a /api/burnout/train")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

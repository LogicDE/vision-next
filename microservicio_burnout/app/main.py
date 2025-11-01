"""
Microservicio de predicción de burnout
API REST para predecir probabilidad de burnout usando machine learning

Este servicio integra:
- Predicción de burnout mediante ML
- Sistema de alertas automáticas
- Dashboard de estado del empleado
- Generación de intervenciones personalizadas
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import os
import sys

# Agregar el directorio padre al path para importar el modelo
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.burnout_model import BurnoutPredictor
from app.AlertsService import AlertsService
from app.DashboardService import DashboardService
from app.InterventionService import InterventionService
from app.clients import MetricsClient

# Crear instancia de FastAPI
app = FastAPI(
    title="Microservicio de Predicción de Burnout",
    description="API completa para predicción de burnout, alertas, dashboard e intervenciones",
    version="2.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instancias globales de servicios
burnout_predictor = BurnoutPredictor()
alerts_service = AlertsService()
dashboard_service = DashboardService()
intervention_service = InterventionService()
metrics_client = MetricsClient()

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

class BurnoutAnalysis(BaseModel):
    """Análisis completo de burnout con alertas e intervenciones"""
    user_id: int
    burnout_probability: float
    burnout_prediction: int
    burnout_level: str
    alert: Optional[Dict[str, Any]]
    summary: Dict[str, Any]
    interventions: Dict[str, Any]
    generated_at: str

class AlertResponse(BaseModel):
    """Respuesta de alerta generada"""
    user_id: int
    has_alert: bool
    alert: Optional[Dict[str, Any]]

class DashboardResponse(BaseModel):
    """Respuesta de dashboard del empleado"""
    user_id: int
    summary: Dict[str, Any]

class InterventionResponse(BaseModel):
    """Respuesta de plan de intervenciones"""
    user_id: int
    interventions: Dict[str, Any]

# Endpoint raíz
@app.get("/")
async def root():
    return {
        "message": "Microservicio de Predicción de Burnout funcionando",
        "version": "2.0.0",
        "description": "Sistema completo de análisis de burnout con ML, alertas e intervenciones",
        "services": {
            "prediction": "Predicción de probabilidad de burnout mediante ML",
            "alerts": "Sistema automático de generación de alertas",
            "dashboard": "Resumen completo del estado del empleado",
            "interventions": "Generación de planes de intervención personalizados"
        },
        "endpoints": {
            "health": "/api/burnout/health",
            "train": "/api/burnout/train",
            "metrics": "/api/burnout/metrics",
            "predict": "/api/burnout/predict/{user_id}",
            "analyze": "/api/burnout/analyze/{user_id}",
            "alerts": "/api/burnout/alerts/{user_id}",
            "dashboard": "/api/burnout/dashboard/{user_id}",
            "interventions": "/api/burnout/interventions/{user_id}"
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

# Endpoint para cargar modelo manualmente
@app.post("/api/burnout/load-model")
async def load_model_manually():
    """Cargar o recargar el modelo manualmente"""
    model_path = "models/burnout_model.pkl"
    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail="Modelo no encontrado en models/burnout_model.pkl")
    
    try:
        burnout_predictor.load_model(model_path)
        return {
            "message": "Modelo cargado exitosamente",
            "model_loaded": True,
            "model_path": model_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cargando modelo: {str(e)}")

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

# ============================================================================
# NUEVOS ENDPOINTS - ANÁLISIS COMPLETO, ALERTAS, DASHBOARD E INTERVENCIONES
# ============================================================================

@app.get("/api/burnout/analyze/{user_id}")
async def analyze_burnout(
    user_id: int,
    authorization: Optional[str] = Header(None)
):
    """
    Análisis completo de burnout integrando todos los servicios
    
    Este endpoint:
    1. Obtiene métricas del usuario desde cms-backend
    2. Predice probabilidad de burnout
    3. Genera alertas si corresponde
    4. Crea resumen de dashboard
    5. Genera plan de intervenciones
    
    Args:
        user_id: ID del usuario para analizar
        authorization: Token JWT opcional para autenticación
        
    Returns:
        Análisis completo de burnout con todos los componentes
    """
    if burnout_predictor.model is None:
        raise HTTPException(
            status_code=503, 
            detail="Modelo no disponible. Entrena el modelo llamando a /api/burnout/train"
        )
    
    try:
        # Extraer token si existe
        auth_token = None
        if authorization and authorization.startswith("Bearer "):
            auth_token = authorization.replace("Bearer ", "")
        
        # 1. Obtener métricas del usuario desde cms-backend
        user_metrics = await metrics_client.get_user_metrics(user_id, auth_token)
        
        # 2. Predecir burnout
        prediction_result = burnout_predictor.predict_burnout(user_metrics)
        burnout_probability = prediction_result['burnout_probability']
        
        # 3. Generar alerta si corresponde
        alert = alerts_service.generate_alert(
            user_id=user_id,
            burnout_probability=burnout_probability,
            user_metrics=user_metrics
        )
        
        # 4. Generar resumen de dashboard
        alerts_list = [alert] if alert else []
        summary = dashboard_service.generate_summary(
            user_id=user_id,
            user_data={},
            burnout_probability=burnout_probability,
            user_metrics=user_metrics,
            alerts=alerts_list
        )
        
        # 5. Generar plan de intervenciones
        main_causes = summary.get('main_causes', [])
        interventions = intervention_service.generate_interventions(
            user_id=user_id,
            burnout_probability=burnout_probability,
            user_metrics=user_metrics,
            main_causes=main_causes,
            alerts=alerts_list
        )
        
        # Construir respuesta completa
        from datetime import datetime
        
        return {
            "user_id": user_id,
            "generated_at": datetime.now().isoformat(),
            "prediction": {
                "burnout_probability": round(burnout_probability, 3),
                "burnout_prediction": prediction_result['burnout_prediction'],
                "burnout_level": summary['overview']['burnout_level'],
                "risk_category": summary['overview']['risk_category']
            },
            "alert": alert,
            "summary": summary,
            "interventions": interventions,
            "metrics": user_metrics
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error en el análisis de burnout: {str(e)}"
        )

@app.get("/api/burnout/alerts/{user_id}")
async def get_alerts(
    user_id: int,
    authorization: Optional[str] = Header(None)
):
    """
    Genera y obtiene alertas de burnout para un usuario
    
    Args:
        user_id: ID del usuario
        authorization: Token JWT opcional
        
    Returns:
        Alertas generadas para el usuario
    """
    if burnout_predictor.model is None:
        raise HTTPException(
            status_code=503, 
            detail="Modelo no disponible"
        )
    
    try:
        # Extraer token
        auth_token = None
        if authorization and authorization.startswith("Bearer "):
            auth_token = authorization.replace("Bearer ", "")
        
        # Obtener métricas y predecir
        user_metrics = await metrics_client.get_user_metrics(user_id, auth_token)
        prediction_result = burnout_predictor.predict_burnout(user_metrics)
        
        # Generar alerta
        alert = alerts_service.generate_alert(
            user_id=user_id,
            burnout_probability=prediction_result['burnout_probability'],
            user_metrics=user_metrics
        )
        
        return {
            "user_id": user_id,
            "has_alert": alert is not None,
            "alert": alert
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error generando alertas: {str(e)}"
        )

@app.get("/api/burnout/dashboard/{user_id}")
async def get_dashboard(
    user_id: int,
    authorization: Optional[str] = Header(None)
):
    """
    Genera resumen de dashboard para un usuario
    
    Args:
        user_id: ID del usuario
        authorization: Token JWT opcional
        
    Returns:
        Resumen completo del estado del empleado
    """
    if burnout_predictor.model is None:
        raise HTTPException(
            status_code=503, 
            detail="Modelo no disponible"
        )
    
    try:
        # Extraer token
        auth_token = None
        if authorization and authorization.startswith("Bearer "):
            auth_token = authorization.replace("Bearer ", "")
        
        # Obtener métricas y predecir
        user_metrics = await metrics_client.get_user_metrics(user_id, auth_token)
        prediction_result = burnout_predictor.predict_burnout(user_metrics)
        burnout_probability = prediction_result['burnout_probability']
        
        # Generar alerta para incluir en el summary
        alert = alerts_service.generate_alert(
            user_id=user_id,
            burnout_probability=burnout_probability,
            user_metrics=user_metrics
        )
        alerts_list = [alert] if alert else []
        
        # Generar resumen
        summary = dashboard_service.generate_summary(
            user_id=user_id,
            user_data={},
            burnout_probability=burnout_probability,
            user_metrics=user_metrics,
            alerts=alerts_list
        )
        
        return {
            "user_id": user_id,
            "summary": summary
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error generando dashboard: {str(e)}"
        )

@app.get("/api/burnout/interventions/{user_id}")
async def get_interventions(
    user_id: int,
    authorization: Optional[str] = Header(None)
):
    """
    Genera plan de intervenciones personalizadas para un usuario
    
    Args:
        user_id: ID del usuario
        authorization: Token JWT opcional
        
    Returns:
        Plan completo de intervenciones
    """
    if burnout_predictor.model is None:
        raise HTTPException(
            status_code=503, 
            detail="Modelo no disponible"
        )
    
    try:
        # Extraer token
        auth_token = None
        if authorization and authorization.startswith("Bearer "):
            auth_token = authorization.replace("Bearer ", "")
        
        # Obtener métricas y predecir
        user_metrics = await metrics_client.get_user_metrics(user_id, auth_token)
        prediction_result = burnout_predictor.predict_burnout(user_metrics)
        burnout_probability = prediction_result['burnout_probability']
        
        # Generar alerta y summary para obtener main_causes
        alert = alerts_service.generate_alert(
            user_id=user_id,
            burnout_probability=burnout_probability,
            user_metrics=user_metrics
        )
        alerts_list = [alert] if alert else []
        
        summary = dashboard_service.generate_summary(
            user_id=user_id,
            user_data={},
            burnout_probability=burnout_probability,
            user_metrics=user_metrics,
            alerts=alerts_list
        )
        
        # Generar intervenciones
        main_causes = summary.get('main_causes', [])
        interventions = intervention_service.generate_interventions(
            user_id=user_id,
            burnout_probability=burnout_probability,
            user_metrics=user_metrics,
            main_causes=main_causes,
            alerts=alerts_list
        )
        
        return {
            "user_id": user_id,
            "interventions": interventions
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error generando intervenciones: {str(e)}"
        )

@app.post("/api/burnout/analyze-custom")
async def analyze_burnout_custom(
    user_id: int,
    user_data: UserData
):
    """
    Análisis de burnout con métricas proporcionadas manualmente
    Útil para testing o cuando no hay conexión con cms-backend
    
    Args:
        user_id: ID del usuario
        user_data: Métricas del usuario
        
    Returns:
        Análisis completo de burnout
    """
    if burnout_predictor.model is None:
        raise HTTPException(
            status_code=503, 
            detail="Modelo no disponible"
        )
    
    try:
        # Convertir a dict
        user_metrics = user_data.dict()
        
        # Predecir burnout
        prediction_result = burnout_predictor.predict_burnout(user_metrics)
        burnout_probability = prediction_result['burnout_probability']
        
        # Generar alerta
        alert = alerts_service.generate_alert(
            user_id=user_id,
            burnout_probability=burnout_probability,
            user_metrics=user_metrics
        )
        
        # Generar resumen
        alerts_list = [alert] if alert else []
        summary = dashboard_service.generate_summary(
            user_id=user_id,
            user_data={},
            burnout_probability=burnout_probability,
            user_metrics=user_metrics,
            alerts=alerts_list
        )
        
        # Generar intervenciones
        main_causes = summary.get('main_causes', [])
        interventions = intervention_service.generate_interventions(
            user_id=user_id,
            burnout_probability=burnout_probability,
            user_metrics=user_metrics,
            main_causes=main_causes,
            alerts=alerts_list
        )
        
        from datetime import datetime
        
        return {
            "user_id": user_id,
            "generated_at": datetime.now().isoformat(),
            "prediction": {
                "burnout_probability": round(burnout_probability, 3),
                "burnout_prediction": prediction_result['burnout_prediction'],
                "burnout_level": summary['overview']['burnout_level'],
                "risk_category": summary['overview']['risk_category']
            },
            "alert": alert,
            "summary": summary,
            "interventions": interventions
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error en análisis personalizado: {str(e)}"
        )

# ============================================================================
# STARTUP Y CONFIGURACIÓN
# ============================================================================

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
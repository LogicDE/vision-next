"""
Endpoint para predicción de IWBS (Indicador de Bienestar Subjetivo)
Utiliza un modelo SVM entrenado para predecir valores de IWBS (1-5)

Este módulo:
- Carga el modelo .pkl desde modelake/
- Obtiene datos biométricos desde InfluxDB (biometric-microservice)
- Preprocesa los datos exactamente como en el entrenamiento
- Genera predicciones de IWBS

Autor: Equipo OOC Analytics
Versión: 1.0
"""

import os
import sys
import pickle
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from influxdb_client import InfluxDBClient
from influxdb_client.client.query_api import QueryApi

# Configurar logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Crear router FastAPI
router = APIRouter()

# ============================================================================
# CONFIGURACIÓN Y CONSTANTES
# ============================================================================

# Ruta al modelo .pkl
MODEL_PATH = Path(__file__).parent.parent / "modelake" / "svm_iwbs_model.pkl"

# Configuración InfluxDB desde variables de entorno
INFLUX_URL = os.getenv("INFLUX_URL", "http://localhost:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN")
INFLUX_ORG = os.getenv("INFLUX_ORG", "ecosalud")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "biometria")

# Columnas esperadas por el modelo (en el mismo orden que en el entrenamiento)
EXPECTED_COLUMNS = [
    'CO2',
    'PM2.5',
    'Noise',
    'Light',
    'resting_heart_rate',
    'HRV_RMSSD',
    'Skin_temperature',
    'respiration_rate',
    'SpO2',
    'EDA',
    'total_sleep_time',
    'sleep_efficiency',
    'sleep_latency'
]

# ============================================================================
# MODELOS PYDANTIC
# ============================================================================

class IWBSPredictionResponse(BaseModel):
    """Respuesta del endpoint de predicción de IWBS"""
    user_id: int
    iwbs_prediction: int  # Valor entre 1-5
    iwbs_probabilities: Optional[Dict[int, float]]  # Probabilidades por clase si está disponible
    model_used: str  # "SVM (GridSearchCV)"
    features_used: List[str]  # Lista de columnas usadas
    timestamp: str  # ISO format
    raw_features: Optional[Dict[str, float]]  # Valores originales antes de normalización


# ============================================================================
# CLASE CLIENTE INFLUXDB
# ============================================================================

class BiometricsClient:
    """
    Cliente para consultar datos biométricos desde InfluxDB.
    Obtiene datos de las mediciones: wearable_biometrics, sleep_summary, env_air, env_ambient
    """
    
    def __init__(self):
        """Inicializa el cliente de InfluxDB"""
        if not INFLUX_TOKEN:
            logger.warning(
                "[WARNING] INFLUX_TOKEN no está definido en el entorno. "
                "Las consultas a InfluxDB pueden fallar."
            )
        
        try:
            self.client = InfluxDBClient(
                url=INFLUX_URL,
                token=INFLUX_TOKEN,
                org=INFLUX_ORG,
                timeout=30000  # 30 segundos
            )
            self.query_api: QueryApi = self.client.query_api()
            logger.info(f"[BiometricsClient] Cliente InfluxDB inicializado: {INFLUX_URL}")
        except Exception as e:
            logger.error(f"[BiometricsClient] Error al inicializar cliente InfluxDB: {e}")
            raise
    
    def _query_influxdb(self, query: str) -> List[Dict[str, Any]]:
        """
        Ejecuta una query Flux en InfluxDB y retorna los resultados como lista de diccionarios.
        
        Args:
            query: Query Flux a ejecutar
            
        Returns:
            Lista de diccionarios con los resultados
        """
        try:
            logger.debug(f"[BiometricsClient] Ejecutando query Flux:\n{query}")
            result = self.query_api.query(query)
            
            data_points = []
            for table in result:
                for record in table.records:
                    # Obtener measurement y field
                    measurement = record.get_measurement()
                    field = record.get_field()
                    value = record.get_value()
                    
                    # Crear punto con la estructura esperada
                    point = {
                        'time': record.get_time(),
                        'measurement': measurement,
                        '_field': field,
                        '_value': value,
                    }
                    
                    # Agregar todos los tags (worker_id, device_id, etc.)
                    for key, val in record.values.items():
                        if key not in ['result', 'table', '_start', '_stop', '_time', '_value', '_field', '_measurement']:
                            point[key] = val
                    
                    data_points.append(point)
            
            logger.info(f"[BiometricsClient] Query ejecutada exitosamente. {len(data_points)} puntos obtenidos")
            return data_points
            
        except Exception as e:
            logger.error(f"[BiometricsClient] Error ejecutando query Flux: {e}")
            logger.error(f"[BiometricsClient] Query que falló:\n{query}")
            raise
    
    async def get_user_biometrics(self, user_id: int) -> Dict[str, Any]:
        """
        Obtiene todos los datos biométricos necesarios para el modelo IWBS de un usuario.
        
        Consulta las 4 mediciones en InfluxDB:
        - wearable_biometrics: HRV, heart rate, temperatura, respiración, SpO2, EDA
        - sleep_summary: total_sleep_s, sleep_efficiency_pct, sleep_latency_s
        - env_air: co2_ppm, pm25_ugm3
        - env_ambient: noise_db, light_lux
        
        Args:
            user_id: ID del usuario (worker_id en InfluxDB)
            
        Returns:
            Diccionario con todas las métricas necesarias para el modelo
        """
        logger.info(f"[BiometricsClient] Obteniendo datos biométricos para user_id={user_id}")
        
        # Inicializar diccionario con valores por defecto
        biometrics_data = {
            # Wearable biometrics
            'hr_bpm': None,
            'hrv_rmssd_ms': None,
            'skin_temp_c': None,
            'resp_rate_bpm': None,
            'spo2_pct': None,
            'eda_microsiemens': None,
            # Sleep summary
            'total_sleep_s': None,
            'sleep_efficiency_pct': None,
            'sleep_latency_s': None,
            # Environmental air
            'co2_ppm': None,
            'pm25_ugm3': None,
            # Environmental ambient
            'noise_db': None,
            'light_lux': None,
        }
        
        try:
            # Query 1: wearable_biometrics (filtrado por worker_id)
            query_wearable = f'''
            from(bucket: "{INFLUX_BUCKET}")
              |> range(start: -7d)
              |> filter(fn: (r) => r["_measurement"] == "wearable_biometrics")
              |> filter(fn: (r) => r["worker_id"] == "{user_id}")
              |> last()
            '''
            logger.debug(f"[BiometricsClient] Ejecutando query para wearable_biometrics")
            data_wearable = self._query_influxdb(query_wearable)
            
            # Query 2: sleep_summary (filtrado por worker_id)
            query_sleep = f'''
            from(bucket: "{INFLUX_BUCKET}")
              |> range(start: -7d)
              |> filter(fn: (r) => r["_measurement"] == "sleep_summary")
              |> filter(fn: (r) => r["worker_id"] == "{user_id}")
              |> last()
            '''
            logger.debug(f"[BiometricsClient] Ejecutando query para sleep_summary")
            data_sleep = self._query_influxdb(query_sleep)
            
            # Query 3: env_air (puede no tener worker_id, obtener el más reciente disponible)
            query_env_air = f'''
            from(bucket: "{INFLUX_BUCKET}")
              |> range(start: -1d)
              |> filter(fn: (r) => r["_measurement"] == "env_air")
              |> last()
            '''
            logger.debug(f"[BiometricsClient] Ejecutando query para env_air")
            data_env_air = self._query_influxdb(query_env_air)
            
            # Query 4: env_ambient (puede no tener worker_id, obtener el más reciente disponible)
            query_env_ambient = f'''
            from(bucket: "{INFLUX_BUCKET}")
              |> range(start: -1d)
              |> filter(fn: (r) => r["_measurement"] == "env_ambient")
              |> last()
            '''
            logger.debug(f"[BiometricsClient] Ejecutando query para env_ambient")
            data_env_ambient = self._query_influxdb(query_env_ambient)
            
            # Combinar todos los datos
            all_data_points = data_wearable + data_sleep + data_env_air + data_env_ambient
            
            # Procesar los puntos de datos
            for point in all_data_points:
                measurement = point.get('measurement', '')
                
                if measurement == 'wearable_biometrics':
                    if '_value' in point:
                        field = point.get('_field', '')
                        if field == 'hr_bpm':
                            biometrics_data['hr_bpm'] = float(point['_value'])
                        elif field == 'hrv_rmssd_ms':
                            biometrics_data['hrv_rmssd_ms'] = float(point['_value'])
                        elif field == 'skin_temp_c':
                            biometrics_data['skin_temp_c'] = float(point['_value'])
                        elif field == 'resp_rate_bpm':
                            biometrics_data['resp_rate_bpm'] = float(point['_value'])
                        elif field == 'spo2_pct':
                            biometrics_data['spo2_pct'] = float(point['_value'])
                        elif field == 'eda_microsiemens':
                            biometrics_data['eda_microsiemens'] = float(point['_value'])
                
                elif measurement == 'sleep_summary':
                    if '_value' in point:
                        field = point.get('_field', '')
                        if field == 'total_sleep_s':
                            biometrics_data['total_sleep_s'] = float(point['_value'])
                        elif field == 'sleep_efficiency_pct':
                            biometrics_data['sleep_efficiency_pct'] = float(point['_value'])
                        elif field == 'sleep_latency_s':
                            biometrics_data['sleep_latency_s'] = float(point['_value'])
                
                elif measurement == 'env_air':
                    if '_value' in point:
                        field = point.get('_field', '')
                        if field == 'co2_ppm':
                            biometrics_data['co2_ppm'] = float(point['_value'])
                        elif field == 'pm25_ugm3':
                            biometrics_data['pm25_ugm3'] = float(point['_value'])
                
                elif measurement == 'env_ambient':
                    if '_value' in point:
                        field = point.get('_field', '')
                        if field == 'noise_db':
                            biometrics_data['noise_db'] = float(point['_value'])
                        elif field == 'light_lux':
                            biometrics_data['light_lux'] = float(point['_value'])
            
            logger.info(f"[BiometricsClient] Datos obtenidos para user_id={user_id}: {biometrics_data}")
            return biometrics_data
            
        except Exception as e:
            logger.error(f"[BiometricsClient] Error al obtener datos biométricos para user_id={user_id}: {e}")
            logger.error(f"[BiometricsClient] Stack trace: {str(e)}", exc_info=True)
            # Retornar valores por defecto en caso de error
            return self._get_default_biometrics()
    
    def _get_default_biometrics(self) -> Dict[str, Any]:
        """
        Retorna valores por defecto cuando no se pueden obtener datos de InfluxDB.
        Estos valores son promedios típicos basados en el dataset de entrenamiento.
        """
        logger.warning("[BiometricsClient] Usando valores por defecto para datos biométricos")
        return {
            'hr_bpm': 70.0,
            'hrv_rmssd_ms': 40.0,
            'skin_temp_c': 33.5,
            'resp_rate_bpm': 14.0,
            'spo2_pct': 97.0,
            'eda_microsiemens': 2.0,
            'total_sleep_s': 21600.0,  # 6 horas en segundos
            'sleep_efficiency_pct': 85.0,
            'sleep_latency_s': 1800.0,  # 30 minutos en segundos
            'co2_ppm': 1000.0,
            'pm25_ugm3': 30.0,
            'noise_db': 60.0,
            'light_lux': 500.0,
        }


# ============================================================================
# FUNCIONES DE CARGA Y PREPROCESAMIENTO
# ============================================================================

# Variable global para almacenar el modelo cargado
_iwbs_model = None
_iwbs_scaler = None


def load_iwbs_model() -> tuple:
    """
    Carga el modelo IWBS y el scaler desde el archivo .pkl.
    
    El archivo .pkl contiene un diccionario con:
    - 'model': GridSearchCV entrenado
    - 'scaler': StandardScaler usado en el entrenamiento
    
    Returns:
        Tupla (model, scaler) donde model es el GridSearchCV y scaler es el StandardScaler
        
    Raises:
        FileNotFoundError: Si el archivo .pkl no existe
        Exception: Si hay error al cargar el modelo
    """
    global _iwbs_model, _iwbs_scaler
    
    # Si ya está cargado, retornar directamente
    if _iwbs_model is not None and _iwbs_scaler is not None:
        logger.info("[load_iwbs_model] Modelo ya está cargado en memoria, reutilizando")
        return _iwbs_model, _iwbs_scaler
    
    logger.info(f"[load_iwbs_model] Iniciando carga del modelo desde: {MODEL_PATH}")
    
    try:
        # Verificar que el archivo existe
        if not MODEL_PATH.exists():
            error_msg = f"Modelo no encontrado en: {MODEL_PATH}"
            logger.error(f"[load_iwbs_model] {error_msg}")
            raise FileNotFoundError(error_msg)
        
        logger.info(f"[load_iwbs_model] Archivo encontrado. Tamaño: {MODEL_PATH.stat().st_size} bytes")
        
        # Cargar el modelo
        with open(MODEL_PATH, 'rb') as f:
            model_data = pickle.load(f)
        
        logger.info(f"[load_iwbs_model] Archivo .pkl cargado exitosamente")
        logger.info(f"[load_iwbs_model] Claves en el diccionario: {list(model_data.keys())}")
        
        # Extraer modelo y scaler
        if 'model' not in model_data:
            raise ValueError("El archivo .pkl no contiene la clave 'model'")
        if 'scaler' not in model_data:
            raise ValueError("El archivo .pkl no contiene la clave 'scaler'")
        
        _iwbs_model = model_data['model']
        _iwbs_scaler = model_data['scaler']
        
        logger.info(f"[load_iwbs_model] Modelo extraído: {type(_iwbs_model).__name__}")
        logger.info(f"[load_iwbs_model] Scaler extraído: {type(_iwbs_scaler).__name__}")
        
        # Verificar que el modelo es un GridSearchCV
        if hasattr(_iwbs_model, 'best_estimator_'):
            logger.info(f"[load_iwbs_model] Mejor estimador: {type(_iwbs_model.best_estimator_).__name__}")
            logger.info(f"[load_iwbs_model] Mejores parámetros: {_iwbs_model.best_params_}")
        
        logger.info("[load_iwbs_model] Modelo cargado exitosamente")
        return _iwbs_model, _iwbs_scaler
        
    except FileNotFoundError:
        logger.error(f"[load_iwbs_model] Archivo no encontrado: {MODEL_PATH}")
        raise
    except Exception as e:
        logger.error(f"[load_iwbs_model] Error al cargar el modelo: {e}")
        logger.error(f"[load_iwbs_model] Stack trace:", exc_info=True)
        raise


def prepare_input_features(raw_data: Dict[str, Any]) -> tuple:
    """
    Preprocesa los datos de InfluxDB y los convierte al formato esperado por el modelo.
    
    Mapea los nombres de campos de InfluxDB a los nombres de columnas del CSV de entrenamiento.
    Aplica las conversiones de unidades necesarias:
    - total_sleep_s → total_sleep_time (segundos a horas: dividir por 3600)
    - sleep_latency_s → sleep_latency (segundos a minutos: dividir por 60)
    
    Args:
        raw_data: Diccionario con datos de InfluxDB (campos de BiometricsClient)
        
    Returns:
        Tupla (features_array, features_dict) donde:
        - features_array: numpy array con las features en el orden correcto para el modelo
        - features_dict: diccionario con los valores originales (para logging/debugging)
        
    Raises:
        ValueError: Si faltan columnas requeridas
    """
    logger.info("[prepare_input_features] Iniciando preprocesamiento de features")
    logger.debug(f"[prepare_input_features] Datos recibidos: {raw_data}")
    
    # Mapeo de campos de InfluxDB a nombres de columnas del CSV
    field_mapping = {
        # Environmental air
        'co2_ppm': 'CO2',
        'pm25_ugm3': 'PM2.5',
        # Environmental ambient
        'noise_db': 'Noise',
        'light_lux': 'Light',
        # Wearable biometrics
        'hr_bpm': 'resting_heart_rate',
        'hrv_rmssd_ms': 'HRV_RMSSD',
        'skin_temp_c': 'Skin_temperature',
        'resp_rate_bpm': 'respiration_rate',
        'spo2_pct': 'SpO2',
        'eda_microsiemens': 'EDA',
        # Sleep summary (con conversiones de unidades)
        'total_sleep_s': 'total_sleep_time',  # Convertir segundos a horas
        'sleep_efficiency_pct': 'sleep_efficiency',
        'sleep_latency_s': 'sleep_latency',  # Convertir segundos a minutos
    }
    
    # Crear diccionario con los valores mapeados
    features_dict = {}
    missing_fields = []
    
    for influx_field, csv_column in field_mapping.items():
        value = raw_data.get(influx_field)
        
        if value is None:
            missing_fields.append(f"{influx_field} ({csv_column})")
            # Usar valor por defecto basado en el dataset
            logger.warning(f"[prepare_input_features] Campo faltante: {influx_field}, usando valor por defecto")
            if csv_column == 'CO2':
                value = 1000.0
            elif csv_column == 'PM2.5':
                value = 30.0
            elif csv_column == 'Noise':
                value = 60.0
            elif csv_column == 'Light':
                value = 500.0
            elif csv_column == 'resting_heart_rate':
                value = 70.0
            elif csv_column == 'HRV_RMSSD':
                value = 40.0
            elif csv_column == 'Skin_temperature':
                value = 33.5
            elif csv_column == 'respiration_rate':
                value = 14.0
            elif csv_column == 'SpO2':
                value = 97.0
            elif csv_column == 'EDA':
                value = 2.0
            elif csv_column == 'total_sleep_time':
                value = 6.0  # 6 horas (ya convertido)
            elif csv_column == 'sleep_efficiency':
                value = 85.0
            elif csv_column == 'sleep_latency':
                value = 30.0  # 30 minutos (ya convertido)
        
        # Aplicar conversiones de unidades
        if csv_column == 'total_sleep_time':
            # Convertir segundos a horas
            value = value / 3600.0
            logger.debug(f"[prepare_input_features] total_sleep_s={raw_data.get(influx_field)}s → total_sleep_time={value}h")
        elif csv_column == 'sleep_latency':
            # Convertir segundos a minutos
            value = value / 60.0
            logger.debug(f"[prepare_input_features] sleep_latency_s={raw_data.get(influx_field)}s → sleep_latency={value}min")
        
        features_dict[csv_column] = float(value)
    
    if missing_fields:
        logger.warning(f"[prepare_input_features] Campos faltantes detectados: {missing_fields}")
        logger.warning("[prepare_input_features] Se usarán valores por defecto para continuar")
    
    # Crear DataFrame con las columnas en el orden exacto del entrenamiento
    logger.info("[prepare_input_features] Creando DataFrame con columnas en orden de entrenamiento")
    features_df = pd.DataFrame([features_dict])
    
    # Reordenar columnas según EXPECTED_COLUMNS
    features_df = features_df[EXPECTED_COLUMNS]
    
    logger.info(f"[prepare_input_features] DataFrame creado. Shape: {features_df.shape}")
    logger.debug(f"[prepare_input_features] Valores de features:\n{features_df.to_dict('records')[0]}")
    
    # Convertir a numpy array
    features_array = features_df.values.astype(np.float64)
    
    logger.info("[prepare_input_features] Preprocesamiento completado exitosamente")
    return features_array, features_dict


def predict_iwbs(model, scaler, features_array: np.ndarray) -> tuple:
    """
    Ejecuta la predicción de IWBS usando el modelo y scaler cargados.
    
    Proceso:
    1. Aplica StandardScaler a las features (mismo que en entrenamiento)
    2. Ejecuta model.predict() para obtener la clase predicha (1-5)
    3. Intenta obtener probabilidades si el modelo las soporta
    
    Args:
        model: Modelo GridSearchCV entrenado
        scaler: StandardScaler usado en el entrenamiento
        features_array: Array numpy con las features preprocesadas
        
    Returns:
        Tupla (prediction, probabilities) donde:
        - prediction: Valor IWBS predicho (1-5)
        - probabilities: Diccionario con probabilidades por clase (si está disponible)
    """
    logger.info("[predict_iwbs] Iniciando predicción de IWBS")
    logger.debug(f"[predict_iwbs] Features array shape: {features_array.shape}")
    logger.debug(f"[predict_iwbs] Features array:\n{features_array}")
    
    try:
        # Paso 1: Aplicar StandardScaler (mismo que en entrenamiento)
        logger.info("[predict_iwbs] Aplicando StandardScaler...")
        features_scaled = scaler.transform(features_array)
        logger.debug(f"[predict_iwbs] Features escaladas:\n{features_scaled}")
        logger.info("[predict_iwbs] StandardScaler aplicado exitosamente")
        
        # Paso 2: Obtener el mejor estimador del GridSearchCV
        best_estimator = model.best_estimator_
        logger.info(f"[predict_iwbs] Usando mejor estimador: {type(best_estimator).__name__}")
        
        # Paso 3: Hacer predicción
        logger.info("[predict_iwbs] Ejecutando predicción...")
        prediction = best_estimator.predict(features_scaled)[0]
        logger.info(f"[predict_iwbs] Predicción obtenida: IWBS = {prediction}")
        
        # Paso 4: Intentar obtener probabilidades (si el modelo las soporta)
        probabilities = None
        try:
            if hasattr(best_estimator, 'predict_proba'):
                proba_array = best_estimator.predict_proba(features_scaled)[0]
                # Crear diccionario con probabilidades por clase
                classes = best_estimator.classes_
                probabilities = {int(classes[i]): float(proba_array[i]) for i in range(len(classes))}
                logger.info(f"[predict_iwbs] Probabilidades obtenidas: {probabilities}")
            else:
                logger.info("[predict_iwbs] El modelo no soporta predict_proba()")
        except Exception as e:
            logger.warning(f"[predict_iwbs] No se pudieron obtener probabilidades: {e}")
        
        logger.info("[predict_iwbs] Predicción completada exitosamente")
        return int(prediction), probabilities
        
    except Exception as e:
        logger.error(f"[predict_iwbs] Error durante la predicción: {e}")
        logger.error(f"[predict_iwbs] Stack trace:", exc_info=True)
        raise


# ============================================================================
# ENDPOINT FASTAPI
# ============================================================================

# Instancia global del cliente de biometrics
_biometrics_client = None


def get_biometrics_client() -> BiometricsClient:
    """Obtiene o crea la instancia del cliente de biometrics"""
    global _biometrics_client
    if _biometrics_client is None:
        _biometrics_client = BiometricsClient()
    return _biometrics_client


@router.get("/api/burnout/iwbs/predict/{user_id}", response_model=IWBSPredictionResponse)
async def predict_iwbs_endpoint(
    user_id: int,
    authorization: Optional[str] = Header(None)
):
    """
    Predice el valor de IWBS (Indicador de Bienestar Subjetivo) para un usuario.
    
    IWBS es un valor entre 1-5 donde:
    - 1: Peor condición (mayor riesgo)
    - 5: Mejor condición (menor riesgo)
    
    Proceso:
    1. Obtiene datos biométricos del usuario desde InfluxDB (biometric-microservice)
    2. Preprocesa los datos exactamente como en el entrenamiento
    3. Carga el modelo SVM entrenado
    4. Genera la predicción de IWBS
    
    Args:
        user_id: ID del usuario para predecir IWBS
        authorization: Token JWT opcional (no usado actualmente, pero disponible para futuras validaciones)
        
    Returns:
        IWBSPredictionResponse con la predicción de IWBS y metadatos
        
    Raises:
        HTTPException 503: Si el modelo no está disponible
        HTTPException 502: Si hay error al consultar InfluxDB
        HTTPException 400: Si faltan datos requeridos
        HTTPException 500: Si hay error interno en la predicción
    """
    logger.info(f"[predict_iwbs_endpoint] === INICIO: Predicción IWBS para user_id={user_id} ===")
    
    try:
        # Paso 1: Cargar el modelo (si no está cargado)
        logger.info("[predict_iwbs_endpoint] Paso 1: Cargando modelo IWBS...")
        try:
            model, scaler = load_iwbs_model()
            logger.info("[predict_iwbs_endpoint] Paso 1 completado: Modelo cargado exitosamente")
        except FileNotFoundError as e:
            logger.error(f"[predict_iwbs_endpoint] Modelo no encontrado: {e}")
            raise HTTPException(
                status_code=503,
                detail=f"Modelo IWBS no disponible. Error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"[predict_iwbs_endpoint] Error al cargar modelo: {e}")
            logger.error(f"[predict_iwbs_endpoint] Stack trace:", exc_info=True)
            raise HTTPException(
                status_code=503,
                detail=f"Error al cargar modelo IWBS: {str(e)}"
            )
        
        # Paso 2: Obtener datos biométricos desde InfluxDB
        logger.info(f"[predict_iwbs_endpoint] Paso 2: Obteniendo datos biométricos para user_id={user_id}...")
        try:
            biometrics_client = get_biometrics_client()
            raw_biometrics = await biometrics_client.get_user_biometrics(user_id)
            logger.info(f"[predict_iwbs_endpoint] Paso 2 completado: Datos obtenidos exitosamente")
            logger.debug(f"[predict_iwbs_endpoint] Datos raw: {raw_biometrics}")
        except Exception as e:
            logger.error(f"[predict_iwbs_endpoint] Error al obtener datos biométricos: {e}")
            logger.error(f"[predict_iwbs_endpoint] Stack trace:", exc_info=True)
            raise HTTPException(
                status_code=502,
                detail=f"Error al obtener datos biométricos desde InfluxDB: {str(e)}"
            )
        
        # Paso 3: Preprocesar datos
        logger.info("[predict_iwbs_endpoint] Paso 3: Preprocesando datos...")
        try:
            features_array, features_dict = prepare_input_features(raw_biometrics)
            logger.info("[predict_iwbs_endpoint] Paso 3 completado: Datos preprocesados exitosamente")
        except ValueError as e:
            logger.error(f"[predict_iwbs_endpoint] Error en preprocesamiento: {e}")
            raise HTTPException(
                status_code=400,
                detail=f"Error al preprocesar datos: {str(e)}"
            )
        except Exception as e:
            logger.error(f"[predict_iwbs_endpoint] Error inesperado en preprocesamiento: {e}")
            logger.error(f"[predict_iwbs_endpoint] Stack trace:", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Error interno al preprocesar datos: {str(e)}"
            )
        
        # Paso 4: Generar predicción
        logger.info("[predict_iwbs_endpoint] Paso 4: Generando predicción de IWBS...")
        try:
            iwbs_prediction, iwbs_probabilities = predict_iwbs(model, scaler, features_array)
            logger.info(f"[predict_iwbs_endpoint] Paso 4 completado: Predicción generada: IWBS={iwbs_prediction}")
        except Exception as e:
            logger.error(f"[predict_iwbs_endpoint] Error durante la predicción: {e}")
            logger.error(f"[predict_iwbs_endpoint] Stack trace:", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Error al generar predicción de IWBS: {str(e)}"
            )
        
        # Paso 5: Construir respuesta
        logger.info("[predict_iwbs_endpoint] Paso 5: Construyendo respuesta...")
        response = IWBSPredictionResponse(
            user_id=user_id,
            iwbs_prediction=iwbs_prediction,
            iwbs_probabilities=iwbs_probabilities,
            model_used="SVM (GridSearchCV)",
            features_used=EXPECTED_COLUMNS,
            timestamp=datetime.utcnow().isoformat() + "Z",
            raw_features=features_dict
        )
        
        logger.info(f"[predict_iwbs_endpoint] === FIN: Predicción IWBS completada exitosamente ===")
        logger.info(f"[predict_iwbs_endpoint] Resultado: user_id={user_id}, IWBS={iwbs_prediction}")
        
        return response
        
    except HTTPException:
        # Re-lanzar HTTPException sin modificar
        raise
    except Exception as e:
        # Capturar cualquier otro error no esperado
        logger.error(f"[predict_iwbs_endpoint] Error inesperado: {e}")
        logger.error(f"[predict_iwbs_endpoint] Stack trace:", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error interno en predicción de IWBS: {str(e)}"
        )


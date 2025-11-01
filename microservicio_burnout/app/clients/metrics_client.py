"""
Cliente HTTP para integración con el servicio de métricas del cms-backend

Este cliente permite obtener las métricas fisiológicas y cognitivas del usuario
desde el servicio metrics en cms-backend/src/modules/metrics.
"""

import httpx
import os
from typing import Dict, Any, Optional
from datetime import datetime


class MetricsClient:
    """
    Cliente para comunicación con el servicio de métricas del CMS Backend
    """
    
    def __init__(self, base_url: str = None):
        """
        Inicializa el cliente de métricas
        
        Args:
            base_url: URL base del CMS backend (por defecto desde variable de entorno)
        """
        self.base_url = base_url or os.getenv(
            "CMS_BACKEND_URL", 
            "http://cms-backend:8000"
        )
        self.timeout = 30.0
        
    async def get_user_metrics(
        self, 
        user_id: int, 
        auth_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Obtiene las métricas de un usuario específico
        
        Args:
            user_id: ID del usuario
            auth_token: Token de autenticación JWT (opcional)
            
        Returns:
            Diccionario con las métricas del usuario
            
        Raises:
            httpx.HTTPError: Si hay error en la comunicación
        """
        headers = {}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                # Obtener métricas en tiempo real
                response = await client.get(
                    f"{self.base_url}/metrics/realtime",
                    headers=headers,
                    params={"user_id": user_id}
                )
                response.raise_for_status()
                
                realtime_data = response.json()
                
                # Transformar a formato esperado por el modelo de burnout
                metrics = self._transform_metrics(realtime_data, user_id)
                
                return metrics
                
            except httpx.HTTPError as e:
                print(f"Error obteniendo métricas del usuario {user_id}: {e}")
                # Retornar métricas por defecto en caso de error
                return self._get_default_metrics(user_id)
    
    async def get_weekly_metrics(
        self, 
        user_id: int, 
        auth_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Obtiene métricas semanales agregadas
        
        Args:
            user_id: ID del usuario
            auth_token: Token de autenticación JWT
            
        Returns:
            Diccionario con métricas semanales
        """
        headers = {}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/metrics/weekly",
                    headers=headers,
                    params={"user_id": user_id}
                )
                response.raise_for_status()
                
                return response.json()
                
            except httpx.HTTPError as e:
                print(f"Error obteniendo métricas semanales: {e}")
                return {}
    
    async def get_radar_metrics(
        self, 
        user_id: int, 
        auth_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Obtiene métricas para visualización radar
        
        Args:
            user_id: ID del usuario
            auth_token: Token de autenticación JWT
            
        Returns:
            Diccionario con métricas radar
        """
        headers = {}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/metrics/radar",
                    headers=headers,
                    params={"user_id": user_id}
                )
                response.raise_for_status()
                
                return response.json()
                
            except httpx.HTTPError as e:
                print(f"Error obteniendo métricas radar: {e}")
                return {}
    
    def _transform_metrics(
        self, 
        api_data: Dict[str, Any], 
        user_id: int
    ) -> Dict[str, Any]:
        """
        Transforma los datos de la API al formato esperado por el modelo de burnout
        
        Args:
            api_data: Datos crudos de la API
            user_id: ID del usuario
            
        Returns:
            Métricas en formato estándar del modelo
        """
        # Extraer métricas según estructura de la API
        # La estructura exacta dependerá de la respuesta real de sp_kpi_realtime()
        
        # Si api_data es una lista, tomar primer elemento
        if isinstance(api_data, list) and len(api_data) > 0:
            data = api_data[0]
        else:
            data = api_data
        
        # Mapear campos de la API a campos del modelo
        # Estos nombres pueden necesitar ajuste según la estructura real
        transformed = {
            # Métricas fisiológicas
            'time_to_recover': float(data.get('time_to_recover', 30.0)),
            'median_hrv': float(data.get('median_hrv', data.get('hrv_median', 44.0))),
            'media_hrv': float(data.get('media_hrv', data.get('hrv_mean', 44.0))),
            'avg_pulse': float(data.get('avg_pulse', data.get('pulse_avg', 72.0))),
            'sleep_score': float(data.get('sleep_score', data.get('sleep_quality', 75.0))),
            'eda_peaks': float(data.get('eda_peaks', data.get('stress_peaks', 14.0))),
            'time_to_recover_hrv': float(data.get('time_to_recover_hrv', data.get('time_to_recover', 30.0))),
            
            # Métricas de estrés
            'high_stress_prevalence_perc': float(data.get('high_stress_prevalence_perc', data.get('stress_percentage', 20.0))),
            'high_stress_prevalence': float(data.get('high_stress_prevalence', data.get('stress_hours', 0.0))),
            
            # Métricas de trabajo/comportamiento
            'weekly_hours_in_meetings': float(data.get('weekly_hours_in_meetings', data.get('meeting_hours', 20.0))),
            'time_on_focus_blocks': float(data.get('time_on_focus_blocks', data.get('focus_time', 4.0))),
            'absenteesim_days': float(data.get('absenteesim_days', data.get('absence_days', 0.5))),
            
            # Métricas de satisfacción
            'nps_score': float(data.get('nps_score', data.get('satisfaction_score', 7.5))),
            'intervention_acceptance_rate': float(data.get('intervention_acceptance_rate', data.get('intervention_rate', 0.5))),
        }
        
        return transformed
    
    def _get_default_metrics(self, user_id: int) -> Dict[str, Any]:
        """
        Retorna métricas por defecto cuando no se pueden obtener del backend
        Estos valores representan un estado promedio/neutral
        
        Args:
            user_id: ID del usuario
            
        Returns:
            Diccionario con métricas por defecto
        """
        return {
            'time_to_recover': 30.0,
            'high_stress_prevalence_perc': 20.0,
            'median_hrv': 44.0,
            'avg_pulse': 72.0,
            'sleep_score': 75.0,
            'media_hrv': 44.0,
            'eda_peaks': 14.0,
            'time_to_recover_hrv': 30.0,
            'weekly_hours_in_meetings': 20.0,
            'time_on_focus_blocks': 4.0,
            'absenteesim_days': 0.5,
            'high_stress_prevalence': 0.2,
            'nps_score': 7.5,
            'intervention_acceptance_rate': 0.5
        }
    
    async def health_check(self) -> bool:
        """
        Verifica si el servicio de métricas está disponible
        
        Returns:
            True si el servicio está disponible, False en caso contrario
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception:
            return False

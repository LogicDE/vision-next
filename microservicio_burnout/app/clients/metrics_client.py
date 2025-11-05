"""
Cliente HTTP para integración con el servicio de métricas del CMS Backend.

Este módulo permite obtener métricas fisiológicas, cognitivas y laborales
desde el servicio `metrics` del backend central (cms-backend/src/modules/metrics).

Incluye métodos para:
- Obtener métricas en tiempo real
- Obtener métricas semanales agregadas
- Obtener métricas para visualización tipo radar
- Verificar la salud del servicio

Autor: Equipo OOC Analytics
Versión: 1.2 (Nov 2025)
"""

from wsgiref import headers
import httpx
import os
from typing import Dict, Any, Optional


class MetricsClient:
    """
    Cliente para comunicación con el servicio de métricas del CMS Backend.
    """

    def __init__(self, base_url: Optional[str] = None):
        """
        Inicializa el cliente de métricas.

        Args:
            base_url: URL base del CMS backend. Si no se proporciona, se usa la variable de entorno CMS_BACKEND_URL.
        """
        self.base_url = base_url or os.getenv("CMS_BACKEND_URL", "http://cms-backend:8000")
        self.timeout = 30.0
        self.internal_token = os.getenv("INTERNAL_SERVICE_JWT")

        if not self.internal_token:
            print(
                "[WARNING] INTERNAL_SERVICE_JWT no está definido en el entorno. "
                "Las peticiones internas pueden fallar con 401 Unauthorized."
            )

    def _build_headers(self, auth_token: Optional[str] = None) -> Dict[str, str]:
        """
        Construye los headers HTTP incluyendo autenticación JWT o token interno.

        Args:
            auth_token: Token JWT del usuario (si se provee, tiene prioridad).

        Returns:
            Diccionario de cabeceras HTTP.
        """
        headers = {"Accept": "application/json"}

        # Preferir token de usuario si se proporciona, si no usar el interno
        token = auth_token if auth_token and auth_token.strip() else self.internal_token
        if token:
            headers["Authorization"] = f"Bearer {token}"

        return headers

    async def get_user_metrics(self, user_id: int, auth_token: Optional[str] = None) -> Dict[str, Any]:
        """
        Obtiene métricas en tiempo real del usuario desde /metrics/realtime.

        Args:
            user_id: ID del usuario.
            auth_token: Token JWT opcional para autenticación.

        Returns:
            Diccionario con las métricas del usuario.
        """
        headers = self._build_headers(auth_token)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            if not headers.get("Authorization"):
                print(f"[ERROR] No se está incluyendo Authorization en la petición de métricas para user_id={user_id}")
            else:
                print(f"[DEBUG] Header Authorization usado: {headers['Authorization'][:25]}...")  # Mostrar solo parte del token
            try:
                response = await client.get(
                    f"{self.base_url}/metrics/realtime",
                    headers=headers,
                    params={"user_id": user_id}
                )
                response.raise_for_status()
                realtime_data = response.json()
                return self._transform_metrics(realtime_data, user_id)

            except httpx.HTTPStatusError as e:
                print(f"[ERROR] ({e.response.status_code}) al obtener métricas de usuario {user_id}: {e}")
                print(f"➡️ Respuesta del CMS: {e.response.text}")
                return self._get_default_metrics(user_id)
            except Exception as e:
                print(f"[ERROR] Error general al obtener métricas del usuario {user_id}: {e}")
                print(f"➡️ Respuesta del CMS: {e.response.text}")
                return self._get_default_metrics(user_id)

    async def get_weekly_metrics(self, user_id: int, auth_token: Optional[str] = None) -> Dict[str, Any]:
        """
        Obtiene métricas semanales agregadas desde /metrics/weekly.
        """
        headers = self._build_headers(auth_token)

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
                print(f"[ERROR] No se pudieron obtener métricas semanales: {e}")
                return {}

    async def get_radar_metrics(self, user_id: int, auth_token: Optional[str] = None) -> Dict[str, Any]:
        """
        Obtiene métricas para visualización radar desde /metrics/radar.
        """
        headers = self._build_headers(auth_token)

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
                print(f"[ERROR] No se pudieron obtener métricas radar: {e}")
                return {}

    def _transform_metrics(self, api_data: Any, user_id: int) -> Dict[str, Any]:
        """
        Transforma los datos crudos entregados por el CMS al formato esperado por el modelo de burnout.
        Convierte listas de métricas tipo [{"metric_name": ..., "value": ...}] a dict {"metric": value}
        """

        # Si llega lista, convertir a dict clave=valor
        if isinstance(api_data, list):
            try:
                data = {item["metric_name"]: item["value"] for item in api_data}
            except Exception as e:
                print(f"[ERROR] Formato inesperado en métricas del usuario {user_id}: {e}")
                return self._get_default_metrics(user_id)
        else:
            data = api_data

        def f(key, alt=None, default=0.0):
            return float(data.get(key, data.get(alt, default)))

        return {
            "time_to_recover": f("time_to_recover", default=30.0),
            "median_hrv": f("median_hrv", "hrv_median", 44.0),
            "media_hrv": f("media_hrv", "hrv_mean", 44.0),
            "avg_pulse": f("avg_pulse", "pulse_avg", 72.0),
            "sleep_score": f("sleep_score", "sleep_quality", 75.0),
            "eda_peaks": f("eda_peaks", "stress_peaks", 14.0),
            "time_to_recover_hrv": f("time_to_recover_hrv", "time_to_recover", 30.0),
            "high_stress_prevalence_perc": f("high_stress_prevalence_perc", "stress_percentage", 20.0),
            "high_stress_prevalence": f("high_stress_prevalence", "stress_hours", 0.2),
            "weekly_hours_in_meetings": f("weekly_hours_in_meetings", "meeting_hours", 20.0),
            "time_on_focus_blocks": f("time_on_focus_blocks", "focus_time", 4.0),
            "absenteesim_days": f("absenteesim_days", "absence_days", 0.5),
            "nps_score": f("nps_score", "satisfaction_score", 7.5),
            "intervention_acceptance_rate": f("intervention_acceptance_rate", "intervention_rate", 0.5),
        }


    def _get_default_metrics(self, user_id: int) -> Dict[str, Any]:
        """
        Retorna métricas por defecto cuando no se pueden obtener del backend.
        """
        return {
            "time_to_recover": 30.0,
            "median_hrv": 44.0,
            "media_hrv": 44.0,
            "avg_pulse": 72.0,
            "sleep_score": 75.0,
            "eda_peaks": 14.0,
            "time_to_recover_hrv": 30.0,
            "high_stress_prevalence_perc": 20.0,
            "high_stress_prevalence": 0.2,
            "weekly_hours_in_meetings": 20.0,
            "time_on_focus_blocks": 4.0,
            "absenteesim_days": 0.5,
            "nps_score": 7.5,
            "intervention_acceptance_rate": 0.5,
        }

    async def health_check(self) -> bool:
        """
        Verifica si el servicio de métricas está disponible.
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception:
            return False

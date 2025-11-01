"""
AlertsService - Detecta y genera alertas basadas en el riesgo de burnout

Este servicio analiza la probabilidad y severidad del burnout y genera
alertas cuando se superan umbrales críticos.
"""

from typing import Dict, Any, Optional
from datetime import datetime
from enum import Enum


class AlertSeverity(str, Enum):
    """Niveles de severidad de las alertas"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertType(str, Enum):
    """Tipos de alertas"""
    BURNOUT_RISK = "burnout_risk"
    HIGH_STRESS = "high_stress"
    POOR_SLEEP = "poor_sleep"
    HIGH_WORKLOAD = "high_workload"
    LOW_RECOVERY = "low_recovery"


class AlertsService:
    """
    Servicio para generar y gestionar alertas de burnout
    """
    
    # Umbrales de probabilidad para generar alertas
    THRESHOLD_LOW = 0.3
    THRESHOLD_MEDIUM = 0.5
    THRESHOLD_HIGH = 0.7
    THRESHOLD_CRITICAL = 0.85
    
    def __init__(self):
        """Inicializa el servicio de alertas"""
        pass
    
    def generate_alert(
        self, 
        user_id: int,
        burnout_probability: float,
        user_metrics: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Genera una alerta si la probabilidad de burnout supera el umbral
        
        Args:
            user_id: ID del usuario
            burnout_probability: Probabilidad de burnout (0-1)
            user_metrics: Métricas del usuario
            
        Returns:
            Diccionario con la alerta generada o None si no se requiere alerta
        """
        # Si la probabilidad es menor al umbral mínimo, no generar alerta
        if burnout_probability < self.THRESHOLD_MEDIUM:
            return None
        
        # Determinar severidad
        severity = self._determine_severity(burnout_probability)
        
        # Generar mensaje según severidad
        message = self._generate_alert_message(severity, burnout_probability, user_metrics)
        
        # Determinar tipos de alerta específicos
        alert_types = self._determine_alert_types(user_metrics)
        
        # Generar recomendaciones inmediatas
        immediate_actions = self._generate_immediate_actions(severity, alert_types)
        
        alert = {
            "user_id": user_id,
            "alert_id": self._generate_alert_id(user_id),
            "severity": severity.value,
            "burnout_probability": round(burnout_probability, 3),
            "message": message,
            "alert_types": [at.value for at in alert_types],
            "immediate_actions": immediate_actions,
            "timestamp": datetime.now().isoformat(),
            "requires_intervention": severity in [AlertSeverity.HIGH, AlertSeverity.CRITICAL],
            "notify_manager": severity == AlertSeverity.CRITICAL,
            "contributing_factors": self._identify_contributing_factors(user_metrics)
        }
        
        return alert
    
    def _determine_severity(self, probability: float) -> AlertSeverity:
        """Determina el nivel de severidad basado en la probabilidad"""
        if probability >= self.THRESHOLD_CRITICAL:
            return AlertSeverity.CRITICAL
        elif probability >= self.THRESHOLD_HIGH:
            return AlertSeverity.HIGH
        elif probability >= self.THRESHOLD_MEDIUM:
            return AlertSeverity.MEDIUM
        else:
            return AlertSeverity.LOW
    
    def _generate_alert_message(
        self, 
        severity: AlertSeverity, 
        probability: float,
        metrics: Dict[str, Any]
    ) -> str:
        """Genera un mensaje descriptivo para la alerta"""
        messages = {
            AlertSeverity.CRITICAL: (
                f"⚠️ ALERTA CRÍTICA: Se ha detectado un riesgo extremo de burnout "
                f"({probability*100:.1f}%). Se requiere intervención inmediata."
            ),
            AlertSeverity.HIGH: (
                f"⚠️ ALERTA ALTA: Riesgo elevado de burnout detectado "
                f"({probability*100:.1f}%). Se recomienda intervención urgente."
            ),
            AlertSeverity.MEDIUM: (
                f"⚠️ ALERTA MEDIA: Se ha detectado un riesgo moderado de burnout "
                f"({probability*100:.1f}%). Monitoreo y acciones preventivas recomendadas."
            ),
            AlertSeverity.LOW: (
                f"ℹ️ ALERTA BAJA: Riesgo leve de burnout detectado "
                f"({probability*100:.1f}%). Mantener seguimiento."
            )
        }
        return messages.get(severity, "Alerta de burnout detectada")
    
    def _determine_alert_types(self, metrics: Dict[str, Any]) -> list[AlertType]:
        """Identifica tipos específicos de alerta basados en las métricas"""
        alert_types = [AlertType.BURNOUT_RISK]  # Siempre incluir riesgo de burnout
        
        # Evaluar estrés alto
        if metrics.get('high_stress_prevalence_perc', 0) > 30:
            alert_types.append(AlertType.HIGH_STRESS)
        
        # Evaluar calidad del sueño
        if metrics.get('sleep_score', 100) < 60:
            alert_types.append(AlertType.POOR_SLEEP)
        
        # Evaluar carga de trabajo
        if metrics.get('weekly_hours_in_meetings', 0) > 25:
            alert_types.append(AlertType.HIGH_WORKLOAD)
        
        # Evaluar tiempo de recuperación
        if metrics.get('time_to_recover', 0) > 40:
            alert_types.append(AlertType.LOW_RECOVERY)
        
        return alert_types
    
    def _generate_immediate_actions(
        self, 
        severity: AlertSeverity, 
        alert_types: list[AlertType]
    ) -> list[str]:
        """Genera lista de acciones inmediatas recomendadas"""
        actions = []
        
        if severity in [AlertSeverity.CRITICAL, AlertSeverity.HIGH]:
            actions.append("Contactar con recursos humanos o servicio de salud ocupacional")
            actions.append("Considerar redistribución de carga laboral inmediata")
            actions.append("Programar evaluación médica o psicológica")
        
        if AlertType.HIGH_STRESS in alert_types:
            actions.append("Implementar técnicas de manejo de estrés")
            actions.append("Tomar descansos regulares durante la jornada")
        
        if AlertType.POOR_SLEEP in alert_types:
            actions.append("Evaluar higiene del sueño y rutinas nocturnas")
            actions.append("Considerar consulta con especialista del sueño")
        
        if AlertType.HIGH_WORKLOAD in alert_types:
            actions.append("Revisar agenda y priorizar tareas esenciales")
            actions.append("Delegar tareas cuando sea posible")
            actions.append("Reducir reuniones no esenciales")
        
        if AlertType.LOW_RECOVERY in alert_types:
            actions.append("Incrementar tiempo de descanso y desconexión")
            actions.append("Practicar actividades de recuperación (ejercicio, mindfulness)")
        
        return actions
    
    def _identify_contributing_factors(self, metrics: Dict[str, Any]) -> list[Dict[str, Any]]:
        """Identifica los principales factores contribuyentes al riesgo"""
        factors = []
        
        # Factor: Estrés
        stress_level = metrics.get('high_stress_prevalence_perc', 0)
        if stress_level > 20:
            factors.append({
                "factor": "Alto nivel de estrés",
                "value": f"{stress_level:.1f}%",
                "severity": "high" if stress_level > 50 else "medium"
            })
        
        # Factor: Sueño
        sleep_score = metrics.get('sleep_score', 100)
        if sleep_score < 70:
            factors.append({
                "factor": "Calidad del sueño deficiente",
                "value": f"{sleep_score:.1f}/100",
                "severity": "high" if sleep_score < 50 else "medium"
            })
        
        # Factor: Carga laboral
        meeting_hours = metrics.get('weekly_hours_in_meetings', 0)
        if meeting_hours > 20:
            factors.append({
                "factor": "Exceso de reuniones",
                "value": f"{meeting_hours:.1f} horas/semana",
                "severity": "high" if meeting_hours > 30 else "medium"
            })
        
        # Factor: Recuperación
        recovery_time = metrics.get('time_to_recover', 0)
        if recovery_time > 35:
            factors.append({
                "factor": "Tiempo de recuperación prolongado",
                "value": f"{recovery_time:.1f} minutos",
                "severity": "high" if recovery_time > 50 else "medium"
            })
        
        # Factor: Variabilidad cardíaca
        hrv = metrics.get('median_hrv', 50)
        if hrv < 30:
            factors.append({
                "factor": "Baja variabilidad cardíaca (HRV)",
                "value": f"{hrv:.1f} ms",
                "severity": "high" if hrv < 20 else "medium"
            })
        
        return factors
    
    def _generate_alert_id(self, user_id: int) -> str:
        """Genera un ID único para la alerta"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        return f"ALERT-{user_id}-{timestamp}"
    
    def should_notify_manager(self, alert: Dict[str, Any]) -> bool:
        """Determina si se debe notificar al supervisor"""
        return alert.get("notify_manager", False)
    
    def should_trigger_intervention(self, alert: Dict[str, Any]) -> bool:
        """Determina si se debe activar un proceso de intervención"""
        return alert.get("requires_intervention", False)

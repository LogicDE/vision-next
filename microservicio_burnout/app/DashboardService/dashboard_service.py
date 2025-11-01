"""
DashboardService - Genera resúmenes globales del estado del empleado

Este servicio consolida información de burnout, métricas y alertas para
mostrar un panel completo del estado de salud del empleado.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum


class BurnoutLevel(str, Enum):
    """Niveles de burnout"""
    NONE = "none"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    SEVERE = "severe"


class HealthStatus(str, Enum):
    """Estado general de salud"""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    CRITICAL = "critical"


class DashboardService:
    """
    Servicio para generar resúmenes de dashboard del empleado
    """
    
    def __init__(self):
        """Inicializa el servicio de dashboard"""
        pass
    
    def generate_summary(
        self,
        user_id: int,
        user_data: Dict[str, Any],
        burnout_probability: float,
        user_metrics: Dict[str, Any],
        alerts: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Genera un resumen completo del estado del empleado
        
        Args:
            user_id: ID del usuario
            user_data: Datos básicos del usuario
            burnout_probability: Probabilidad de burnout
            user_metrics: Métricas fisiológicas y cognitivas
            alerts: Lista de alertas activas
            
        Returns:
            Diccionario con el resumen completo
        """
        # Determinar nivel de burnout y estado general
        burnout_level = self._determine_burnout_level(burnout_probability)
        health_status = self._determine_health_status(burnout_probability, user_metrics)
        
        # Analizar métricas clave
        key_metrics = self._analyze_key_metrics(user_metrics)
        
        # Identificar principales causantes
        main_causes = self._identify_main_causes(user_metrics, burnout_probability)
        
        # Calcular scores por categoría
        category_scores = self._calculate_category_scores(user_metrics)
        
        # Generar tendencias
        trends = self._generate_trends(user_metrics)
        
        # Preparar resumen de alertas
        alerts_summary = self._summarize_alerts(alerts) if alerts else None
        
        # Generar recomendaciones generales
        recommendations = self._generate_recommendations(
            burnout_level, 
            health_status, 
            main_causes
        )
        
        summary = {
            "user_id": user_id,
            "generated_at": datetime.now().isoformat(),
            "overview": {
                "burnout_level": burnout_level.value,
                "burnout_probability": round(burnout_probability, 3),
                "health_status": health_status.value,
                "risk_category": self._get_risk_category(burnout_probability)
            },
            "key_metrics": key_metrics,
            "category_scores": category_scores,
            "main_causes": main_causes,
            "trends": trends,
            "alerts_summary": alerts_summary,
            "recommendations": recommendations,
            "metrics_details": {
                "physiological": self._extract_physiological_metrics(user_metrics),
                "cognitive": self._extract_cognitive_metrics(user_metrics),
                "behavioral": self._extract_behavioral_metrics(user_metrics)
            }
        }
        
        return summary
    
    def _determine_burnout_level(self, probability: float) -> BurnoutLevel:
        """Determina el nivel de burnout basado en la probabilidad"""
        if probability >= 0.85:
            return BurnoutLevel.SEVERE
        elif probability >= 0.70:
            return BurnoutLevel.HIGH
        elif probability >= 0.50:
            return BurnoutLevel.MODERATE
        elif probability >= 0.30:
            return BurnoutLevel.LOW
        else:
            return BurnoutLevel.NONE
    
    def _determine_health_status(
        self, 
        probability: float, 
        metrics: Dict[str, Any]
    ) -> HealthStatus:
        """Determina el estado general de salud"""
        # Factores a considerar
        sleep_score = metrics.get('sleep_score', 70)
        stress_level = metrics.get('high_stress_prevalence_perc', 0)
        hrv = metrics.get('median_hrv', 40)
        
        # Calcular score compuesto
        health_score = (
            (sleep_score / 100) * 0.3 +
            ((100 - stress_level) / 100) * 0.3 +
            (min(hrv / 50, 1)) * 0.2 +
            ((1 - probability) * 0.2)
        ) * 100
        
        if health_score >= 80:
            return HealthStatus.EXCELLENT
        elif health_score >= 65:
            return HealthStatus.GOOD
        elif health_score >= 50:
            return HealthStatus.FAIR
        elif health_score >= 35:
            return HealthStatus.POOR
        else:
            return HealthStatus.CRITICAL
    
    def _analyze_key_metrics(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analiza y presenta las métricas más importantes"""
        key_metrics = []
        
        # Estrés
        stress = metrics.get('high_stress_prevalence_perc', 0)
        key_metrics.append({
            "name": "Nivel de Estrés",
            "value": f"{stress:.1f}%",
            "status": self._get_metric_status(stress, 20, 40, inverse=True),
            "description": "Porcentaje de tiempo en estado de estrés alto"
        })
        
        # Sueño
        sleep = metrics.get('sleep_score', 70)
        key_metrics.append({
            "name": "Calidad del Sueño",
            "value": f"{sleep:.1f}/100",
            "status": self._get_metric_status(sleep, 70, 50),
            "description": "Puntuación de calidad del sueño"
        })
        
        # HRV
        hrv = metrics.get('median_hrv', 40)
        key_metrics.append({
            "name": "Variabilidad Cardíaca (HRV)",
            "value": f"{hrv:.1f} ms",
            "status": self._get_metric_status(hrv, 40, 30),
            "description": "Indicador de capacidad de adaptación al estrés"
        })
        
        # Pulso
        pulse = metrics.get('avg_pulse', 70)
        key_metrics.append({
            "name": "Frecuencia Cardíaca Media",
            "value": f"{pulse:.1f} bpm",
            "status": self._get_metric_status(pulse, 80, 90, inverse=True),
            "description": "Frecuencia cardíaca promedio en reposo"
        })
        
        # Reuniones
        meetings = metrics.get('weekly_hours_in_meetings', 0)
        key_metrics.append({
            "name": "Horas en Reuniones",
            "value": f"{meetings:.1f} h/semana",
            "status": self._get_metric_status(meetings, 20, 30, inverse=True),
            "description": "Tiempo semanal dedicado a reuniones"
        })
        
        # Tiempo de enfoque
        focus = metrics.get('time_on_focus_blocks', 0)
        key_metrics.append({
            "name": "Tiempo de Enfoque",
            "value": f"{focus:.1f} h/día",
            "status": self._get_metric_status(focus, 3, 2),
            "description": "Tiempo diario en bloques de trabajo concentrado"
        })
        
        return key_metrics
    
    def _get_metric_status(
        self, 
        value: float, 
        good_threshold: float, 
        bad_threshold: float,
        inverse: bool = False
    ) -> str:
        """Determina el estado de una métrica (good/warning/bad)"""
        if not inverse:
            if value >= good_threshold:
                return "good"
            elif value >= bad_threshold:
                return "warning"
            else:
                return "bad"
        else:
            if value <= good_threshold:
                return "good"
            elif value <= bad_threshold:
                return "warning"
            else:
                return "bad"
    
    def _identify_main_causes(
        self, 
        metrics: Dict[str, Any], 
        probability: float
    ) -> List[Dict[str, Any]]:
        """Identifica las principales causas del riesgo de burnout"""
        causes = []
        
        # Análisis de cada factor potencial
        factors = [
            {
                "name": "Estrés Laboral Alto",
                "metric": "high_stress_prevalence_perc",
                "threshold": 30,
                "weight": 0.25,
                "inverse": True
            },
            {
                "name": "Mala Calidad del Sueño",
                "metric": "sleep_score",
                "threshold": 65,
                "weight": 0.20,
                "inverse": False
            },
            {
                "name": "Exceso de Reuniones",
                "metric": "weekly_hours_in_meetings",
                "threshold": 25,
                "weight": 0.15,
                "inverse": True
            },
            {
                "name": "Tiempo de Recuperación Prolongado",
                "metric": "time_to_recover",
                "threshold": 35,
                "weight": 0.15,
                "inverse": True
            },
            {
                "name": "Baja Variabilidad Cardíaca",
                "metric": "median_hrv",
                "threshold": 35,
                "weight": 0.15,
                "inverse": False
            },
            {
                "name": "Poco Tiempo de Enfoque",
                "metric": "time_on_focus_blocks",
                "threshold": 3,
                "weight": 0.10,
                "inverse": False
            }
        ]
        
        for factor in factors:
            value = metrics.get(factor["metric"], 0)
            threshold = factor["threshold"]
            inverse = factor["inverse"]
            
            # Determinar si este factor es problemático
            is_problematic = (value > threshold if inverse else value < threshold)
            
            if is_problematic:
                # Calcular impacto relativo
                if inverse:
                    impact = min((value - threshold) / threshold, 1.0)
                else:
                    impact = min((threshold - value) / threshold, 1.0)
                
                impact_score = impact * factor["weight"] * 100
                
                causes.append({
                    "cause": factor["name"],
                    "impact_score": round(impact_score, 2),
                    "current_value": round(value, 2),
                    "threshold": threshold,
                    "severity": "high" if impact > 0.6 else "medium" if impact > 0.3 else "low"
                })
        
        # Ordenar por impacto y retornar top 5
        causes.sort(key=lambda x: x["impact_score"], reverse=True)
        return causes[:5]
    
    def _calculate_category_scores(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Calcula scores por categoría de métricas"""
        # Score fisiológico
        physiological_score = self._calculate_physiological_score(metrics)
        
        # Score cognitivo/desempeño
        cognitive_score = self._calculate_cognitive_score(metrics)
        
        # Score de bienestar
        wellbeing_score = self._calculate_wellbeing_score(metrics)
        
        # Score de carga laboral
        workload_score = self._calculate_workload_score(metrics)
        
        return {
            "physiological": {
                "score": round(physiological_score, 2),
                "status": self._get_score_status(physiological_score),
                "description": "Indicadores físicos y biométricos"
            },
            "cognitive": {
                "score": round(cognitive_score, 2),
                "status": self._get_score_status(cognitive_score),
                "description": "Rendimiento y capacidad mental"
            },
            "wellbeing": {
                "score": round(wellbeing_score, 2),
                "status": self._get_score_status(wellbeing_score),
                "description": "Bienestar general y satisfacción"
            },
            "workload": {
                "score": round(workload_score, 2),
                "status": self._get_score_status(workload_score),
                "description": "Carga de trabajo y balance"
            }
        }
    
    def _calculate_physiological_score(self, metrics: Dict[str, Any]) -> float:
        """Calcula score de indicadores fisiológicos (0-100)"""
        hrv = min(metrics.get('median_hrv', 40) / 60, 1) * 100
        pulse_score = max(0, 100 - abs(metrics.get('avg_pulse', 70) - 70))
        sleep = metrics.get('sleep_score', 70)
        recovery = max(0, 100 - (metrics.get('time_to_recover', 30) / 60 * 100))
        
        return (hrv * 0.3 + pulse_score * 0.2 + sleep * 0.3 + recovery * 0.2)
    
    def _calculate_cognitive_score(self, metrics: Dict[str, Any]) -> float:
        """Calcula score de rendimiento cognitivo (0-100)"""
        focus = min(metrics.get('time_on_focus_blocks', 3) / 6, 1) * 100
        stress_score = max(0, 100 - metrics.get('high_stress_prevalence_perc', 0))
        
        return (focus * 0.5 + stress_score * 0.5)
    
    def _calculate_wellbeing_score(self, metrics: Dict[str, Any]) -> float:
        """Calcula score de bienestar general (0-100)"""
        nps = (metrics.get('nps_score', 7) / 10) * 100
        intervention_acceptance = metrics.get('intervention_acceptance_rate', 0.5) * 100
        absenteeism = max(0, 100 - (metrics.get('absenteesim_days', 0) * 10))
        
        return (nps * 0.4 + intervention_acceptance * 0.3 + absenteeism * 0.3)
    
    def _calculate_workload_score(self, metrics: Dict[str, Any]) -> float:
        """Calcula score de carga laboral (0-100, mayor = mejor balance)"""
        meetings = max(0, 100 - (metrics.get('weekly_hours_in_meetings', 20) / 40 * 100))
        focus_time = min(metrics.get('time_on_focus_blocks', 3) / 5, 1) * 100
        stress = max(0, 100 - metrics.get('high_stress_prevalence_perc', 0))
        
        return (meetings * 0.3 + focus_time * 0.3 + stress * 0.4)
    
    def _get_score_status(self, score: float) -> str:
        """Determina el estado basado en un score 0-100"""
        if score >= 80:
            return "excellent"
        elif score >= 65:
            return "good"
        elif score >= 50:
            return "fair"
        elif score >= 35:
            return "poor"
        else:
            return "critical"
    
    def _generate_trends(self, metrics: Dict[str, Any]) -> Dict[str, str]:
        """
        Genera información de tendencias
        Nota: En una implementación real, esto requeriría datos históricos
        """
        return {
            "burnout_risk": "stable",
            "stress_levels": "increasing",
            "sleep_quality": "stable",
            "workload": "increasing",
            "note": "Las tendencias requieren datos históricos para análisis preciso"
        }
    
    def _summarize_alerts(self, alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Resume las alertas activas"""
        if not alerts:
            return {"total": 0, "by_severity": {}, "active_alerts": []}
        
        by_severity = {}
        for alert in alerts:
            severity = alert.get("severity", "unknown")
            by_severity[severity] = by_severity.get(severity, 0) + 1
        
        return {
            "total": len(alerts),
            "by_severity": by_severity,
            "active_alerts": [
                {
                    "alert_id": alert.get("alert_id"),
                    "severity": alert.get("severity"),
                    "message": alert.get("message")
                }
                for alert in alerts[:5]  # Mostrar solo las 5 más recientes
            ]
        }
    
    def _generate_recommendations(
        self,
        burnout_level: BurnoutLevel,
        health_status: HealthStatus,
        main_causes: List[Dict[str, Any]]
    ) -> List[str]:
        """Genera recomendaciones generales basadas en el análisis"""
        recommendations = []
        
        # Recomendaciones según nivel de burnout
        if burnout_level in [BurnoutLevel.SEVERE, BurnoutLevel.HIGH]:
            recommendations.append(
                "Prioridad Alta: Considerar intervención profesional inmediata"
            )
            recommendations.append(
                "Revisar carga laboral y redistribuir responsabilidades"
            )
        
        # Recomendaciones según causas principales
        if main_causes:
            top_cause = main_causes[0]["cause"]
            if "Estrés" in top_cause:
                recommendations.append(
                    "Implementar técnicas de gestión del estrés y mindfulness"
                )
            elif "Sueño" in top_cause:
                recommendations.append(
                    "Mejorar rutinas de sueño y considerar evaluación especializada"
                )
            elif "Reuniones" in top_cause:
                recommendations.append(
                    "Optimizar calendario: reducir reuniones innecesarias"
                )
        
        # Recomendaciones generales
        recommendations.append(
            "Mantener seguimiento regular de métricas de bienestar"
        )
        recommendations.append(
            "Promover balance trabajo-vida personal"
        )
        
        return recommendations[:5]  # Máximo 5 recomendaciones
    
    def _extract_physiological_metrics(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Extrae métricas fisiológicas"""
        return {
            "median_hrv": metrics.get('median_hrv', 0),
            "avg_pulse": metrics.get('avg_pulse', 0),
            "sleep_score": metrics.get('sleep_score', 0),
            "time_to_recover": metrics.get('time_to_recover', 0),
            "eda_peaks": metrics.get('eda_peaks', 0)
        }
    
    def _extract_cognitive_metrics(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Extrae métricas cognitivas"""
        return {
            "time_on_focus_blocks": metrics.get('time_on_focus_blocks', 0),
            "high_stress_prevalence_perc": metrics.get('high_stress_prevalence_perc', 0),
            "nps_score": metrics.get('nps_score', 0)
        }
    
    def _extract_behavioral_metrics(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Extrae métricas comportamentales"""
        return {
            "weekly_hours_in_meetings": metrics.get('weekly_hours_in_meetings', 0),
            "absenteesim_days": metrics.get('absenteesim_days', 0),
            "intervention_acceptance_rate": metrics.get('intervention_acceptance_rate', 0)
        }
    
    def _get_risk_category(self, probability: float) -> str:
        """Obtiene categoría de riesgo textual"""
        if probability >= 0.7:
            return "Alto Riesgo"
        elif probability >= 0.5:
            return "Riesgo Moderado"
        elif probability >= 0.3:
            return "Riesgo Bajo"
        else:
            return "Sin Riesgo Significativo"


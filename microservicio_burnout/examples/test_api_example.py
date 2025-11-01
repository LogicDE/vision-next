"""
Script de ejemplo para probar el microservicio de burnout

Este script demuestra cómo usar todos los endpoints del microservicio.
"""

import requests
import json
from typing import Dict, Any


class BurnoutAPIClient:
    """Cliente de ejemplo para el API de burnout"""
    
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def health_check(self) -> Dict[str, Any]:
        """Verificar estado del servicio"""
        response = self.session.get(f"{self.base_url}/api/burnout/health")
        return response.json()
    
    def get_info(self) -> Dict[str, Any]:
        """Obtener información del servicio"""
        response = self.session.get(f"{self.base_url}/")
        return response.json()
    
    def analyze_user(self, user_id: int, auth_token: str = None) -> Dict[str, Any]:
        """
        Realizar análisis completo de burnout para un usuario
        
        Args:
            user_id: ID del usuario
            auth_token: Token JWT opcional
        """
        headers = {}
        if auth_token:
            headers['Authorization'] = f"Bearer {auth_token}"
        
        response = self.session.get(
            f"{self.base_url}/api/burnout/analyze/{user_id}",
            headers=headers
        )
        return response.json()
    
    def get_alerts(self, user_id: int, auth_token: str = None) -> Dict[str, Any]:
        """Obtener solo las alertas de un usuario"""
        headers = {}
        if auth_token:
            headers['Authorization'] = f"Bearer {auth_token}"
        
        response = self.session.get(
            f"{self.base_url}/api/burnout/alerts/{user_id}",
            headers=headers
        )
        return response.json()
    
    def get_dashboard(self, user_id: int, auth_token: str = None) -> Dict[str, Any]:
        """Obtener dashboard de un usuario"""
        headers = {}
        if auth_token:
            headers['Authorization'] = f"Bearer {auth_token}"
        
        response = self.session.get(
            f"{self.base_url}/api/burnout/dashboard/{user_id}",
            headers=headers
        )
        return response.json()
    
    def get_interventions(self, user_id: int, auth_token: str = None) -> Dict[str, Any]:
        """Obtener plan de intervenciones de un usuario"""
        headers = {}
        if auth_token:
            headers['Authorization'] = f"Bearer {auth_token}"
        
        response = self.session.get(
            f"{self.base_url}/api/burnout/interventions/{user_id}",
            headers=headers
        )
        return response.json()
    
    def analyze_custom(self, user_id: int, metrics: Dict[str, float]) -> Dict[str, Any]:
        """
        Análisis con métricas personalizadas
        
        Args:
            user_id: ID del usuario
            metrics: Diccionario con las métricas del usuario
        """
        response = self.session.post(
            f"{self.base_url}/api/burnout/analyze-custom",
            params={"user_id": user_id},
            json=metrics
        )
        return response.json()


def print_section(title: str):
    """Imprime un separador de sección"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def print_json(data: Dict[str, Any]):
    """Imprime JSON formateado"""
    print(json.dumps(data, indent=2, ensure_ascii=False))


def main():
    """Función principal de demostración"""
    
    # Crear cliente
    client = BurnoutAPIClient()
    
    # 1. Health Check
    print_section("1. Health Check")
    try:
        health = client.health_check()
        print_json(health)
    except Exception as e:
        print(f"Error: {e}")
    
    # 2. Info del servicio
    print_section("2. Información del Servicio")
    try:
        info = client.get_info()
        print_json(info)
    except Exception as e:
        print(f"Error: {e}")
    
    # 3. Análisis con métricas personalizadas
    print_section("3. Análisis con Métricas Personalizadas")
    
    # Métricas de ejemplo - Usuario con riesgo moderado
    sample_metrics = {
        'time_to_recover': 40.0,
        'high_stress_prevalence_perc': 30.0,
        'median_hrv': 35.0,
        'avg_pulse': 80.0,
        'sleep_score': 60.0,
        'media_hrv': 35.0,
        'eda_peaks': 18.0,
        'time_to_recover_hrv': 40.0,
        'weekly_hours_in_meetings': 28.0,
        'time_on_focus_blocks': 3.0,
        'absenteesim_days': 1.5,
        'high_stress_prevalence': 0.30,
        'nps_score': 6.5,
        'intervention_acceptance_rate': 0.45
    }
    
    try:
        analysis = client.analyze_custom(user_id=999, metrics=sample_metrics)
        
        # Mostrar solo resumen de la predicción
        print("\n--- PREDICCIÓN ---")
        print_json(analysis.get('prediction', {}))
        
        # Mostrar alerta si existe
        if analysis.get('alert'):
            print("\n--- ALERTA GENERADA ---")
            alert = analysis['alert']
            print(f"Severidad: {alert['severity']}")
            print(f"Mensaje: {alert['message']}")
            print(f"Requiere intervención: {alert['requires_intervention']}")
        else:
            print("\n--- No se generó alerta ---")
        
        # Mostrar resumen del dashboard
        print("\n--- RESUMEN DASHBOARD ---")
        summary = analysis.get('summary', {})
        overview = summary.get('overview', {})
        print(f"Nivel de burnout: {overview.get('burnout_level')}")
        print(f"Estado de salud: {overview.get('health_status')}")
        print(f"Categoría de riesgo: {overview.get('risk_category')}")
        
        # Mostrar causas principales
        print("\n--- CAUSAS PRINCIPALES ---")
        main_causes = summary.get('main_causes', [])
        for i, cause in enumerate(main_causes[:3], 1):
            print(f"{i}. {cause['cause']} (Impacto: {cause['impact_score']:.1f})")
        
        # Mostrar intervenciones inmediatas
        print("\n--- INTERVENCIONES INMEDIATAS ---")
        interventions = analysis.get('interventions', {})
        immediate = interventions.get('interventions_by_timeframe', {}).get('immediate', [])
        for i, intervention in enumerate(immediate[:3], 1):
            print(f"\n{i}. {intervention['title']}")
            print(f"   Prioridad: {intervention['priority']}")
            print(f"   Categoría: {intervention['category']}")
            print(f"   Pasos:")
            for step in intervention['action_steps'][:2]:
                print(f"     - {step}")
        
    except Exception as e:
        print(f"Error: {e}")
    
    # 4. Ejemplo de escenario de alto riesgo
    print_section("4. Escenario de Alto Riesgo")
    
    high_risk_metrics = {
        'time_to_recover': 60.0,
        'high_stress_prevalence_perc': 55.0,
        'median_hrv': 25.0,
        'avg_pulse': 95.0,
        'sleep_score': 35.0,
        'media_hrv': 25.0,
        'eda_peaks': 30.0,
        'time_to_recover_hrv': 60.0,
        'weekly_hours_in_meetings': 40.0,
        'time_on_focus_blocks': 1.0,
        'absenteesim_days': 3.5,
        'high_stress_prevalence': 0.55,
        'nps_score': 2.5,
        'intervention_acceptance_rate': 0.15
    }
    
    try:
        analysis = client.analyze_custom(user_id=998, metrics=high_risk_metrics)
        
        pred = analysis.get('prediction', {})
        print(f"Probabilidad de burnout: {pred.get('burnout_probability', 0):.1%}")
        print(f"Nivel: {pred.get('burnout_level')}")
        
        if analysis.get('alert'):
            alert = analysis['alert']
            print(f"\n⚠️  ALERTA {alert['severity'].upper()}")
            print(f"Notificar supervisor: {alert.get('notify_manager', False)}")
            print(f"Requiere intervención: {alert.get('requires_intervention', False)}")
        
    except Exception as e:
        print(f"Error: {e}")
    
    # 5. Ejemplo de escenario saludable
    print_section("5. Escenario Saludable (Bajo Riesgo)")
    
    healthy_metrics = {
        'time_to_recover': 20.0,
        'high_stress_prevalence_perc': 8.0,
        'median_hrv': 55.0,
        'avg_pulse': 65.0,
        'sleep_score': 88.0,
        'media_hrv': 55.0,
        'eda_peaks': 8.0,
        'time_to_recover_hrv': 20.0,
        'weekly_hours_in_meetings': 12.0,
        'time_on_focus_blocks': 5.5,
        'absenteesim_days': 0.1,
        'high_stress_prevalence': 0.08,
        'nps_score': 9.2,
        'intervention_acceptance_rate': 0.75
    }
    
    try:
        analysis = client.analyze_custom(user_id=997, metrics=healthy_metrics)
        
        pred = analysis.get('prediction', {})
        print(f"Probabilidad de burnout: {pred.get('burnout_probability', 0):.1%}")
        print(f"Nivel: {pred.get('burnout_level')}")
        
        summary = analysis.get('summary', {})
        overview = summary.get('overview', {})
        print(f"Estado de salud: {overview.get('health_status')}")
        
        if not analysis.get('alert'):
            print("\n✓ No se requieren alertas - Estado saludable")
        
    except Exception as e:
        print(f"Error: {e}")
    
    print_section("FIN DE LAS PRUEBAS")
    print("\nPara más información, visita: http://localhost:8001/docs")


if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║          MICROSERVICIO DE BURNOUT - CLIENTE DE PRUEBA                   ║
║                                                                          ║
║  Este script demuestra el uso del API de análisis de burnout            ║
║  Asegúrate de que el servicio esté corriendo en localhost:8001          ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
    """)
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nPruebas interrumpidas por el usuario.")
    except Exception as e:
        print(f"\n\nError fatal: {e}")


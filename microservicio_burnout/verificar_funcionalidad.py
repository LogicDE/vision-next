"""
Script de Verificación Rápida del Microservicio de Burnout

Este script verifica que todos los componentes estén funcionando correctamente.
"""

import requests
import json
import time

BASE_URL = "http://localhost:8001"

def print_section(title):
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def print_result(test_name, passed, details=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"    {details}")

def test_health_check():
    """Test 1: Health Check"""
    print_section("Test 1: Health Check")
    try:
        response = requests.get(f"{BASE_URL}/api/burnout/health", timeout=5)
        passed = response.status_code == 200
        data = response.json()
        print_result("Health Check", passed, 
                    f"Status: {data.get('status')}, Model: {data.get('model_loaded')}")
        return passed
    except Exception as e:
        print_result("Health Check", False, str(e))
        return False

def test_service_info():
    """Test 2: Service Info"""
    print_section("Test 2: Service Info")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        passed = response.status_code == 200
        data = response.json()
        print_result("Service Info", passed, 
                    f"Version: {data.get('version')}")
        if passed:
            print(f"    Servicios: {', '.join(data.get('services', {}).keys())}")
        return passed
    except Exception as e:
        print_result("Service Info", False, str(e))
        return False

def test_analyze_custom():
    """Test 3: Análisis con Métricas Personalizadas"""
    print_section("Test 3: Análisis con Métricas Personalizadas")
    
    # Métricas de prueba
    metrics = {
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
        response = requests.post(
            f"{BASE_URL}/api/burnout/analyze-custom",
            params={"user_id": 999},
            json=metrics,
            timeout=10
        )
        
        passed = response.status_code == 200
        
        if passed:
            data = response.json()
            pred = data.get('prediction', {})
            prob = pred.get('burnout_probability', 0)
            level = pred.get('burnout_level', 'unknown')
            
            print_result("Análisis Completo", True,
                        f"Probabilidad: {prob:.1%}, Nivel: {level}")
            
            # Verificar componentes
            has_prediction = 'prediction' in data
            has_alert = 'alert' in data
            has_summary = 'summary' in data
            has_interventions = 'interventions' in data
            
            print_result("  └─ Predicción", has_prediction)
            print_result("  └─ Alerta", has_alert)
            print_result("  └─ Dashboard", has_summary)
            print_result("  └─ Intervenciones", has_interventions)
            
            # Mostrar detalles de alerta si existe
            if data.get('alert'):
                alert = data['alert']
                print(f"\n    📢 Alerta Generada:")
                print(f"       Severidad: {alert.get('severity')}")
                print(f"       Requiere intervención: {alert.get('requires_intervention')}")
            
            # Mostrar causas principales
            summary = data.get('summary', {})
            main_causes = summary.get('main_causes', [])
            if main_causes:
                print(f"\n    🔍 Principales Causas:")
                for i, cause in enumerate(main_causes[:3], 1):
                    print(f"       {i}. {cause['cause']} (Impacto: {cause['impact_score']:.1f})")
            
            # Mostrar intervenciones inmediatas
            interventions = data.get('interventions', {})
            immediate = interventions.get('interventions_by_timeframe', {}).get('immediate', [])
            if immediate:
                print(f"\n    💊 Intervenciones Inmediatas: {len(immediate)}")
                for i, interv in enumerate(immediate[:2], 1):
                    print(f"       {i}. {interv['title']} (Prioridad: {interv['priority']})")
            
            return has_prediction and has_summary and has_interventions
        else:
            print_result("Análisis Completo", False, 
                        f"Status Code: {response.status_code}")
            return False
            
    except Exception as e:
        print_result("Análisis Completo", False, str(e))
        return False

def test_alerts_service():
    """Test 4: Servicio de Alertas"""
    print_section("Test 4: AlertsService")
    
    from app.AlertsService import AlertsService
    
    try:
        service = AlertsService()
        
        # Test con riesgo alto
        metrics = {'high_stress_prevalence_perc': 50.0, 'sleep_score': 40.0}
        alert = service.generate_alert(
            user_id=1,
            burnout_probability=0.75,
            user_metrics=metrics
        )
        
        passed = alert is not None and alert['severity'] == 'high'
        print_result("Generación de Alerta", passed,
                    f"Severidad: {alert['severity'] if alert else 'None'}")
        
        return passed
    except Exception as e:
        print_result("AlertsService", False, str(e))
        return False

def test_dashboard_service():
    """Test 5: Servicio de Dashboard"""
    print_section("Test 5: DashboardService")
    
    from app.DashboardService import DashboardService
    
    try:
        service = DashboardService()
        
        metrics = {
            'time_to_recover': 35.0,
            'high_stress_prevalence_perc': 25.0,
            'median_hrv': 40.0,
            'avg_pulse': 75.0,
            'sleep_score': 70.0,
            'weekly_hours_in_meetings': 22.0,
            'time_on_focus_blocks': 4.0,
            'nps_score': 7.5
        }
        
        summary = service.generate_summary(
            user_id=1,
            user_data={},
            burnout_probability=0.6,
            user_metrics=metrics
        )
        
        has_overview = 'overview' in summary
        has_metrics = 'key_metrics' in summary
        has_scores = 'category_scores' in summary
        
        print_result("Resumen Dashboard", has_overview and has_metrics,
                    f"Nivel: {summary['overview']['burnout_level']}")
        print_result("  └─ Overview", has_overview)
        print_result("  └─ Métricas Clave", has_metrics)
        print_result("  └─ Scores por Categoría", has_scores)
        
        return has_overview and has_metrics and has_scores
    except Exception as e:
        print_result("DashboardService", False, str(e))
        return False

def test_intervention_service():
    """Test 6: Servicio de Intervenciones"""
    print_section("Test 6: InterventionService")
    
    from app.InterventionService import InterventionService
    
    try:
        service = InterventionService()
        
        metrics = {'high_stress_prevalence_perc': 35.0, 'sleep_score': 55.0}
        main_causes = [
            {'cause': 'Estrés Alto', 'severity': 'high'}
        ]
        
        interventions = service.generate_interventions(
            user_id=1,
            burnout_probability=0.7,
            user_metrics=metrics,
            main_causes=main_causes
        )
        
        has_timeframes = 'interventions_by_timeframe' in interventions
        has_action_plan = 'action_plan' in interventions
        has_followup = 'follow_up_recommendations' in interventions
        
        total = interventions.get('total_interventions', 0)
        
        print_result("Plan de Intervenciones", total > 0,
                    f"Total: {total} intervenciones")
        print_result("  └─ Por Timeframe", has_timeframes)
        print_result("  └─ Plan de Acción", has_action_plan)
        print_result("  └─ Seguimiento", has_followup)
        
        return has_timeframes and has_action_plan and total > 0
    except Exception as e:
        print_result("InterventionService", False, str(e))
        return False

def main():
    print("""
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║      VERIFICACIÓN DE FUNCIONALIDAD - MICROSERVICIO BURNOUT       ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
    """)
    
    results = []
    
    # Tests API (requieren servicio corriendo)
    print("\n📡 TESTS DE API (requieren servicio en puerto 8001)")
    results.append(("Health Check", test_health_check()))
    results.append(("Service Info", test_service_info()))
    results.append(("Análisis Completo", test_analyze_custom()))
    
    # Tests de servicios directos
    print("\n🔧 TESTS DE SERVICIOS DIRECTOS")
    results.append(("AlertsService", test_alerts_service()))
    results.append(("DashboardService", test_dashboard_service()))
    results.append(("InterventionService", test_intervention_service()))
    
    # Resumen final
    print_section("RESUMEN DE RESULTADOS")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print(f"\nTests Pasados: {passed}/{total}")
    print(f"Porcentaje de Éxito: {(passed/total)*100:.1f}%\n")
    
    for test_name, result in results:
        status = "✅" if result else "❌"
        print(f"{status} {test_name}")
    
    if passed == total:
        print("\n🎉 ¡TODOS LOS TESTS PASARON! El microservicio está funcionando correctamente.\n")
    else:
        print(f"\n⚠️  {total - passed} test(s) fallaron. Revisa los detalles arriba.\n")
    
    print("="*70)
    print("\n💡 Próximos pasos:")
    print("   1. Visita http://localhost:8001/docs para la documentación interactiva")
    print("   2. Ejecuta 'pytest tests/ -v' para tests automatizados completos")
    print("   3. Revisa README.md para más información\n")

if __name__ == "__main__":
    main()


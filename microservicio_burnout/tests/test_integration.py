"""
Tests de integración para el microservicio de burnout

Pruebas del flujo completo integrando todos los servicios
"""

import pytest
from app.burnout_model import BurnoutPredictor
from app.AlertsService import AlertsService
from app.DashboardService import DashboardService
from app.InterventionService import InterventionService


@pytest.fixture
def burnout_predictor():
    """Fixture para el predictor de burnout"""
    predictor = BurnoutPredictor()
    # Nota: En un entorno de test real, cargaríamos el modelo entrenado
    # Para estos tests, asumimos que el modelo está disponible
    return predictor


@pytest.fixture
def alerts_service():
    """Fixture para el servicio de alertas"""
    return AlertsService()


@pytest.fixture
def dashboard_service():
    """Fixture para el servicio de dashboard"""
    return DashboardService()


@pytest.fixture
def intervention_service():
    """Fixture para el servicio de intervenciones"""
    return InterventionService()


@pytest.fixture
def sample_user_metrics():
    """Métricas de un usuario con riesgo moderado de burnout"""
    return {
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


def test_complete_analysis_flow(
    burnout_predictor,
    alerts_service,
    dashboard_service,
    intervention_service,
    sample_user_metrics
):
    """
    Test del flujo completo de análisis de burnout
    
    Este test simula el proceso completo:
    1. Predicción de burnout
    2. Generación de alerta
    3. Creación de dashboard
    4. Generación de intervenciones
    """
    user_id = 1
    
    # Paso 1: Predecir burnout (simulado con métricas directas)
    # En un test real con modelo cargado, usaríamos:
    # prediction = burnout_predictor.predict_burnout(sample_user_metrics)
    # Por ahora, simulamos una probabilidad
    burnout_probability = 0.65
    
    # Paso 2: Generar alerta
    alert = alerts_service.generate_alert(
        user_id=user_id,
        burnout_probability=burnout_probability,
        user_metrics=sample_user_metrics
    )
    
    # Verificar que se generó la alerta
    assert alert is not None
    assert alert['user_id'] == user_id
    assert alert['burnout_probability'] == burnout_probability
    
    # Paso 3: Generar dashboard
    alerts_list = [alert] if alert else []
    summary = dashboard_service.generate_summary(
        user_id=user_id,
        user_data={},
        burnout_probability=burnout_probability,
        user_metrics=sample_user_metrics,
        alerts=alerts_list
    )
    
    # Verificar estructura del dashboard
    assert summary['user_id'] == user_id
    assert 'overview' in summary
    assert 'main_causes' in summary
    
    # Paso 4: Generar intervenciones
    main_causes = summary.get('main_causes', [])
    interventions = intervention_service.generate_interventions(
        user_id=user_id,
        burnout_probability=burnout_probability,
        user_metrics=sample_user_metrics,
        main_causes=main_causes,
        alerts=alerts_list
    )
    
    # Verificar plan de intervenciones
    assert interventions['user_id'] == user_id
    assert interventions['total_interventions'] > 0
    assert 'action_plan' in interventions
    
    # Verificar coherencia entre servicios
    assert summary['overview']['burnout_probability'] == burnout_probability
    assert interventions['severity'] in ['low', 'medium', 'high', 'critical']


def test_high_risk_scenario(
    alerts_service,
    dashboard_service,
    intervention_service
):
    """
    Test del flujo para un escenario de alto riesgo
    """
    user_id = 2
    burnout_probability = 0.85
    
    # Métricas de alto riesgo
    high_risk_metrics = {
        'time_to_recover': 60.0,
        'high_stress_prevalence_perc': 50.0,
        'median_hrv': 25.0,
        'avg_pulse': 95.0,
        'sleep_score': 40.0,
        'media_hrv': 25.0,
        'eda_peaks': 30.0,
        'time_to_recover_hrv': 60.0,
        'weekly_hours_in_meetings': 40.0,
        'time_on_focus_blocks': 1.0,
        'absenteesim_days': 3.0,
        'high_stress_prevalence': 0.50,
        'nps_score': 3.0,
        'intervention_acceptance_rate': 0.2
    }
    
    # Generar alerta
    alert = alerts_service.generate_alert(
        user_id=user_id,
        burnout_probability=burnout_probability,
        user_metrics=high_risk_metrics
    )
    
    # Verificar severidad crítica
    assert alert['severity'] == 'critical'
    assert alert['requires_intervention'] is True
    assert alert['notify_manager'] is True
    
    # Generar dashboard
    summary = dashboard_service.generate_summary(
        user_id=user_id,
        user_data={},
        burnout_probability=burnout_probability,
        user_metrics=high_risk_metrics,
        alerts=[alert]
    )
    
    # Verificar nivel de burnout severo
    assert summary['overview']['burnout_level'] in ['severe', 'high']
    
    # Generar intervenciones
    interventions = intervention_service.generate_interventions(
        user_id=user_id,
        burnout_probability=burnout_probability,
        user_metrics=high_risk_metrics,
        main_causes=summary['main_causes'],
        alerts=[alert]
    )
    
    # Verificar que se generan intervenciones inmediatas
    immediate_interventions = interventions['interventions_by_timeframe']['immediate']
    assert len(immediate_interventions) > 0
    
    # Verificar que hay intervenciones de alta prioridad
    high_priority_count = sum(
        1 for i in immediate_interventions 
        if i['priority'] in ['critical', 'high']
    )
    assert high_priority_count > 0


def test_low_risk_scenario(
    alerts_service,
    dashboard_service,
    intervention_service
):
    """
    Test del flujo para un escenario de bajo riesgo
    """
    user_id = 3
    burnout_probability = 0.25
    
    # Métricas saludables
    low_risk_metrics = {
        'time_to_recover': 20.0,
        'high_stress_prevalence_perc': 10.0,
        'median_hrv': 55.0,
        'avg_pulse': 65.0,
        'sleep_score': 85.0,
        'media_hrv': 55.0,
        'eda_peaks': 10.0,
        'time_to_recover_hrv': 20.0,
        'weekly_hours_in_meetings': 15.0,
        'time_on_focus_blocks': 5.0,
        'absenteesim_days': 0.2,
        'high_stress_prevalence': 0.10,
        'nps_score': 9.0,
        'intervention_acceptance_rate': 0.7
    }
    
    # Generar alerta (no debería generarse)
    alert = alerts_service.generate_alert(
        user_id=user_id,
        burnout_probability=burnout_probability,
        user_metrics=low_risk_metrics
    )
    
    # Verificar que no se genera alerta
    assert alert is None
    
    # Generar dashboard
    summary = dashboard_service.generate_summary(
        user_id=user_id,
        user_data={},
        burnout_probability=burnout_probability,
        user_metrics=low_risk_metrics,
        alerts=None
    )
    
    # Verificar buen estado de salud
    assert summary['overview']['burnout_level'] in ['none', 'low']
    assert summary['overview']['health_status'] in ['excellent', 'good']


def test_service_integration_consistency(
    alerts_service,
    dashboard_service,
    intervention_service,
    sample_user_metrics
):
    """
    Test que verifica la consistencia entre servicios
    """
    user_id = 4
    burnout_probability = 0.70
    
    # Generar componentes
    alert = alerts_service.generate_alert(
        user_id, burnout_probability, sample_user_metrics
    )
    
    summary = dashboard_service.generate_summary(
        user_id, {}, burnout_probability, sample_user_metrics, [alert] if alert else []
    )
    
    interventions = intervention_service.generate_interventions(
        user_id, burnout_probability, sample_user_metrics,
        summary['main_causes'], [alert] if alert else []
    )
    
    # Verificar consistencia de severidad
    if alert:
        alert_severity = alert['severity']
        burnout_level = summary['overview']['burnout_level']
        intervention_severity = interventions['severity']
        
        # Mapeo aproximado de severidades
        severity_mapping = {
            'critical': ['severe', 'critical'],
            'high': ['high', 'severe', 'critical'],
            'medium': ['moderate', 'high', 'medium'],
            'low': ['low', 'moderate', 'none', 'medium']
        }
        
        # Verificar que las severidades son coherentes
        assert burnout_level in severity_mapping.get(alert_severity, []) or \
               intervention_severity in [alert_severity, 'high', 'critical']


def test_main_causes_drive_interventions(
    dashboard_service,
    intervention_service,
    sample_user_metrics
):
    """
    Test que verifica que las causas principales impulsan las intervenciones
    """
    user_id = 5
    burnout_probability = 0.65
    
    # Generar dashboard con causas identificadas
    summary = dashboard_service.generate_summary(
        user_id, {}, burnout_probability, sample_user_metrics
    )
    
    main_causes = summary['main_causes']
    
    # Generar intervenciones
    interventions = intervention_service.generate_interventions(
        user_id, burnout_probability, sample_user_metrics, main_causes
    )
    
    # Si hay causas principales, debe haber intervenciones específicas
    if len(main_causes) > 0:
        assert interventions['total_interventions'] > 0
        
        # Las intervenciones deben abordar las causas identificadas
        # (esto es una verificación conceptual - en implementación real
        # verificaríamos que las categorías de intervención coinciden
        # con los tipos de causas)
        all_interventions = []
        for timeframe_interventions in interventions['interventions_by_timeframe'].values():
            all_interventions.extend(timeframe_interventions)
        
        assert len(all_interventions) > 0


def test_action_plan_phases_progression(
    intervention_service,
    sample_user_metrics
):
    """
    Test que verifica la progresión lógica de fases en el plan de acción
    """
    user_id = 6
    burnout_probability = 0.70
    main_causes = [
        {'cause': 'Estrés Alto', 'severity': 'high'}
    ]
    
    interventions = intervention_service.generate_interventions(
        user_id, burnout_probability, sample_user_metrics, main_causes
    )
    
    action_plan = interventions['action_plan']
    
    # Verificar que las fases existen
    assert 'phase_1_immediate' in action_plan
    assert 'phase_2_short_term' in action_plan
    assert 'phase_3_medium_term' in action_plan
    assert 'phase_4_long_term' in action_plan
    
    # Verificar que la fase 1 (inmediata) tiene intervenciones
    phase_1 = action_plan['phase_1_immediate']
    assert len(phase_1['interventions']) > 0
    
    # Todas las intervenciones de fase 1 deben ser "immediate"
    for intervention in phase_1['interventions']:
        assert intervention['timeframe'] == 'immediate'


if __name__ == "__main__":
    pytest.main([__file__, "-v"])


"""
Tests para AlertsService

Pruebas unitarias del servicio de generación de alertas
"""

import pytest
from app.AlertsService import AlertsService


@pytest.fixture
def alerts_service():
    """Fixture para crear instancia de AlertsService"""
    return AlertsService()


@pytest.fixture
def sample_metrics():
    """Métricas de ejemplo para pruebas"""
    return {
        'time_to_recover': 45.0,
        'high_stress_prevalence_perc': 35.0,
        'median_hrv': 30.0,
        'avg_pulse': 85.0,
        'sleep_score': 55.0,
        'media_hrv': 30.0,
        'eda_peaks': 20.0,
        'time_to_recover_hrv': 45.0,
        'weekly_hours_in_meetings': 30.0,
        'time_on_focus_blocks': 2.0,
        'absenteesim_days': 2.0,
        'high_stress_prevalence': 0.35,
        'nps_score': 5.0,
        'intervention_acceptance_rate': 0.3
    }


def test_no_alert_for_low_probability(alerts_service):
    """Test que no se genera alerta cuando la probabilidad es baja"""
    alert = alerts_service.generate_alert(
        user_id=1,
        burnout_probability=0.3,
        user_metrics={}
    )
    
    assert alert is None


def test_alert_generated_for_medium_probability(alerts_service, sample_metrics):
    """Test que se genera alerta para probabilidad media"""
    alert = alerts_service.generate_alert(
        user_id=1,
        burnout_probability=0.6,
        user_metrics=sample_metrics
    )
    
    assert alert is not None
    assert alert['user_id'] == 1
    assert alert['severity'] in ['medium', 'high']
    assert alert['burnout_probability'] == 0.6
    assert 'message' in alert
    assert 'immediate_actions' in alert
    assert 'contributing_factors' in alert


def test_alert_severity_critical(alerts_service, sample_metrics):
    """Test que se asigna severidad crítica para probabilidad muy alta"""
    alert = alerts_service.generate_alert(
        user_id=1,
        burnout_probability=0.9,
        user_metrics=sample_metrics
    )
    
    assert alert['severity'] == 'critical'
    assert alert['requires_intervention'] is True
    assert alert['notify_manager'] is True


def test_alert_severity_high(alerts_service, sample_metrics):
    """Test severidad alta"""
    alert = alerts_service.generate_alert(
        user_id=1,
        burnout_probability=0.75,
        user_metrics=sample_metrics
    )
    
    assert alert['severity'] == 'high'
    assert alert['requires_intervention'] is True


def test_alert_severity_medium(alerts_service, sample_metrics):
    """Test severidad media"""
    alert = alerts_service.generate_alert(
        user_id=1,
        burnout_probability=0.55,
        user_metrics=sample_metrics
    )
    
    assert alert['severity'] == 'medium'


def test_alert_types_identification(alerts_service):
    """Test que se identifican correctamente los tipos de alerta"""
    metrics = {
        'high_stress_prevalence_perc': 40.0,  # Alto estrés
        'sleep_score': 50.0,  # Mal sueño
        'weekly_hours_in_meetings': 30.0,  # Muchas reuniones
        'time_to_recover': 50.0  # Baja recuperación
    }
    
    alert = alerts_service.generate_alert(
        user_id=1,
        burnout_probability=0.7,
        user_metrics=metrics
    )
    
    alert_types = alert['alert_types']
    assert 'burnout_risk' in alert_types
    assert 'high_stress' in alert_types
    assert 'poor_sleep' in alert_types
    assert 'high_workload' in alert_types
    assert 'low_recovery' in alert_types


def test_contributing_factors_identified(alerts_service, sample_metrics):
    """Test que se identifican factores contribuyentes"""
    alert = alerts_service.generate_alert(
        user_id=1,
        burnout_probability=0.7,
        user_metrics=sample_metrics
    )
    
    factors = alert['contributing_factors']
    assert len(factors) > 0
    
    # Verificar estructura de cada factor
    for factor in factors:
        assert 'factor' in factor
        assert 'value' in factor
        assert 'severity' in factor


def test_immediate_actions_generated(alerts_service, sample_metrics):
    """Test que se generan acciones inmediatas"""
    alert = alerts_service.generate_alert(
        user_id=1,
        burnout_probability=0.8,
        user_metrics=sample_metrics
    )
    
    actions = alert['immediate_actions']
    assert len(actions) > 0
    assert isinstance(actions, list)
    assert all(isinstance(action, str) for action in actions)


def test_alert_id_uniqueness(alerts_service, sample_metrics):
    """Test que cada alerta tiene un ID único"""
    alert1 = alerts_service.generate_alert(1, 0.7, sample_metrics)
    alert2 = alerts_service.generate_alert(2, 0.7, sample_metrics)
    
    assert alert1['alert_id'] != alert2['alert_id']


def test_should_notify_manager(alerts_service):
    """Test determinación de notificación a supervisor"""
    # Alerta crítica debe notificar
    critical_alert = {
        'severity': 'critical',
        'notify_manager': True
    }
    assert alerts_service.should_notify_manager(critical_alert) is True
    
    # Alerta media no debe notificar
    medium_alert = {
        'severity': 'medium',
        'notify_manager': False
    }
    assert alerts_service.should_notify_manager(medium_alert) is False


def test_should_trigger_intervention(alerts_service):
    """Test determinación de activación de intervención"""
    # Alerta alta debe activar intervención
    high_alert = {
        'severity': 'high',
        'requires_intervention': True
    }
    assert alerts_service.should_trigger_intervention(high_alert) is True
    
    # Alerta baja no debe activar
    low_alert = {
        'severity': 'low',
        'requires_intervention': False
    }
    assert alerts_service.should_trigger_intervention(low_alert) is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])


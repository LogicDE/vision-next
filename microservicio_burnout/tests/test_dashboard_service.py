"""
Tests para DashboardService

Pruebas unitarias del servicio de generación de dashboard
"""

import pytest
from app.DashboardService import DashboardService


@pytest.fixture
def dashboard_service():
    """Fixture para crear instancia de DashboardService"""
    return DashboardService()


@pytest.fixture
def sample_metrics():
    """Métricas de ejemplo para pruebas"""
    return {
        'time_to_recover': 35.0,
        'high_stress_prevalence_perc': 25.0,
        'median_hrv': 40.0,
        'avg_pulse': 75.0,
        'sleep_score': 70.0,
        'media_hrv': 40.0,
        'eda_peaks': 15.0,
        'time_to_recover_hrv': 35.0,
        'weekly_hours_in_meetings': 22.0,
        'time_on_focus_blocks': 4.0,
        'absenteesim_days': 1.0,
        'high_stress_prevalence': 0.25,
        'nps_score': 7.5,
        'intervention_acceptance_rate': 0.5
    }


def test_generate_summary_structure(dashboard_service, sample_metrics):
    """Test que el resumen generado tiene la estructura esperada"""
    summary = dashboard_service.generate_summary(
        user_id=1,
        user_data={},
        burnout_probability=0.6,
        user_metrics=sample_metrics,
        alerts=None
    )
    
    # Verificar campos principales
    assert 'user_id' in summary
    assert 'generated_at' in summary
    assert 'overview' in summary
    assert 'key_metrics' in summary
    assert 'category_scores' in summary
    assert 'main_causes' in summary
    assert 'trends' in summary
    assert 'recommendations' in summary
    assert 'metrics_details' in summary


def test_overview_section(dashboard_service, sample_metrics):
    """Test sección overview del dashboard"""
    summary = dashboard_service.generate_summary(
        user_id=1,
        user_data={},
        burnout_probability=0.65,
        user_metrics=sample_metrics
    )
    
    overview = summary['overview']
    assert 'burnout_level' in overview
    assert 'burnout_probability' in overview
    assert 'health_status' in overview
    assert 'risk_category' in overview
    
    assert overview['burnout_probability'] == 0.65
    assert overview['burnout_level'] in ['none', 'low', 'moderate', 'high', 'severe']


def test_key_metrics_analysis(dashboard_service, sample_metrics):
    """Test análisis de métricas clave"""
    summary = dashboard_service.generate_summary(
        user_id=1,
        user_data={},
        burnout_probability=0.5,
        user_metrics=sample_metrics
    )
    
    key_metrics = summary['key_metrics']
    assert len(key_metrics) > 0
    
    # Verificar estructura de cada métrica
    for metric in key_metrics:
        assert 'name' in metric
        assert 'value' in metric
        assert 'status' in metric
        assert 'description' in metric
        assert metric['status'] in ['good', 'warning', 'bad']


def test_category_scores(dashboard_service, sample_metrics):
    """Test cálculo de scores por categoría"""
    summary = dashboard_service.generate_summary(
        user_id=1,
        user_data={},
        burnout_probability=0.5,
        user_metrics=sample_metrics
    )
    
    scores = summary['category_scores']
    
    # Verificar categorías esperadas
    assert 'physiological' in scores
    assert 'cognitive' in scores
    assert 'wellbeing' in scores
    assert 'workload' in scores
    
    # Verificar estructura de cada score
    for category, data in scores.items():
        assert 'score' in data
        assert 'status' in data
        assert 'description' in data
        assert 0 <= data['score'] <= 100


def test_main_causes_identification(dashboard_service, sample_metrics):
    """Test identificación de causas principales"""
    summary = dashboard_service.generate_summary(
        user_id=1,
        user_data={},
        burnout_probability=0.7,
        user_metrics=sample_metrics
    )
    
    causes = summary['main_causes']
    
    # Verificar que se identifican causas
    if len(causes) > 0:
        for cause in causes:
            assert 'cause' in cause
            assert 'impact_score' in cause
            assert 'current_value' in cause
            assert 'threshold' in cause
            assert 'severity' in cause


def test_recommendations_generated(dashboard_service, sample_metrics):
    """Test generación de recomendaciones"""
    summary = dashboard_service.generate_summary(
        user_id=1,
        user_data={},
        burnout_probability=0.7,
        user_metrics=sample_metrics
    )
    
    recommendations = summary['recommendations']
    assert isinstance(recommendations, list)
    assert len(recommendations) > 0
    assert len(recommendations) <= 5  # Máximo 5 recomendaciones


def test_metrics_details_extraction(dashboard_service, sample_metrics):
    """Test extracción de detalles de métricas"""
    summary = dashboard_service.generate_summary(
        user_id=1,
        user_data={},
        burnout_probability=0.5,
        user_metrics=sample_metrics
    )
    
    details = summary['metrics_details']
    
    # Verificar categorías de métricas
    assert 'physiological' in details
    assert 'cognitive' in details
    assert 'behavioral' in details
    
    # Verificar que contienen datos
    assert len(details['physiological']) > 0
    assert len(details['cognitive']) > 0
    assert len(details['behavioral']) > 0


def test_burnout_level_determination(dashboard_service, sample_metrics):
    """Test determinación correcta del nivel de burnout"""
    # Nivel severo
    summary_severe = dashboard_service.generate_summary(
        user_id=1, user_data={}, burnout_probability=0.9, user_metrics=sample_metrics
    )
    assert summary_severe['overview']['burnout_level'] == 'severe'
    
    # Nivel alto
    summary_high = dashboard_service.generate_summary(
        user_id=1, user_data={}, burnout_probability=0.75, user_metrics=sample_metrics
    )
    assert summary_high['overview']['burnout_level'] == 'high'
    
    # Nivel moderado
    summary_mod = dashboard_service.generate_summary(
        user_id=1, user_data={}, burnout_probability=0.6, user_metrics=sample_metrics
    )
    assert summary_mod['overview']['burnout_level'] == 'moderate'
    
    # Nivel bajo
    summary_low = dashboard_service.generate_summary(
        user_id=1, user_data={}, burnout_probability=0.4, user_metrics=sample_metrics
    )
    assert summary_low['overview']['burnout_level'] == 'low'


def test_alerts_summary_with_alerts(dashboard_service, sample_metrics):
    """Test resumen de alertas cuando hay alertas"""
    alerts = [
        {
            'alert_id': 'ALERT-1-001',
            'severity': 'high',
            'message': 'Test alert'
        }
    ]
    
    summary = dashboard_service.generate_summary(
        user_id=1,
        user_data={},
        burnout_probability=0.7,
        user_metrics=sample_metrics,
        alerts=alerts
    )
    
    alerts_summary = summary['alerts_summary']
    assert alerts_summary is not None
    assert alerts_summary['total'] == 1
    assert 'by_severity' in alerts_summary
    assert 'active_alerts' in alerts_summary


def test_alerts_summary_without_alerts(dashboard_service, sample_metrics):
    """Test resumen de alertas cuando no hay alertas"""
    summary = dashboard_service.generate_summary(
        user_id=1,
        user_data={},
        burnout_probability=0.3,
        user_metrics=sample_metrics,
        alerts=None
    )
    
    alerts_summary = summary['alerts_summary']
    assert alerts_summary is None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])


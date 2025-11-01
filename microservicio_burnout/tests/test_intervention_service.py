"""
Tests para InterventionService

Pruebas unitarias del servicio de generación de intervenciones
"""

import pytest
from app.InterventionService import InterventionService


@pytest.fixture
def intervention_service():
    """Fixture para crear instancia de InterventionService"""
    return InterventionService()


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


@pytest.fixture
def sample_main_causes():
    """Causas principales de ejemplo"""
    return [
        {
            'cause': 'Estrés Laboral Alto',
            'impact_score': 18.5,
            'current_value': 35.0,
            'threshold': 30,
            'severity': 'high'
        },
        {
            'cause': 'Mala Calidad del Sueño',
            'impact_score': 15.0,
            'current_value': 55.0,
            'threshold': 65,
            'severity': 'medium'
        }
    ]


def test_generate_interventions_structure(intervention_service, sample_metrics, sample_main_causes):
    """Test que el plan de intervenciones tiene la estructura esperada"""
    plan = intervention_service.generate_interventions(
        user_id=1,
        burnout_probability=0.7,
        user_metrics=sample_metrics,
        main_causes=sample_main_causes
    )
    
    # Verificar campos principales
    assert 'user_id' in plan
    assert 'generated_at' in plan
    assert 'severity' in plan
    assert 'total_interventions' in plan
    assert 'interventions_by_timeframe' in plan
    assert 'action_plan' in plan
    assert 'follow_up_recommendations' in plan
    assert 'expected_outcomes' in plan


def test_severity_determination(intervention_service, sample_metrics, sample_main_causes):
    """Test determinación correcta de severidad"""
    # Severidad crítica
    plan_critical = intervention_service.generate_interventions(
        user_id=1, burnout_probability=0.9,
        user_metrics=sample_metrics, main_causes=sample_main_causes
    )
    assert plan_critical['severity'] == 'critical'
    
    # Severidad alta
    plan_high = intervention_service.generate_interventions(
        user_id=1, burnout_probability=0.75,
        user_metrics=sample_metrics, main_causes=sample_main_causes
    )
    assert plan_high['severity'] == 'high'
    
    # Severidad media
    plan_medium = intervention_service.generate_interventions(
        user_id=1, burnout_probability=0.6,
        user_metrics=sample_metrics, main_causes=sample_main_causes
    )
    assert plan_medium['severity'] == 'medium'


def test_interventions_organized_by_timeframe(intervention_service, sample_metrics, sample_main_causes):
    """Test que las intervenciones están organizadas por marco temporal"""
    plan = intervention_service.generate_interventions(
        user_id=1, burnout_probability=0.7,
        user_metrics=sample_metrics, main_causes=sample_main_causes
    )
    
    by_timeframe = plan['interventions_by_timeframe']
    
    # Verificar que existen todas las categorías temporales
    assert 'immediate' in by_timeframe
    assert 'short_term' in by_timeframe
    assert 'medium_term' in by_timeframe
    assert 'long_term' in by_timeframe
    
    # Verificar que cada categoría es una lista
    for timeframe, interventions in by_timeframe.items():
        assert isinstance(interventions, list)


def test_intervention_structure(intervention_service, sample_metrics, sample_main_causes):
    """Test estructura de cada intervención individual"""
    plan = intervention_service.generate_interventions(
        user_id=1, burnout_probability=0.7,
        user_metrics=sample_metrics, main_causes=sample_main_causes
    )
    
    # Obtener todas las intervenciones
    all_interventions = []
    for interventions in plan['interventions_by_timeframe'].values():
        all_interventions.extend(interventions)
    
    # Verificar estructura de cada intervención
    for intervention in all_interventions:
        assert 'id' in intervention
        assert 'category' in intervention
        assert 'priority' in intervention
        assert 'timeframe' in intervention
        assert 'title' in intervention
        assert 'description' in intervention
        assert 'action_steps' in intervention
        assert 'expected_benefit' in intervention
        assert 'duration' in intervention
        
        # Verificar que action_steps es una lista
        assert isinstance(intervention['action_steps'], list)
        assert len(intervention['action_steps']) > 0


def test_interventions_for_stress(intervention_service):
    """Test que se generan intervenciones para estrés"""
    metrics_stress = {
        'high_stress_prevalence_perc': 60.0  # Estrés muy alto
    }
    
    main_causes = [
        {'cause': 'Estrés Laboral Alto', 'severity': 'high'}
    ]
    
    plan = intervention_service.generate_interventions(
        user_id=1, burnout_probability=0.7,
        user_metrics=metrics_stress, main_causes=main_causes
    )
    
    # Verificar que hay intervenciones
    assert plan['total_interventions'] > 0


def test_interventions_for_sleep(intervention_service):
    """Test que se generan intervenciones para problemas de sueño"""
    metrics_sleep = {
        'sleep_score': 40.0  # Sueño muy malo
    }
    
    main_causes = [
        {'cause': 'Mala Calidad del Sueño', 'severity': 'high'}
    ]
    
    plan = intervention_service.generate_interventions(
        user_id=1, burnout_probability=0.7,
        user_metrics=metrics_sleep, main_causes=main_causes
    )
    
    assert plan['total_interventions'] > 0


def test_interventions_for_meetings(intervention_service):
    """Test que se generan intervenciones para exceso de reuniones"""
    metrics_meetings = {
        'weekly_hours_in_meetings': 35.0  # Muchas reuniones
    }
    
    main_causes = [
        {'cause': 'Exceso de Reuniones', 'severity': 'high'}
    ]
    
    plan = intervention_service.generate_interventions(
        user_id=1, burnout_probability=0.6,
        user_metrics=metrics_meetings, main_causes=main_causes
    )
    
    assert plan['total_interventions'] > 0


def test_action_plan_structure(intervention_service, sample_metrics, sample_main_causes):
    """Test estructura del plan de acción"""
    plan = intervention_service.generate_interventions(
        user_id=1, burnout_probability=0.7,
        user_metrics=sample_metrics, main_causes=sample_main_causes
    )
    
    action_plan = plan['action_plan']
    
    # Verificar fases
    assert 'phase_1_immediate' in action_plan
    assert 'phase_2_short_term' in action_plan
    assert 'phase_3_medium_term' in action_plan
    assert 'phase_4_long_term' in action_plan
    
    # Verificar estructura de cada fase
    for phase_name, phase_data in action_plan.items():
        assert 'description' in phase_data
        assert 'interventions' in phase_data
        assert 'success_criteria' in phase_data


def test_follow_up_recommendations(intervention_service, sample_metrics, sample_main_causes):
    """Test recomendaciones de seguimiento"""
    plan = intervention_service.generate_interventions(
        user_id=1, burnout_probability=0.7,
        user_metrics=sample_metrics, main_causes=sample_main_causes
    )
    
    follow_up = plan['follow_up_recommendations']
    
    assert 'frequency' in follow_up
    assert 'duration' in follow_up
    assert 'metrics_to_monitor' in follow_up
    assert 'reassessment_triggers' in follow_up
    
    # Verificar que son listas
    assert isinstance(follow_up['metrics_to_monitor'], list)
    assert isinstance(follow_up['reassessment_triggers'], list)


def test_expected_outcomes(intervention_service, sample_metrics, sample_main_causes):
    """Test definición de resultados esperados"""
    plan = intervention_service.generate_interventions(
        user_id=1, burnout_probability=0.7,
        user_metrics=sample_metrics, main_causes=sample_main_causes
    )
    
    outcomes = plan['expected_outcomes']
    
    assert 'timeframe' in outcomes
    assert 'expected_burnout_reduction' in outcomes
    assert 'key_improvements' in outcomes
    assert 'success_indicators' in outcomes
    
    # Verificar que son listas
    assert isinstance(outcomes['key_improvements'], list)
    assert isinstance(outcomes['success_indicators'], list)


def test_no_duplicate_interventions(intervention_service, sample_metrics, sample_main_causes):
    """Test que no hay intervenciones duplicadas"""
    plan = intervention_service.generate_interventions(
        user_id=1, burnout_probability=0.7,
        user_metrics=sample_metrics, main_causes=sample_main_causes
    )
    
    # Recolectar todos los IDs de intervenciones
    all_ids = []
    for interventions in plan['interventions_by_timeframe'].values():
        all_ids.extend([i['id'] for i in interventions])
    
    # Verificar que no hay duplicados
    assert len(all_ids) == len(set(all_ids))


def test_priority_sorting(intervention_service, sample_metrics, sample_main_causes):
    """Test que las intervenciones están ordenadas por prioridad"""
    plan = intervention_service.generate_interventions(
        user_id=1, burnout_probability=0.8,
        user_metrics=sample_metrics, main_causes=sample_main_causes
    )
    
    # Las intervenciones inmediatas deberían tener prioridades más altas
    immediate = plan['interventions_by_timeframe']['immediate']
    
    if len(immediate) > 1:
        priorities = ['critical', 'high', 'medium', 'low']
        priority_values = {p: i for i, p in enumerate(priorities)}
        
        for i in range(len(immediate) - 1):
            current_priority = priority_values[immediate[i]['priority']]
            next_priority = priority_values[immediate[i + 1]['priority']]
            # La prioridad actual debe ser igual o mayor (menor número = mayor prioridad)
            assert current_priority <= next_priority


if __name__ == "__main__":
    pytest.main([__file__, "-v"])


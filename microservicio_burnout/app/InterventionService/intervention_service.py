"""
InterventionService - Genera propuestas de intervención personalizadas

Este servicio crea recomendaciones específicas y accionables basadas en
el análisis de burnout, métricas del usuario y factores de riesgo identificados.
"""

from typing import Dict, Any, List
from datetime import datetime
from enum import Enum


class InterventionType(str, Enum):
    """Tipos de intervención"""
    IMMEDIATE = "immediate"  # Acciones inmediatas
    SHORT_TERM = "short_term"  # 1-2 semanas
    MEDIUM_TERM = "medium_term"  # 1-3 meses
    LONG_TERM = "long_term"  # Más de 3 meses


class InterventionCategory(str, Enum):
    """Categorías de intervención"""
    STRESS_MANAGEMENT = "stress_management"
    SLEEP_IMPROVEMENT = "sleep_improvement"
    WORKLOAD_ADJUSTMENT = "workload_adjustment"
    PHYSICAL_ACTIVITY = "physical_activity"
    SOCIAL_SUPPORT = "social_support"
    PROFESSIONAL_HELP = "professional_help"
    WORK_ENVIRONMENT = "work_environment"
    RECOVERY_STRATEGIES = "recovery_strategies"


class InterventionPriority(str, Enum):
    """Prioridad de la intervención"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class InterventionService:
    """
    Servicio para generar propuestas de intervención personalizadas
    """
    
    def __init__(self):
        """Inicializa el servicio de intervenciones"""
        self.intervention_catalog = self._build_intervention_catalog()
    
    def generate_interventions(
        self,
        user_id: int,
        burnout_probability: float,
        user_metrics: Dict[str, Any],
        main_causes: List[Dict[str, Any]],
        alerts: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Genera un plan de intervenciones personalizadas
        
        Args:
            user_id: ID del usuario
            burnout_probability: Probabilidad de burnout
            user_metrics: Métricas del usuario
            main_causes: Principales causas identificadas
            alerts: Alertas activas
            
        Returns:
            Plan de intervenciones estructurado por tipo y prioridad
        """
        # Determinar severidad general
        severity = self._determine_severity(burnout_probability)
        
        # Generar intervenciones por categoría
        interventions = []
        
        # Intervenciones basadas en causas principales
        for cause in main_causes[:3]:  # Top 3 causas
            cause_interventions = self._generate_interventions_for_cause(
                cause, 
                user_metrics,
                severity
            )
            interventions.extend(cause_interventions)
        
        # Intervenciones generales según severidad
        general_interventions = self._generate_general_interventions(
            severity, 
            user_metrics
        )
        interventions.extend(general_interventions)
        
        # Eliminar duplicados y ordenar por prioridad
        interventions = self._deduplicate_and_sort(interventions)
        
        # Organizar por tipo temporal
        organized = self._organize_by_timeframe(interventions)
        
        # Generar plan de acción
        action_plan = self._create_action_plan(organized, severity)
        
        return {
            "user_id": user_id,
            "generated_at": datetime.now().isoformat(),
            "severity": severity,
            "total_interventions": len(interventions),
            "interventions_by_timeframe": organized,
            "action_plan": action_plan,
            "follow_up_recommendations": self._generate_follow_up(severity),
            "expected_outcomes": self._define_expected_outcomes(severity)
        }
    
    def _determine_severity(self, probability: float) -> str:
        """Determina severidad para clasificar intervenciones"""
        if probability >= 0.85:
            return "critical"
        elif probability >= 0.70:
            return "high"
        elif probability >= 0.50:
            return "medium"
        else:
            return "low"
    
    def _generate_interventions_for_cause(
        self,
        cause: Dict[str, Any],
        metrics: Dict[str, Any],
        severity: str
    ) -> List[Dict[str, Any]]:
        """Genera intervenciones específicas para una causa"""
        interventions = []
        cause_name = cause.get("cause", "")
        
        if "Estrés" in cause_name:
            interventions.extend(self._interventions_stress(metrics, severity))
        
        if "Sueño" in cause_name:
            interventions.extend(self._interventions_sleep(metrics, severity))
        
        if "Reuniones" in cause_name:
            interventions.extend(self._interventions_meetings(metrics, severity))
        
        if "Recuperación" in cause_name:
            interventions.extend(self._interventions_recovery(metrics, severity))
        
        if "Cardíaca" in cause_name or "HRV" in cause_name:
            interventions.extend(self._interventions_hrv(metrics, severity))
        
        if "Enfoque" in cause_name:
            interventions.extend(self._interventions_focus(metrics, severity))
        
        return interventions
    
    def _interventions_stress(
        self, 
        metrics: Dict[str, Any], 
        severity: str
    ) -> List[Dict[str, Any]]:
        """Intervenciones para manejo del estrés"""
        stress_level = metrics.get('high_stress_prevalence_perc', 0)
        
        interventions = [
            {
                "id": "STRESS-001",
                "category": InterventionCategory.STRESS_MANAGEMENT.value,
                "priority": InterventionPriority.HIGH.value if severity in ["critical", "high"] else InterventionPriority.MEDIUM.value,
                "timeframe": InterventionType.IMMEDIATE.value,
                "title": "Implementar pausas de respiración consciente",
                "description": "Realizar 3-5 minutos de respiración profunda cada 2 horas de trabajo",
                "action_steps": [
                    "Configurar recordatorios cada 2 horas",
                    "Practicar respiración 4-7-8 (inhalar 4s, sostener 7s, exhalar 8s)",
                    "Realizar 5 ciclos completos por sesión"
                ],
                "expected_benefit": "Reducción del 15-20% en niveles de estrés percibido",
                "duration": "15 minutos diarios"
            },
            {
                "id": "STRESS-002",
                "category": InterventionCategory.STRESS_MANAGEMENT.value,
                "priority": InterventionPriority.MEDIUM.value,
                "timeframe": InterventionType.SHORT_TERM.value,
                "title": "Iniciar práctica de mindfulness",
                "description": "Programa estructurado de mindfulness de 8 semanas",
                "action_steps": [
                    "Inscribirse en programa de mindfulness corporativo o app (Headspace, Calm)",
                    "Dedicar 10-15 minutos diarios a la práctica",
                    "Llevar diario de progreso"
                ],
                "expected_benefit": "Mejora en regulación emocional y reducción de estrés",
                "duration": "8 semanas"
            }
        ]
        
        if stress_level > 50:
            interventions.append({
                "id": "STRESS-003",
                "category": InterventionCategory.PROFESSIONAL_HELP.value,
                "priority": InterventionPriority.HIGH.value,
                "timeframe": InterventionType.IMMEDIATE.value,
                "title": "Consulta con psicólogo organizacional",
                "description": "Evaluación profesional y desarrollo de estrategias personalizadas",
                "action_steps": [
                    "Contactar con departamento de RRHH o salud ocupacional",
                    "Agendar evaluación inicial",
                    "Seguir plan de tratamiento recomendado"
                ],
                "expected_benefit": "Estrategias profesionales de afrontamiento del estrés",
                "duration": "Variable según necesidad"
            })
        
        return interventions
    
    def _interventions_sleep(
        self, 
        metrics: Dict[str, Any], 
        severity: str
    ) -> List[Dict[str, Any]]:
        """Intervenciones para mejorar calidad del sueño"""
        sleep_score = metrics.get('sleep_score', 70)
        
        interventions = [
            {
                "id": "SLEEP-001",
                "category": InterventionCategory.SLEEP_IMPROVEMENT.value,
                "priority": InterventionPriority.HIGH.value if sleep_score < 60 else InterventionPriority.MEDIUM.value,
                "timeframe": InterventionType.IMMEDIATE.value,
                "title": "Establecer rutina de higiene del sueño",
                "description": "Implementar protocolo de preparación para dormir",
                "action_steps": [
                    "Establecer horario fijo para dormir y despertar (7 días/semana)",
                    "Apagar pantallas 60 minutos antes de dormir",
                    "Mantener temperatura ambiente entre 18-20°C",
                    "Evitar cafeína después de las 14:00h"
                ],
                "expected_benefit": "Mejora del 20-30% en calidad del sueño en 2-3 semanas",
                "duration": "Hábito permanente"
            },
            {
                "id": "SLEEP-002",
                "category": InterventionCategory.SLEEP_IMPROVEMENT.value,
                "priority": InterventionPriority.MEDIUM.value,
                "timeframe": InterventionType.SHORT_TERM.value,
                "title": "Crear ambiente óptimo para dormir",
                "description": "Optimizar el entorno de descanso",
                "action_steps": [
                    "Instalar cortinas blackout o usar antifaz",
                    "Usar tapones para oídos o ruido blanco",
                    "Evaluar calidad del colchón y almohada",
                    "Limitar actividades no relacionadas con sueño en la cama"
                ],
                "expected_benefit": "Reducción en tiempo de conciliación del sueño",
                "duration": "2-4 semanas para adaptación"
            }
        ]
        
        if sleep_score < 50:
            interventions.append({
                "id": "SLEEP-003",
                "category": InterventionCategory.PROFESSIONAL_HELP.value,
                "priority": InterventionPriority.HIGH.value,
                "timeframe": InterventionType.SHORT_TERM.value,
                "title": "Evaluación médica del sueño",
                "description": "Consulta con especialista en medicina del sueño",
                "action_steps": [
                    "Agendar cita con especialista del sueño",
                    "Llevar diario de sueño de 2 semanas",
                    "Considerar estudio de sueño (polisomnografía) si es necesario"
                ],
                "expected_benefit": "Diagnóstico y tratamiento de posibles trastornos del sueño",
                "duration": "Variable según diagnóstico"
            })
        
        return interventions
    
    def _interventions_meetings(
        self, 
        metrics: Dict[str, Any], 
        severity: str
    ) -> List[Dict[str, Any]]:
        """Intervenciones para optimizar carga de reuniones"""
        return [
            {
                "id": "WORK-001",
                "category": InterventionCategory.WORKLOAD_ADJUSTMENT.value,
                "priority": InterventionPriority.HIGH.value,
                "timeframe": InterventionType.IMMEDIATE.value,
                "title": "Auditoría y optimización de reuniones",
                "description": "Revisar y reducir reuniones innecesarias o ineficientes",
                "action_steps": [
                    "Revisar calendario de la última semana",
                    "Identificar reuniones que podrían ser emails o mensajes",
                    "Declinar o delegar reuniones de bajo valor",
                    "Implementar regla: ninguna reunión sin agenda clara"
                ],
                "expected_benefit": "Reducción del 30-40% en tiempo de reuniones",
                "duration": "1-2 semanas"
            },
            {
                "id": "WORK-002",
                "category": InterventionCategory.WORKLOAD_ADJUSTMENT.value,
                "priority": InterventionPriority.MEDIUM.value,
                "timeframe": InterventionType.SHORT_TERM.value,
                "title": "Implementar bloques de trabajo sin interrupciones",
                "description": "Proteger tiempo para trabajo profundo",
                "action_steps": [
                    "Bloquear mínimo 2 horas diarias para trabajo concentrado",
                    "Configurar estado 'No molestar' durante estos bloques",
                    "Comunicar disponibilidad al equipo",
                    "Posponer reuniones que interfieran con bloques de enfoque"
                ],
                "expected_benefit": "Incremento del 50% en productividad durante trabajo concentrado",
                "duration": "Implementación permanente"
            },
            {
                "id": "WORK-003",
                "category": InterventionCategory.WORK_ENVIRONMENT.value,
                "priority": InterventionPriority.MEDIUM.value,
                "timeframe": InterventionType.MEDIUM_TERM.value,
                "title": "Negociar ajustes de carga laboral",
                "description": "Discutir redistribución de responsabilidades con supervisor",
                "action_steps": [
                    "Documentar carga de trabajo actual y tiempo dedicado",
                    "Agendar reunión con supervisor/manager",
                    "Proponer redistribución o delegación de tareas",
                    "Establecer límites realistas y sostenibles"
                ],
                "expected_benefit": "Balance de carga de trabajo más saludable",
                "duration": "1-2 meses para implementación completa"
            }
        ]
    
    def _interventions_recovery(
        self, 
        metrics: Dict[str, Any], 
        severity: str
    ) -> List[Dict[str, Any]]:
        """Intervenciones para mejorar recuperación"""
        return [
            {
                "id": "RECOV-001",
                "category": InterventionCategory.RECOVERY_STRATEGIES.value,
                "priority": InterventionPriority.HIGH.value,
                "timeframe": InterventionType.IMMEDIATE.value,
                "title": "Implementar microdescansos",
                "description": "Pausas breves pero frecuentes durante la jornada",
                "action_steps": [
                    "Cada 25-30 minutos: pausa de 5 minutos (técnica Pomodoro)",
                    "Levantarse, estirarse, caminar brevemente",
                    "Realizar ejercicios de movilidad cervical y de hombros",
                    "Descanso visual: mirar punto lejano por 20 segundos"
                ],
                "expected_benefit": "Reducción de fatiga acumulada durante el día",
                "duration": "Hábito diario permanente"
            },
            {
                "id": "RECOV-002",
                "category": InterventionCategory.RECOVERY_STRATEGIES.value,
                "priority": InterventionPriority.MEDIUM.value,
                "timeframe": InterventionType.SHORT_TERM.value,
                "title": "Establecer rituales de desconexión",
                "description": "Crear separación clara entre trabajo y vida personal",
                "action_steps": [
                    "Definir hora de fin de jornada y respetarla",
                    "Crear ritual de cierre: cerrar aplicaciones, ordenar escritorio",
                    "No revisar correos laborales después de horario laboral",
                    "Realizar actividad de transición (caminar, ejercicio, hobby)"
                ],
                "expected_benefit": "Mejora en calidad de recuperación fuera del trabajo",
                "duration": "2-3 semanas para establecer hábito"
            }
        ]
    
    def _interventions_hrv(
        self, 
        metrics: Dict[str, Any], 
        severity: str
    ) -> List[Dict[str, Any]]:
        """Intervenciones para mejorar variabilidad cardíaca"""
        return [
            {
                "id": "HRV-001",
                "category": InterventionCategory.PHYSICAL_ACTIVITY.value,
                "priority": InterventionPriority.MEDIUM.value,
                "timeframe": InterventionType.SHORT_TERM.value,
                "title": "Programa de ejercicio cardiovascular moderado",
                "description": "Actividad física regular para mejorar salud cardiovascular",
                "action_steps": [
                    "Realizar 30 minutos de ejercicio aeróbico moderado, 5 días/semana",
                    "Opciones: caminar rápido, nadar, bicicleta, baile",
                    "Mantener frecuencia cardíaca en 50-70% del máximo",
                    "Incrementar intensidad gradualmente"
                ],
                "expected_benefit": "Mejora del 10-15% en HRV en 8-12 semanas",
                "duration": "Mínimo 8 semanas, idealmente permanente"
            },
            {
                "id": "HRV-002",
                "category": InterventionCategory.STRESS_MANAGEMENT.value,
                "priority": InterventionPriority.MEDIUM.value,
                "timeframe": InterventionType.IMMEDIATE.value,
                "title": "Entrenamiento de coherencia cardíaca",
                "description": "Técnica de respiración para mejorar HRV",
                "action_steps": [
                    "Practicar respiración a 6 respiraciones por minuto (5s inhalar, 5s exhalar)",
                    "Realizar 3 sesiones de 5 minutos al día",
                    "Usar app de biofeedback si está disponible",
                    "Practicar en momentos de estrés"
                ],
                "expected_benefit": "Mejora inmediata en regulación del sistema nervioso autónomo",
                "duration": "Práctica diaria permanente"
            }
        ]
    
    def _interventions_focus(
        self, 
        metrics: Dict[str, Any], 
        severity: str
    ) -> List[Dict[str, Any]]:
        """Intervenciones para mejorar tiempo de enfoque"""
        return [
            {
                "id": "FOCUS-001",
                "category": InterventionCategory.WORKLOAD_ADJUSTMENT.value,
                "priority": InterventionPriority.HIGH.value,
                "timeframe": InterventionType.IMMEDIATE.value,
                "title": "Implementar bloques de trabajo profundo",
                "description": "Períodos dedicados exclusivamente a tareas de alta concentración",
                "action_steps": [
                    "Bloquear 2-4 horas diarias en calendario para trabajo profundo",
                    "Eliminar todas las distracciones: cerrar email, chat, redes sociales",
                    "Usar auriculares con cancelación de ruido",
                    "Trabajar en las tareas más importantes o complejas"
                ],
                "expected_benefit": "Duplicar producción de trabajo de alto valor",
                "duration": "Implementar inmediatamente, mantener permanentemente"
            }
        ]
    
    def _generate_general_interventions(
        self,
        severity: str,
        metrics: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Genera intervenciones generales según severidad"""
        interventions = []
        
        if severity in ["critical", "high"]:
            interventions.append({
                "id": "GEN-001",
                "category": InterventionCategory.PROFESSIONAL_HELP.value,
                "priority": InterventionPriority.CRITICAL.value,
                "timeframe": InterventionType.IMMEDIATE.value,
                "title": "Evaluación profesional de salud mental",
                "description": "Consulta urgente con profesional de salud mental",
                "action_steps": [
                    "Contactar con programa de asistencia al empleado (EAP) si está disponible",
                    "Agendar cita con psicólogo clínico u ocupacional",
                    "Considerar licencia médica temporal si es necesario",
                    "Informar a supervisor/RRHH sobre necesidad de apoyo"
                ],
                "expected_benefit": "Evaluación profesional y plan de tratamiento personalizado",
                "duration": "Inmediato"
            })
        
        # Intervención de soporte social
        interventions.append({
            "id": "GEN-002",
            "category": InterventionCategory.SOCIAL_SUPPORT.value,
            "priority": InterventionPriority.MEDIUM.value,
            "timeframe": InterventionType.SHORT_TERM.value,
            "title": "Fortalecer red de apoyo social",
            "description": "Conectar con red de soporte personal y profesional",
            "action_steps": [
                "Identificar personas de confianza en el trabajo y fuera de él",
                "Compartir preocupaciones con personas de apoyo",
                "Participar en grupos de apoyo o comunidades",
                "Programar tiempo regular con amigos y familia"
            ],
            "expected_benefit": "Mejor manejo del estrés y sentimiento de conexión",
            "duration": "Desarrollo continuo"
        })
        
        return interventions
    
    def _deduplicate_and_sort(
        self, 
        interventions: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Elimina duplicados y ordena por prioridad"""
        # Eliminar duplicados por ID
        unique = {i["id"]: i for i in interventions}
        interventions = list(unique.values())
        
        # Ordenar por prioridad
        priority_order = {
            InterventionPriority.CRITICAL.value: 0,
            InterventionPriority.HIGH.value: 1,
            InterventionPriority.MEDIUM.value: 2,
            InterventionPriority.LOW.value: 3
        }
        
        interventions.sort(key=lambda x: priority_order.get(x["priority"], 99))
        
        return interventions
    
    def _organize_by_timeframe(
        self, 
        interventions: List[Dict[str, Any]]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Organiza intervenciones por marco temporal"""
        organized = {
            InterventionType.IMMEDIATE.value: [],
            InterventionType.SHORT_TERM.value: [],
            InterventionType.MEDIUM_TERM.value: [],
            InterventionType.LONG_TERM.value: []
        }
        
        for intervention in interventions:
            timeframe = intervention.get("timeframe", InterventionType.MEDIUM_TERM.value)
            organized[timeframe].append(intervention)
        
        return organized
    
    def _create_action_plan(
        self, 
        organized: Dict[str, List[Dict[str, Any]]], 
        severity: str
    ) -> Dict[str, Any]:
        """Crea un plan de acción estructurado"""
        return {
            "phase_1_immediate": {
                "description": "Acciones a implementar en las próximas 24-48 horas",
                "interventions": organized[InterventionType.IMMEDIATE.value][:3],
                "success_criteria": "Inicio de implementación de al menos 2 acciones"
            },
            "phase_2_short_term": {
                "description": "Acciones para implementar en las próximas 1-2 semanas",
                "interventions": organized[InterventionType.SHORT_TERM.value][:4],
                "success_criteria": "Establecimiento de rutinas y hábitos nuevos"
            },
            "phase_3_medium_term": {
                "description": "Cambios estructurales a implementar en 1-3 meses",
                "interventions": organized[InterventionType.MEDIUM_TERM.value][:3],
                "success_criteria": "Mejoras medibles en métricas de bienestar"
            },
            "phase_4_long_term": {
                "description": "Cambios sostenibles a largo plazo",
                "interventions": organized[InterventionType.LONG_TERM.value],
                "success_criteria": "Mantenimiento de hábitos saludables y prevención"
            }
        }
    
    def _generate_follow_up(self, severity: str) -> Dict[str, Any]:
        """Genera recomendaciones de seguimiento"""
        if severity in ["critical", "high"]:
            frequency = "semanal"
            duration = "primeros 2 meses"
        elif severity == "medium":
            frequency = "quincenal"
            duration = "primer mes, luego mensual"
        else:
            frequency = "mensual"
            duration = "primeros 3 meses"
        
        return {
            "frequency": frequency,
            "duration": duration,
            "metrics_to_monitor": [
                "Probabilidad de burnout",
                "Niveles de estrés",
                "Calidad del sueño",
                "Adherencia a intervenciones",
                "Percepción subjetiva de mejora"
            ],
            "reassessment_triggers": [
                "Empeoramiento de síntomas",
                "Nuevos factores estresantes",
                "Cambios laborales significativos",
                "Falta de progreso después de 4 semanas"
            ]
        }
    
    def _define_expected_outcomes(self, severity: str) -> Dict[str, Any]:
        """Define resultados esperados del plan de intervención"""
        if severity in ["critical", "high"]:
            timeframe = "3-6 meses"
            reduction = "30-50%"
        elif severity == "medium":
            timeframe = "2-3 meses"
            reduction = "40-60%"
        else:
            timeframe = "1-2 meses"
            reduction = "50-70%"
        
        return {
            "timeframe": timeframe,
            "expected_burnout_reduction": reduction,
            "key_improvements": [
                "Reducción en niveles de estrés percibido",
                "Mejora en calidad del sueño",
                "Mayor sensación de control y eficacia",
                "Mejor balance trabajo-vida personal",
                "Incremento en energía y motivación"
            ],
            "success_indicators": [
                "Disminución de alertas críticas",
                "Mejora en métricas fisiológicas (HRV, pulso en reposo)",
                "Reducción en ausentismo",
                "Mayor satisfacción laboral (NPS)",
                "Feedback positivo del empleado"
            ]
        }
    
    def _build_intervention_catalog(self) -> Dict[str, Any]:
        """
        Construye catálogo de intervenciones disponibles
        Este método podría cargarse desde una base de datos en producción
        """
        return {
            "stress_management": [],
            "sleep_improvement": [],
            "workload_adjustment": [],
            "physical_activity": [],
            "social_support": [],
            "professional_help": [],
            "work_environment": [],
            "recovery_strategies": []
        }


"""
Pantalla de visualización de gráficas.
Muestra diferentes tipos de gráficas según el tipo de datos.
"""

import customtkinter as ctk
from ui.base_screen import BaseScreen
from utils.charts import ChartGenerator, ChartManager
from config import COLORS, FONTS, SPACING
import threading


class ChartsScreen(BaseScreen):
    """
    Pantalla para visualización de gráficas.
    Soporta diferentes tipos de métricas y visualizaciones.
    """
    
    def __init__(self, parent, app_controller, chart_type: str, title: str):
        """
        Inicializa la pantalla de gráficas.
        
        Args:
            parent: Widget padre
            app_controller: Controlador principal
            chart_type: Tipo de gráfica ('employee', 'group', 'burnout', 'alerts')
            title: Título de la pantalla
        """
        self.chart_type = chart_type
        self.chart_title = title
        self.chart_manager = None
        super().__init__(parent, app_controller)
        self.setup_ui()
        self.load_chart_data()
    
    def setup_ui(self):
        """Configura la interfaz de usuario."""
        # Header con botón de retroceso
        self.create_header(self.chart_title, show_back=True)
        
        # Contenido
        content = ctk.CTkFrame(self, fg_color=COLORS['background'])
        content.pack(fill='both', expand=True, padx=SPACING['md'], pady=SPACING['md'])
        
        # Indicador de carga
        self.loading_label = ctk.CTkLabel(
            content,
            text="Cargando datos...",
            font=FONTS['body'],
            text_color=COLORS['text_secondary']
        )
        self.loading_label.pack(expand=True)
        
        # Frame para la gráfica
        self.chart_frame = ctk.CTkFrame(
            content,
            fg_color=COLORS['surface'],
            corner_radius=12
        )
        # No se empaqueta hasta que se carguen los datos
    
    def load_chart_data(self):
        """Carga los datos de la gráfica en segundo plano."""
        thread = threading.Thread(target=self.fetch_and_display_chart)
        thread.daemon = True
        thread.start()
    
    def fetch_and_display_chart(self):
        """Obtiene los datos y genera la gráfica."""
        try:
            if self.chart_type == 'employee':
                data = self.app_controller.data_service.get_employee_metrics()
                figure = self.create_employee_chart(data)
            elif self.chart_type == 'group':
                data = self.app_controller.data_service.get_group_metrics()
                figure = self.create_group_chart(data)
            elif self.chart_type == 'burnout':
                data = self.app_controller.data_service.get_burnout_predictions()
                figure = self.create_burnout_chart(data)
            elif self.chart_type == 'alerts':
                data = self.app_controller.data_service.get_alerts()
                figure = self.create_alerts_chart(data)
            else:
                raise ValueError(f"Tipo de gráfica no soportado: {self.chart_type}")
            
            self.after(0, lambda: self.display_chart(figure))
        except Exception as e:
            print(f"Error generando gráfica: {e}")
            self.after(0, lambda: self.show_error(f"Error al cargar gráfica: {str(e)}"))
    
    def create_employee_chart(self, data: list):
        """Crea la gráfica de métricas de empleados."""
        if not data:
            raise ValueError("No hay datos de empleados disponibles")
        
        # Crear dashboard de bienestar
        return ChartGenerator.create_wellness_dashboard(data)
    
    def create_group_chart(self, data: list):
        """Crea la gráfica de métricas de grupos."""
        if not data:
            raise ValueError("No hay datos de grupos disponibles")
        
        # Crear gráfica de líneas con múltiples métricas
        return ChartGenerator.create_line_chart(
            data,
            x_key='date',
            y_keys=['avg_wellness', 'avg_stress'],
            title='Métricas de Grupo',
            labels=['Bienestar Promedio', 'Estrés Promedio'],
            figsize=(7, 5)
        )
    
    def create_burnout_chart(self, data: dict):
        """Crea la gráfica de predicciones de burnout."""
        if not data:
            raise ValueError("No hay datos de burnout disponibles")
        
        return ChartGenerator.create_burnout_risk_chart(data)
    
    def create_alerts_chart(self, data: list):
        """Crea la gráfica de alertas."""
        if not data:
            raise ValueError("No hay alertas disponibles")
        
        # Agrupar alertas por severidad
        severity_counts = {'high': 0, 'medium': 0, 'low': 0}
        for alert in data:
            severity = alert.get('severity', 'low')
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        # Crear gráfica de pastel
        chart_data = {
            'Alta': severity_counts['high'],
            'Media': severity_counts['medium'],
            'Baja': severity_counts['low']
        }
        
        return ChartGenerator.create_pie_chart(
            chart_data,
            title='Distribución de Alertas por Severidad',
            figsize=(6, 6)
        )
    
    def display_chart(self, figure):
        """
        Muestra la gráfica en la pantalla.
        
        Args:
            figure: Figure de matplotlib a mostrar
        """
        # Ocultar indicador de carga
        self.loading_label.pack_forget()
        
        # Mostrar frame de gráfica
        self.chart_frame.pack(fill='both', expand=True)
        
        # Crear y mostrar gráfica
        self.chart_manager = ChartManager(self.chart_frame)
        self.chart_manager.display_chart(figure)


class EmployeeMetricsScreen(ChartsScreen):
    """Pantalla específica para métricas de empleados."""
    
    def __init__(self, parent, app_controller):
        super().__init__(parent, app_controller, 'employee', '📊 Métricas de Empleados')


class GroupMetricsScreen(ChartsScreen):
    """Pantalla específica para métricas de grupos."""
    
    def __init__(self, parent, app_controller):
        super().__init__(parent, app_controller, 'group', '👥 Métricas de Grupos')


class BurnoutPredictionsScreen(ChartsScreen):
    """Pantalla específica para predicciones de burnout."""
    
    def __init__(self, parent, app_controller):
        super().__init__(parent, app_controller, 'burnout', '🔥 Predicciones de Burnout')


class AlertsScreen(ChartsScreen):
    """Pantalla específica para alertas."""
    
    def __init__(self, parent, app_controller):
        super().__init__(parent, app_controller, 'alerts', '🔔 Alertas Activas')


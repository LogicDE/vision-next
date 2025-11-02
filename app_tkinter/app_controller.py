"""
Controlador principal de la aplicación.
Maneja la navegación entre pantallas y el ciclo de vida de la app.
"""

import customtkinter as ctk
from auth.jwt_manager import JWTManager
from services.data_service import DataService
from config import (
    WINDOW_WIDTH, 
    WINDOW_HEIGHT, 
    MIN_WINDOW_WIDTH, 
    MIN_WINDOW_HEIGHT,
    COLORS,
    INACTIVITY_TIMEOUT
)
from datetime import datetime, timedelta
from typing import Optional


class AppController:
    """
    Controlador principal de la aplicación móvil Tkinter.
    Gestiona la navegación, autenticación y ciclo de vida.
    """
    
    def __init__(self):
        """Inicializa el controlador de la aplicación."""
        # Configuración de CustomTkinter
        ctk.set_appearance_mode("light")
        ctk.set_default_color_theme("blue")
        
        # Ventana principal
        self.root = ctk.CTk()
        self.root.title("VitaNexo - Sistema de Monitoreo")
        self.root.geometry(f"{WINDOW_WIDTH}x{WINDOW_HEIGHT}")
        self.root.minsize(MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT)
        
        # Servicios
        self.jwt_manager = JWTManager()
        self.data_service = DataService(self.jwt_manager)
        
        # Estado de la aplicación
        self.current_screen = None
        self.screens_history = []
        
        # Monitoreo de inactividad
        self.last_activity = datetime.now()
        self.inactivity_check_id = None
        
        # Container principal para las pantallas
        self.main_container = ctk.CTkFrame(self.root, fg_color=COLORS['background'])
        self.main_container.pack(fill='both', expand=True)
        
        # Bind eventos de actividad
        self.setup_activity_monitoring()
    
    def setup_activity_monitoring(self):
        """Configura el monitoreo de actividad del usuario."""
        def on_activity(event=None):
            self.last_activity = datetime.now()
        
        # Eventos que cuentan como actividad
        self.root.bind('<Motion>', on_activity)
        self.root.bind('<Button>', on_activity)
        self.root.bind('<Key>', on_activity)
        
        # Iniciar verificación periódica
        self.check_inactivity()
    
    def check_inactivity(self):
        """Verifica si ha habido inactividad y hace logout automático."""
        if self.jwt_manager.is_authenticated():
            time_inactive = (datetime.now() - self.last_activity).seconds
            
            if time_inactive > INACTIVITY_TIMEOUT:
                print("Sesión expirada por inactividad")
                self.data_service.logout()
                self.show_login()
        
        # Verificar cada 30 segundos
        self.inactivity_check_id = self.root.after(30000, self.check_inactivity)
    
    def start(self):
        """Inicia la aplicación."""
        # Verificar si hay sesión guardada
        if self.jwt_manager.load_tokens():
            print("Sesión anterior encontrada")
            self.show_dashboard()
        else:
            self.show_login()
        
        # Iniciar loop principal
        self.root.mainloop()
    
    def show_screen(self, screen_class, *args, **kwargs):
        """
        Muestra una nueva pantalla.
        
        Args:
            screen_class: Clase de la pantalla a mostrar
            *args: Argumentos posicionales para el constructor
            **kwargs: Argumentos nombrados para el constructor
        """
        # Destruir pantalla actual
        if self.current_screen:
            self.current_screen.destroy()
        
        # Crear y mostrar nueva pantalla
        self.current_screen = screen_class(self.main_container, self, *args, **kwargs)
        self.current_screen.pack(fill='both', expand=True)
    
    def show_login(self):
        """Muestra la pantalla de login."""
        from ui.login_screen import LoginScreen
        self.screens_history = []  # Limpiar historial
        self.show_screen(LoginScreen)
    
    def show_dashboard(self):
        """Muestra el dashboard principal."""
        from ui.dashboard_screen import DashboardScreen
        self.screens_history = []  # Limpiar historial al entrar al dashboard
        self.show_screen(DashboardScreen)
    
    def show_employee_metrics(self):
        """Muestra las métricas de empleados."""
        from ui.charts_screen import EmployeeMetricsScreen
        self.screens_history.append('dashboard')
        self.show_screen(EmployeeMetricsScreen)
    
    def show_group_metrics(self):
        """Muestra las métricas de grupos."""
        from ui.charts_screen import GroupMetricsScreen
        self.screens_history.append('dashboard')
        self.show_screen(GroupMetricsScreen)
    
    def show_burnout_predictions(self):
        """Muestra las predicciones de burnout."""
        from ui.charts_screen import BurnoutPredictionsScreen
        self.screens_history.append('dashboard')
        self.show_screen(BurnoutPredictionsScreen)
    
    def show_alerts(self):
        """Muestra las alertas activas."""
        from ui.charts_screen import AlertsScreen
        self.screens_history.append('dashboard')
        self.show_screen(AlertsScreen)
    
    def navigate_back(self):
        """Navega a la pantalla anterior."""
        if self.screens_history:
            previous = self.screens_history.pop()
            
            if previous == 'dashboard':
                self.show_dashboard()
            elif previous == 'login':
                self.show_login()
        else:
            # Si no hay historial, ir al dashboard
            self.show_dashboard()
    
    def on_closing(self):
        """Maneja el evento de cierre de la aplicación."""
        # Cancelar verificaciones periódicas
        if self.inactivity_check_id:
            self.root.after_cancel(self.inactivity_check_id)
        
        # Cerrar ventana
        self.root.destroy()


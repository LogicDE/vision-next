"""
Pantalla principal del dashboard.
Muestra resumen de métricas y acceso rápido a funciones.
"""

import customtkinter as ctk
from ui.base_screen import BaseScreen
from config import COLORS, FONTS, SPACING
import threading


class DashboardScreen(BaseScreen):
    """
    Dashboard principal con resumen de métricas y navegación.
    Optimizado para dispositivos móviles.
    """
    
    def __init__(self, parent, app_controller):
        """
        Inicializa el dashboard.
        
        Args:
            parent: Widget padre
            app_controller: Controlador principal
        """
        super().__init__(parent, app_controller)
        self.dashboard_data = None
        self.setup_ui()
        self.load_dashboard_data()
    
    def setup_ui(self):
        """Configura la interfaz de usuario."""
        # Header
        header = self.create_header_with_user()
        
        # Contenido scrollable
        self.content = self.create_scrollable_content()
        
        # Mensaje de bienvenida
        self.welcome_card = self.create_welcome_card()
        
        # Tarjetas de métricas
        self.metrics_container = ctk.CTkFrame(self.content, fg_color='transparent')
        self.metrics_container.pack(fill='x', pady=SPACING['md'])
        
        # Actividades recientes
        self.activities_card = self.create_card(self.content, "Actividades Recientes")
        
        # Botones de navegación
        self.create_navigation_buttons()
    
    def create_header_with_user(self) -> ctk.CTkFrame:
        """Crea el header con información del usuario."""
        header = ctk.CTkFrame(self, fg_color=COLORS['primary'], height=100)
        header.pack(fill='x', padx=0, pady=0)
        header.pack_propagate(False)
        
        # Contenedor interno
        header_content = ctk.CTkFrame(header, fg_color='transparent')
        header_content.pack(fill='both', expand=True, padx=SPACING['md'], pady=SPACING['md'])
        
        # Container izquierdo (título + estado)
        left_container = ctk.CTkFrame(header_content, fg_color='transparent')
        left_container.pack(side='left', anchor='w', fill='y')
        
        # Título
        title_label = ctk.CTkLabel(
            left_container,
            text="Dashboard",
            font=FONTS['title'],
            text_color='white'
        )
        title_label.pack(anchor='w')
        
        # Indicador de estado de conexión
        connection_status = self.get_connection_status()
        status_icon = "🟢" if connection_status == "online" else "🔴"
        status_text = "Online" if connection_status == "online" else "Demo"
        
        status_label = ctk.CTkLabel(
            left_container,
            text=f"{status_icon} {status_text}",
            font=FONTS['caption'],
            text_color='white'
        )
        status_label.pack(anchor='w')
        
        # Botón de logout
        logout_btn = ctk.CTkButton(
            header_content,
            text="🚪",
            width=50,
            height=50,
            font=('Segoe UI', 20),
            fg_color='transparent',
            hover_color=COLORS['primary_dark'],
            command=self.handle_logout
        )
        logout_btn.pack(side='right', anchor='e')
        
        return header
    
    def get_connection_status(self) -> str:
        """
        Obtiene el estado de conexión actual.
        
        Returns:
            'online' si está conectado al backend, 'offline' en modo demo
        """
        if self.app_controller.data_service.is_simulated_mode():
            return "offline"
        
        # Verificar si el backend está disponible
        if self.app_controller.data_service.is_backend_available():
            return "online"
        
        return "offline"
    
    def create_welcome_card(self) -> ctk.CTkFrame:
        """Crea la tarjeta de bienvenida."""
        card = ctk.CTkFrame(
            self.content,
            fg_color=COLORS['primary'],
            corner_radius=12,
            height=100
        )
        card.pack(fill='x', pady=SPACING['md'])
        card.pack_propagate(False)
        
        # Contenido
        content_frame = ctk.CTkFrame(card, fg_color='transparent')
        content_frame.pack(fill='both', expand=True, padx=SPACING['lg'], pady=SPACING['md'])
        
        # Saludo
        user_data = self.app_controller.jwt_manager.get_user_data()
        user_name = user_data.get('nombre', 'Usuario') if user_data else 'Usuario'
        
        greeting_label = ctk.CTkLabel(
            content_frame,
            text=f"¡Hola, {user_name}!",
            font=FONTS['subtitle'],
            text_color='white'
        )
        greeting_label.pack(anchor='w')
        
        subtitle_label = ctk.CTkLabel(
            content_frame,
            text="Bienvenido a tu panel de control",
            font=FONTS['body'],
            text_color='white'
        )
        subtitle_label.pack(anchor='w')
        
        # Indicador de modo simulado (si aplica)
        if hasattr(self, 'dashboard_data') and self.dashboard_data and self.dashboard_data.get('_simulated'):
            sim_label = ctk.CTkLabel(
                content_frame,
                text="📡 Modo Demo (Backend no disponible)",
                font=FONTS['caption'],
                text_color='#FFD700'  # Dorado para indicar modo demo
            )
            sim_label.pack(anchor='w', pady=(SPACING['xs'], 0))
        
        return card
    
    def load_dashboard_data(self):
        """Carga los datos del dashboard en segundo plano."""
        thread = threading.Thread(target=self.fetch_dashboard_data)
        thread.daemon = True
        thread.start()
    
    def fetch_dashboard_data(self):
        """Obtiene los datos del dashboard desde el servicio."""
        try:
            self.dashboard_data = self.app_controller.data_service.get_dashboard_data()
            self.after(0, self.update_dashboard_ui)
        except Exception as e:
            print(f"Error cargando datos del dashboard: {e}")
            self.after(0, lambda: self.show_error(f"Error cargando datos: {str(e)}"))
    
    def update_dashboard_ui(self):
        """Actualiza la UI con los datos cargados."""
        if not self.dashboard_data:
            return
        
        # Actualizar métricas
        metrics = self.dashboard_data.get('metrics', {})
        self.create_metrics_cards(metrics)
        
        # Actualizar actividades
        activities = self.dashboard_data.get('recent_activities', [])
        self.create_activities_list(activities)
    
    def create_metrics_cards(self, metrics: dict):
        """Crea las tarjetas de métricas principales."""
        # Limpiar contenedor
        for widget in self.metrics_container.winfo_children():
            widget.destroy()
        
        # Obtener número de contenidos nuevos
        new_count = self.app_controller.data_service.get_new_content_count()
        
        # Grid de métricas (2 columnas)
        metrics_data = [
            {
                'title': 'Empleados',
                'value': str(metrics.get('total_employees', 0)),
                'icon': '👥',
                'color': COLORS['primary']
            },
            {
                'title': 'Grupos',
                'value': str(metrics.get('active_groups', 0)),
                'icon': '👨‍👩‍👧‍👦',
                'color': COLORS['secondary']
            },
            {
                'title': 'Nuevos',
                'value': str(new_count) if new_count > 0 else '0',
                'icon': '🆕',
                'color': COLORS['warning'] if new_count > 0 else COLORS['text_secondary']
            },
            {
                'title': 'Bienestar',
                'value': f"{metrics.get('avg_wellness_score', 0):.1f}",
                'icon': '💚',
                'color': COLORS['success']
            },
        ]
        
        # Marcar contenidos como vistos
        if new_count > 0:
            self.app_controller.data_service.mark_content_as_viewed()
        
        for i, metric in enumerate(metrics_data):
            row = i // 2
            col = i % 2
            
            card = self.create_metric_card(
                self.metrics_container,
                metric['title'],
                metric['value'],
                metric['icon'],
                metric['color']
            )
            card.grid(row=row, column=col, padx=SPACING['sm'], pady=SPACING['sm'], sticky='ew')
        
        # Configurar peso de columnas
        self.metrics_container.columnconfigure(0, weight=1)
        self.metrics_container.columnconfigure(1, weight=1)
    
    def create_metric_card(self, parent, title: str, value: str, icon: str, color: str) -> ctk.CTkFrame:
        """Crea una tarjeta individual de métrica."""
        card = ctk.CTkFrame(
            parent,
            fg_color=COLORS['surface'],
            corner_radius=12,
            border_width=2,
            border_color=color,
            height=100
        )
        
        # Icono
        icon_label = ctk.CTkLabel(
            card,
            text=icon,
            font=('Segoe UI', 32)
        )
        icon_label.pack(pady=(SPACING['sm'], 0))
        
        # Valor
        value_label = ctk.CTkLabel(
            card,
            text=value,
            font=FONTS['subtitle'],
            text_color=color
        )
        value_label.pack()
        
        # Título
        title_label = ctk.CTkLabel(
            card,
            text=title,
            font=FONTS['caption'],
            text_color=COLORS['text_secondary']
        )
        title_label.pack(pady=(0, SPACING['sm']))
        
        return card
    
    def create_activities_list(self, activities: list):
        """Crea la lista de actividades recientes."""
        # Limpiar actividades anteriores
        for widget in self.activities_card.winfo_children():
            if widget.winfo_class() != 'CTkLabel':  # Mantener el título
                widget.destroy()
        
        if not activities:
            no_data_label = ctk.CTkLabel(
                self.activities_card,
                text="No hay actividades recientes",
                font=FONTS['body'],
                text_color=COLORS['text_secondary']
            )
            no_data_label.pack(padx=SPACING['md'], pady=SPACING['md'])
            return
        
        # Crear lista de actividades
        for activity in activities[:5]:  # Máximo 5 actividades
            activity_frame = self.create_activity_item(activity)
            activity_frame.pack(fill='x', padx=SPACING['md'], pady=SPACING['xs'])
    
    def create_activity_item(self, activity: dict) -> ctk.CTkFrame:
        """Crea un item de actividad."""
        item = ctk.CTkFrame(
            self.activities_card,
            fg_color='transparent',
            height=60
        )
        
        # Icono según tipo
        icons = {
            'alert': '🔔',
            'intervention': '🏥',
            'survey': '📋',
            'default': '📌'
        }
        icon = icons.get(activity.get('type'), icons['default'])
        
        icon_label = ctk.CTkLabel(
            item,
            text=icon,
            font=('Segoe UI', 24)
        )
        icon_label.pack(side='left', padx=(0, SPACING['sm']))
        
        # Contenido
        content_frame = ctk.CTkFrame(item, fg_color='transparent')
        content_frame.pack(side='left', fill='both', expand=True)
        
        message_label = ctk.CTkLabel(
            content_frame,
            text=activity.get('message', ''),
            font=FONTS['body'],
            text_color=COLORS['text_primary'],
            anchor='w'
        )
        message_label.pack(anchor='w', fill='x')
        
        time_label = ctk.CTkLabel(
            content_frame,
            text=activity.get('timestamp', ''),
            font=FONTS['caption'],
            text_color=COLORS['text_secondary'],
            anchor='w'
        )
        time_label.pack(anchor='w')
        
        return item
    
    def create_navigation_buttons(self):
        """Crea los botones de navegación principales."""
        nav_card = self.create_card(self.content, "Accesos Rápidos")
        
        buttons_data = [
            {'text': '📊 Métricas de Empleados', 'command': self.show_employee_metrics},
            {'text': '👥 Métricas de Grupos', 'command': self.show_group_metrics},
            {'text': '🔥 Predicciones de Burnout', 'command': self.show_burnout_predictions},
            {'text': '🔔 Alertas Activas', 'command': self.show_alerts},
        ]
        
        for btn_data in buttons_data:
            btn = ctk.CTkButton(
                nav_card,
                text=btn_data['text'],
                height=50,
                font=FONTS['body_bold'],
                fg_color=COLORS['surface'],
                hover_color=COLORS['primary'],
                text_color=COLORS['text_primary'],
                border_width=2,
                border_color=COLORS['border'],
                anchor='w',
                command=btn_data['command']
            )
            btn.pack(fill='x', padx=SPACING['md'], pady=SPACING['xs'])
    
    def show_employee_metrics(self):
        """Navega a las métricas de empleados."""
        self.app_controller.show_employee_metrics()
    
    def show_group_metrics(self):
        """Navega a las métricas de grupos."""
        self.app_controller.show_group_metrics()
    
    def show_burnout_predictions(self):
        """Navega a las predicciones de burnout."""
        self.app_controller.show_burnout_predictions()
    
    def show_alerts(self):
        """Navega a las alertas."""
        self.app_controller.show_alerts()
    
    def handle_logout(self):
        """Maneja el cierre de sesión."""
        # Confirmar logout
        dialog = ctk.CTkToplevel(self)
        dialog.title("Cerrar Sesión")
        dialog.geometry("300x150")
        dialog.resizable(False, False)
        dialog.transient(self.master)
        dialog.grab_set()
        
        message = ctk.CTkLabel(
            dialog,
            text="¿Desea cerrar sesión?",
            font=FONTS['body'],
            wraplength=250
        )
        message.pack(pady=SPACING['lg'])
        
        buttons_frame = ctk.CTkFrame(dialog, fg_color='transparent')
        buttons_frame.pack(pady=SPACING['md'])
        
        def confirm_logout():
            dialog.destroy()
            self.app_controller.data_service.logout()
            self.app_controller.show_login()
        
        cancel_btn = ctk.CTkButton(
            buttons_frame,
            text="Cancelar",
            width=100,
            command=dialog.destroy,
            fg_color=COLORS['text_secondary']
        )
        cancel_btn.pack(side='left', padx=SPACING['sm'])
        
        logout_btn = ctk.CTkButton(
            buttons_frame,
            text="Cerrar Sesión",
            width=120,
            command=confirm_logout,
            fg_color=COLORS['error']
        )
        logout_btn.pack(side='left', padx=SPACING['sm'])


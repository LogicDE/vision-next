"""
Pantalla de inicio de sesión.
Interfaz de login optimizada para dispositivos móviles.
"""

import customtkinter as ctk
from ui.base_screen import BaseScreen
from config import COLORS, FONTS, SPACING, BUTTON_HEIGHT, BUTTON_WIDTH
import threading


class LoginScreen(BaseScreen):
    """
    Pantalla de inicio de sesión con autenticación JWT.
    Diseño optimizado para pantallas táctiles.
    """
    
    def __init__(self, parent, app_controller):
        """
        Inicializa la pantalla de login.
        
        Args:
            parent: Widget padre
            app_controller: Controlador principal
        """
        super().__init__(parent, app_controller)
        self.setup_ui()
    
    def setup_ui(self):
        """Configura la interfaz de usuario."""
        # Container principal centrado con scroll
        main_container = ctk.CTkScrollableFrame(
            self, 
            fg_color='transparent',
            scrollbar_button_color=COLORS['primary'],
            scrollbar_button_hover_color=COLORS['primary_dark']
        )
        main_container.pack(fill='both', expand=True, padx=SPACING['md'], pady=SPACING['md'])
        
        # Espaciador superior
        spacer_top = ctk.CTkFrame(main_container, fg_color='transparent', height=20)
        spacer_top.pack()
        
        # Logo/Icono
        logo_label = ctk.CTkLabel(
            main_container,
            text="🏥",
            font=('Segoe UI', 64)
        )
        logo_label.pack(pady=(SPACING['md'], SPACING['sm']))
        
        # Título
        title_label = ctk.CTkLabel(
            main_container,
            text="VitaNexo",
            font=FONTS['title'],
            text_color=COLORS['primary']
        )
        title_label.pack(pady=(0, SPACING['xs']))
        
        # Subtítulo
        subtitle_label = ctk.CTkLabel(
            main_container,
            text="Sistema de Monitoreo de Bienestar",
            font=FONTS['caption'],
            text_color=COLORS['text_secondary']
        )
        subtitle_label.pack(pady=(0, SPACING['lg']))
        
        # Card de login (sin restricción de tamaño fijo)
        login_card = ctk.CTkFrame(
            main_container,
            fg_color=COLORS['surface'],
            corner_radius=16,
            border_width=1,
            border_color=COLORS['border']
        )
        login_card.pack(fill='x', pady=SPACING['md'], padx=SPACING['lg'])
        
        # Formulario
        form_frame = ctk.CTkFrame(login_card, fg_color='transparent')
        form_frame.pack(fill='x', padx=SPACING['lg'], pady=SPACING['lg'])
        
        # Campo de email
        email_label = ctk.CTkLabel(
            form_frame,
            text="Email",
            font=FONTS['body_bold'],
            text_color=COLORS['text_primary'],
            anchor='w'
        )
        email_label.pack(fill='x', pady=(0, SPACING['xs']))
        
        self.email_entry = ctk.CTkEntry(
            form_frame,
            height=BUTTON_HEIGHT,
            font=FONTS['body'],
            placeholder_text="usuario@example.com",
            border_width=1,
            border_color=COLORS['border']
        )
        self.email_entry.pack(fill='x', pady=(0, SPACING['md']))
        
        # Campo de contraseña
        password_label = ctk.CTkLabel(
            form_frame,
            text="Contraseña",
            font=FONTS['body_bold'],
            text_color=COLORS['text_primary'],
            anchor='w'
        )
        password_label.pack(fill='x', pady=(0, SPACING['xs']))
        
        self.password_entry = ctk.CTkEntry(
            form_frame,
            height=BUTTON_HEIGHT,
            font=FONTS['body'],
            placeholder_text="••••••••",
            show="•",
            border_width=1,
            border_color=COLORS['border']
        )
        self.password_entry.pack(fill='x', pady=(0, SPACING['lg']))
        
        # Bind Enter key
        self.password_entry.bind('<Return>', lambda e: self.handle_login())
        
        # Botón de login
        self.login_button = ctk.CTkButton(
            form_frame,
            text="Iniciar Sesión",
            height=BUTTON_HEIGHT,
            font=FONTS['button'],
            fg_color=COLORS['primary'],
            hover_color=COLORS['primary_dark'],
            command=self.handle_login
        )
        self.login_button.pack(fill='x', pady=(0, SPACING['sm']))
        
        # Mensaje de error (inicialmente oculto)
        self.error_label = ctk.CTkLabel(
            form_frame,
            text="",
            font=FONTS['caption'],
            text_color=COLORS['error'],
            wraplength=250
        )
        self.error_label.pack(pady=(SPACING['sm'], 0))
        
        # Información de prueba (solo para desarrollo)
        info_label = ctk.CTkLabel(
            main_container,
            text="📝 Credenciales de prueba:\nadmin@vitanexo.com / admin123",
            font=FONTS['caption'],
            text_color=COLORS['text_secondary'],
            justify='center'
        )
        info_label.pack(pady=SPACING['lg'])
        
        # Espaciador inferior
        spacer_bottom = ctk.CTkFrame(main_container, fg_color='transparent', height=20)
        spacer_bottom.pack()
    
    def handle_login(self):
        """Maneja el proceso de inicio de sesión."""
        email = self.email_entry.get().strip()
        password = self.password_entry.get().strip()
        
        # Validación básica
        if not email or not password:
            self.show_error_message("Por favor complete todos los campos")
            return
        
        # Validar formato de email
        if '@' not in email:
            self.show_error_message("Por favor ingrese un email válido")
            return
        
        # Deshabilitar botón durante el login
        self.login_button.configure(state='disabled', text="Iniciando sesión...")
        self.error_label.configure(text="")
        
        # Ejecutar login en thread separado para no bloquear UI
        thread = threading.Thread(target=self.perform_login, args=(email, password))
        thread.daemon = True
        thread.start()
    
    def perform_login(self, email: str, password: str):
        """
        Realiza el login en segundo plano.
        
        Args:
            email: Email del usuario
            password: Contraseña
        """
        try:
            # Intentar login a través del servicio de datos
            result = self.app_controller.data_service.login(email, password)
            
            if result.get('success'):
                # Login exitoso
                self.after(0, self.on_login_success)
            else:
                self.after(0, lambda: self.show_error_message("Credenciales inválidas"))
                self.after(0, self.reset_login_button)
        except Exception as e:
            error_msg = str(e)
            if "Credenciales inválidas" in error_msg:
                self.after(0, lambda: self.show_error_message("Email o contraseña incorrectos"))
            else:
                self.after(0, lambda: self.show_error_message(f"Error de conexión: {error_msg}"))
            self.after(0, self.reset_login_button)
    
    def on_login_success(self):
        """Callback ejecutado cuando el login es exitoso."""
        # Limpiar campos
        self.email_entry.delete(0, 'end')
        self.password_entry.delete(0, 'end')
        
        # Navegar al dashboard
        self.app_controller.show_dashboard()
    
    def reset_login_button(self):
        """Resetea el estado del botón de login."""
        self.login_button.configure(state='normal', text="Iniciar Sesión")
    
    def show_error_message(self, message: str):
        """
        Muestra un mensaje de error en la pantalla.
        
        Args:
            message: Mensaje de error a mostrar
        """
        self.error_label.configure(text=message)


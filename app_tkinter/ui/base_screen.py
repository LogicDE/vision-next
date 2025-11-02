"""
Pantalla base para todas las pantallas de la aplicación.
Proporciona funcionalidad común y estructura.
"""

import customtkinter as ctk
from typing import Optional, Callable
from config import COLORS, FONTS, SPACING


class BaseScreen(ctk.CTkFrame):
    """
    Clase base para todas las pantallas de la aplicación.
    Proporciona estructura común y métodos auxiliares.
    """
    
    def __init__(self, parent, app_controller):
        """
        Inicializa la pantalla base.
        
        Args:
            parent: Widget padre
            app_controller: Controlador principal de la aplicación
        """
        super().__init__(parent, fg_color=COLORS['background'])
        self.app_controller = app_controller
        self.pack(fill='both', expand=True)
    
    def create_header(self, title: str, show_back: bool = False) -> ctk.CTkFrame:
        """
        Crea un header estándar para la pantalla.
        
        Args:
            title: Título del header
            show_back: Si se debe mostrar botón de retroceso
            
        Returns:
            Frame del header
        """
        header = ctk.CTkFrame(self, fg_color=COLORS['primary'], height=80)
        header.pack(fill='x', padx=0, pady=0)
        header.pack_propagate(False)
        
        # Botón de retroceso (opcional)
        if show_back:
            back_btn = ctk.CTkButton(
                header,
                text="←",
                width=50,
                height=50,
                font=('Segoe UI', 24),
                fg_color='transparent',
                hover_color=COLORS['primary_dark'],
                command=self.go_back
            )
            back_btn.pack(side='left', padx=SPACING['md'], pady=SPACING['md'])
        
        # Título
        title_label = ctk.CTkLabel(
            header,
            text=title,
            font=FONTS['title'],
            text_color='white'
        )
        title_label.pack(side='left', padx=SPACING['md'], pady=SPACING['md'])
        
        return header
    
    def create_scrollable_content(self) -> ctk.CTkScrollableFrame:
        """
        Crea un frame scrollable para el contenido principal.
        
        Returns:
            Frame scrollable
        """
        content = ctk.CTkScrollableFrame(
            self,
            fg_color=COLORS['background']
        )
        content.pack(fill='both', expand=True, padx=SPACING['md'], pady=SPACING['md'])
        return content
    
    def create_card(self, parent, title: Optional[str] = None) -> ctk.CTkFrame:
        """
        Crea una tarjeta (card) para agrupar contenido.
        
        Args:
            parent: Widget padre
            title: Título de la tarjeta (opcional)
            
        Returns:
            Frame de la tarjeta
        """
        card = ctk.CTkFrame(
            parent,
            fg_color=COLORS['surface'],
            corner_radius=12,
            border_width=1,
            border_color=COLORS['border']
        )
        card.pack(fill='x', pady=SPACING['sm'])
        
        if title:
            title_label = ctk.CTkLabel(
                card,
                text=title,
                font=FONTS['heading'],
                text_color=COLORS['text_primary']
            )
            title_label.pack(anchor='w', padx=SPACING['md'], pady=(SPACING['md'], SPACING['sm']))
        
        return card
    
    def show_loading(self, message: str = "Cargando...") -> ctk.CTkLabel:
        """
        Muestra un indicador de carga.
        
        Args:
            message: Mensaje a mostrar
            
        Returns:
            Label del mensaje de carga
        """
        loading_label = ctk.CTkLabel(
            self,
            text=message,
            font=FONTS['body'],
            text_color=COLORS['text_secondary']
        )
        loading_label.place(relx=0.5, rely=0.5, anchor='center')
        return loading_label
    
    def show_error(self, message: str) -> None:
        """
        Muestra un mensaje de error en un diálogo.
        
        Args:
            message: Mensaje de error
        """
        dialog = ctk.CTkToplevel(self)
        dialog.title("Error")
        dialog.geometry("300x150")
        dialog.resizable(False, False)
        
        # Centrar diálogo
        dialog.transient(self.master)
        dialog.grab_set()
        
        # Contenido
        error_label = ctk.CTkLabel(
            dialog,
            text="❌",
            font=('Segoe UI', 36)
        )
        error_label.pack(pady=(SPACING['md'], 0))
        
        message_label = ctk.CTkLabel(
            dialog,
            text=message,
            font=FONTS['body'],
            wraplength=250
        )
        message_label.pack(pady=SPACING['sm'])
        
        ok_btn = ctk.CTkButton(
            dialog,
            text="OK",
            width=120,
            height=40,
            command=dialog.destroy,
            fg_color=COLORS['error'],
            hover_color=COLORS['error']
        )
        ok_btn.pack(pady=SPACING['md'])
    
    def show_success(self, message: str, callback: Optional[Callable] = None) -> None:
        """
        Muestra un mensaje de éxito.
        
        Args:
            message: Mensaje de éxito
            callback: Función a ejecutar al cerrar (opcional)
        """
        dialog = ctk.CTkToplevel(self)
        dialog.title("Éxito")
        dialog.geometry("300x150")
        dialog.resizable(False, False)
        
        dialog.transient(self.master)
        dialog.grab_set()
        
        success_label = ctk.CTkLabel(
            dialog,
            text="✓",
            font=('Segoe UI', 36),
            text_color=COLORS['success']
        )
        success_label.pack(pady=(SPACING['md'], 0))
        
        message_label = ctk.CTkLabel(
            dialog,
            text=message,
            font=FONTS['body'],
            wraplength=250
        )
        message_label.pack(pady=SPACING['sm'])
        
        def on_close():
            dialog.destroy()
            if callback:
                callback()
        
        ok_btn = ctk.CTkButton(
            dialog,
            text="OK",
            width=120,
            height=40,
            command=on_close,
            fg_color=COLORS['success'],
            hover_color=COLORS['success']
        )
        ok_btn.pack(pady=SPACING['md'])
    
    def go_back(self) -> None:
        """Vuelve a la pantalla anterior."""
        if hasattr(self.app_controller, 'navigate_back'):
            self.app_controller.navigate_back()
    
    def clear_screen(self) -> None:
        """Limpia todos los widgets de la pantalla."""
        for widget in self.winfo_children():
            widget.destroy()


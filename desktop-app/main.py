"""
Punto de entrada principal de la aplicación móvil VitaNexo.

Esta aplicación Tkinter está diseñada para dispositivos móviles y consume
datos exclusivamente en formato JSON con autenticación JWT.

Autor: Sistema VitaNexo
Fecha: 2024
Versión: 1.0.0
"""

import sys
import os

# Agregar el directorio raíz al path para imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app_controller import AppController


def main():
    """
    Función principal de la aplicación.
    Inicializa y ejecuta el controlador principal.
    """
    print("=" * 60)
    print("VitaNexo - Sistema de Monitoreo de Bienestar")
    print("Aplicación Móvil Tkinter")
    print("=" * 60)
    print()
    print("Iniciando aplicación...")
    print()
    
    try:
        # Crear y ejecutar el controlador de la aplicación
        app = AppController()
        app.start()
    except KeyboardInterrupt:
        print("\nAplicación interrumpida por el usuario")
        sys.exit(0)
    except Exception as e:
        print(f"\nError crítico: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()


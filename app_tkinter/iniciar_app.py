"""
Script de inicio inteligente para la aplicación VitaNexo.
Verifica el backend y proporciona información del modo activo.

Ejecutar: python iniciar_app.py
"""

import sys
import os
import requests

# Agregar al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def check_backend():
    """Verifica si el backend está disponible."""
    try:
        response = requests.get('http://localhost:8000', timeout=2)
        return True
    except:
        return False

def main():
    """Función principal."""
    print()
    print("=" * 70)
    print("🏥 VitaNexo - Sistema de Monitoreo de Bienestar")
    print("=" * 70)
    print()
    
    # Verificar backend
    print("🔍 Verificando conexión con backend...")
    backend_available = check_backend()
    
    print()
    if backend_available:
        print("✅ Backend disponible en http://localhost:8000")
        print("🔗 Modo: REAL - Conectado al backend CMS")
        print()
        print("   📊 Datos desde PostgreSQL")
        print("   🔐 Autenticación JWT completa")
        print("   📈 Métricas en tiempo real")
        print()
    else:
        print("⚠️  Backend no disponible")
        print("📡 Modo: DEMO - Usando datos simulados")
        print()
        print("   ✅ Todas las funcionalidades disponibles")
        print("   📊 Datos de demostración realistas")
        print("   🎨 Perfecto para desarrollo y demos")
        print()
    
    print("-" * 70)
    print("🔐 Credenciales de acceso:")
    print("-" * 70)
    print()
    print("   Email:    admin@vitanexo.com")
    print("   Password: admin123")
    print()
    print("-" * 70)
    print()
    
    # Importar y ejecutar la aplicación
    try:
        print("🚀 Iniciando aplicación...")
        print()
        
        from app_controller import AppController
        
        app = AppController()
        app.start()
        
    except KeyboardInterrupt:
        print("\n")
        print("👋 Aplicación cerrada por el usuario")
        sys.exit(0)
    except Exception as e:
        print()
        print("=" * 70)
        print("❌ ERROR AL INICIAR LA APLICACIÓN")
        print("=" * 70)
        print()
        print(f"Error: {e}")
        print()
        print("Posibles soluciones:")
        print("1. Verifica que las dependencias estén instaladas:")
        print("   pip install -r requirements.txt")
        print()
        print("2. Consulta la documentación:")
        print("   README.md")
        print("   INSTALL.md")
        print()
        print("3. Verifica que Python 3.8+ esté instalado:")
        print("   python --version")
        print()
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()


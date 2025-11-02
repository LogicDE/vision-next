"""
Script de diagnóstico completo del backend CMS.
Identifica problemas y sugiere soluciones.

Ejecutar: python diagnosticar_backend.py
"""

import requests
import subprocess
import time
import sys

print("=" * 70)
print("🔍 DIAGNÓSTICO COMPLETO DEL BACKEND CMS")
print("=" * 70)
print()

def run_command(cmd, description):
    """Ejecuta un comando y retorna el output."""
    print(f"📌 {description}")
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            capture_output=True, 
            text=True,
            cwd=".."  # Ejecutar desde raíz del proyecto
        )
        return result.stdout + result.stderr
    except Exception as e:
        return f"Error: {e}"

# 1. Verificar contenedores
print("1️⃣  VERIFICANDO CONTENEDORES DOCKER")
print("-" * 70)
output = run_command("docker ps -a --filter name=cms-backend", "Estado del contenedor cms-backend")
print(output)

if "Up" in output:
    print("✅ Contenedor está UP")
else:
    print("❌ Contenedor NO está corriendo")
    print()
    print("💡 Solución:")
    print("   cd ..")
    print("   docker-compose up -d cms-backend")
    print()
    sys.exit(1)

# 2. Verificar logs
print()
print("2️⃣  VERIFICANDO LOGS DEL BACKEND")
print("-" * 70)
logs = run_command("docker logs vision-next-cms-backend-1 --tail 50", "Últimos 50 logs")
print(logs[:1000])  # Primeros 1000 caracteres

if "successfully started" in logs.lower():
    print("\n✅ Backend INICIADO correctamente")
    backend_started = True
elif "error" in logs.lower():
    print("\n❌ Backend tiene ERRORES de compilación")
    backend_started = False
    
    # Identificar errores específicos
    if "@nestjs/axios" in logs:
        print("\n🔴 ERROR IDENTIFICADO: Módulo @nestjs/axios no encontrado")
        print()
        print("💡 SOLUCIÓN:")
        print()
        print("   Ejecuta estos comandos (FUERA de app_tkinter):")
        print()
        print("   cd ..")
        print("   cd cms-backend")
        print("   npm install @nestjs/axios axios")
        print("   cd ..")
        print("   docker-compose restart cms-backend")
        print()
        print("   Luego espera 30 segundos y ejecuta de nuevo este script")
        print()
else:
    print("\n⚠️  Backend está compilando...")
    backend_started = False

# 3. Test de conectividad
print()
print("3️⃣  TEST DE CONECTIVIDAD HTTP")
print("-" * 70)

try:
    response = requests.get("http://localhost:8000", timeout=3)
    print(f"✅ Backend responde - Status: {response.status_code}")
    backend_reachable = True
except requests.exceptions.ConnectionError:
    print("❌ Backend NO responde en http://localhost:8000")
    backend_reachable = False
except Exception as e:
    print(f"❌ Error: {e}")
    backend_reachable = False

# 4. Test de autenticación
if backend_reachable:
    print()
    print("4️⃣  TEST DE AUTENTICACIÓN")
    print("-" * 70)
    
    try:
        login_response = requests.post(
            "http://localhost:8000/auth/login",
            json={
                'email': 'admin@vitanexo.com',
                'password': 'admin123'
            },
            timeout=5
        )
        
        if login_response.status_code in [200, 201]:
            data = login_response.json()
            if data.get('success'):
                print("✅ Login FUNCIONA correctamente")
                print(f"   Usuario: {data.get('user', {}).get('nombre', 'N/A')}")
                login_works = True
            else:
                print("❌ Login falló - Credenciales incorrectas")
                login_works = False
        else:
            print(f"❌ Login falló - Status: {login_response.status_code}")
            print(f"   Respuesta: {login_response.text[:200]}")
            login_works = False
            
    except Exception as e:
        print(f"❌ Error en login: {e}")
        login_works = False
else:
    login_works = False

# RESUMEN FINAL
print()
print("=" * 70)
print("📊 RESUMEN DEL DIAGNÓSTICO")
print("=" * 70)
print()

status = {
    "Contenedor Docker": "✅" if "Up" in output else "❌",
    "Backend Iniciado": "✅" if backend_started else "❌",
    "HTTP Reachable": "✅" if backend_reachable else "❌",
    "Login Funciona": "✅" if login_works else "❌"
}

all_ok = all(v == "✅" for v in status.values())

for key, value in status.items():
    print(f"{value} {key}")

print()
print("-" * 70)

if all_ok:
    print("🎉 ¡BACKEND COMPLETAMENTE FUNCIONAL!")
    print()
    print("Tu aplicación Tkinter puede conectarse al backend real:")
    print("   python iniciar_app.py")
    print()
    print("Credenciales:")
    print("   Email: admin@vitanexo.com")
    print("   Password: admin123")
    print()
else:
    print("⚠️  EL BACKEND NECESITA REPARACIÓN")
    print()
    print("Ejecuta el script de reparación:")
    print("   python reparar_backend_auto.py")
    print()
    print("O sigue las instrucciones arriba para reparar manualmente.")
    print()
    print("Mientras tanto, la app funciona en modo demo:")
    print("   python iniciar_app.py")
    print()

print("=" * 70)


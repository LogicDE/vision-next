"""
Script automático de reparación del backend CMS.
Ejecuta todos los pasos necesarios automáticamente.

⚠️  IMPORTANTE: Este script ejecuta comandos en la raíz del proyecto
(NO modifica archivos, solo ejecuta comandos Docker y npm)

Ejecutar: python reparar_backend_auto.py
"""

import subprocess
import time
import sys
import os

def run_cmd(cmd, description, cwd=".."):
    """Ejecuta un comando y muestra el resultado."""
    print(f"\n{'='*70}")
    print(f"📌 {description}")
    print(f"{'='*70}")
    print(f"Comando: {cmd}")
    print()
    
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True
        )
        
        # Mostrar output
        if result.stdout:
            print(result.stdout)
        if result.stderr and "warning" not in result.stderr.lower():
            print(result.stderr)
        
        if result.returncode == 0:
            print(f"✅ {description} - Completado")
            return True
        else:
            print(f"❌ {description} - Falló (código: {result.returncode})")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

print("=" * 70)
print("🔧 REPARACIÓN AUTOMÁTICA DEL BACKEND CMS")
print("=" * 70)
print()
print("Este script:")
print("1. Detendrá el backend actual")
print("2. Limpiará node_modules corrupto")
print("3. Instalará dependencias frescas")
print("4. Reconstruirá la imagen Docker")
print("5. Iniciará el backend")
print("6. Verificará que funcione")
print()
print("⏱️  Tiempo estimado: 10-15 minutos")
print()

input("Presiona ENTER para continuar o CTRL+C para cancelar...")

# PASO 1: Detener backend
success = run_cmd(
    "docker-compose stop cms-backend",
    "PASO 1/6: Detener backend actual"
)

if not success:
    print("\n⚠️  Error al detener. Continuando de todas formas...")

time.sleep(2)

# PASO 2: Limpiar node_modules
print(f"\n{'='*70}")
print("📌 PASO 2/6: Eliminar node_modules corrupto")
print(f"{'='*70}")

# En Windows
node_modules_path = os.path.join("..", "cms-backend", "node_modules")
if os.path.exists(node_modules_path):
    print(f"Eliminando {node_modules_path}...")
    try:
        if sys.platform == 'win32':
            subprocess.run(f'rmdir /s /q "{node_modules_path}"', shell=True, cwd="..")
        else:
            subprocess.run(f'rm -rf "{node_modules_path}"', shell=True, cwd="..")
        print("✅ node_modules eliminado")
    except:
        print("⚠️  No se pudo eliminar, continuando...")
else:
    print("ℹ️  node_modules no existe (OK)")

time.sleep(1)

# PASO 3: Instalar dependencias
success = run_cmd(
    "npm install",
    "PASO 3/6: Instalar dependencias (2-3 min)",
    cwd="../cms-backend"
)

if not success:
    print("\n❌ Falló la instalación de npm")
    print("Verifica tu conexión a internet e intenta de nuevo")
    sys.exit(1)

time.sleep(2)

# PASO 4: Reconstruir imagen
print(f"\n⚠️  ADVERTENCIA: El siguiente paso tardará 5-10 minutos")
print("Es normal ver mucho output. Por favor espera...")
input("Presiona ENTER para continuar...")

success = run_cmd(
    "docker-compose build --no-cache cms-backend",
    "PASO 4/6: Reconstruir imagen Docker (5-10 min)"
)

if not success:
    print("\n❌ Falló la reconstrucción")
    sys.exit(1)

time.sleep(2)

# PASO 5: Iniciar backend
success = run_cmd(
    "docker-compose up -d cms-backend",
    "PASO 5/6: Iniciar backend"
)

if not success:
    print("\n❌ Falló al iniciar el backend")
    sys.exit(1)

# PASO 6: Esperar y verificar
print(f"\n{'='*70}")
print("📌 PASO 6/6: Verificación (esperando 30 segundos)")
print(f"{'='*70}")

for i in range(30, 0, -5):
    print(f"⏱️  Esperando {i} segundos para que compile...")
    time.sleep(5)

print("\nVerificando logs...")
logs = run_cmd(
    "docker logs vision-next-cms-backend-1 --tail 30",
    "Logs recientes del backend"
)

# Verificar si inició correctamente
print()
print("=" * 70)
print("🎯 VERIFICACIÓN FINAL")
print("=" * 70)
print()

import requests

try:
    response = requests.get("http://localhost:8000", timeout=3)
    print("✅ Backend responde en http://localhost:8000")
    backend_ok = True
except:
    print("❌ Backend aún no responde")
    backend_ok = False

if backend_ok:
    # Test de login
    try:
        login = requests.post(
            "http://localhost:8000/auth/login",
            json={'email': 'admin@vitanexo.com', 'password': 'admin123'},
            timeout=5
        )
        if login.status_code in [200, 201]:
            print("✅ Login funciona correctamente")
            print()
            print("=" * 70)
            print("🎉 ¡REPARACIÓN EXITOSA!")
            print("=" * 70)
            print()
            print("Tu aplicación ahora puede conectarse al backend real:")
            print("   cd app_tkinter")
            print("   python iniciar_app.py")
            print()
            print("Credenciales:")
            print("   Email: admin@vitanexo.com")
            print("   Password: admin123")
            print()
        else:
            print(f"⚠️  Login retorna status {login.status_code}")
            backend_ok = False
    except Exception as e:
        print(f"❌ Error en login: {e}")
        backend_ok = False

if not backend_ok:
    print()
    print("=" * 70)
    print("⚠️  BACKEND AÚN CON PROBLEMAS")
    print("=" * 70)
    print()
    print("Acciones sugeridas:")
    print()
    print("1. Espera 1-2 minutos más para que termine de compilar")
    print()
    print("2. Verifica los logs completos:")
    print("   docker logs vision-next-cms-backend-1")
    print()
    print("3. Busca el mensaje: 'Nest application successfully started'")
    print()
    print("4. Si ves errores de TypeScript, verifica que @nestjs/axios esté instalado:")
    print("   cd ../cms-backend")
    print("   npm list @nestjs/axios")
    print()
    print("5. Mientras tanto, usa la app en modo demo:")
    print("   python iniciar_app.py")
    print()

print("=" * 70)


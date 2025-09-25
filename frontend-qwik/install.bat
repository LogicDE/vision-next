@echo off
echo 🚀 Instalando VisionNext Monitor - Versión Qwik
echo ==============================================

REM Verificar que Node.js esté instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js 18+ primero.
    pause
    exit /b 1
)

echo ✅ Node.js detectado
node --version

REM Instalar dependencias
echo 📦 Instalando dependencias...
npm install

if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas correctamente

REM Crear archivo .env si no existe
if not exist .env (
    echo 📝 Creando archivo .env...
    (
        echo # API Configuration
        echo NEXT_PUBLIC_API_URL=http://localhost:8000
        echo.
        echo # Development
        echo NODE_ENV=development
    ) > .env
    echo ✅ Archivo .env creado
) else (
    echo ✅ Archivo .env ya existe
)

echo.
echo 🎉 ¡Instalación completada!
echo.
echo Para ejecutar el proyecto:
echo   npm run dev
echo.
echo Para construir para producción:
echo   npm run build
echo.
echo Para ejecutar en producción:
echo   npm start
echo.
echo 📚 Documentación: README.md
echo 🔧 Configuración: tailwind.config.js, vite.config.ts
echo.
echo ¡Disfruta de tu nueva aplicación Qwik! 🚀
pause

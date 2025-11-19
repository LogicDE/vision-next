@echo off
REM Script de inicio para Windows

echo ========================================
echo VitaNexo - Aplicacion Movil Tkinter
echo ========================================
echo.

REM Verificar si existe el entorno virtual
if not exist "venv\" (
    echo Creando entorno virtual...
    python -m venv venv
    echo.
)

REM Activar entorno virtual
echo Activando entorno virtual...
call venv\Scripts\activate.bat

REM Instalar/actualizar dependencias
echo Verificando dependencias...
pip install -r requirements.txt --quiet

echo.
echo Iniciando aplicacion...
echo.

REM Ejecutar aplicación
python main.py

REM Desactivar entorno al salir
deactivate

pause


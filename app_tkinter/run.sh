#!/bin/bash
# Script de inicio para Linux/Mac

echo "========================================"
echo "VitaNexo - Aplicación Móvil Tkinter"
echo "========================================"
echo ""

# Verificar si existe el entorno virtual
if [ ! -d "venv" ]; then
    echo "Creando entorno virtual..."
    python3 -m venv venv
    echo ""
fi

# Activar entorno virtual
echo "Activando entorno virtual..."
source venv/bin/activate

# Instalar/actualizar dependencias
echo "Verificando dependencias..."
pip install -r requirements.txt --quiet

echo ""
echo "Iniciando aplicación..."
echo ""

# Ejecutar aplicación
python main.py

# Desactivar entorno al salir
deactivate


#!/bin/bash

echo "🚀 Instalando VisionNext Monitor - Versión Qwik"
echo "=============================================="

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Se requiere Node.js 18 o superior. Versión actual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas correctamente"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Development
NODE_ENV=development
EOF
    echo "✅ Archivo .env creado"
else
    echo "✅ Archivo .env ya existe"
fi

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "Para ejecutar el proyecto:"
echo "  npm run dev"
echo ""
echo "Para construir para producción:"
echo "  npm run build"
echo ""
echo "Para ejecutar en producción:"
echo "  npm start"
echo ""
echo "📚 Documentación: README.md"
echo "🔧 Configuración: tailwind.config.js, vite.config.ts"
echo ""
echo "¡Disfruta de tu nueva aplicación Qwik! 🚀"

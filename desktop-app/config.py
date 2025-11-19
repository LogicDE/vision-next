"""
Configuración centralizada de la aplicación móvil Tkinter.
Contiene todas las URLs, colores, tamaños y configuraciones generales.
"""

import os

# ========================================
# CONFIGURACIÓN DE SERVICIOS BACKEND
# ========================================

# URL base del CMS Backend (NestJS)
CMS_BACKEND_URL = os.getenv('CMS_BACKEND_URL', 'http://localhost:8000')

# URL del microservicio de métricas (Python FastAPI)
MICROSERVICES_URL = os.getenv('MICROSERVICES_URL', 'http://localhost:9000')

# URL del microservicio de burnout
BURNOUT_SERVICE_URL = os.getenv('BURNOUT_SERVICE_URL', 'http://localhost:8001')

# ========================================
# ENDPOINTS DE AUTENTICACIÓN
# ========================================

AUTH_ENDPOINTS = {
    'login': f'{CMS_BACKEND_URL}/auth/login',
    'refresh': f'{CMS_BACKEND_URL}/auth/refresh',
    'logout': f'{CMS_BACKEND_URL}/auth/logout',
    'me': f'{CMS_BACKEND_URL}/auth/me',
}

# ========================================
# CONFIGURACIÓN DE JWT
# ========================================

# Tiempo de expiración del token (en segundos)
JWT_ACCESS_TOKEN_EXPIRY = 300  # 5 minutos
JWT_REFRESH_TOKEN_EXPIRY = 604800  # 7 días

# ========================================
# CONFIGURACIÓN DE INTERFAZ MÓVIL
# ========================================

# Dimensiones de ventana
WINDOW_WIDTH = 400
WINDOW_HEIGHT = 700
MIN_WINDOW_WIDTH = 350
MIN_WINDOW_HEIGHT = 600

# Colores (tema moderno y profesional)
COLORS = {
    'primary': '#1E88E5',          # Azul principal
    'primary_dark': '#1565C0',     # Azul oscuro
    'secondary': '#43A047',        # Verde secundario
    'background': '#FAFAFA',       # Fondo claro
    'surface': '#FFFFFF',          # Superficie blanca
    'error': '#E53935',            # Rojo de error
    'text_primary': '#212121',     # Texto principal
    'text_secondary': '#757575',   # Texto secundario
    'border': '#E0E0E0',           # Bordes
    'success': '#66BB6A',          # Verde éxito
    'warning': '#FFA726',          # Naranja advertencia
}

# Fuentes (tamaños adaptados para móvil)
FONTS = {
    'title': ('Segoe UI', 24, 'bold'),
    'subtitle': ('Segoe UI', 18, 'bold'),
    'heading': ('Segoe UI', 16, 'bold'),
    'body': ('Segoe UI', 14),
    'body_bold': ('Segoe UI', 14, 'bold'),
    'caption': ('Segoe UI', 12),
    'button': ('Segoe UI', 14, 'bold'),
}

# Espaciado y padding
SPACING = {
    'xs': 4,
    'sm': 8,
    'md': 16,
    'lg': 24,
    'xl': 32,
}

# Tamaños de botones (optimizados para pantallas táctiles)
BUTTON_HEIGHT = 50
BUTTON_WIDTH = 280

# ========================================
# CONFIGURACIÓN DE GRÁFICAS
# ========================================

CHART_CONFIG = {
    'figure_size': (7, 5),
    'dpi': 100,
    'style': 'seaborn-v0_8-darkgrid',
    'colors': ['#1E88E5', '#43A047', '#E53935', '#FFA726', '#9C27B0'],
}

# ========================================
# CONFIGURACIÓN DE CACHE Y PERSISTENCIA
# ========================================

# Carpeta para almacenar datos temporales
CACHE_DIR = os.path.join(os.path.dirname(__file__), '.cache')
TOKEN_FILE = os.path.join(CACHE_DIR, 'tokens.json')

# Crear directorio de cache si no existe
os.makedirs(CACHE_DIR, exist_ok=True)

# ========================================
# CONFIGURACIÓN DE TIMEOUT
# ========================================

# Timeout para requests HTTP (en segundos)
REQUEST_TIMEOUT = 30

# Timeout para auto-logout por inactividad (en segundos)
INACTIVITY_TIMEOUT = 300  # 5 minutos


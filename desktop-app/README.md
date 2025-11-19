# 🏥 VitaNexo - Aplicación Móvil Tkinter

## 📱 Descripción

Aplicación gráfica desarrollada con **Tkinter/CustomTkinter** optimizada para dispositivos móviles que consume datos exclusivamente en formato **JSON** y utiliza autenticación **JWT**. 

Esta aplicación es parte del sistema VitaNexo para monitoreo de bienestar laboral y prevención de burnout.

## ✨ Estado Actual

La aplicación funciona en **modo demostración** con datos simulados realistas, permitiendo explorar todas las funcionalidades sin necesidad de tener el backend corriendo.

## 🎯 Características Principales

### ✅ Interfaz Móvil Adaptativa
- Diseño responsivo optimizado para pantallas pequeñas (400x700px)
- Botones grandes y táctiles (50px de altura)
- Navegación simple e intuitiva
- Fuentes legibles y diseño vertical
- Tema moderno con CustomTkinter

### 🔐 Autenticación JWT
- Login seguro con email y contraseña
- Gestión automática de tokens (access y refresh)
- ✨ **Renovación automática de tokens** (cuando están por expirar)
- Persistencia de sesión entre ejecuciones
- Auto-logout por inactividad (5 minutos)
- Manejo seguro de credenciales

### 📄 Comunicación JSON
- **Todos los datos se intercambian en formato JSON**
- Cliente HTTP RESTful estándar
- Integración nativa con backends JSON
- Serialización automática de datos
- Compatible con APIs modernas

### 📊 Visualización de Gráficas
- Dashboard de métricas de bienestar
- **8+ gráficas** diferentes (líneas, barras, pastel, dashboards)
- Métricas de empleados individuales (3 subplots)
- Métricas de grupos con tendencias
- Predicciones de burnout (distribución + top 5)
- Alertas por severidad

### 💾 Soporte Offline
- ✨ **Caché local con SQLite** para datos persistentes
- ✨ Visualización de datos sin conexión
- ✨ Indicador de **estado de conexión** (🟢 Online / 🔴 Demo)
- ✨ **Contador de nuevos contenidos** desde última visita
- Auto-guardado de métricas y dashboard

## 🏗️ Arquitectura

```
app_tkinter/
│
├── main.py                    # Punto de entrada
├── iniciar_app.py             # Inicio inteligente (recomendado)
├── app_controller.py          # Controlador principal y navegación
├── config.py                  # Configuración centralizada
├── requirements.txt           # Dependencias
│
├── auth/                      # Módulo de autenticación
│   ├── __init__.py
│   └── jwt_manager.py         # Gestor de tokens JWT
│
├── services/                  # Servicios de datos
│   ├── __init__.py
│   ├── json_client.py         # Cliente HTTP JSON
│   └── data_service.py        # Servicio de datos
│
├── utils/                     # Utilidades
│   ├── __init__.py
│   └── charts.py              # Generación de gráficas
│
├── ui/                        # Interfaces de usuario
│   ├── __init__.py
│   ├── base_screen.py         # Pantalla base
│   ├── login_screen.py        # Pantalla de login
│   ├── dashboard_screen.py    # Dashboard principal
│   └── charts_screen.py       # Pantallas de gráficas
│
└── .cache/                    # Cache local (generado automáticamente)
    └── tokens.json            # Tokens persistidos
```

## 🚀 Instalación

### Requisitos Previos
- Python 3.8 o superior
- pip (gestor de paquetes de Python)

### Pasos de Instalación

1. **Navegar a la carpeta de la aplicación:**
```bash
cd app_tkinter
```

2. **Crear un entorno virtual (recomendado):**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

## 🎮 Uso

### Inicio Rápido

```bash
python iniciar_app.py
```

O simplemente:

```bash
python main.py
```

### 📡 Modo Demo

La aplicación funciona actualmente en **modo demostración** con:
- ✅ Datos simulados realistas
- ✅ Todas las funcionalidades disponibles
- ✅ Login, dashboard y gráficas completas
- ✅ Sin necesidad de backend o Docker
- ✅ Perfecto para demos y desarrollo

**Nota**: La aplicación puede conectarse automáticamente a un backend real si está disponible en `http://localhost:8000`

### Configuración (Opcional)

#### Verificar Conexión con Backend

```bash
python test_backend_connection.py
```

#### Cambiar URLs del Backend

Si deseas conectar con un backend diferente, edita `config.py`:

```python
CMS_BACKEND_URL = 'http://tu-servidor:8000'
MICROSERVICES_URL = 'http://tu-servidor:9000'
BURNOUT_SERVICE_URL = 'http://tu-servidor:8001'
```

### Credenciales de Acceso

```
Email: admin@vitanexo.com
Password: admin123
```

**Alternativa (modo demo):**
```
Email: user@vitanexo.com
Password: user123
```

## 📖 Módulos Principales

### 🔐 auth/ - Autenticación
- `jwt_manager.py` - Gestión JWT con renovación automática

### 🔄 services/ - Servicios de Datos
- `json_client.py` - Cliente HTTP JSON
- `data_service.py` - Servicio de datos con caché y modo offline

### 🛠️ utils/ - Utilidades
- `charts.py` - Generación de gráficas con matplotlib
- `cache_manager.py` - Caché local con SQLite para soporte offline

### 📱 ui/ - Interfaces de Usuario
- `base_screen.py` - Pantalla base con helpers comunes
- `login_screen.py` - Pantalla de autenticación
- `dashboard_screen.py` - Dashboard principal con métricas
- `charts_screen.py` - Visualización de gráficas (4 pantallas)

### 🎮 Controlador
- `app_controller.py` - Gestión de navegación y ciclo de vida de la app

## 💻 Ejemplos de Uso

### Iniciar la Aplicación
```bash
python iniciar_app.py
```

### Personalizar Colores
```python
# Editar config.py
COLORS = {
    'primary': '#1E88E5',     # Cambiar a tu color
    'secondary': '#43A047',
    # ...
}
```

### Ajustar Dimensiones
```python
# Editar config.py
WINDOW_WIDTH = 450   # Ancho de ventana
WINDOW_HEIGHT = 800  # Alto de ventana
```

## 🔒 Características de Seguridad

- ✅ Autenticación JWT con tokens persistidos
- ✅ Auto-logout por inactividad (5 minutos)
- ✅ Validación de expiración de tokens
- ✅ Contraseñas nunca almacenadas localmente
- ✅ Modo demo seguro sin datos reales

## 🐛 Troubleshooting

### Error: "No module named 'customtkinter'" u otros módulos

```bash
pip install -r requirements.txt
```

### Error: Backend no disponible

**No es un problema**: La app funciona perfectamente en modo demo. Simplemente ignora el mensaje y usa la aplicación normalmente.

### Problema: Gráficas no se muestran

```bash
# Verificar tkinter
python -c "import tkinter; print('OK')"

# Si falla en Linux
sudo apt-get install python3-tk

# Reinstalar matplotlib
pip install matplotlib --force-reinstall
```

### Problema: Ventana muy pequeña o elementos no visibles

Ajusta las dimensiones en `config.py`:
```python
WINDOW_WIDTH = 450  # Aumentar si es necesario
WINDOW_HEIGHT = 800
```

## 📚 Documentación

- **README.md** - Este archivo (documentación completa)
- **INSTALL.md** - Guía de instalación detallada
- **ESTRUCTURA_FINAL.md** - Estructura y organización del proyecto

## 📊 Características

### KPIs en Dashboard (4 tarjetas)
- **Empleados totales** - Número de empleados activos
- **Grupos activos** - Equipos en el sistema
- **Nuevos contenidos** - Desde última visita (con notificación)
- **Bienestar promedio** - Score general del equipo

### Indicadores Clave
- 🟢 **Estado de conexión** - Online (backend) / Demo (simulado)
- 🆕 **Contenidos nuevos** - Contador visible en dashboard
- 📊 **8+ gráficas** diferentes
- 💾 **Caché local** - Funciona sin conexión

### Modo Demo
- **150 empleados** simulados
- **12 grupos** activos
- **6 días** de métricas históricas
- **Predicciones de burnout** realistas
- **3 alertas** activas
- **Caché SQLite** funcional

## 📝 Notas Importantes

- ✅ Esta aplicación **NO modifica** ningún archivo del proyecto principal
- ✅ Funciona completamente independiente con datos simulados
- ✅ Puede conectarse automáticamente a un backend real si está disponible
- ✅ Todos los datos se intercambian en formato **JSON exclusivamente**
- ✅ Compatible con APIs RESTful estándar

## 🤝 Soporte

Para problemas o preguntas:
1. Revisa este README completo
2. Consulta **INSTALL.md** para problemas de instalación
3. Verifica la sección de Troubleshooting arriba

## 📄 Licencia

Este proyecto es parte del sistema VitaNexo.

---

**Desarrollado con ❤️ usando Python y CustomTkinter**

**Versión**: 1.0.0 | **Estado**: ✅ Funcional (Modo Demo)


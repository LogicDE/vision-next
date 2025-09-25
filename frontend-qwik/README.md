# VisionNext Monitor - Migración a Qwik

Este proyecto ha sido migrado de React/Next.js a Qwik para mejorar el rendimiento y la experiencia del usuario.

## 🚀 Características de la Migración

### ✅ Completado
- ✅ Migración de dependencias de React a Qwik
- ✅ Contexto de autenticación migrado a Qwik Context
- ✅ Componentes UI base migrados (Button, Input, Card, etc.)
- ✅ LoginForm migrado con manejo de eventos Qwik
- ✅ UserDashboard y AdminDashboard migrados
- ✅ Estructura de rutas con Qwik City
- ✅ Configuración de Tailwind CSS
- ✅ Soporte para dark/light mode

### 🔄 Patrones de Migración Implementados

#### Hooks React → Qwik
- `useState` → `useSignal`
- `useEffect` → `useTask$`
- `useContext` → `useContextProvider` y `useContext`
- `useCallback` → `$` (Qwik functions)

#### Eventos React → Qwik
- `onClick` → `onClick$`
- `onChange` → `onChange$`
- `onSubmit` → `onSubmit$`

#### Routing
- Next.js App Router → Qwik City Router
- Rutas basadas en archivos en `src/routes/`

## 📁 Estructura del Proyecto

```
src/
├── routes/              # Rutas de Qwik City
│   ├── index.tsx       # Página principal
│   └── layout.tsx      # Layout de rutas
├── components/         # Componentes reutilizables
│   ├── ui/            # Componentes UI base
│   ├── login-form.tsx # Formulario de login
│   ├── user-dashboard.tsx
│   └── admin-dashboard.tsx
├── contexts/          # Contextos de Qwik
│   └── auth-context.tsx
├── lib/              # Utilidades
│   └── utils.ts
├── global.css        # Estilos globales
└── root.tsx          # Componente raíz
```

## 🛠️ Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en modo producción
npm start
```

## 🔧 Configuración

### Variables de Entorno
El proyecto mantiene la misma configuración de API que el proyecto React original:
- `NEXT_PUBLIC_API_URL` (ahora se detecta automáticamente)
- Soporte para localhost y contenedores Docker

### Backend Compatibility
- ✅ Llamadas fetch mantenidas
- ✅ Manejo de cookies/sesiones preservado
- ✅ Integración con APIs existentes

## 🎨 Estilos y UI

- ✅ Tailwind CSS configurado
- ✅ Componentes UI migrados de Radix UI
- ✅ Soporte para dark/light mode
- ✅ Animaciones y efectos visuales preservados

## 📊 Componentes Migrados

### Componentes Principales
- ✅ AuthContext → Qwik Context
- ✅ LoginForm → Componente Qwik
- ✅ UserDashboard → Componente Qwik
- ✅ AdminDashboard → Componente Qwik

### Componentes UI
- ✅ Button
- ✅ Input
- ✅ Card (Header, Content, Footer)
- ✅ Label
- ✅ Badge
- ✅ Avatar
- ✅ Tabs
- ✅ LoadingSpinner

## 🔄 Próximos Pasos

Para completar la migración, se recomienda:

1. **Migrar componentes restantes**: Completar la migración de todos los componentes UI
2. **Implementar toast notifications**: Migrar el sistema de notificaciones
3. **Optimizar rendimiento**: Aprovechar las características de Qwik para mejor rendimiento
4. **Testing**: Implementar tests para los componentes migrados

## 🚨 Notas Importantes

- El proyecto mantiene compatibilidad total con el backend existente
- Todas las funcionalidades de autenticación están preservadas
- Los estilos y la experiencia de usuario se mantienen idénticos
- El proyecto está listo para desarrollo y producción

## 📝 Comandos Útiles

```bash
# Linting
npm run lint
npm run lint.fix

# Formateo
npm run fmt
npm run fmt.check

# Testing
npm test
```

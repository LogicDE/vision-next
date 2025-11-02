"""
Servicio de datos para comunicación con el backend.
Maneja autenticación y obtención de datos para gráficas.
Usa exclusivamente JSON para todas las comunicaciones.
"""

from typing import Optional, Dict, Any, List
from auth.jwt_manager import JWTManager
from utils.cache_manager import CacheManager
from config import CMS_BACKEND_URL, MICROSERVICES_URL, BURNOUT_SERVICE_URL, REQUEST_TIMEOUT
import requests
import json


class DataService:
    """
    Servicio centralizado para todas las operaciones de datos.
    Maneja autenticación, obtención de métricas, y datos de gráficas.
    Compatible con backend JSON + Cookies (formato nativo).
    """
    
    def __init__(self, jwt_manager: JWTManager):
        """
        Inicializa el servicio de datos.
        
        Args:
            jwt_manager: Gestor de tokens JWT
        """
        self.jwt_manager = jwt_manager
        # Usar requests.Session para manejar cookies automáticamente
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.cms_url = CMS_BACKEND_URL
        self.microservices_url = MICROSERVICES_URL
        self.burnout_url = BURNOUT_SERVICE_URL
        self._is_simulated_mode = False  # Flag para tracking del modo
        self.cache = CacheManager()  # Gestor de caché local
    
    def is_backend_available(self) -> bool:
        """
        Verifica si el backend está disponible.
        
        Returns:
            True si el backend responde, False en caso contrario
        """
        try:
            response = requests.get(self.cms_url, timeout=2)
            return True
        except:
            return False
    
    def is_simulated_mode(self) -> bool:
        """Retorna True si está en modo simulado."""
        return self._is_simulated_mode
    
    def login(self, email: str, password: str) -> Dict[str, Any]:
        """
        Realiza login y obtiene tokens JWT.
        
        Args:
            email: Email del usuario
            password: Contraseña del usuario
            
        Returns:
            Diccionario con datos del usuario y tokens
            
        Raises:
            Exception: Si las credenciales son inválidas
        """
        try:
            # Hacer POST al endpoint de login (el backend espera JSON)
            url = f"{self.cms_url}/auth/login"
            payload = {'email': email, 'password': password}
            
            response = self.session.post(
                url, 
                json=payload,
                timeout=REQUEST_TIMEOUT
            )
            
            # Verificar respuesta
            if response.status_code == 200 or response.status_code == 201:
                data = response.json()
                
                # El backend retorna success y user en formato JSON
                if data.get('success'):
                    user_data = data.get('user', {})
                    
                    # Las cookies JWT se guardan automáticamente en self.session
                    # Crear tokens para el JWT manager
                    import base64
                    
                    token_payload = {
                        'sub': user_data.get('id', 1),
                        'email': user_data.get('email', email),
                        'nombre': user_data.get('nombre', user_data.get('name', 'Usuario')),
                        'role': user_data.get('rol', user_data.get('role', 'user')),
                    }
                    
                    # Crear pseudo-JWT (el real está en cookies)
                    token_json = json.dumps(token_payload)
                    access_token = base64.b64encode(token_json.encode()).decode()
                    refresh_token = base64.b64encode(f"refresh_{token_json}".encode()).decode()
                    
                    # Guardar tokens
                    self.jwt_manager.save_tokens(access_token, refresh_token)
                    
                    return {
                        'success': True,
                        'user': user_data,
                        'access_token': access_token,
                        'refresh_token': refresh_token,
                    }
                else:
                    raise Exception('Credenciales inválidas')
            else:
                raise Exception(f'Error HTTP {response.status_code}: {response.text}')
                
        except requests.exceptions.ConnectionError as e:
            # Modo fallback: usar datos simulados si el backend no está disponible
            print(f"⚠️  Backend no disponible en {self.cms_url}")
            print(f"   Activando modo demo...")
            self._is_simulated_mode = True
            return self._simulated_login(email, password)
        except requests.exceptions.Timeout:
            print(f"⚠️  Timeout al conectar con {self.cms_url}")
            print(f"   Activando modo demo...")
            self._is_simulated_mode = True
            return self._simulated_login(email, password)
        except Exception as e:
            raise Exception(f"Error en login: {str(e)}")
    
    def _simulated_login(self, email: str, password: str) -> Dict[str, Any]:
        """Login simulado para demostración cuando el backend no está disponible."""
        # Validar credenciales simuladas
        valid_users = {
            'admin@vitanexo.com': {
                'password': 'admin123',
                'data': {'id': 1, 'nombre': 'Administrador', 'email': 'admin@vitanexo.com', 'rol': 'admin'}
            },
            'user@vitanexo.com': {
                'password': 'user123',
                'data': {'id': 2, 'nombre': 'Usuario Demo', 'email': 'user@vitanexo.com', 'rol': 'user'}
            }
        }
        
        if email in valid_users and valid_users[email]['password'] == password:
            user_data = valid_users[email]['data']
            
            # Crear tokens simulados
            import base64
            token_payload = {
                'sub': user_data['id'],
                'email': user_data['email'],
                'nombre': user_data['nombre'],
                'role': user_data['rol'],
            }
            
            token_json = json.dumps(token_payload)
            access_token = base64.b64encode(token_json.encode()).decode()
            refresh_token = base64.b64encode(f"refresh_{token_json}".encode()).decode()
            
            # Guardar tokens
            self.jwt_manager.save_tokens(access_token, refresh_token)
            
            print(f"✅ Login simulado exitoso para {user_data['nombre']}")
            print(f"   📋 Usando datos de demostración")
            print(f"   💡 Para usar el backend real, sigue GUIA_BACKEND_REAL.md")
            
            return {
                'success': True,
                'user': user_data,
                'access_token': access_token,
                'refresh_token': refresh_token,
                '_simulated': True
            }
        else:
            raise Exception('Credenciales inválidas')
    
    def refresh_token(self) -> bool:
        """
        Renueva el token de acceso usando el refresh token.
        
        Returns:
            True si la renovación fue exitosa
        """
        try:
            url = f"{self.cms_url}/auth/refresh"
            response = self.session.post(url, timeout=REQUEST_TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                
                # El backend retorna el nuevo access token
                if data.get('success'):
                    # Actualizar solo el access token (el refresh sigue igual)
                    current_refresh = self.jwt_manager.get_refresh_token()
                    if current_refresh:
                        # Crear nuevo access token (el backend lo actualiza en cookies)
                        user_data = self.jwt_manager.get_user_data()
                        
                        import base64
                        token_json = json.dumps(user_data)
                        new_access_token = base64.b64encode(f"refreshed_{token_json}".encode()).decode()
                        
                        self.jwt_manager.save_tokens(new_access_token, current_refresh)
                        print("✅ Token renovado exitosamente")
                        return True
            
            return False
        except Exception as e:
            print(f"❌ Error renovando token: {e}")
            return False
    
    def auto_refresh_if_needed(self) -> None:
        """
        Verifica y renueva automáticamente el token si es necesario.
        """
        if self.jwt_manager.needs_refresh() and not self._is_simulated_mode:
            print("🔄 Token próximo a expirar, renovando...")
            self.refresh_token()
    
    def logout(self) -> bool:
        """
        Cierra la sesión del usuario.
        
        Returns:
            True si el logout fue exitoso
        """
        try:
            # Intentar hacer logout en el backend
            url = f"{self.cms_url}/auth/logout"
            self.session.post(url, timeout=REQUEST_TIMEOUT)
        except Exception:
            # Ignorar errores, limpiamos tokens localmente de todos modos
            pass
        
        # Limpiar cookies
        self.session.cookies.clear()
        
        # Limpiar tokens localmente
        self.jwt_manager.clear_tokens()
        self._is_simulated_mode = False
        return True
    
    def get_user_info(self) -> Optional[Dict[str, Any]]:
        """
        Obtiene información del usuario actual.
        
        Returns:
            Diccionario con datos del usuario o None si no hay sesión
        """
        return self.jwt_manager.get_user_data()
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        """
        Obtiene datos para el dashboard principal.
        Intenta del backend primero, luego caché, luego simulados.
        
        Returns:
            Diccionario con métricas y estadísticas
        """
        user_data = self.jwt_manager.get_user_data()
        
        # Intentar obtener del backend si está en modo real
        if not self._is_simulated_mode and self.is_backend_available():
            try:
                # TODO: Implementar cuando el backend esté disponible
                # response = self.session.get(f"{self.cms_url}/api/dashboard")
                # data = response.json()
                # self.cache.set('dashboard_data', data, ttl_seconds=300)
                # return data
                pass
            except:
                pass
        
        # Intentar caché
        cached_data = self.cache.get('dashboard_data')
        if cached_data:
            print("📦 Usando datos del caché")
            return cached_data
        
        # Datos simulados (fallback)
        dashboard_data = {
            'user': user_data,
            'metrics': {
                'total_employees': 150,
                'active_groups': 12,
                'alerts_pending': 5,
                'avg_wellness_score': 7.8,
            },
            'recent_activities': [
                {'id': 1, 'type': 'alert', 'message': 'Nueva alerta de burnout', 'timestamp': '2024-01-15 10:30'},
                {'id': 2, 'type': 'intervention', 'message': 'Intervención completada', 'timestamp': '2024-01-15 09:15'},
                {'id': 3, 'type': 'survey', 'message': 'Nueva encuesta disponible', 'timestamp': '2024-01-15 08:00'},
            ],
            '_from_cache': False
        }
        
        # Guardar en caché
        self.cache.set('dashboard_data', dashboard_data, ttl_seconds=300)
        
        return dashboard_data
    
    def get_employee_metrics(self, employee_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Obtiene métricas de empleados.
        Usa caché para soporte offline.
        
        Args:
            employee_id: ID del empleado (opcional, si no se proporciona devuelve todos)
            
        Returns:
            Lista de métricas de empleados
        """
        cache_key = f'employee_metrics_{employee_id}' if employee_id else 'employee_metrics_all'
        
        # Intentar backend real
        if not self._is_simulated_mode and self.is_backend_available():
            try:
                # TODO: Implementar cuando backend esté disponible
                # url = f"{self.cms_url}/api/employees/{employee_id}/metrics" if employee_id else f"{self.cms_url}/api/employees/metrics"
                # response = self.session.get(url)
                # data = response.json()
                # self.cache.save_metrics('employee', data, employee_id)
                # return data
                pass
            except:
                pass
        
        # Intentar caché
        cached = self.cache.get_metrics('employee', employee_id)
        if cached:
            print(f"📦 Métricas de empleados desde caché")
            return cached
        
        # Datos simulados - fallback
        try:
            metrics = [
                {
                    'date': '2024-01-10',
                    'wellness_score': 8.2,
                    'stress_level': 3.5,
                    'productivity': 85,
                    'mood': 'positive'
                },
                {
                    'date': '2024-01-11',
                    'wellness_score': 7.8,
                    'stress_level': 4.1,
                    'productivity': 82,
                    'mood': 'neutral'
                },
                {
                    'date': '2024-01-12',
                    'wellness_score': 7.5,
                    'stress_level': 4.8,
                    'productivity': 78,
                    'mood': 'neutral'
                },
                {
                    'date': '2024-01-13',
                    'wellness_score': 7.2,
                    'stress_level': 5.2,
                    'productivity': 75,
                    'mood': 'negative'
                },
                {
                    'date': '2024-01-14',
                    'wellness_score': 7.8,
                    'stress_level': 4.5,
                    'productivity': 80,
                    'mood': 'neutral'
                },
                {
                    'date': '2024-01-15',
                    'wellness_score': 8.0,
                    'stress_level': 4.0,
                    'productivity': 83,
                    'mood': 'positive'
                },
            ]
            
            # Guardar en caché
            self.cache.save_metrics('employee', metrics, employee_id)
            return metrics
        except Exception as e:
            print(f"Error obteniendo métricas de empleados: {e}")
            # Intentar caché como último recurso
            cached = self.cache.get_metrics('employee', employee_id)
            return cached if cached else []
    
    def get_group_metrics(self, group_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Obtiene métricas de grupos.
        Usa caché para soporte offline.
        
        Args:
            group_id: ID del grupo (opcional)
            
        Returns:
            Lista de métricas de grupos
        """
        # Intentar caché primero
        cached = self.cache.get_metrics('group', group_id)
        if cached and self._is_simulated_mode:
            print(f"📦 Métricas de grupos desde caché")
            return cached
        
        try:
            # Datos simulados
            metrics = [
                {
                    'date': '2024-01-10',
                    'avg_wellness': 7.8,
                    'avg_stress': 4.2,
                    'team_cohesion': 8.5,
                    'burnout_risk': 'low'
                },
                {
                    'date': '2024-01-11',
                    'avg_wellness': 7.5,
                    'avg_stress': 4.5,
                    'team_cohesion': 8.2,
                    'burnout_risk': 'low'
                },
                {
                    'date': '2024-01-12',
                    'avg_wellness': 7.2,
                    'avg_stress': 4.8,
                    'team_cohesion': 7.9,
                    'burnout_risk': 'medium'
                },
                {
                    'date': '2024-01-13',
                    'avg_wellness': 7.0,
                    'avg_stress': 5.1,
                    'team_cohesion': 7.5,
                    'burnout_risk': 'medium'
                },
                {
                    'date': '2024-01-14',
                    'avg_wellness': 7.3,
                    'avg_stress': 4.7,
                    'team_cohesion': 7.8,
                    'burnout_risk': 'low'
                },
                {
                    'date': '2024-01-15',
                    'avg_wellness': 7.6,
                    'avg_stress': 4.4,
                    'team_cohesion': 8.0,
                    'burnout_risk': 'low'
                },
            ]
            
            # Guardar en caché
            self.cache.save_metrics('group', metrics, group_id)
            return metrics
        except Exception as e:
            print(f"Error obteniendo métricas de grupos: {e}")
            # Intentar caché como fallback
            cached = self.cache.get_metrics('group', group_id)
            return cached if cached else []
    
    def get_new_content_count(self) -> int:
        """
        Obtiene el número de contenidos nuevos desde la última visita.
        
        Returns:
            Número de contenidos nuevos
        """
        last_visit = self.cache.get_last_visit()
        
        if not last_visit:
            # Primera visita
            return 0
        
        # En modo demo, simular contenidos nuevos si pasó más de 1 hora
        from datetime import datetime, timedelta
        if datetime.now() > last_visit + timedelta(hours=1):
            return 3  # Simular 3 contenidos nuevos
        
        return 0
    
    def mark_content_as_viewed(self) -> None:
        """Marca el contenido actual como visto (actualiza última visita)."""
        self.cache.update_last_visit()
    
    def get_burnout_predictions(self) -> Dict[str, Any]:
        """
        Obtiene predicciones de burnout del microservicio.
        
        Returns:
            Diccionario con predicciones de burnout
        """
        try:
            # Datos simulados - en producción vendría del microservicio de burnout
            return {
                'high_risk_employees': [
                    {'id': 1, 'name': 'Juan Pérez', 'risk_score': 0.85, 'department': 'IT'},
                    {'id': 2, 'name': 'María García', 'risk_score': 0.78, 'department': 'Marketing'},
                ],
                'medium_risk_employees': [
                    {'id': 3, 'name': 'Carlos López', 'risk_score': 0.65, 'department': 'Sales'},
                    {'id': 4, 'name': 'Ana Martínez', 'risk_score': 0.58, 'department': 'HR'},
                ],
                'overall_risk': 0.45,
                'trend': 'increasing'
            }
        except Exception as e:
            print(f"Error obteniendo predicciones de burnout: {e}")
            return {}
    
    def get_alerts(self) -> List[Dict[str, Any]]:
        """
        Obtiene alertas activas del sistema.
        
        Returns:
            Lista de alertas
        """
        try:
            # Datos simulados
            return [
                {
                    'id': 1,
                    'type': 'burnout',
                    'severity': 'high',
                    'message': 'Riesgo alto de burnout detectado en el equipo IT',
                    'timestamp': '2024-01-15 10:30',
                    'employee_id': 1
                },
                {
                    'id': 2,
                    'type': 'stress',
                    'severity': 'medium',
                    'message': 'Nivel de estrés elevado en el departamento de Marketing',
                    'timestamp': '2024-01-15 09:15',
                    'employee_id': 2
                },
                {
                    'id': 3,
                    'type': 'productivity',
                    'severity': 'low',
                    'message': 'Disminución en productividad del equipo de Sales',
                    'timestamp': '2024-01-15 08:00',
                    'employee_id': 3
                },
            ]
        except Exception as e:
            print(f"Error obteniendo alertas: {e}")
            return []


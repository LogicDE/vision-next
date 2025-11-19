"""
Gestor de autenticación JWT.
Maneja la validación, almacenamiento y renovación de tokens JWT.
"""

import jwt
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from config import TOKEN_FILE, JWT_ACCESS_TOKEN_EXPIRY


class JWTManager:
    """
    Gestor centralizado de tokens JWT para la aplicación móvil.
    
    Funcionalidades:
    - Almacenamiento seguro de tokens (access y refresh)
    - Validación de expiración de tokens
    - Decodificación de payload JWT
    - Limpieza de tokens al cerrar sesión
    """
    
    def __init__(self):
        """Inicializa el gestor de JWT."""
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.token_expiry: Optional[datetime] = None
        self.user_data: Optional[Dict[str, Any]] = None
        
    def save_tokens(self, access_token: str, refresh_token: str) -> None:
        """
        Guarda los tokens en memoria y en archivo persistente.
        
        Args:
            access_token: Token de acceso JWT
            refresh_token: Token de refresco JWT
        """
        self.access_token = access_token
        self.refresh_token = refresh_token
        
        # Calcular tiempo de expiración
        self.token_expiry = datetime.now() + timedelta(seconds=JWT_ACCESS_TOKEN_EXPIRY)
        
        # Decodificar el token para obtener información del usuario
        try:
            # Decodificar sin verificar la firma (ya fue verificado por el backend)
            payload = jwt.decode(access_token, options={"verify_signature": False})
            self.user_data = {
                'id': payload.get('sub'),
                'email': payload.get('email'),
                'nombre': payload.get('nombre'),
                'role': payload.get('role'),
            }
        except Exception as e:
            print(f"Error al decodificar token: {e}")
            self.user_data = None
        
        # Persistir tokens en archivo
        self._persist_tokens()
    
    def _persist_tokens(self) -> None:
        """Guarda los tokens en un archivo JSON local."""
        try:
            token_data = {
                'access_token': self.access_token,
                'refresh_token': self.refresh_token,
                'expiry': self.token_expiry.isoformat() if self.token_expiry else None,
                'user_data': self.user_data,
            }
            
            with open(TOKEN_FILE, 'w') as f:
                json.dump(token_data, f)
        except Exception as e:
            print(f"Error al persistir tokens: {e}")
    
    def load_tokens(self) -> bool:
        """
        Carga los tokens desde el archivo persistente.
        
        Returns:
            True si se cargaron tokens válidos, False en caso contrario
        """
        if not os.path.exists(TOKEN_FILE):
            return False
        
        try:
            with open(TOKEN_FILE, 'r') as f:
                token_data = json.load(f)
            
            self.access_token = token_data.get('access_token')
            self.refresh_token = token_data.get('refresh_token')
            self.user_data = token_data.get('user_data')
            
            expiry_str = token_data.get('expiry')
            if expiry_str:
                self.token_expiry = datetime.fromisoformat(expiry_str)
            
            # Verificar si el token aún es válido
            if self.is_token_expired():
                return False
            
            return True
        except Exception as e:
            print(f"Error al cargar tokens: {e}")
            return False
    
    def is_token_expired(self) -> bool:
        """
        Verifica si el token de acceso ha expirado.
        
        Returns:
            True si el token ha expirado o no existe, False en caso contrario
        """
        if not self.token_expiry or not self.access_token:
            return True
        
        # Agregar margen de 30 segundos para evitar problemas de timing
        return datetime.now() > (self.token_expiry - timedelta(seconds=30))
    
    def needs_refresh(self) -> bool:
        """
        Verifica si el token necesita renovación (está próximo a expirar).
        
        Returns:
            True si el token expira en menos de 1 minuto
        """
        if not self.token_expiry or not self.access_token:
            return False
        
        # Renovar si expira en menos de 60 segundos
        return datetime.now() > (self.token_expiry - timedelta(seconds=60))
    
    def get_access_token(self) -> Optional[str]:
        """
        Obtiene el token de acceso actual.
        
        Returns:
            Token de acceso o None si no existe o ha expirado
        """
        if self.is_token_expired():
            return None
        return self.access_token
    
    def get_refresh_token(self) -> Optional[str]:
        """
        Obtiene el token de refresco.
        
        Returns:
            Token de refresco o None si no existe
        """
        return self.refresh_token
    
    def get_user_data(self) -> Optional[Dict[str, Any]]:
        """
        Obtiene los datos del usuario actual.
        
        Returns:
            Diccionario con datos del usuario o None si no hay sesión
        """
        return self.user_data
    
    def clear_tokens(self) -> None:
        """Limpia todos los tokens y datos de usuario (logout)."""
        self.access_token = None
        self.refresh_token = None
        self.token_expiry = None
        self.user_data = None
        
        # Eliminar archivo de tokens
        try:
            if os.path.exists(TOKEN_FILE):
                os.remove(TOKEN_FILE)
        except Exception as e:
            print(f"Error al eliminar archivo de tokens: {e}")
    
    def get_auth_headers(self) -> Dict[str, str]:
        """
        Genera headers de autenticación para requests HTTP.
        
        Returns:
            Diccionario con el header Authorization
        """
        token = self.get_access_token()
        if token:
            return {'Authorization': f'Bearer {token}'}
        return {}
    
    def is_authenticated(self) -> bool:
        """
        Verifica si hay una sesión activa y válida.
        
        Returns:
            True si hay un token válido, False en caso contrario
        """
        return self.get_access_token() is not None


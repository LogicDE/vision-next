"""
Cliente HTTP para comunicación JSON con el backend.
Todas las requests y responses se manejan en formato JSON.
"""

import requests
from typing import Optional, Dict, Any
import json
from config import REQUEST_TIMEOUT


class JSONHTTPClient:
    """
    Cliente HTTP que maneja exclusivamente comunicación en JSON.
    """
    
    def __init__(self):
        """Inicializa el cliente HTTP."""
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        })
    
    def set_auth_token(self, token: str) -> None:
        """
        Establece el token JWT para autenticación.
        
        Args:
            token: Token JWT de acceso
        """
        self.session.headers.update({
            'Authorization': f'Bearer {token}'
        })
    
    def clear_auth_token(self) -> None:
        """Elimina el token de autenticación."""
        if 'Authorization' in self.session.headers:
            del self.session.headers['Authorization']
    
    def post(self, url: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Realiza una petición POST con datos JSON.
        
        Args:
            url: URL del endpoint
            data: Diccionario con datos a enviar
            
        Returns:
            Diccionario con la respuesta parseada
            
        Raises:
            requests.RequestException: Si hay error en la petición
        """
        try:
            response = self.session.post(
                url,
                json=data,
                timeout=REQUEST_TIMEOUT
            )
            response.raise_for_status()
            
            # Parsear respuesta JSON
            return response.json()
        except requests.RequestException as e:
            raise requests.RequestException(f"Error en POST request: {e}")
    
    def get(self, url: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Realiza una petición GET y espera respuesta en JSON.
        
        Args:
            url: URL del endpoint
            params: Parámetros query string (opcional)
            
        Returns:
            Diccionario con la respuesta parseada
            
        Raises:
            requests.RequestException: Si hay error en la petición
        """
        try:
            response = self.session.get(
                url,
                params=params,
                timeout=REQUEST_TIMEOUT
            )
            response.raise_for_status()
            
            return response.json()
        except requests.RequestException as e:
            raise requests.RequestException(f"Error en GET request: {e}")
    
    def put(self, url: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Realiza una petición PUT con datos JSON.
        
        Args:
            url: URL del endpoint
            data: Diccionario con datos a enviar
            
        Returns:
            Diccionario con la respuesta parseada
        """
        try:
            response = self.session.put(
                url,
                json=data,
                timeout=REQUEST_TIMEOUT
            )
            response.raise_for_status()
            
            return response.json()
        except requests.RequestException as e:
            raise requests.RequestException(f"Error en PUT request: {e}")
    
    def delete(self, url: str) -> Dict[str, Any]:
        """
        Realiza una petición DELETE.
        
        Args:
            url: URL del endpoint
            
        Returns:
            Diccionario con la respuesta parseada
        """
        try:
            response = self.session.delete(url, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            
            return response.json()
        except requests.RequestException as e:
            raise requests.RequestException(f"Error en DELETE request: {e}")


class JSONAPIClient:
    """
    Cliente API que maneja exclusivamente comunicación en JSON.
    Compatible con backends RESTful estándar.
    """
    
    def __init__(self, base_url: str):
        """
        Inicializa el cliente API.
        
        Args:
            base_url: URL base del API
        """
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    
    def set_auth_token(self, token: str) -> None:
        """Establece el token de autenticación."""
        self.session.headers.update({
            'Authorization': f'Bearer {token}'
        })
    
    def clear_auth_token(self) -> None:
        """Elimina el token de autenticación."""
        if 'Authorization' in self.session.headers:
            del self.session.headers['Authorization']
    
    def post(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Envía datos JSON al backend vía POST.
        
        Args:
            endpoint: Endpoint del API
            data: Datos a enviar
            
        Returns:
            Diccionario con respuesta JSON
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.post(url, json=data, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise requests.RequestException(f"Error en request: {e}")
    
    def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Realiza GET y obtiene respuesta JSON.
        
        Args:
            endpoint: Endpoint del API
            params: Parámetros query string
            
        Returns:
            Diccionario con respuesta JSON
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.get(url, params=params, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise requests.RequestException(f"Error en request: {e}")
    
    def put(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Actualiza datos vía PUT con JSON.
        
        Args:
            endpoint: Endpoint del API
            data: Datos a enviar
            
        Returns:
            Diccionario con respuesta JSON
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.put(url, json=data, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise requests.RequestException(f"Error en request: {e}")
    
    def delete(self, endpoint: str) -> Dict[str, Any]:
        """
        Elimina un recurso vía DELETE.
        
        Args:
            endpoint: Endpoint del API
            
        Returns:
            Diccionario con respuesta JSON
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.delete(url, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise requests.RequestException(f"Error en request: {e}")


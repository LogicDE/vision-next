"""
Gestor de caché local con SQLite.
Permite almacenar y recuperar datos offline.
"""

import sqlite3
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from config import CACHE_DIR


class CacheManager:
    """
    Gestor de caché local usando SQLite.
    Permite trabajar offline con datos previamente cargados.
    """
    
    def __init__(self):
        """Inicializa el gestor de caché."""
        self.db_path = os.path.join(CACHE_DIR, 'data_cache.db')
        self._init_database()
    
    def _init_database(self) -> None:
        """Crea las tablas necesarias si no existen."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de caché general
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cache (
                key TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                expiry_seconds INTEGER DEFAULT 3600
            )
        ''')
        
        # Tabla de métricas
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                entity_id INTEGER,
                data TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )
        ''')
        
        # Tabla de últimas visitas (para detectar nuevos contenidos)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS last_visit (
                id INTEGER PRIMARY KEY,
                timestamp TEXT NOT NULL
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def set(self, key: str, data: Any, ttl_seconds: int = 3600) -> None:
        """
        Guarda datos en caché.
        
        Args:
            key: Clave única del dato
            data: Datos a guardar (se serializan a JSON)
            ttl_seconds: Tiempo de vida en segundos
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        json_data = json.dumps(data)
        timestamp = datetime.now().isoformat()
        
        cursor.execute('''
            INSERT OR REPLACE INTO cache (key, data, timestamp, expiry_seconds)
            VALUES (?, ?, ?, ?)
        ''', (key, json_data, timestamp, ttl_seconds))
        
        conn.commit()
        conn.close()
    
    def get(self, key: str) -> Optional[Any]:
        """
        Obtiene datos del caché.
        
        Args:
            key: Clave del dato
            
        Returns:
            Datos deserializados o None si no existe o expiró
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT data, timestamp, expiry_seconds FROM cache WHERE key = ?
        ''', (key,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return None
        
        data_json, timestamp_str, ttl = result
        
        # Verificar expiración
        timestamp = datetime.fromisoformat(timestamp_str)
        if datetime.now() > timestamp + timedelta(seconds=ttl):
            # Expirado
            return None
        
        return json.loads(data_json)
    
    def save_metrics(self, metric_type: str, data: List[Dict], entity_id: Optional[int] = None) -> None:
        """
        Guarda métricas en caché.
        
        Args:
            metric_type: Tipo de métrica ('employee', 'group', etc.)
            data: Lista de métricas
            entity_id: ID de la entidad (opcional)
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Eliminar métricas anteriores del mismo tipo
        if entity_id:
            cursor.execute('DELETE FROM metrics WHERE type = ? AND entity_id = ?', 
                         (metric_type, entity_id))
        else:
            cursor.execute('DELETE FROM metrics WHERE type = ? AND entity_id IS NULL', 
                         (metric_type,))
        
        # Insertar nuevas métricas
        json_data = json.dumps(data)
        timestamp = datetime.now().isoformat()
        
        cursor.execute('''
            INSERT INTO metrics (type, entity_id, data, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (metric_type, entity_id, json_data, timestamp))
        
        conn.commit()
        conn.close()
    
    def get_metrics(self, metric_type: str, entity_id: Optional[int] = None) -> Optional[List[Dict]]:
        """
        Obtiene métricas del caché.
        
        Args:
            metric_type: Tipo de métrica
            entity_id: ID de la entidad (opcional)
            
        Returns:
            Lista de métricas o None si no existen
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if entity_id:
            cursor.execute('''
                SELECT data FROM metrics 
                WHERE type = ? AND entity_id = ?
                ORDER BY timestamp DESC LIMIT 1
            ''', (metric_type, entity_id))
        else:
            cursor.execute('''
                SELECT data FROM metrics 
                WHERE type = ? AND entity_id IS NULL
                ORDER BY timestamp DESC LIMIT 1
            ''', (metric_type,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return json.loads(result[0])
        return None
    
    def update_last_visit(self) -> None:
        """Actualiza el timestamp de la última visita."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        timestamp = datetime.now().isoformat()
        cursor.execute('''
            INSERT OR REPLACE INTO last_visit (id, timestamp)
            VALUES (1, ?)
        ''', (timestamp,))
        
        conn.commit()
        conn.close()
    
    def get_last_visit(self) -> Optional[datetime]:
        """
        Obtiene el timestamp de la última visita.
        
        Returns:
            Datetime de la última visita o None
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT timestamp FROM last_visit WHERE id = 1')
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return datetime.fromisoformat(result[0])
        return None
    
    def clear_cache(self) -> None:
        """Limpia todo el caché."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM cache')
        cursor.execute('DELETE FROM metrics')
        
        conn.commit()
        conn.close()
    
    def clear_expired(self) -> None:
        """Elimina entradas expiradas del caché."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Eliminar cache expirado
        cursor.execute('''
            DELETE FROM cache 
            WHERE datetime(timestamp, '+' || expiry_seconds || ' seconds') < datetime('now')
        ''')
        
        # Eliminar métricas antiguas (más de 7 días)
        week_ago = (datetime.now() - timedelta(days=7)).isoformat()
        cursor.execute('DELETE FROM metrics WHERE timestamp < ?', (week_ago,))
        
        conn.commit()
        conn.close()


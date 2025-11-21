import json
import random
from locust import HttpUser, task, between
from locust import LoadTestShape

with open("users.json") as f:
    USERS = json.load(f)

class CMSUserSoak(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        user = random.choice(USERS)
        resp = self.client.post("/auth/login", json={"email": user["email"], "password": user["password"]})
        if resp.status_code not in (200, 201):
            print(f"Login failed for {user['email']}: {resp.text}")
            return
        self.token = resp.cookies.get("jwt")
        self.headers = {"Authorization": f"Bearer {self.token}"}

    @task
    def get_metrics(self):
        self.client.get("/metrics/daily", headers=self.headers)

# -------------------------
# Shape para soak test: 1800 usuarios en 30 minutos de manera constante
# -------------------------
class SoakShape(LoadTestShape):
    """
    Soak test: carga sostenida de 1800 usuarios en 30 minutos
    - Spawn rate promedio: ~1 usuario/segundo para mantener carga constante
    - Duración total: 30 minutos (1800 segundos)
    - Mantiene carga constante durante todo el periodo
    """
    
    def tick(self):
        run_time = self.get_run_time()
        duration_seconds = 30 * 60  # 30 minutos = 1800 segundos
        spawn_rate = 1  # 1 usuario por segundo
        
        # Calcular usuarios objetivo basado en el tiempo transcurrido
        # Esto crea una carga constante que crece a ~1 usuario/segundo
        target_users = min(int(run_time * spawn_rate), 1800)
        
        # Ejecutar durante 30 minutos con spawn rate constante
        if run_time < duration_seconds:
            # Mantener carga constante: agregar ~1 usuario por segundo hasta 1800
            return (target_users, spawn_rate)
        
        # Terminar después de 30 minutos
        return None


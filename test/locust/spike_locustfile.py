import json
import random
from locust import HttpUser, task, between
from locust import LoadTestShape

with open("users.json") as f:
    USERS = json.load(f)

class CMSUserSpike(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        user = random.choice(USERS)
        print(f"[INICIO] Intentando login para usuario: {user['email']}")
        resp = self.client.post("/auth/login", json={"email": user["email"], "password": user["password"]})
        if resp.status_code not in (200, 201):
            print(f"[ERROR] Login fallido para {user['email']}: Status {resp.status_code} - {resp.text}")
            return
        print(f"[EXITO] Login exitoso para usuario: {user['email']}")
        self.token = resp.cookies.get("jwt")
        self.headers = {"Authorization": f"Bearer {self.token}"}

    @task
    def get_metrics(self):
        print("[METRICAS] Obteniendo métricas diarias...")
        resp = self.client.get("/metrics/daily", headers=self.headers)
        if resp.status_code == 200:
            print(f"[EXITO] Métricas obtenidas exitosamente. Status: {resp.status_code}")
        else:
            print(f"[ERROR] Error al obtener métricas. Status: {resp.status_code} - {resp.text}")

# -------------------------
# Shape para spike test: 300 usuarios en 5 segundos
# -------------------------
class SpikeShape(LoadTestShape):
    """
    Spike test: carga 300 usuarios en 5 segundos
    - Spawn rate: 60 usuarios/segundo (300 usuarios / 5 segundos)
    - Duración total: 5 segundos
    """
    
    def tick(self):
        run_time = self.get_run_time()
        
        # Ejecutar spike durante 5 segundos
        if run_time < 5:
            # Mantener 300 usuarios con spawn_rate de 60/s
            print(f"[SPIKE] Tiempo de ejecución: {run_time:.2f}s - Manteniendo 300 usuarios a 60 usuarios/s")
            return (300, 60)
        
        # Terminar después de 5 segundos
        print(f"[SPIKE] Test completado después de {run_time:.2f}s. Finalizando...")
        return None


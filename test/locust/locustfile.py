import json
from locust import HttpUser, task, between, events

# Cargar usuarios generados
with open("users.json") as f:
    USERS = json.load(f)

class CMSUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        # Tomar un usuario aleatorio de la lista
        import random
        user = random.choice(USERS)
        resp = self.client.post(
            "/auth/login",
            json={"email": user["email"], "password": user["password"]}
        )
        if resp.status_code not in (200, 201):
            print(f"Login failed for {user['email']}: {resp.text}")
            return

        self.token = resp.cookies.get("jwt")
        self.headers = {"Authorization": f"Bearer {self.token}"}

    @task(2)
    def get_metrics(self):
        self.client.get("/metrics/daily", headers=self.headers)

    @task(1)
    def get_employees(self):
        self.client.get("/employees", headers=self.headers)

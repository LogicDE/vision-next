import json
import random
from locust import HttpUser, task, between

with open("users.json") as f:
    USERS = json.load(f)

class CMSUserReadWrite(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        user = random.choice(USERS)
        resp = self.client.post("/auth/login", json={"email": user["email"], "password": user["password"]})
        if resp.status_code not in (200, 201):
            print(f"Login failed for {user['email']}: {resp.text}")
            return
        self.token = resp.cookies.get("jwt")
        self.headers = {"Authorization": f"Bearer {self.token}"}

    @task(8)  # 80% GET
    def get_metrics(self):
        self.client.get("/metrics/daily", headers=self.headers)

    @task(2)  # 20% POST
    def create_metric(self):
        payload = {"metric": "heart_rate", "value": random.randint(60, 100)}
        self.client.post("/metrics/daily", headers=self.headers, json=payload)

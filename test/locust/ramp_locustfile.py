import json
import random
from locust import HttpUser, task, between
from locust import LoadTestShape

with open("users.json") as f:
    USERS = json.load(f)

class CMSUserRamp(HttpUser):
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
# Shape para ramp-up / ramp-down
# -------------------------
class RampUpDownShape(LoadTestShape):
    stages = [
        {"duration": 60, "users": 10, "spawn_rate": 1},   # ramp-up
        {"duration": 120, "users": 50, "spawn_rate": 5},  # mantener
        {"duration": 180, "users": 0, "spawn_rate": 10},  # ramp-down
    ]

    def tick(self):
        run_time = self.get_run_time()
        for stage in self.stages:
            if run_time < stage["duration"]:
                return (stage["users"], stage["spawn_rate"])
        return None

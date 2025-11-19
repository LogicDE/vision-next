from locust import HttpUser, task, between, LoadTestShape
import random

# Lista de usuarios de prueba basada en los empleados existentes
USERS = [
    {"email": "carlos@vitanexo.com", "password": "123456"},
    {"email": "juan.perez@demo.com", "password": "123456"},
    {"email": "maria.gonzalez@vitanexo.com", "password": "123456"},
    {"email": "roberto.silva@vitanexo.com", "password": "123456"},
    {"email": "ana.martinez@vitanexo.com", "password": "123456"},
    {"email": "luis.ramirez@vitanexo.com", "password": "123456"},
    {"email": "laura.diaz@vitanexo.com", "password": "123456"},
    {"email": "sofia.lopez@vitanexo.com", "password": "123456"},
    {"email": "diego.martinez@vitanexo.com", "password": "123456"},
    {"email": "elena.rodriguez@vitanexo.com", "password": "123456"},
    {"email": "carlos.garcia@vitanexo.com", "password": "123456"},
    {"email": "isabel.hernandez@vitanexo.com", "password": "123456"},
    {"email": "fernando.gomez@vitanexo.com", "password": "123456"},
    {"email": "patricia.castillo@vitanexo.com", "password": "123456"},
    {"email": "ricardo.morales@vitanexo.com", "password": "123456"},
    {"email": "gabriela.reyes@vitanexo.com", "password": "123456"},
    {"email": "oscar.vargas@vitanexo.com", "password": "123456"},
    {"email": "lucia.castro@vitanexo.com", "password": "123456"},
    {"email": "javier.ortega@vitanexo.com", "password": "123456"},
    {"email": "carmen.flores@vitanexo.com", "password": "123456"},
    {"email": "miguel.santos@vitanexo.com", "password": "123456"},
    {"email": "adriana.mendoza@vitanexo.com", "password": "123456"},
    {"email": "raul.jimenez@vitanexo.com", "password": "123456"},
    {"email": "teresa.navarro@vitanexo.com", "password": "123456"},
    {"email": "hector.rios@vitanexo.com", "password": "123456"},
    {"email": "silvia.mora@vitanexo.com", "password": "123456"},
    {"email": "alberto.paredes@vitanexo.com", "password": "123456"},
    {"email": "rosa.cordero@vitanexo.com", "password": "123456"},
    {"email": "enrique.salazar@vitanexo.com", "password": "123456"},
    {"email": "veronica.lara@vitanexo.com", "password": "123456"},
    {"email": "daniel.klein@techcorp.com", "password": "123456"},
    {"email": "emma.weber@techcorp.com", "password": "123456"},
    {"email": "thomas.schmidt@techcorp.com", "password": "123456"},
    {"email": "anna.muller@techcorp.com", "password": "123456"},
    {"email": "pierre.dubois@healthplus.com", "password": "123456"},
    {"email": "marie.laurent@healthplus.com", "password": "123456"},
    {"email": "jean.moreau@healthplus.com", "password": "123456"},
    {"email": "claire.petit@healthplus.com", "password": "123456"},
    {"email": "antonio.silva@innovate.com", "password": "123456"},
    {"email": "paula.oliveira@innovate.com", "password": "123456"},
    {"email": "marcos.santos@innovate.com", "password": "123456"},
    {"email": "beatriz.costa@innovate.com", "password": "123456"},
    {"email": "john.smith@biowellness.com", "password": "123456"},
    {"email": "sarah.johnson@biowellness.com", "password": "123456"},
    {"email": "michael.brown@biowellness.com", "password": "123456"},
    {"email": "emily.davis@biowellness.com", "password": "123456"},
    {"email": "david.wilson@biowellness.com", "password": "123456"},
]

class CMSUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        # Tomar un usuario aleatorio de la lista
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


class RampUpSpikeShape(LoadTestShape):
    """
    Simula diferentes fases de carga:
    - Ramp-up inicial
    - Pico (spike)
    - Ramp-down
    """
    time_limit = 600  # duración total del test en segundos

    def tick(self):
        run_time = self.get_run_time()
        if run_time > self.time_limit:
            return None

        # Definir fases de tiempo
        if run_time < 120:  # primeros 2 minutos: ramp-up
            users = 50 + int(run_time * 2)  # aumenta 2 usuarios por segundo
            spawn_rate = 5
        elif run_time < 240:  # minutos 2-4: spike
            users = 200
            spawn_rate = 50
        elif run_time < 480:  # minutos 4-8: sostenida alta
            users = 150
            spawn_rate = 20
        else:  # últimos 2 minutos: ramp-down
            users = max(0, 150 - int((run_time-480) * 2))
            spawn_rate = 5

        return (users, spawn_rate)
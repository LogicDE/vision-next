import requests
import random
import string
import json
import time

BASE_URL = "http://localhost:8000"  # Cambia a http://cms-backend:8000 si estás en Docker
NUM_USERS = 300
ADMIN_EMAIL = "carlos@demo.com"
ADMIN_PASS = "123456"

def login_admin():
    """Hace login y obtiene la cookie JWT."""
    print("🔐 Iniciando sesión como admin...")
    resp = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASS},
    )

    if resp.status_code not in (200, 201):
        raise Exception(f"Error al iniciar sesión ({resp.status_code}): {resp.text}")

    token = resp.cookies.get("jwt")
    if not token:
        raise Exception("No se recibió cookie JWT.")

    print("✅ Login exitoso.")
    # Retornamos el diccionario cookies
    return {"jwt": token}

def random_email():
    """Genera un correo aleatorio para el usuario."""
    return ''.join(random.choices(string.ascii_lowercase, k=8)) + "@test.com"

def create_users(n, cookies):
    """Crea n usuarios nuevos usando el endpoint /employees/seed"""
    users = []

    for i in range(n):
        user = {
            "first_name": f"User{i}",
            "last_name": "Auto",
            "email": random_email(),
            "password": "123456",
            "id_role": 2,        # Ajusta según tu BD
            "id_enterprise": 2
        }

        try:
            r = requests.post(f"{BASE_URL}/employees/seed", json=user, cookies=cookies)
            if r.status_code in (200, 201):
                print(f"[OK] {user['email']}")
                users.append({"email": user["email"], "password": user["password"]})
            else:
                print(f"[ERROR {r.status_code}] {r.text}")
        except Exception as e:
            print(f"[EXCEPTION] {e}")

        time.sleep(0.05)  # pequeña pausa para no saturar el backend

    # Guardar usuarios creados
    with open("users.json", "w") as f:
        json.dump(users, f, indent=2)

    print(f"✅ {len(users)} users guardados en users.json")

if __name__ == "__main__":
    cookies = login_admin()
    create_users(NUM_USERS, cookies)

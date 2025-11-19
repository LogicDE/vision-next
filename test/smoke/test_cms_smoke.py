import requests
import os

BASE_URL = os.getenv("CMS_API_URL", "http://localhost:8000")

def test_health_check():
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200

def test_login():
    payload = {"email": "carlos@vitanexo.com", "password": "123456"}  # <-- email corregido
    r = requests.post(f"{BASE_URL}/auth/login", json=payload)
    assert r.status_code in [200, 201]
    # Leer token de cookies
    token = r.cookies.get('jwt')
    assert token is not None

def test_employees_list():
    with requests.Session() as s:
        # Login
        r = s.post(f"{BASE_URL}/auth/login", json={"email": "carlos@vitanexo.com", "password": "123456"})
        assert r.status_code in [200, 201]

        # Obtener empleados
        r = s.get(f"{BASE_URL}/employees")
        assert r.status_code == 200

        json_resp = r.json()

        # Ahora la respuesta es directamente una lista
        assert isinstance(json_resp, list), "La respuesta no es una lista"
        assert len(json_resp) > 0, "No hay empleados en la lista"

        # Validar campos de ejemplo en el primer empleado
        first_emp = json_resp[0]
        for key in ["email", "firstName", "enterprise"]:
            assert key in first_emp, f"Falta '{key}' en el primer empleado"

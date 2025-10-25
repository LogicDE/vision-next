import requests
import os

BASE_URL = os.getenv("CMS_API_URL", "http://localhost:8000")

def test_health_check():
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200

def test_login():
    payload = {"email": "carlos@demo.com", "password": "123456"}  # <-- email corregido
    r = requests.post(f"{BASE_URL}/auth/login", json=payload)
    assert r.status_code in [200, 201]
    # Leer token de cookies
    token = r.cookies.get('jwt')
    assert token is not None

def test_employees_list():
    with requests.Session() as s:
        # Login
        r = s.post(f"{BASE_URL}/auth/login", json={"email": "carlos@demo.com", "password": "123456"})
        assert r.status_code in [200, 201]

        # Obtener empleados
        r = s.get(f"{BASE_URL}/employees")
        assert r.status_code == 200

        json_resp = r.json()
        assert "data" in json_resp, "La respuesta no contiene 'data'"
        assert isinstance(json_resp["data"], list), "'data' no es una lista"
        assert len(json_resp["data"]) > 0, "No hay empleados en la lista"

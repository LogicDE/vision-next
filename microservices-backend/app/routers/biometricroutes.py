from fastapi import APIRouter, HTTPException
from app.models.biometric import BiometricData
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import os

router = APIRouter()

# Configuración InfluxDB desde variables de entorno
INFLUX_URL = os.getenv("INFLUX_URL", "http://localhost:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN")
INFLUX_ORG = os.getenv("INFLUX_ORG", "ecosalud")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "biometria")

if not INFLUX_TOKEN:
    raise RuntimeError("INFLUX_TOKEN no definido en el entorno")

# Cliente InfluxDB
client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)
write_api = client.write_api(write_options=SYNCHRONOUS)

# Test de conexión al iniciar el router
try:
    health = client.health()
    if health.status != "pass":
        raise RuntimeError(f"InfluxDB no saludable: {health.message}")
except Exception as e:
    raise RuntimeError(f"No se pudo conectar a InfluxDB: {e}")

@router.post("/biometric")
def send_biometric(data: BiometricData):
    point = Point("biometric_data") \
        .tag("user_id", data.user_id) \
        .tag("device_id", data.device_id)
    
    # Agregamos solo los campos que existen
    for field, value in data.dict().items():
        if field not in ["user_id", "device_id"] and value is not None:
            point.field(field, value)
    
    try:
        write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error escribiendo en InfluxDB: {e}")
    
    return {"status": "ok"}

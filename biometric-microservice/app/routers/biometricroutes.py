from fastapi import APIRouter, HTTPException, Request
from app.models.biometric import BiometricData
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from jose import jwt, JWTError
import os
import logging
import xml.etree.ElementTree as ET
from typing import Any, Dict, Optional

router = APIRouter()
logger = logging.getLogger("biometric_jwt")

# Configuración InfluxDB desde variables de entorno
INFLUX_URL = os.getenv("INFLUX_URL", "http://localhost:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN")
INFLUX_ORG = os.getenv("INFLUX_ORG", "ecosalud")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "biometria")

if not INFLUX_TOKEN:
    raise RuntimeError("INFLUX_TOKEN no definido en el entorno")

# JWT config (must match cms-backend JWT_* config)
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET") or JWT_SECRET
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET no definido en el entorno para biometric-microservice")

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


def _parse_xml_body(raw: bytes) -> Dict[str, Any]:
    """
    Parse a simple XML payload like:

    <BiometricData>
        <user_id>123</user_id>
        <device_id>dev1</device_id>
        <heart_rate>72</heart_rate>
        ...
    </BiometricData>
    """
    try:
        root = ET.fromstring(raw.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"XML malformado: {e}")

    data: Dict[str, Any] = {}
    for child in root:
        # Pydantic se encargará de hacer el casting de tipos
        data[child.tag] = child.text
    return data


def _validate_jwt(request: Request) -> Dict[str, Any]:
    """
    Extrae y valida el JWT del header Authorization: Bearer <token>.
    Debe ser el mismo token emitido por cms-backend (mismo JWT_SECRET/algoritmo).
    """
    auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authorization header Bearer requerido")

    access_token = auth_header.split(" ", 1)[1].strip()
    if not access_token:
        raise HTTPException(status_code=401, detail="Token de acceso vacío")

    # Debe venir también el refresh token (se usa a nivel de plataforma para renovar sesiones),
    # pero aquí solo comprobamos que exista; no lo validamos criptográficamente para no
    # acoplar este microservicio a la lógica de renovación.
    refresh_token = request.headers.get("x-refresh-token") or request.headers.get("X-Refresh-Token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="X-Refresh-Token requerido")

    try:
        # cms-backend firma el token con sub=int; python-jose espera string por RFC.
        # Desactivamos verify_sub para aceptar este payload.
        access_payload = jwt.decode(
            access_token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"verify_sub": False},
        )
    except JWTError as e:
        logger.warning(f"JWT access token decode failed: {e}")
        raise HTTPException(status_code=401, detail=f"Token de acceso JWT inválido: {e}")

    # Devolvemos solo el payload de acceso; podríamos usar ambos si fuera necesario
    return access_payload


def _build_common_tags(data: BiometricData) -> Dict[str, str]:
    """
    Construye el conjunto estándar de tags usados en todas las mediciones.
    """
    tags: Dict[str, str] = {}

    if data.org_id:
        tags["org_id"] = str(data.org_id)

    # worker_id es el user_id de la plataforma
    if data.user_id is not None:
        tags["worker_id"] = str(data.user_id)
    elif data.user_email:
        tags["worker_id"] = data.user_email  # fallback legible

    tags["device_id"] = data.device_id

    # Extra: mantener user_email separado si existe
    if data.user_email:
        tags["user_email"] = data.user_email

    return tags


def _write_wearable_biometrics(data: BiometricData) -> Optional[Point]:
    """
    Crea un Point de InfluxDB para la medición wearable_biometrics.
    Devuelve el Point o None si no hay datos biométricos continuos.
    """
    if (
        data.heart_rate is None
        and data.hrv is None
        and data.hrv_sdnn_ms is None
        and data.eda_microsiemens is None
        and data.temperature is None
        and data.resp_rate is None
        and data.spo2_pct is None
    ):
        return None

    tags = _build_common_tags(data)
    p = Point("wearable_biometrics")
    for k, v in tags.items():
        p = p.tag(k, v)

    # Mapear campos según el diseño
    if data.heart_rate is not None:
        p = p.field("hr_bpm", int(data.heart_rate))
    if data.hrv is not None:
        p = p.field("hrv_rmssd_ms", float(data.hrv))
    if data.hrv_sdnn_ms is not None:
        p = p.field("hrv_sdnn_ms", float(data.hrv_sdnn_ms))
    if data.eda_microsiemens is not None:
        p = p.field("eda_microsiemens", float(data.eda_microsiemens))
    if data.temperature is not None:
        p = p.field("skin_temp_c", float(data.temperature))
    if data.resp_rate is not None:
        p = p.field("resp_rate_bpm", float(data.resp_rate))
    if data.spo2_pct is not None:
        p = p.field("spo2_pct", float(data.spo2_pct))

    return p


def _write_sleep_summary(data: BiometricData) -> Optional[Point]:
    """
    Crea un Point de InfluxDB para la medición sleep_summary.
    Devuelve el Point o None si no hay datos de sueño.
    """
    if (
        data.total_sleep_s is None
        and data.sleep_efficiency_pct is None
        and data.sleep_latency_s is None
        and data.sleep_score is None
        and data.awakening_count is None
        and data.time_in_bed_s is None
    ):
        return None

    tags = _build_common_tags(data)
    p = Point("sleep_summary")
    for k, v in tags.items():
        p = p.tag(k, v)

    if data.sleep_score is not None:
        p = p.field("sleep_score", float(data.sleep_score))
    if data.total_sleep_s is not None:
        p = p.field("total_sleep_s", int(data.total_sleep_s))
    if data.sleep_efficiency_pct is not None:
        p = p.field("sleep_efficiency_pct", float(data.sleep_efficiency_pct))
    if data.sleep_latency_s is not None:
        p = p.field("sleep_latency_s", int(data.sleep_latency_s))
    if data.awakening_count is not None:
        p = p.field("awakening_count", int(data.awakening_count))
    if data.time_in_bed_s is not None:
        # Campo adicional útil aunque no estaba en el diseño original
        p = p.field("time_in_bed_s", int(data.time_in_bed_s))

    return p


def _write_env_air(data: BiometricData) -> Optional[Point]:
    """
    Create an InfluxDB Point for environmental air quality (env_air).
    Uses tags: org_id, site, zone, device_id (sensor_id), model (if provided).
    Fields: co2_ppm, pm25_ugm3, temp_c
    """
    if data.co2_ppm is None and data.pm25_ugm3 is None and data.temp_c is None:
        return None

    tags = _build_common_tags(data)
    p = Point("env_air")
    for k, v in tags.items():
        p = p.tag(k, v)

    if data.co2_ppm is not None:
        p = p.field("co2_ppm", float(data.co2_ppm))
    if data.pm25_ugm3 is not None:
        p = p.field("pm25_ugm3", float(data.pm25_ugm3))
    if data.temp_c is not None:
        p = p.field("temp_c", float(data.temp_c))

    return p


def _write_env_ambient(data: BiometricData) -> Optional[Point]:
    """
    Create an InfluxDB Point for ambient noise/light (env_ambient).
    Uses tags: org_id, site, zone, device_id (sensor_id), model (if provided).
    Fields: noise_db, light_lux
    """
    if data.noise_db is None and data.light_lux is None:
        return None

    tags = _build_common_tags(data)
    p = Point("env_ambient")
    for k, v in tags.items():
        p = p.tag(k, v)

    if data.noise_db is not None:
        p = p.field("noise_db", float(data.noise_db))
    if data.light_lux is not None:
        p = p.field("light_lux", float(data.light_lux))

    return p


@router.post("/biometric")
async def send_biometric(request: Request):
    """
    Endpoint bilingüe y securizado con JWT:
    - JSON (application/json)
    - XML (application/xml)

    Requiere Authorization: Bearer <jwt> emitido por cms-backend.
    Persiste los datos en InfluxDB usando las mediciones:
    - wearable_biometrics
    - sleep_summary
    """
    # 1) Validar JWT entre app móvil y microservicio biométrico
    _ = _validate_jwt(request)

    # 2) Parsear cuerpo (JSON o XML)
    content_type = request.headers.get("content-type", "").split(";")[0].strip().lower()

    if content_type in ("application/json", "text/json", ""):
        body = await request.json()
        payload_format = "json"
    elif content_type in ("application/xml", "text/xml", "application/xhtml+xml"):
        raw = await request.body()
        body = _parse_xml_body(raw)
        payload_format = "xml"
    else:
        raise HTTPException(status_code=415, detail=f"Tipo de contenido no soportado: {content_type}")

    try:
        data = BiometricData(**body)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payload inválido: {e}")

    points: list[Point] = []

    # 3) Medición wearable_biometrics (stream continuo)
    biometrics_point = _write_wearable_biometrics(data)
    if biometrics_point is not None:
        points.append(biometrics_point)

    # 4) Medición sleep_summary (resumen diario)
    sleep_point = _write_sleep_summary(data)
    if sleep_point is not None:
        points.append(sleep_point)

    # 5) Medición env_air (IoT air quality)
    env_air_point = _write_env_air(data)
    if env_air_point is not None:
        points.append(env_air_point)

    # 6) Medición env_ambient (IoT ambient noise/light)
    env_ambient_point = _write_env_ambient(data)
    if env_ambient_point is not None:
        points.append(env_ambient_point)

    if not points:
        # Nada que guardar: probablemente payload incompleto
        raise HTTPException(status_code=400, detail="Payload sin datos biométricos ni de sueño reconocibles")

    try:
        write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=points)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error escribiendo en InfluxDB: {e}")

    return {"status": "ok", "format": payload_format, "points_written": len(points)}

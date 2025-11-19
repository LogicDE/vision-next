from pydantic import BaseModel
from typing import Optional


class BiometricData(BaseModel):
    """
    Payload received from the mobile app simulator or real devices.

    It can represent:
    - Continuous wearable biometrics (heart_rate, hrv, eda_microsiemens, etc.)
    - Sleep summary metrics (total_sleep_s, sleep_efficiency_pct, ...)
    """

    # Identification
    user_id: Optional[int] = None          # Worker / employee id
    user_email: Optional[str] = None       # Optional, for other clients
    device_id: str

    # Optional context / location tags
    org_id: Optional[str] = None
    site: Optional[str] = None
    zone: Optional[str] = None

    # Continuous wearable biometrics
    heart_rate: Optional[float] = None          # maps to hr_bpm
    hrv: Optional[float] = None                 # RMSSD, maps to hrv_rmssd_ms
    hrv_sdnn_ms: Optional[float] = None         # Optional SDNN if a device provides it
    temperature: Optional[float] = None         # maps to skin_temp_c
    resp_rate: Optional[float] = None           # maps to resp_rate_bpm
    spo2_pct: Optional[float] = None
    eda_microsiemens: Optional[float] = None

    # Environmental / IoT metrics (env_air / env_ambient)
    co2_ppm: Optional[float] = None
    pm25_ugm3: Optional[float] = None
    temp_c: Optional[float] = None
    noise_db: Optional[float] = None
    light_lux: Optional[float] = None

    # Generic optional cognitive/ambient fields (unused by current simulator but allowed)
    pasos: Optional[int] = None
    estres: Optional[float] = None
    atencion: Optional[float] = None
    carga_cognitiva: Optional[float] = None
    estado_emocional: Optional[int] = None
    ruido: Optional[float] = None
    iluminacion: Optional[float] = None
    co2: Optional[float] = None
    presencia: Optional[bool] = None

    # Sleep-related summary metrics (sent once per sleep episode)
    sleep_score: Optional[float] = None
    total_sleep_s: Optional[int] = None
    time_in_bed_s: Optional[int] = None
    sleep_efficiency_pct: Optional[float] = None
    sleep_latency_s: Optional[int] = None
    awakening_count: Optional[int] = None

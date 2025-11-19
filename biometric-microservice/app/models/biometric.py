from pydantic import BaseModel

class BiometricData(BaseModel):
    user_id: str
    device_id: str
    frecuencia_cardiaca: float
    hrv: float = None
    pasos: int = None
    temperatura: float = None
    estres: float = None
    atencion: float = None
    carga_cognitiva: float = None
    estado_emocional: int = None
    ruido: float = None
    iluminacion: float = None
    co2: float = None
    presencia: bool = None

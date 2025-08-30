from fastapi import FastAPI
from app.routers import biometricroutes as biometric

app = FastAPI(title="Microservicio Biométrico")

# Registrar routers
app.include_router(biometric.router, prefix="/api", tags=["biometria"])

@app.get("/")
def root():
    return {"message": "Microservicio de biometría funcionando"}

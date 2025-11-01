# Script para iniciar el servicio de burnout

Write-Host "="*70 -ForegroundColor Cyan
Write-Host "  INICIANDO MICROSERVICIO DE BURNOUT" -ForegroundColor Cyan
Write-Host "="*70 -ForegroundColor Cyan

# Verificar que el modelo existe
if (Test-Path "models/burnout_model.pkl") {
    $size = (Get-Item "models/burnout_model.pkl").Length
    Write-Host "✅ Modelo encontrado ($size bytes)" -ForegroundColor Green
} else {
    Write-Host "❌ Modelo no encontrado en models/burnout_model.pkl" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Iniciando servidor..."
Write-Host "   URL: http://localhost:8001"
Write-Host "   Docs: http://localhost:8001/docs"
Write-Host "`n⏳ Iniciando uvicorn...`n"

# Iniciar el servicio
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001


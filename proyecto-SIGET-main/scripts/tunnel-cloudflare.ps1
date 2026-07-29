# Exponer SIGET con Cloudflare Quick Tunnel (sin registro)
# Requisito: cloudflared instalado → winget install Cloudflare.cloudflared
# El túnel apunta al frontend (puerto 3000) que hace proxy al backend vía /api-backend

param(
    [int]$Port = 3000
)

Write-Host "=== Cloudflare Quick Tunnel — SIGET ===" -ForegroundColor Cyan
Write-Host "Asegurate de tener Docker corriendo: docker compose up -d" -ForegroundColor Yellow
Write-Host "Exponiendo http://localhost:$Port ..." -ForegroundColor Green
Write-Host ""
Write-Host "La URL publica aparecera abajo (ej. https://xxxx.trycloudflare.com)" -ForegroundColor White
Write-Host "Prueba desde celular con datos moviles (4G/5G), NO WiFi local." -ForegroundColor White
Write-Host ""

cloudflared tunnel --url "http://localhost:$Port"

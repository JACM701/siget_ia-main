# Exponer SIGET con Ngrok Free Tier
# Requisito: ngrok instalado y autenticado → ngrok config add-authtoken TU_TOKEN
# El túnel apunta al frontend (puerto 3000)

param(
    [int]$Port = 3000
)

Write-Host "=== Ngrok Tunnel — SIGET ===" -ForegroundColor Cyan
Write-Host "Asegurate de tener Docker corriendo: docker compose up -d" -ForegroundColor Yellow
Write-Host "Exponiendo http://localhost:$Port ..." -ForegroundColor Green
Write-Host ""
Write-Host "Si usas frontend en Vercel, expone el BACKEND en su lugar:" -ForegroundColor Yellow
Write-Host "  .\scripts\tunnel-ngrok.ps1 -Port 4000" -ForegroundColor Yellow
Write-Host "  y configura NEXT_PUBLIC_BACKEND_URL en Vercel con la URL de ngrok." -ForegroundColor Yellow
Write-Host ""

ngrok http $Port

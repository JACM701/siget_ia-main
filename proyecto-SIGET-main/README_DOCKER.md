# Docker + Ngrok — Levantar el proyecto localmente

Pasos rápidos:

1. Instala Ngrok y asegúrate de tener Ollama corriendo en el host (`ollama serve`).

2. Inicia ngrok apuntando al puerto del backend (por defecto `4000`):

```bash
ngrok http 4000
```

3. Ngrok mostrará una URL pública HTTPS. Abre o copia la URL y reemplaza los valores en el archivo `.env` (raíz del proyecto):

```
CORS_ORIGINS=https://TU_SUBDOMINIO_NGROK.ngrok.app
NEXT_PUBLIC_BACKEND_URL=https://TU_SUBDOMINIO_NGROK.ngrok.app
```

4. Construye y levanta los servicios:

```bash
docker compose up --build -d
```

5. Verifica salud del backend vía la URL pública:

```bash
curl -i https://TU_SUBDOMINIO_NGROK.ngrok.app/health
```

6. Consultar logs si algo falla:

```bash
docker compose logs -f backend
```

Notas:
- `NEXT_PUBLIC_BACKEND_URL` se inyecta en build time del frontend; debes reconstruir el servicio `frontend` si cambias la URL.
- `OLLAMA_HOST` está apuntando a `host.docker.internal` para permitir que el backend en Docker converse con Ollama local.
- Las bases de datos usan volúmenes (`chromadb_data`, `backend_data`) para persistencia.

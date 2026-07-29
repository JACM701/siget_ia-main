# SIGET Peritos - Backend Node.js

Este módulo implementa el backend Node.js para el módulo de **Peritos SIGET** con las 7 funciones de IA: croquis 3D, velocidad por huellas, dictamen prellenado, asistente legal, análisis de video, detección de inconsistencias y banco de dictámenes inteligentes.

## Tecnologías usadas

- Node.js + Express
- Ollama con `qwen2.5:1.5b`
- ChromaDB para búsqueda semántica
- OCR y análisis de video nativos en Node.js
- Whisper (opcional) para transcripción de audio

## Estructura

```
backend-node/
├── app.js
├── config/index.js
├── package.json
├── .env.example
├── routes/
│   ├── dictamen.js
│   └── peritos.js
├── services/
│   ├── ollamaService.js
│   ├── chromaService.js
│   ├── mediaService.js
│   └── peritoService.js
├── Dockerfile
├── docker-compose.yml
```

## Instalación

1. Copiar el ejemplo de variables de entorno:

```bash
cd backend-node
cp .env.example .env
```

2. Instalar dependencias:

```bash
npm install
```

3. Instalar Ollama y descargar el modelo `qwen2.5:1.5b`:

```bash
# Instalar Ollama desde https://ollama.ai
ollama pull qwen2.5:1.5b
```

4. Iniciar el backend Node.js:

```bash
cd backend-node
npm run dev
```

```bash
cd backend-node
npm run dev
```

## Ejecutar con Docker Compose

```bash
cd backend-node
docker compose up -d
```

Esto levantará:
- `chromadb` en el puerto `8000`
- backend Node.js en el puerto `4000`

## API principales

### 1. Croquis 3D automático
POST `/api/peritos/croquis-3d`

Body:
```json
{
  "fotos_dir": "/ruta/fotos",
  "numero_fotos": 12
}
```

### 2. Cálculo de velocidad por huellas
POST `/api/peritos/velocidad-huellas`

Body:
```json
{ "ruta_foto": "/ruta/huella.jpg" }
```

### 3. Dictamen prellenado
POST `/api/dictamen/prellenado`

Body:
```json
{
  "ruta_licencia": "/ruta/licencia.jpg",
  "ruta_tarjeta_circulacion": "/ruta/tarjeta.jpg",
  "ruta_placa": "/ruta/placa.jpg"
}
```

### 4. Asistente legal en tiempo real
POST `/api/peritos/asistente-legal`

Body:
```json
{ "pregunta": "¿Quién tiene culpa si no hay señal en el cruce?" }
```

### 5. Análisis de videos C5i
POST `/api/peritos/analizar-video`

Body:
```json
{ "ruta_video": "/ruta/video_c5i.mp4" }
```

### 6. Detección de inconsistencias
POST `/api/dictamen/inconsistencias`

Body:
```json
{
  "conductores": [ ... ],
  "vehiculos": [ ... ]
}
```

### 7. Banco de dictámenes inteligentes
GET `/api/dictamen/similares?lugar=Merida&tipo=alcance`

### Búsqueda semántica en ChromaDB
POST `/api/dictamen/buscar`

Body:
```json
{ "consulta": "Accidente por no ceder el paso", "limite": 5 }
```

## Notas

- El backend Node.js usa Ollama para generar respuestas del modelo `qwen2.5:1.5b`.
- El OCR y el análisis de video se realizan directamente en Node.js.
- ChromaDB se usa para almacenar y buscar dictámenes similares.

## Siguiente paso

Si quieres, puedo añadir una interfaz React/Next para consumir este backend y crear un asistente visual para los peritos.

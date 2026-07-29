const axios = require('axios');
const config = require('../config');

const baseUrl = `http://${config.ollama.host}:${config.ollama.port}`;

async function verificarConexion() {
  try {
    const url = `${baseUrl}/api/tags`;
    const resp = await axios.get(url);
    return resp.status === 200;
  } catch (error) {
    return false;
  }
}

function crearErrorOllama(message) {
  const error = new Error(message);
  error.status = 503;
  return error;
}
function obtenerRespuestaMock(prompt) {
  return "Lo siento, mi conexión con el cerebro de Inteligencia Artificial (Ollama) tardó demasiado o falló. Por favor, verifica que el modelo esté descargado e intenta de nuevo.";
}
/*
function obtenerRespuestaMock(prompt) {
  // 1. Check if it's the 3D Croquis prompt
  if (prompt.includes("plano de accidente en 3D") || prompt.includes("croquis 3D")) {
    return JSON.stringify({
      estado: "completado",
      croquis_3d_url: "/images/mock-croquis-3d.png",
      vehiculos: [
        { id: 1, marca: "Nissan Versa", color: "Gris", posicion: "Intersección Noroeste", daño: "Frontal" },
        { id: 2, marca: "Chevrolet Aveo", color: "Rojo", posicion: "Centro de la vía", daño: "Lateral Derecho" }
      ],
      huellas_frenado: [
        { vehiculo: 1, longitud_metros: 12.5 },
        { vehiculo: 2, longitud_metros: 4.2 }
      ],
      medidas: {
        ancho_calle_60: "9.5 metros",
        distancia_impacto: "3.2 metros desde la esquina"
      },
      comentario: "Reconstrucción tridimensional generada con éxito a partir de las imágenes de evidencia."
    }, null, 2);
  }

  // 2. Check if it's the speed calculations by skid marks (huellas)
  if (prompt.includes("huellas de frenado en un accidente") || prompt.includes("velocidad")) {
    return `Cálculo de Velocidad por Huellas de Frenado:

1. FÓRMULA FÍSICA APLICADA:
   v = sqrt(2 * g * f * d)
   Donde:
   - v = Velocidad inicial del vehículo en m/s
   - g = Aceleración de la gravedad (9.81 m/s²)
   - f = Coeficiente de fricción (para asfalto seco aproximado: 0.7)
   - d = Longitud de la huella de frenado (medida en el sitio)

2. DESARROLLO DEL CASO:
   - Longitud de huella medida (d): 15 metros.
   - Coeficiente de fricción del asfalto (f): 0.75 (asfalto seco de buena calidad).
   - Gravedad (g): 9.81 m/s².

   v = sqrt(2 * 9.81 * 0.75 * 15)
   v = sqrt(220.725)
   v ≈ 14.85 m/s

3. CONVERSIÓN A KM/H:
   v_kmh = v * 3.6
   v_kmh = 14.85 * 3.6 ≈ 53.48 km/h

Conclusión: La velocidad estimada del vehículo al iniciar el frenado era de aproximadamente 53.5 km/h. Con base en el Reglamento de Tránsito de Yucatán, el límite de velocidad en esta zona urbana es de 50 km/h, por lo que el conductor excedía ligeramente el límite de velocidad permitido.`;
  }

  // 3. Check if it's the inconsistencies detection
  if (prompt.includes("inconsistencias en la versión") || prompt.includes("inconsistencias")) {
    return JSON.stringify({
      inconsistencias_detectadas: [
        {
          id: 1,
          gravedad: "ALTA",
          descripcion: "El conductor del Nissan Versa (Vehículo A) declara que estaba estático, pero la huella de frenado del mismo es de 12.5 metros, lo que indica que circulaba a una velocidad mínima de 40 km/h antes del impacto."
        },
        {
          id: 2,
          gravedad: "MEDIA",
          descripcion: "El daño reportado en el Chevrolet Aveo (Vehículo B) es de tipo lateral derecho, pero el conductor declara que fue impactado de frente."
        },
        {
          id: 3,
          gravedad: "BAJA",
          descripcion: "Mismatch menor en las horas declaradas por ambos conductores por un margen de 15 minutos."
        }
      ],
      conclusion: "Existe evidencia física de huellas y daños que contradicen las declaraciones iniciales de los involucrados."
    }, null, 2);
  }

  // 4. Check if it's the legal articles detection (JSON)
  if (prompt.includes("Reglamento de Tránsito") && prompt.includes("JSON") && prompt.includes("articulos")) {
    return JSON.stringify({
      articulos: ["Art. 82", "Art. 104", "Art. 215"],
      explicacion: "Se identificaron infracciones relativas a la preferencia de paso en intersecciones no reguladas (Art. 82) y exceso de velocidad (Art. 104) con base en la colisión lateral y huellas de frenado."
    }, null, 2);
  }

  // 5. Default is Legal Assistant / general question
  let respuesta = `De acuerdo con el Reglamento de Tránsito del Estado de Yucatán:

1. MARCO LEGAL GENERAL:
   En intersecciones y cruces de vías públicas, la preferencia de paso se regula conforme a la señalización existente. A falta de señales físicas (disco de alto o semáforo), se aplicará la regla de la derecha (Art. 82): tiene preferencia el vehículo que circule por la vía de mayor flujo o, en su caso, el que se aproxime por la derecha del otro.

2. ANÁLISIS DEL CASO Y ARTÍCULOS APLICABLES:
   - Art. 82: Preferencia de paso en intersecciones no señalizadas.
   - Art. 95: Obligación de reducir la velocidad al aproximarse a cualquier intersección.
   - Art. 143: Reglas de conducta y prohibición de entorpecer el tránsito.

3. RECOMENDACIONES:
   Se sugiere al perito recabar evidencias fotográficas detalladas de la falta de señalamiento vial y el ángulo de impacto en los vehículos para determinar la trayectoria y la prioridad de paso física en el momento del siniestro.`;

  const queryNormalized = prompt.toLowerCase();
  if (queryNormalized.includes("sobornar") || queryNormalized.includes("soborno") || queryNormalized.includes("dinero") || queryNormalized.includes("dádiva") || queryNormalized.includes("dadiva")) {
    respuesta = `De acuerdo con el Reglamento de Tránsito de Yucatán y la Ley de Seguridad Pública del Estado:

1. MARCO LEGAL DEL INTENTO DE COHECHO / SOBORNO:
   Cualquier intento de ofrecer dinero, dádivas o beneficios a un agente de tránsito para evitar una sanción o modificar un dictamen constituye el delito de Cohecho conforme al Código Penal del Estado de Yucatán.

2. PROTOCOLO DE ACTUACIÓN PARA EL PERITO (Art. 296 y aplicables):
   - Rechazar de forma categórica e inmediata cualquier ofrecimiento ilícito.
   - Informar de inmediato al Centro de Control (C5i) o a su superior jerárquico.
   - Documentar la situación en la sección de 'Observaciones del IPH' (Informe Policial Homologado).
   - De ser necesario y si hay testigos o grabación de video de patrulla/chaleco, proceder con la puesta a disposición del conductor infractor ante el Ministerio Público.

3. ADVERTENCIA:
   Aceptar o solicitar sobornos invalida el peritaje y expone al perito a sanciones penales graves, destitución e inhabilitación del servicio público.`;
  } else if (queryNormalized.includes("alcohol") || queryNormalized.includes("ebrio") || queryNormalized.includes("tomado") || queryNormalized.includes("aliento") || queryNormalized.includes("cerveza")) {
    respuesta = `Reglamento de Tránsito del Estado de Yucatán - Conducción bajo efectos del alcohol:

1. LÍMITES PERMITIDOS (Art. 312):
   Está prohibido conducir vehículos en el estado de Yucatán con una tasa de alcohol en la sangre superior a 0.8 gramos por litro o con aliento alcohólico/drogas. Para conductores de transporte público, escolar o de carga, la tolerancia es CERO.

2. SANCIONES APLICABLES:
   - Arresto administrativo inconmutable de hasta 36 horas.
   - Retención del vehículo y traslado al corralón.
   - Suspensión temporal de la licencia de conducir.

3. OBLIGACIONES DEL PERITO:
   Debe solicitar inmediatamente el apoyo médico certificado para realizar la prueba de alcoholimetría (alcoholímetro) en aire espirado o examen de sangre para que conste de manera oficial en el expediente del siniestro.`;
  }

  return respuesta;
}
*/
async function generarRespuesta(prompt) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const body = {
        contents: [{ parts: [{ text: prompt }] }]
      };
      const resp = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000
      });
      if (resp.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return resp.data.candidates[0].content.parts[0].text;
      }
    } catch (error) {
      console.warn(`[GEMINI-FALLBACK] Error llamando a Gemini API: ${error.message}. Pasando a Ollama/Mock.`);
    }
  }

  const url = `${baseUrl}/api/generate`;
  const body = {
    model: config.ollama.model,
    prompt,
    stream: false
  };

  try {
    const resp = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000
    });

    if (!resp.data || typeof resp.data.response !== 'string') {
      throw crearErrorOllama('Ollama respondió sin contenido válido.');
    }

    return resp.data.response;
  } catch (error) {
    console.warn(`[OLLAMA-FALLBACK] No se pudo conectar o comunicar con Ollama en ${baseUrl} (${error.message}). Utilizando respuesta simulada.`);
    return obtenerRespuestaMock(prompt);
  }
}

async function obtenerAsistenteJuridico(pregunta) {
  const prompt = `Eres el Asistente Legal virtual del sistema SIGET (Sistema Integral de Gestión de Tránsito), experto en el Reglamento de Tránsito de Yucatán. 
Instrucciones críticas:
- Si el usuario solo te saluda (ej. "hola", "buenos días"), devuélvele el saludo de forma breve, preséntate como asistente del SIGET y ofrécele tu ayuda sin citar leyes.
- Si el usuario te hace una pregunta sobre un accidente o vialidad, responde de forma clara y profesional citando los artículos relevantes del reglamento.
- Si no sabes algo, admítelo. Sé directo y profesional.

Pregunta del usuario: ${pregunta}

Tu respuesta:`;
  return generarRespuesta(prompt);
}

async function obtenerArticulosRelevantes(situacion) {
  const prompt = `Para la siguiente situación de tránsito, indica qué artículos del Reglamento de Tránsito de Yucatán podrían aplicarse:\n\nSituación: ${situacion}\n\nResponde en formato JSON con estructura: {"articulos": ["Art. X", "Art. Y"], "explicacion": "..."}`;
  const resp = await generarRespuesta(prompt);

  try {
    // Si la respuesta viene con formato de Markdown code block (común en Gemini), limpiarla
    const cleanedJson = resp.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);
    return parsed.articulos || [];
  } catch (error) {
    console.warn('No se pudo parsear JSON de LLM:', error.message);
    return [];
  }
}

async function generarRespuestaStream(prompt, onToken, onDone, onError) {
  let doneCalled = false;
  const safeOnDone = (info) => {
    if (doneCalled) return;
    doneCalled = true;
    onDone(info);
  };

  if (process.env.GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const body = {
        contents: [{ parts: [{ text: prompt }] }]
      };
      const resp = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000
      });
      if (resp.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = resp.data.candidates[0].content.parts[0].text;
        simulateStream(text, onToken, safeOnDone);
        return;
      }
    } catch (error) {
      console.warn(`[GEMINI-STREAM-FALLBACK] Error llamando a Gemini API: ${error.message}. Pasando a Ollama/Mock.`);
    }
  }

  const url = `${baseUrl}/api/generate`;
  const body = {
    model: config.ollama.model,
    prompt,
    stream: true
  };

  try {
    const response = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'stream',
      timeout: 60000
    });

    let buffer = '';
    response.data.on('data', (chunk) => {
      buffer += chunk.toString();
      let lines = buffer.split('\n');
      buffer = lines.pop(); // guardar última línea incompleta
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            onToken(parsed.response);
          }
          if (parsed.done) {
            safeOnDone(parsed);
          }
        } catch (e) {
          // ignorar error de parseo de línea incompleta
        }
      }
    });

    response.data.on('end', () => {
      if (buffer.trim() !== '') {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.response) onToken(parsed.response);
          if (parsed.done) safeOnDone(parsed);
        } catch(e) {}
      }
      safeOnDone({ done: true });
    });

    response.data.on('error', (err) => {
      onError(err);
    });

  } catch (error) {
    console.warn(`[OLLAMA-FALLBACK] No se pudo conectar a Ollama en ${baseUrl} para streaming (${error.message}). Usando fallback simulado.`);
    const mockResp = obtenerRespuestaMock(prompt);
    simulateStream(mockResp, onToken, safeOnDone);
  }
}

function simulateStream(text, onToken, onDone) {
  let index = 0;
  const words = text.split(/(\s+)/);
  const interval = setInterval(() => {
    if (index < words.length) {
      onToken(words[index]);
      index++;
    } else {
      clearInterval(interval);
      onDone({ done: true, total_duration: 500, eval_count: words.length });
    }
  }, 25);
}

function generarInformeFallback(notas) {
  const cleanNotas = notas || '';
  const lines = cleanNotas.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Helpers for line-based search
  const findValueByKeyword = (keyword) => {
    for (const line of lines) {
      if (line.toLowerCase().includes(keyword.toLowerCase())) {
        const parts = line.split(':');
        if (parts.length > 1) {
          return parts.slice(1).join(':').trim();
        }
      }
    }
    return null;
  };

  const folio = findValueByKeyword('folio') || 'ST-2026-0896';
  const area = findValueByKeyword('área') || findValueByKeyword('area') || 'Tránsito Terrestre';
  
  const fechaVal = findValueByKeyword('fecha');
  const fechaMatch = fechaVal ? fechaVal.match(/(\d{4}-\d{2}-\d{2})/) : cleanNotas.match(/(\d{4}-\d{2}-\d{2})/);
  const fecha_siniestro = fechaMatch ? fechaMatch[1] : new Date().toISOString().split('T')[0];

  const horaVal = findValueByKeyword('hora');
  const horaMatch = horaVal ? horaVal.match(/(\d{2}:\d{2}(:\d{2})?)/) : cleanNotas.match(/(\d{2}:\d{2}(:\d{2})?)/);
  const hora_siniestro = horaMatch ? horaMatch[1] : "11:10:00";

  const tipo_siniestro = findValueByKeyword('tipo') || 'Colisión frontal';
  
  const calle_principal = findValueByKeyword('calle principal') || findValueByKeyword('calle_principal') || 'Calle 50';
  const entre_calles = findValueByKeyword('entre calles') || findValueByKeyword('entre_calles') || 'Calle 60';
  const colonia_fraccionamiento = findValueByKeyword('colonia') || findValueByKeyword('fraccionamiento') || 'Centro';
  const punto_referencia = findValueByKeyword('referencia') || 'Frente a comercio local';
  const coordenadas_gps = findValueByKeyword('gps') || findValueByKeyword('coordenadas') || '19.8454, -90.5236';

  const lesionadosVal = findValueByKeyword('lesionados');
  const lesionadosMatch = lesionadosVal ? lesionadosVal.match(/(\d+)/) : cleanNotas.match(/lesionados:?\s*(\d+)/i);
  const personas_lesionadas = lesionadosMatch ? parseInt(lesionadosMatch[1]) : 0;

  const fallecidosVal = findValueByKeyword('fallecidos');
  const fallecidosMatch = fallecidosVal ? fallecidosVal.match(/(\d+)/) : cleanNotas.match(/fallecidos:?\s*(\d+)/i);
  const personas_fallecidas = fallecidosMatch ? parseInt(fallecidosMatch[1]) : 0;

  // Determinar vehículos
  const vehiculos = [];
  const detallesLine = findValueByKeyword('detalles') || findValueByKeyword('vehículos') || findValueByKeyword('vehiculos');
  
  if (detallesLine) {
    const vParts = detallesLine.split(/vehículo\s*\d+\s*:?/i).map(p => p.trim()).filter(Boolean);
    let idVehiculo = 1;
    for (const part of vParts) {
      const marcaMatch = part.match(/(Nissan|Italika|Chevrolet|Ford|Toyota|Honda|Hyundai|Mazda|Volkswagen|Kia)/i);
      const placasMatch = part.match(/placas?:?\s*([a-zA-Z0-9-]+|sin placas)/i);
      const rolMatch = part.match(/(presunto responsable|responsable|afectado|involucrado)/i);
      const modeloMatch = part.match(/modelo?:?\s*([a-zA-Z0-9]+)/i);
      
      if (marcaMatch) {
        vehiculos.push({
          id_vehiculo: idVehiculo++,
          marca: marcaMatch[1],
          modelo: modeloMatch ? modeloMatch[1] : (marcaMatch[1].toLowerCase() === 'nissan' ? 'Versa' : '125Z'),
          placas: placasMatch ? placasMatch[1] : "No especificado",
          tipo_participacion: rolMatch ? rolMatch[1] : "Involucrado"
        });
      }
    }
  }

  // Si no se detectó ningún vehículo, ponemos mocks con datos básicos
  if (vehiculos.length === 0) {
    vehiculos.push({
      id_vehiculo: 1,
      marca: "Nissan",
      modelo: "Versa",
      placas: "YYY-123",
      tipo_participacion: "Presunto responsable"
    });
    vehiculos.push({
      id_vehiculo: 2,
      marca: "Italika",
      modelo: "125Z",
      placas: "Sin placas",
      tipo_participacion: "Afectado"
    });
  }

  const descripcion_hechos = findValueByKeyword('hechos') || findValueByKeyword('descripción') || cleanNotas.trim();

  return {
    datos_generales: {
      folio,
      area,
      fecha_siniestro,
      hora_siniestro,
      tipo_siniestro,
      descripcion_hechos
    },
    ubicacion: {
      calle_principal,
      entre_calles,
      colonia_fraccionamiento,
      punto_referencia,
      coordenadas_gps
    },
    vehiculos_involucrados: {
      cantidad_vehiculos: vehiculos.length,
      detalle_vehiculos: vehiculos
    },
    saldo_involucrados: {
      personas_lesionadas,
      personas_fallecidas
    },
    metadatos_sistema: {
      estado_cadena_custodia: "Iniciada",
      autores_registro: "Angel Sanchez Vazquez y Genny Sanchez Pech"
    }
  };
}

async function generarInformeEstructurado(notas) {
  const prompt = `
INSTRUCCIÓN CRÍTICA: 
Analiza las notas proporcionadas por el oficial y extrae la información para llenar el reporte.
DEBES responder EXCLUSIVAMENTE con un objeto JSON válido. No incluyas texto antes ni después del JSON.
Si un dato no está presente en las notas (como las placas o la colonia), coloca el valor como "No especificado" o "0" para los números.

El JSON debe seguir EXACTAMENTE esta estructura:
{
  "datos_generales": { 
    "folio": "", 
    "area": "", 
    "fecha_siniestro": "YYYY-MM-DD", 
    "hora_siniestro": "HH:MM:00", 
    "tipo_siniestro": "", 
    "descripcion_hechos": "" 
  },
  "ubicacion": { 
    "calle_principal": "", 
    "entre_calles": "", 
    "colonia_fraccionamiento": "", 
    "punto_referencia": "", 
    "coordenadas_gps": "" 
  },
  "vehiculos_involucrados": { 
    "cantidad_vehiculos": 0, 
    "detalle_vehiculos": [
      { 
        "id_vehiculo": 1, 
        "marca": "", 
        "modelo": "", 
        "placas": "", 
        "tipo_participacion": "" 
      }
    ] 
  },
  "saldo_involucrados": { 
    "personas_lesionadas": 0, 
    "personas_fallecidas": 0 
  },
  "metadatos_sistema": { 
    "estado_cadena_custodia": "Iniciada", 
    "autores_registro": "Angel Sanchez Vazquez y Genny Sanchez Pech" 
  }
}

Notas proporcionadas por el oficial:
${notas}
`;

  try {
    const respuesta = await generarRespuesta(prompt);
    // Intentar extraer el JSON de la respuesta
    const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
    throw new Error("No se pudo extraer un JSON válido de la respuesta de Ollama.");
  } catch (error) {
    console.warn("[OLLAMA-FALLBACK] Error al generar informe estructurado con Ollama, usando fallback de extracción manual:", error.message);
    return generarInformeFallback(notas);
  }
}

module.exports = {
  verificarConexion,
  generarRespuesta,
  generarRespuestaStream,
  obtenerAsistenteJuridico,
  obtenerArticulosRelevantes,
  generarInformeEstructurado
};

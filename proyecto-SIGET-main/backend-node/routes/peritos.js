const express = require('express');
const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs/promises');
const peritoService = require('../services/peritoService');
const router = express.Router();

const upload = multer({
  dest: path.join(os.tmpdir(), 'siget-uploads')
});

const { verifyToken, apiLimiter } = require('../middleware/auth.middleware.js');

// 🔒 Aplicar limitador de velocidad (10 req/min) y validación de Token
router.use(apiLimiter);
router.use(verifyToken);

async function cleanupFiles(files) {
  if (!files) return;
  await Promise.all(
    files.map((file) => fs.unlink(file.path).catch(() => {}))
  );
}

router.post('/croquis-3d', async (req, res, next) => {
  try {
    const { fotos_dir, numero_fotos } = req.body;
    const resultado = await peritoService.generarCroquis3DAutomatico(fotos_dir, numero_fotos);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

router.post('/croquis-3d/upload', upload.array('photos', 20), async (req, res, next) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      throw new Error('Debe cargar al menos una imagen para el croquis.');
    }
    const numeroFotos = Number(req.body.numero_fotos) || files.length;
    const filePaths = files.map((file) => file.path);
    const resultado = await peritoService.generarCroquis3DAutomatico(filePaths, numeroFotos);
    await cleanupFiles(files);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

router.post('/velocidad-huellas', async (req, res, next) => {
  try {
    const { ruta_foto } = req.body;
    const resultado = await peritoService.calcularVelocidadPorHuellas(ruta_foto);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

router.post('/velocidad-huellas/upload', upload.single('huella'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('Debe cargar una imagen de huellas.');
    }
    const resultado = await peritoService.calcularVelocidadPorHuellas(req.file.path);
    await cleanupFiles([req.file]);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

router.post('/asistente-legal', async (req, res, next) => {
  try {
    const { pregunta, conversation_id } = req.body;
    const { checkPromptInjection } = require('../services/guardrailsService');
    const dbService = require('../services/dbService');
    const { getClientIp } = require('../utils/clientIp');
    const { v4: uuidv4 } = require('uuid');

    const conversationId = conversation_id || uuidv4();
    const clientIp = getClientIp(req);

    // 1. Guardrails check
    if (checkPromptInjection(pregunta)) {
      await dbService.saveMetrics({
        sessionId: conversationId,
        prompt: pregunta || '',
        response: 'BLOQUEADO POR SEGURIDAD (GUARDRAILS)',
        ttft: 0,
        latency: 0,
        tps: 0,
        was_blocked: 1,
        tools_executed: [],
        client_ip: clientIp
      });
      return res.status(400).json({ error: 'Consulta bloqueada por políticas de seguridad.' });
    }

    // 2. Set headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    // Save user's question to history
    const userMsgId = uuidv4();
    await dbService.saveChatMessage(userMsgId, conversationId, 'user', pregunta);

    // Get chat history
    const history = await dbService.getChatHistory(conversationId);

    // 3. Sliding window context control (keep within ~8000 characters)
    let formattedHistory = [];
    let currentLength = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      const msgText = `${msg.role === 'user' ? 'Perito' : 'Asistente'}: ${msg.content}`;
      if (currentLength + msgText.length > 8000) {
        break;
      }
      formattedHistory.unshift(msgText);
      currentLength += msgText.length;
    }
    const historyText = formattedHistory.join('\n');

    // 4. Function Calling / Tools Execution with Resilience
    const toolsExecuted = [];
    let toolContext = "";
    const queryNormalized = (pregunta || '').toLowerCase();

    // Tool 1: Buscar artículos del reglamento
    if (queryNormalized.includes('reglamento') || queryNormalized.includes('artículo') || queryNormalized.includes('articulo') || queryNormalized.includes('ley')) {
      res.write(`data: ${JSON.stringify({ status: 'searching_rules', message: 'Buscando artículos en el reglamento de tránsito de Yucatán...' })}\n\n`);
      try {
        const ollamaService = require('../services/ollamaService');
        const articulos = await ollamaService.obtenerArticulosRelevantes(pregunta);
        toolsExecuted.push({ name: 'buscar_reglamento_yucatan', status: 'success', result: articulos });
        if (articulos && articulos.length > 0) {
          toolContext += `\nArtículos relevantes del reglamento de Yucatán: ${articulos.join(', ')}.`;
        }
      } catch (err) {
        console.error('Error en herramienta buscar_reglamento_yucatan:', err.message);
        toolsExecuted.push({ name: 'buscar_reglamento_yucatan', status: 'failed', error: err.message });
        toolContext += `\n[Nota: No se pudo consultar la base de datos de artículos del reglamento por un problema técnico. Continúa con tus conocimientos base sin mostrar errores del sistema.]`;
      }
    }

    // Tool 2: Buscar siniestros similares
    if (queryNormalized.includes('siniestro') || queryNormalized.includes('choque') || queryNormalized.includes('colision') || queryNormalized.includes('colisión') || queryNormalized.includes('accidente')) {
      res.write(`data: ${JSON.stringify({ status: 'searching_accidents', message: 'Analizando historial de colisiones en la base de datos...' })}\n\n`);
      try {
        const chromaService = require('../services/chromaService');
        const similares = await chromaService.buscarDictamenesSimilares(pregunta, 2);
        toolsExecuted.push({ name: 'analizar_siniestros_similares', status: 'success', count: similares.length });
        if (similares && similares.length > 0) {
          toolContext += `\nCasos similares de accidentes encontrados:\n${similares.map(s => `- ${s.document || JSON.stringify(s)}`).join('\n')}`;
        }
      } catch (err) {
        console.error('Error en herramienta analizar_siniestros_similares:', err.message);
        toolsExecuted.push({ name: 'analizar_siniestros_similares', status: 'failed', error: err.message });
        toolContext += `\n[Nota: No se pudo consultar la base de datos de accidentes históricos (Chroma). Responde en base a la información provista por el perito y tu base de conocimientos.]`;
      }
    }

    // Tool 3: Buscar en PDFs locales (Reglamento y Constitución)
    try {
      const searchService = require('../services/searchService');
      const fragmentos = searchService.buscarEnDocumentos(pregunta, 3);
      if (fragmentos && fragmentos.length > 0) {
        toolsExecuted.push({ name: 'buscar_en_pdfs_locales', status: 'success', count: fragmentos.length });
        toolContext += `\n\nArtículos y fragmentos relevantes extraídos directamente de los PDFs cargados por el usuario:\n` + 
          fragmentos.map(f => `* De "${f.document}" (Pág. ${f.page}): "${f.text}"`).join('\n\n');
      }
    } catch (err) {
      console.error('Error en herramienta buscar_en_pdfs_locales:', err.message);
    }

    // 5. Inferencia con LLM (Ollama o Gemini)
    res.write(`data: ${JSON.stringify({ status: 'inferring', message: 'Procesando respuesta con Inteligencia Artificial...' })}\n\n`);

    const startTime = Date.now();
    let firstTokenReceived = false;
    let ttftTime = 0;
    let fullResponse = "";

    const systemPrompt = `Eres un asistente legal experto en tránsito vial del Estado de Yucatán. Ayudas a peritos de tránsito a analizar accidentes, determinar culpabilidades y encontrar artículos de leyes relevantes. Responde de forma profesional, clara y concisa.`;
    const finalPrompt = `${systemPrompt}\n\nHistorial de la conversación:\n${historyText}\n\nInformación adicional de herramientas:\n${toolContext}\n\nPregunta final del perito:\n${pregunta}\n\nRespuesta del asistente:`;

    const ollamaService = require('../services/ollamaService');
    await ollamaService.generarRespuestaStream(
      finalPrompt,
      (token) => {
        if (!firstTokenReceived) {
          firstTokenReceived = true;
          ttftTime = Date.now() - startTime;
        }
        fullResponse += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      },
      async (doneInfo) => {
        const totalLatency = Date.now() - startTime;
        const wordCount = fullResponse.split(/\s+/).filter(Boolean).length;
        const tokenCount = Math.max(1, Math.round(wordCount * 1.3));
        const tps = totalLatency > 0 ? (tokenCount / (totalLatency / 1000)) : 0;

        // Guardar respuesta del asistente en BD
        const assistantMsgId = uuidv4();
        await dbService.saveChatMessage(assistantMsgId, conversationId, 'assistant', fullResponse);

        // Guardar métricas de auditoría
        await dbService.saveMetrics({
          sessionId: conversationId,
          prompt: pregunta,
          response: fullResponse,
          ttft: ttftTime,
          latency: totalLatency,
          tps: tps,
          was_blocked: 0,
          tools_executed: toolsExecuted,
          client_ip: clientIp
        });

        // Enviar evento de finalización
        res.write(`data: ${JSON.stringify({
          status: 'done',
          conversation_id: conversationId,
          metrics: {
            ttft: ttftTime,
            latency: totalLatency,
            tps: parseFloat(tps.toFixed(2))
          }
        })}\n\n`);
        res.end();
      },
      (err) => {
        console.error('Error durante la generación de respuesta en stream:', err.message);
        res.write(`data: ${JSON.stringify({ error: 'Error durante la generación de la respuesta.' })}\n\n`);
        res.end();
      }
    );

  } catch (error) {
    next(error);
  }
});

router.get('/asistente-legal/historial/:sessionId', async (req, res, next) => {
  try {
    const dbService = require('../services/dbService');
    const history = await dbService.getChatHistory(req.params.sessionId);
    res.json({ history });
  } catch (error) {
    next(error);
  }
});

// Métricas de observabilidad (evidencia de peticiones locales/externas)
router.get('/observability/metrics', async (req, res, next) => {
  try {
    const dbService = require('../services/dbService');
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const metrics = await dbService.getObservabilityMetrics(limit);
    res.json({ count: metrics.length, metrics });
  } catch (error) {
    next(error);
  }
});

router.post('/analizar-video', async (req, res, next) => {
  try {
    const { ruta_video } = req.body;
    const resultado = await peritoService.analizarVideoC5i(ruta_video);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

router.post('/analizar-video/upload', upload.single('video'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('Debe cargar un archivo de video.');
    }
    const resultado = await peritoService.analizarVideoC5i(req.file.path);
    await cleanupFiles([req.file]);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

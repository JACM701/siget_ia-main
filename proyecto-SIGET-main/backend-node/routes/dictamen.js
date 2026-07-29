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

router.post('/prellenado', async (req, res, next) => {
  try {
    const { ruta_licencia, ruta_tarjeta_circulacion, ruta_placa } = req.body;
    const resultado = await peritoService.crearDictamenPrellenado(
      ruta_licencia,
      ruta_tarjeta_circulacion,
      ruta_placa
    );
    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

router.post('/prellenado/upload', upload.fields([
  { name: 'licencia', maxCount: 1 },
  { name: 'tarjeta', maxCount: 1 },
  { name: 'placa', maxCount: 1 }
]), async (req, res, next) => {
  try {
    const files = req.files || {};
    const licencia = files.licencia?.[0];
    const tarjeta = files.tarjeta?.[0];
    const placa = files.placa?.[0];

    if (!licencia || !tarjeta || !placa) {
      throw new Error('Debe cargar licencia, tarjeta y placa.');
    }

    const resultado = await peritoService.crearDictamenPrellenado(
      licencia.path,
      tarjeta.path,
      placa.path
    );

    await cleanupFiles([licencia, tarjeta, placa]);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

router.post('/inconsistencias', async (req, res, next) => {
  try {
    const { conductores, vehiculos } = req.body;
    const resultado = await peritoService.detectarInconsistencias(conductores, vehiculos);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
});

router.get('/similares', async (req, res, next) => {
  try {
    const { lugar, tipo } = req.query;
    const resultado = await peritoService.obtenerDictamenesSimilares(lugar, tipo);
    res.json({ similares: resultado });
  } catch (error) {
    next(error);
  }
});

router.post('/buscar', async (req, res, next) => {
  try {
    const { consulta, limite } = req.body;
    const resultado = await require('../services/chromaService').buscarDictamenesSimilares(consulta, limite || 5);
    res.json({ resultados: resultado });
  } catch (error) {
    next(error);
  }
});

router.post('/generar-informe', async (req, res, next) => {
  try {
    const { notas } = req.body;
    if (!notas) {
      throw new Error('Debe proporcionar notas para estructurar el informe.');
    }
    const ollamaService = require('../services/ollamaService');
    const informe = await ollamaService.generarInformeEstructurado(notas);
    res.json(informe);
  } catch (error) {
    next(error);
  }
});

router.post('/guardar-informe', async (req, res, next) => {
  try {
    const { informe } = req.body;
    if (!informe || !informe.datos_generales || !informe.datos_generales.folio) {
      throw new Error('Datos del informe incompletos (requiere folio).');
    }
    const dbService = require('../services/dbService');
    const { folio, area, fecha_siniestro, hora_siniestro, tipo_siniestro } = informe.datos_generales;
    await dbService.saveInforme(
      folio,
      area || 'No especificado',
      fecha_siniestro || 'No especificado',
      hora_siniestro || 'No especificado',
      tipo_siniestro || 'No especificado',
      informe
    );
    res.json({ success: true, message: `Informe con folio ${folio} guardado exitosamente.` });
  } catch (error) {
    next(error);
  }
});

router.get('/informes', async (req, res, next) => {
  try {
    const dbService = require('../services/dbService');
    const informes = await dbService.getAllInformes();
    const parsedInformes = informes.map(inf => {
      try {
        return {
          ...inf,
          datos_completos: JSON.parse(inf.datos_completos)
        };
      } catch (e) {
        return inf;
      }
    });
    res.json({ informes: parsedInformes });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

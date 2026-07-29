const { v4: uuidv4 } = require('uuid');
const ollamaService = require('./ollamaService');
const chromaService = require('./chromaService');
const mediaService = require('./mediaService');

async function generarCroquis3DAutomatico(fotosDir, numeroFotos) {
  const prompt = `Genera un plano de accidente en 3D con medidas, posiciones de vehículos y huellas usando ${numeroFotos} fotos del directorio ${fotosDir}. Describe el resultado en JSON.`;
  const resp = await ollamaService.generarRespuesta(prompt);
  return { croquis: resp, fotosDir, numeroFotos };
}

async function calcularVelocidadPorHuellas(rutaFoto) {
  const prompt = `En base a una imagen de huellas de frenado en un accidente, explica cómo calcular la velocidad aproximada usando fórmula física. Proporciona un resultado de ejemplo para la imagen: ${rutaFoto}`;
  const resp = await ollamaService.generarRespuesta(prompt);
  return { rutaFoto, respuesta: resp };
}

async function crearDictamenPrellenado(rutaLicencia, rutaTarjeta, rutaPlaca) {
  const ocr = await mediaService.procesarOCR(rutaLicencia, rutaTarjeta, rutaPlaca);

  const dictamen = {
    id: uuidv4(),
    fecha: new Date().toISOString(),
    conductor: {
      nombre: ocr.licencia?.datos?.nombre || 'Desconocido',
      licencia: ocr.licencia?.datos?.numero || '',
      curp: ocr.licencia?.datos?.curp || ''
    },
    vehiculo: {
      placa: ocr.placa?.datos?.texto || ocr.placa?.texto || '',
      marca: ocr.tarjeta?.datos?.marca || '',
      modelo: ocr.tarjeta?.datos?.modelo || ''
    },
    ocr,
    texto_ai: `Dictamen generado automáticamente para placas ${ocr.placa?.datos?.texto || ocr.placa?.texto || 'NO DISPONIBLE'}`
  };

  const contenido = JSON.stringify(dictamen, null, 2);
  await chromaService.guardarDictamen(dictamen.id, contenido, {
    tipo: 'dictamen_prellenado',
    lugar: 'Desconocido'
  });

  return dictamen;
}

async function asistenteJuridico(pregunta) {
  return ollamaService.obtenerAsistenteJuridico(pregunta);
}

async function analizarVideoC5i(rutaVideo) {
  const result = await mediaService.analizarVideo(rutaVideo);
  return result;
}

async function detectarInconsistencias(conductores, vehiculos) {
  const prompt = `Compara los siguientes datos de conductores y vehículos para encontrar inconsistencias en la versión de los hechos y daños:\n\nConductores:\n${JSON.stringify(conductores, null, 2)}\n\nVehículos:\n${JSON.stringify(vehiculos, null, 2)}\n\nDevuelve una lista de inconsistencias detectadas.`;
  const resp = await ollamaService.generarRespuesta(prompt);
  return { inconsistencias: resp };
}

async function obtenerDictamenesSimilares(lugar, tipo) {
  const consulta = `Accidentes en ${lugar} de tipo ${tipo} con resultados similares.`;
  const resultados = await chromaService.buscarDictamenesSimilares(consulta, 5);
  return resultados;
}

module.exports = {
  generarCroquis3DAutomatico,
  calcularVelocidadPorHuellas,
  crearDictamenPrellenado,
  asistenteJuridico,
  analizarVideoC5i,
  detectarInconsistencias,
  obtenerDictamenesSimilares
};

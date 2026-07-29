const fs = require('fs');
const path = require('path');

const documentosPath = path.resolve(__dirname, '../data/documentos_legales.json');
let documentos = [];

// Cargar documentos al iniciar
try {
  if (fs.existsSync(documentosPath)) {
    const raw = fs.readFileSync(documentosPath, 'utf8');
    documentos = JSON.parse(raw);
    console.log(`📚 Motor de Búsqueda Local cargado: ${documentos.length} fragmentos de PDFs listos.`);
  } else {
    console.warn(`⚠️  No se encontró el archivo de documentos en ${documentosPath}. Recuerda ejecutar scripts/ingest_pdfs.py primero.`);
  }
} catch (error) {
  console.error('❌ Error al cargar documentos_legales.json:', error.message);
}

function buscarEnDocumentos(consulta, limite = 4) {
  // Recargar dinámicamente si no se cargó al inicio pero ya existe
  if (documentos.length === 0) {
    try {
      if (fs.existsSync(documentosPath)) {
        const raw = fs.readFileSync(documentosPath, 'utf8');
        documentos = JSON.parse(raw);
        console.log(`📚 Motor de Búsqueda Local (recarga dinámica): ${documentos.length} fragmentos cargados.`);
      }
    } catch (e) {}
  }

  if (!documentos || documentos.length === 0) {
    return [];
  }

  // Normalizar consulta y extraer términos clave (filtrando palabras de parada de 2 o menos letras)
  const terminos = consulta
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s]/g, '')     // Quitar caracteres especiales
    .split(/\s+/)
    .filter(t => t.length > 2);      // Palabras significativas

  if (terminos.length === 0) {
    return documentos.slice(0, limite);
  }

  // Puntuación de fragmentos basada en la coincidencia de términos
  const puntuados = documentos.map(doc => {
    let score = 0;
    const textoNormalizado = doc.text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    terminos.forEach(term => {
      // Búsqueda simple de subcadena
      const idx = textoNormalizado.indexOf(term);
      if (idx !== -1) {
        // Encontrado: contar repeticiones
        const matches = (textoNormalizado.match(new RegExp(term, 'g')) || []).length;
        score += matches;
        
        // Puntos adicionales si el término está en una palabra exacta
        const wordRegex = new RegExp(`\\b${term}\\b`, 'i');
        if (wordRegex.test(textoNormalizado)) {
          score += 2;
        }
      }
    });

    return { ...doc, score };
  });

  // Filtrar los que tengan puntuación > 0, ordenar de mayor a menor y limitar
  return puntuados
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limite);
}

module.exports = {
  buscarEnDocumentos
};

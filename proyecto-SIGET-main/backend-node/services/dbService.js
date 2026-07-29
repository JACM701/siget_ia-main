const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Default database path in the project root
const dbPath = config.database?.path || path.resolve(__dirname, '../../siget.db');

// Ensure target directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al abrir la base de datos SQLite:', err.message);
  } else {
    console.log('💾 Conectado a la base de datos SQLite en:', dbPath);
  }
});

// Inicializar tablas inmediatamente para encolar la creación antes de otras consultas
initializeTables();

function initializeTables() {
  db.serialize(() => {
    // 1. Chat History Table
    db.run(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,       -- 'user' | 'assistant'
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `, (err) => {
      if (err) console.error('Error al crear tabla chat_history:', err.message);
    });

    db.run(`CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_history(session_id)`);

    // 2. Observability Metrics Table
    db.run(`
      CREATE TABLE IF NOT EXISTS observability_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        prompt TEXT NOT NULL,
        response TEXT,
        ttft INTEGER,             -- Time to First Token (ms)
        latency INTEGER,          -- Latencia Total (ms)
        tps REAL,                 -- Tokens por Segundo (tps)
        was_blocked INTEGER,      -- 1 si fue bloqueado, 0 si no
        tools_executed TEXT,      -- Detalle JSON de herramientas invocadas
        client_ip TEXT            -- IP de origen (útil para evidencia de acceso externo)
      )
    `, (err) => {
      if (err) console.error('Error al crear tabla observability_metrics:', err.message);
    });

    // Migración: agregar client_ip en bases de datos existentes
    db.run(`ALTER TABLE observability_metrics ADD COLUMN client_ip TEXT`, () => {});

    // 3. Informes (Reportes) Table
    db.run(`
      CREATE TABLE IF NOT EXISTS informes (
        folio TEXT PRIMARY KEY,
        area TEXT,
        fecha_siniestro TEXT,
        hora_siniestro TEXT,
        tipo_siniestro TEXT,
        datos_completos TEXT NOT NULL, -- JSON completo
        created_at TEXT NOT NULL
      )
    `, (err) => {
      if (err) console.error('Error al crear tabla informes:', err.message);
    });
  });
}

// Promisified operations for cleaner async/await usage
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = {
  db,
  run,
  all,
  
  // Save message in history
  saveChatMessage: async (id, sessionId, role, content) => {
    return run(
      `INSERT INTO chat_history (id, session_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)`,
      [id, sessionId, role, content, new Date().toISOString()]
    );
  },

  // Retrieve chat history
  getChatHistory: async (sessionId) => {
    return all(
      `SELECT role, content FROM chat_history WHERE session_id = ? ORDER BY timestamp ASC`,
      [sessionId]
    );
  },

  // Save observability metrics
  saveMetrics: async ({ sessionId, prompt, response, ttft, latency, tps, was_blocked, tools_executed, client_ip }) => {
    return run(
      `INSERT INTO observability_metrics (session_id, timestamp, prompt, response, ttft, latency, tps, was_blocked, tools_executed, client_ip) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        new Date().toISOString(),
        prompt,
        response,
        ttft || 0,
        latency || 0,
        tps || 0,
        was_blocked ? 1 : 0,
        JSON.stringify(tools_executed || []),
        client_ip || null
      ]
    );
  },

  // Consultar métricas de observabilidad (evidencia Semana 6)
  getObservabilityMetrics: async (limit = 50) => {
    return all(
      `SELECT id, session_id, timestamp, substr(prompt, 1, 80) AS prompt_preview,
              ttft, latency, tps, was_blocked, client_ip
       FROM observability_metrics
       ORDER BY timestamp DESC
       LIMIT ?`,
      [limit]
    );
  },

  // Save generated report
  saveInforme: async (folio, area, fechaSiniestro, horaSiniestro, tipoSiniestro, datosCompletos) => {
    const rawJson = typeof datosCompletos === 'string' ? datosCompletos : JSON.stringify(datosCompletos);
    return run(
      `INSERT INTO informes (folio, area, fecha_siniestro, hora_siniestro, tipo_siniestro, datos_completos, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(folio) DO UPDATE SET
         area=excluded.area,
         fecha_siniestro=excluded.fecha_siniestro,
         hora_siniestro=excluded.hora_siniestro,
         tipo_siniestro=excluded.tipo_siniestro,
         datos_completos=excluded.datos_completos,
         created_at=excluded.created_at`,
      [folio, area, fechaSiniestro, horaSiniestro, tipoSiniestro, rawJson, new Date().toISOString()]
    );
  },

  // Retrieve a specific report by folio
  getInforme: async (folio) => {
    const rows = await all(`SELECT * FROM informes WHERE folio = ?`, [folio]);
    return rows[0] || null;
  },

  // List all reports ordered by creation date
  getAllInformes: async () => {
    return all(`SELECT * FROM informes ORDER BY created_at DESC`);
  }
};

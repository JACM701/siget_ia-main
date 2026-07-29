const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

module.exports = {
  server: {
    port: process.env.SERVER_PORT || '4000'
  },
  ollama: {
    host: process.env.OLLAMA_HOST || 'localhost',
    port: process.env.OLLAMA_PORT || '11434',
    model: process.env.OLLAMA_MODEL || 'qwen2.5:1.5b'
  },
  chroma: {
    host: process.env.CHROMA_HOST || 'localhost',
    port: process.env.CHROMA_PORT || '8000',
    collection: process.env.CHROMA_COLLECTION || 'dictamenes'
  },
  database: {
    path: process.env.DATABASE_PATH || path.resolve(__dirname, '../../siget.db')
  },
  cors: {
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
      : []
  }
};

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const dictamenRoutes = require('./routes/dictamen');
const peritosRoutes = require('./routes/peritos');

const app = express();

// Necesario para obtener IP real cuando el tráfico entra por túnel (Ngrok/Cloudflare)
app.set('trust proxy', true);

const corsOptions = config.cors?.origins?.length
  ? {
      origin: config.cors.origins.includes('*') ? true : config.cors.origins,
      credentials: true
    }
  : {};
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'SIGET Peritos - Node.js Backend' });
});

app.use('/api/dictamen', dictamenRoutes);
app.use('/api/peritos', peritosRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
    details: err.details || err.message
  });
});

const port = config.server.port;
app.listen(port, () => {
  console.log(`🚀 SIGET Peritos Node.js backend iniciado en http://localhost:${port}`);
});

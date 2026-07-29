const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/auth');
const dictamenRoutes = require('./routes/dictamen');
const peritosRoutes = require('./routes/peritos');

const app = express();

// En Docker/proxy inverso: 1 salto de proxy. Evita el ERR_ERL_PERMISSIVE_TRUST_PROXY del rate-limiter.
app.set('trust proxy', 1);

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

app.use('/api/auth', authRoutes);
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

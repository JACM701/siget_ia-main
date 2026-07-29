// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// ⏱️ 1. Definir el limitador: Máximo 10 peticiones por minuto
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto en milisegundos
  max: 10, // Máximo 10 peticiones por ventana (windowMs)
  standardHeaders: true, // Devuelve información del límite en los headers `RateLimit-*`
  legacyHeaders: false, // Deshabilita los headers `X-RateLimit-*`
  message: {
    error: 'Has excedido el límite de 10 peticiones por minuto. Por favor, reintenta más tarde.'
  }
});

// 🔒 2. Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Acceso denegado. Token no proporcionado o formato inválido.' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET ;
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP por 15 minutos
  message: {
    error: 'Demasiados intentos de inicio de sesión fallidos desde esta IP. Por favor, intente más tarde.'
  }
});

const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto en milisegundos
  max: 1, // Máximo 1 petición por minuto por endpoint sensible
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Has excedido el límite de peticiones. Por favor, reintenta más tarde.'
  }
});

module.exports = { verifyToken, apiLimiter, authRateLimiter, strictLimiter };
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { authRateLimiter } = require('../middleware/auth.middleware.js');

const router = express.Router();

// 🛡️ Aplicar limitador de intentos fallidos (5 intentos / 15 min por IP)
router.use(authRateLimiter);

/**
 * Valida el token de Cloudflare Turnstile en el servidor.
 * Si TURNSTILE_SECRET_KEY no está configurada, omite la validación (modo desarrollo).
 */
async function validateCaptcha(token) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn('[AUTH] ⚠️  TURNSTILE_SECRET_KEY no configurada. Omitiendo validación de captcha (modo desarrollo).');
    return true;
  }

  try {
    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      new URLSearchParams({ secret: secretKey, response: token }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 }
    );
    return response.data?.success === true;
  } catch (err) {
    console.error('[AUTH] Error validando captcha con Cloudflare:', err.message);
    // En caso de error de red con Cloudflare, permitir el paso para no bloquear a usuarios legítimos
    return true;
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { badge: string, password: string, captchaToken: string }
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { badge, password, captchaToken } = req.body;

  // 1️⃣  Validar campos requeridos
  if (!badge || !password) {
    return res.status(400).json({ error: 'Número de placa y contraseña son requeridos.' });
  }

  if (!captchaToken) {
    return res.status(400).json({ error: 'Token de captcha requerido.' });
  }

  // 2️⃣  Validar captcha con Cloudflare Turnstile
  const captchaValid = await validateCaptcha(captchaToken);
  if (!captchaValid) {
    return res.status(400).json({
      error: 'Verificación de seguridad fallida. Por favor recarga la página e intenta de nuevo.'
    });
  }

  // 3️⃣  Leer credenciales del servidor (variables de entorno)
  const validBadge    = process.env.AUTH_BADGE;
  const validPassword = process.env.AUTH_PASSWORD;

  if (!validBadge || !validPassword) {
    console.error('[AUTH] ❌ Variables AUTH_BADGE o AUTH_PASSWORD no configuradas en el backend.');
    return res.status(500).json({
      error: 'El servidor no está configurado correctamente. Contacte al administrador del sistema.'
    });
  }

  // 4️⃣  Comparar credenciales (insensible a mayúsculas en la placa)
  const badgeMatch    = badge.trim().toUpperCase() === validBadge.trim().toUpperCase();
  const passwordMatch = password === validPassword;

  if (!badgeMatch || !passwordMatch) {
    console.warn(`[AUTH] Intento de acceso fallido para placa: ${badge}`);
    return res.status(401).json({ error: 'Número de placa o contraseña incorrectos.' });
  }

  // 5️⃣  Verificar que JWT_SECRET esté configurado
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[AUTH] ❌ JWT_SECRET no configurado en el backend.');
    return res.status(500).json({ error: 'Configuración de seguridad incompleta en el servidor.' });
  }

  // 6️⃣  Construir el objeto del oficial con datos de variables de entorno
  const officer = {
    id:                  validBadge,
    badge:               validBadge,
    name:                process.env.OFFICER_NAME                || 'Oficial SIGET',
    rank:                process.env.OFFICER_RANK                || 'Perito de Tránsito',
    unit:                process.env.OFFICER_UNIT                || 'Unidad de Tránsito',
    email:               process.env.OFFICER_EMAIL               || '',
    phone:               process.env.OFFICER_PHONE               || '',
    shift:               process.env.OFFICER_SHIFT               || 'Matutino',
    zone:                process.env.OFFICER_ZONE                || 'Zona Centro',
    certifications:      (process.env.OFFICER_CERTIFICATIONS     || 'Peritaje Vial').split(',').map(c => c.trim()),
    activeIncidents:     0,
    completedIncidents:  parseInt(process.env.OFFICER_COMPLETED_INCIDENTS || '0', 10),
    joinDate:            process.env.OFFICER_JOIN_DATE           || new Date().toISOString().split('T')[0],
  };

  // 7️⃣  Generar token JWT con expiración de 8 horas (un turno de trabajo)
  const token = jwt.sign(
    { badge: officer.badge, name: officer.name, rank: officer.rank },
    secret,
    { expiresIn: '8h' }
  );

  console.log(`[AUTH] ✅ Login exitoso — Oficial: ${officer.name} (${officer.badge})`);

  return res.status(200).json({ officer, token });
});

module.exports = router;

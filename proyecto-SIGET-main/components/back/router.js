router.post('/login', async (req, res) => {
  const { badge, password, captchaToken } = req.body;

  // 1. Validar Captcha... (código previo)

  // 2. Comparar contra variables de entorno
  const envBadge = process.env.AUTH_BADGE;
  const envPassword = process.env.AUTH_PASSWORD;

  if (badge.trim().toUpperCase() !== envBadge || password !== envPassword) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  // 3. Generar JWT
  const token = jwt.sign({ badge: envBadge }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // 4. Retornar los datos del oficial desde el servidor (Sin expone datos clave en el frontend)
  return res.json({
    token,
    officer: {
      id: "OFF-2024-0148",
      badge: envBadge,
      name: process.env.OFFICER_NAME || "Oficial Registrado",
      rank: process.env.OFFICER_RANK || "Perito de Tránsito",
      unit: process.env.OFFICER_UNIT || "Unidad de Investigación",
      email: process.env.OFFICER_EMAIL || "oficial@ssp.yucatan.gob.mx",
      phone: "+52 999 765 4321",
      shift: "Turno Matutino (06:00 - 14:00)",
      zone: "Zona Norte - Mérida",
      certifications: [
        "Peritaje en Accidentes de Tránsito",
        "Manejo de Evidencias Digitales"
      ],
      activeIncidents: 3,
      completedIncidents: 147,
      joinDate: "15 de marzo de 2019"
    }
  });
});
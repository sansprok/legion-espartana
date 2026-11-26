const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const Usuario = require('../models/Usuario');
const autenticar = require('../middleware/autenticar');
const clave = require('../util/clave');
const a = require('../util/async');
const { construirArbol, permisosDe } = require('../services/permisos');

const router = express.Router();

// Bloqueo simple por correo: 5 intentos fallidos en 15 minutos.
const INTENTOS_MAX = 5;
const VENTANA_MS = 15 * 60 * 1000;
const fallidos = new Map();

function bloqueado(email) {
  const f = fallidos.get(email);
  if (!f) return false;
  if (Date.now() - f.desde > VENTANA_MS) { fallidos.delete(email); return false; }
  return f.cantidad >= INTENTOS_MAX;
}
function registrarFallo(email) {
  const f = fallidos.get(email);
  if (!f || Date.now() - f.desde > VENTANA_MS) fallidos.set(email, { cantidad: 1, desde: Date.now() });
  else f.cantidad += 1;
}

async function perfil(usuario) {
  const permisos = permisosDe(usuario);
  return {
    usuario: usuario.aPublico(),
    permisos,
    menu: await construirArbol(permisos),
  };
}

router.post('/login', a(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const contrasena = String(req.body.clave || '');
  if (!email || !contrasena) {
    return res.status(400).json({ mensaje: 'Ingrese su correo y contraseña.' });
  }
  if (bloqueado(email)) {
    return res.status(429).json({ mensaje: 'Se superó el número de intentos. Inténtelo nuevamente en 15 minutos.' });
  }
  const usuario = await Usuario.findOne({ email }).select('+claveHash').populate('rol');
  const valido = usuario && usuario.activo && await clave.verificar(contrasena, usuario.claveHash);
  if (!valido) {
    registrarFallo(email);
    return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos, o usuario no habilitado.' });
  }
  fallidos.delete(email);
  usuario.ultimoAcceso = new Date();
  await usuario.save();
  const token = jwt.sign({ sub: String(usuario._id) }, config.jwtSecret, { expiresIn: config.jwtDuracion });
  return res.json(Object.assign({ token }, await perfil(usuario)));
}));

router.get('/perfil', autenticar, a(async (req, res) => {
  res.json(await perfil(req.usuario));
}));

router.post('/cambiar-clave', autenticar, a(async (req, res) => {
  const actual = String(req.body.claveActual || '');
  const nueva = String(req.body.claveNueva || '');
  const usuario = await Usuario.findById(req.usuario._id).select('+claveHash');
  if (!await clave.verificar(actual, usuario.claveHash)) {
    return res.status(400).json({ mensaje: 'La contraseña actual no es correcta.' });
  }
  const error = clave.validar(nueva);
  if (error) return res.status(400).json({ mensaje: error });
  if (actual === nueva) {
    return res.status(400).json({ mensaje: 'La nueva contraseña debe ser distinta de la actual.' });
  }
  usuario.claveHash = await clave.generarHash(nueva);
  usuario.debeCambiarClave = false;
  await usuario.save();
  return res.json({ mensaje: 'La contraseña se actualizó correctamente.' });
}));

module.exports = router;

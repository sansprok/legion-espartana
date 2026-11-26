const express = require('express');
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const Rol = require('../models/Rol');
const clave = require('../util/clave');
const a = require('../util/async');

const router = express.Router();
const esId = id => mongoose.Types.ObjectId.isValid(id);

// Evita que el sistema quede sin ningún administrador activo.
async function quedaOtroAdministrador(excluirId) {
  const roles = await Rol.find({ permisos: '*' }).select('_id');
  const otros = await Usuario.countDocuments({
    _id: { $ne: excluirId }, activo: true, rol: { $in: roles.map(r => r._id) },
  });
  return otros > 0;
}

router.get('/', a(async (req, res) => {
  const usuarios = await Usuario.find().populate('rol', 'nombre').sort({ nombre: 1 });
  res.json(usuarios.map(u => u.aPublico()));
}));

router.post('/', a(async (req, res) => {
  const nombre = String(req.body.nombre || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const rolId = req.body.rol;
  if (!nombre || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ mensaje: 'Ingrese un nombre y un correo válido.' });
  }
  if (!esId(rolId) || !await Rol.exists({ _id: rolId })) {
    return res.status(400).json({ mensaje: 'Seleccione un rol válido.' });
  }
  if (await Usuario.exists({ email })) {
    return res.status(409).json({ mensaje: 'Ya existe un usuario con ese correo.' });
  }
  // Si no se indica contraseña, se genera una temporal y se devuelve una sola vez.
  const indicada = req.body.clave ? String(req.body.clave) : '';
  const error = indicada ? clave.validar(indicada) : null;
  if (error) return res.status(400).json({ mensaje: error });
  const temporal = indicada || clave.generarTemporal();
  const usuario = await Usuario.create({
    nombre, email, rol: rolId, claveHash: await clave.generarHash(temporal), debeCambiarClave: true,
  });
  await usuario.populate('rol', 'nombre').execPopulate();
  return res.status(201).json({ usuario: usuario.aPublico(), claveTemporal: indicada ? null : temporal });
}));

router.put('/:id', a(async (req, res) => {
  if (!esId(req.params.id)) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  const usuario = await Usuario.findById(req.params.id);
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  const propio = String(usuario._id) === String(req.usuario._id);

  if (req.body.nombre !== undefined) {
    const nombre = String(req.body.nombre).trim();
    if (!nombre) return res.status(400).json({ mensaje: 'El nombre es obligatorio.' });
    usuario.nombre = nombre;
  }
  if (req.body.rol !== undefined && String(req.body.rol) !== String(usuario.rol)) {
    if (propio) return res.status(400).json({ mensaje: 'No puede cambiar su propio rol.' });
    if (!esId(req.body.rol) || !await Rol.exists({ _id: req.body.rol })) {
      return res.status(400).json({ mensaje: 'Seleccione un rol válido.' });
    }
    if (!await quedaOtroAdministrador(usuario._id)) {
      const nuevo = await Rol.findById(req.body.rol);
      if (nuevo.permisos.indexOf('*') === -1) {
        return res.status(400).json({ mensaje: 'Debe quedar al menos un administrador activo.' });
      }
    }
    usuario.rol = req.body.rol;
  }
  if (req.body.activo !== undefined && Boolean(req.body.activo) !== usuario.activo) {
    if (propio) return res.status(400).json({ mensaje: 'No puede desactivar su propio usuario.' });
    if (!req.body.activo && !await quedaOtroAdministrador(usuario._id)) {
      return res.status(400).json({ mensaje: 'Debe quedar al menos un administrador activo.' });
    }
    usuario.activo = Boolean(req.body.activo);
  }
  await usuario.save();
  await usuario.populate('rol', 'nombre').execPopulate();
  return res.json(usuario.aPublico());
}));

router.post('/:id/restablecer-clave', a(async (req, res) => {
  if (!esId(req.params.id)) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  const usuario = await Usuario.findById(req.params.id);
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  const temporal = clave.generarTemporal();
  usuario.claveHash = await clave.generarHash(temporal);
  usuario.debeCambiarClave = true;
  await usuario.save();
  return res.json({ claveTemporal: temporal });
}));

module.exports = router;

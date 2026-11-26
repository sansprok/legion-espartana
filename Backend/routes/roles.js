const express = require('express');
const mongoose = require('mongoose');
const Rol = require('../models/Rol');
const Usuario = require('../models/Usuario');
const OpcionMenu = require('../models/OpcionMenu');
const a = require('../util/async');
const { construirArbol } = require('../services/permisos');

const router = express.Router();
const esId = id => mongoose.Types.ObjectId.isValid(id);

// Solo se aceptan claves que existan como opción de menú (o '*').
async function limpiarPermisos(lista) {
  const pedidas = Array.isArray(lista) ? lista.map(String) : [];
  if (pedidas.indexOf('*') !== -1) return ['*'];
  const existentes = await OpcionMenu.find({ clave: { $in: pedidas } }).distinct('clave');
  return pedidas.filter((c, i) => existentes.indexOf(c) !== -1 && pedidas.indexOf(c) === i);
}

// Árbol de opciones activas, para marcar permisos en la pantalla de roles.
router.get('/opciones', a(async (req, res) => {
  res.json(await construirArbol(null, false));
}));

router.get('/', a(async (req, res) => {
  const roles = await Rol.find().sort({ nombre: 1 }).lean();
  const conteos = await Usuario.aggregate([{ $group: { _id: '$rol', n: { $sum: 1 } } }]);
  const porRol = new Map(conteos.map(c => [String(c._id), c.n]));
  res.json(roles.map(r => Object.assign(r, { usuarios: porRol.get(String(r._id)) || 0 })));
}));

router.post('/', a(async (req, res) => {
  const nombre = String(req.body.nombre || '').trim();
  if (!nombre) return res.status(400).json({ mensaje: 'El nombre del rol es obligatorio.' });
  if (await Rol.exists({ nombre })) return res.status(409).json({ mensaje: 'Ya existe un rol con ese nombre.' });
  const rol = await Rol.create({
    nombre,
    descripcion: String(req.body.descripcion || '').trim(),
    permisos: await limpiarPermisos(req.body.permisos),
  });
  res.status(201).json(rol);
}));

router.put('/:id', a(async (req, res) => {
  if (!esId(req.params.id)) return res.status(404).json({ mensaje: 'Rol no encontrado.' });
  const rol = await Rol.findById(req.params.id);
  if (!rol) return res.status(404).json({ mensaje: 'Rol no encontrado.' });
  if (rol.sistema) {
    // El rol de sistema conserva nombre y acceso total.
    if (req.body.descripcion !== undefined) rol.descripcion = String(req.body.descripcion).trim();
    await rol.save();
    return res.json(rol);
  }
  if (req.body.nombre !== undefined) {
    const nombre = String(req.body.nombre).trim();
    if (!nombre) return res.status(400).json({ mensaje: 'El nombre del rol es obligatorio.' });
    if (await Rol.exists({ nombre, _id: { $ne: rol._id } })) {
      return res.status(409).json({ mensaje: 'Ya existe un rol con ese nombre.' });
    }
    rol.nombre = nombre;
  }
  if (req.body.descripcion !== undefined) rol.descripcion = String(req.body.descripcion).trim();
  if (req.body.permisos !== undefined) rol.permisos = await limpiarPermisos(req.body.permisos);
  await rol.save();
  return res.json(rol);
}));

router.delete('/:id', a(async (req, res) => {
  if (!esId(req.params.id)) return res.status(404).json({ mensaje: 'Rol no encontrado.' });
  const rol = await Rol.findById(req.params.id);
  if (!rol) return res.status(404).json({ mensaje: 'Rol no encontrado.' });
  if (rol.sistema) return res.status(400).json({ mensaje: 'El rol de sistema no se puede eliminar.' });
  const usuarios = await Usuario.countDocuments({ rol: rol._id });
  if (usuarios) {
    return res.status(400).json({ mensaje: `El rol está asignado a ${usuarios} usuario(s). Reasígnelos antes de eliminarlo.` });
  }
  await rol.deleteOne();
  return res.json({ mensaje: 'Rol eliminado.' });
}));

module.exports = router;

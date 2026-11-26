const express = require('express');
const mongoose = require('mongoose');
const OpcionMenu = require('../models/OpcionMenu');
const Rol = require('../models/Rol');
const a = require('../util/async');
const { construirArbol } = require('../services/permisos');

const router = express.Router();
const esId = id => mongoose.Types.ObjectId.isValid(id);

// Árbol completo, incluidas las opciones inactivas (para administrar).
router.get('/', a(async (req, res) => {
  res.json(await construirArbol(null, true));
}));

// Valida que el padre exista, no sea la misma opción ni un descendiente suyo.
async function validarPadre(padreId, propioId) {
  if (!padreId) return null;
  if (!esId(padreId)) return 'El grupo padre no es válido.';
  let actual = await OpcionMenu.findById(padreId).lean();
  if (!actual) return 'El grupo padre no existe.';
  while (actual) {
    if (propioId && String(actual._id) === String(propioId)) {
      return 'Una opción no puede ubicarse dentro de sí misma.';
    }
    actual = actual.padre ? await OpcionMenu.findById(actual.padre).lean() : null;
  }
  return null;
}

function datosDe(body) {
  const d = {};
  ['titulo', 'clave', 'ruta', 'icono'].forEach((k) => {
    if (body[k] !== undefined) d[k] = String(body[k] || '').trim();
  });
  if (d.clave !== undefined) d.clave = d.clave.toLowerCase();
  if (d.ruta && d.ruta.charAt(0) !== '/') d.ruta = `/${d.ruta}`;
  if (body.padre !== undefined) d.padre = body.padre || null;
  if (body.orden !== undefined) d.orden = Number(body.orden) || 0;
  if (body.activo !== undefined) d.activo = Boolean(body.activo);
  return d;
}

router.post('/', a(async (req, res) => {
  const d = datosDe(req.body);
  if (!d.titulo || !d.clave) return res.status(400).json({ mensaje: 'El título y la clave son obligatorios.' });
  const errorPadre = await validarPadre(d.padre);
  if (errorPadre) return res.status(400).json({ mensaje: errorPadre });
  if (await OpcionMenu.exists({ clave: d.clave })) {
    return res.status(409).json({ mensaje: 'Ya existe una opción con esa clave.' });
  }
  const opcion = await OpcionMenu.create(d);
  return res.status(201).json(opcion);
}));

router.put('/:id', a(async (req, res) => {
  if (!esId(req.params.id)) return res.status(404).json({ mensaje: 'Opción no encontrada.' });
  const opcion = await OpcionMenu.findById(req.params.id);
  if (!opcion) return res.status(404).json({ mensaje: 'Opción no encontrada.' });
  const d = datosDe(req.body);
  if (opcion.sistema) {
    // En las opciones de sistema solo se cambia la presentación.
    delete d.clave; delete d.ruta; delete d.padre; delete d.activo;
  }
  if (d.titulo === '') return res.status(400).json({ mensaje: 'El título es obligatorio.' });
  if (d.padre !== undefined) {
    const errorPadre = await validarPadre(d.padre, opcion._id);
    if (errorPadre) return res.status(400).json({ mensaje: errorPadre });
  }
  const claveAnterior = opcion.clave;
  if (d.clave !== undefined && d.clave !== claveAnterior) {
    if (!d.clave) return res.status(400).json({ mensaje: 'La clave es obligatoria.' });
    if (await OpcionMenu.exists({ clave: d.clave })) {
      return res.status(409).json({ mensaje: 'Ya existe una opción con esa clave.' });
    }
  }
  Object.assign(opcion, d);
  await opcion.save();
  // Si cambió la clave, los roles que la tenían conservan el permiso.
  if (opcion.clave !== claveAnterior) {
    await Rol.updateMany({ permisos: claveAnterior }, { $set: { 'permisos.$': opcion.clave } });
  }
  return res.json(opcion);
}));

router.delete('/:id', a(async (req, res) => {
  if (!esId(req.params.id)) return res.status(404).json({ mensaje: 'Opción no encontrada.' });
  const opcion = await OpcionMenu.findById(req.params.id);
  if (!opcion) return res.status(404).json({ mensaje: 'Opción no encontrada.' });
  if (opcion.sistema) return res.status(400).json({ mensaje: 'Las opciones de sistema no se pueden eliminar.' });
  if (await OpcionMenu.exists({ padre: opcion._id })) {
    return res.status(400).json({ mensaje: 'El grupo tiene opciones dentro. Muévalas o elimínelas primero.' });
  }
  await opcion.deleteOne();
  await Rol.updateMany({}, { $pull: { permisos: opcion.clave } });
  return res.json({ mensaje: 'Opción eliminada.' });
}));

module.exports = router;

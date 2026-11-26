const mongoose = require('mongoose');

// Opción del menú lateral. Puede ser un grupo (con hijos, sin ruta) o una
// opción final (con ruta). La "clave" es a la vez el permiso que la habilita:
// un rol que contiene la clave ve la opción y puede usar las rutas del backend
// protegidas con requierePermiso(clave).
const opcionMenuSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  clave: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: [/^[a-z0-9]+([._-][a-z0-9]+)*$/, 'La clave solo admite minúsculas, números, punto, guion y guion bajo.'],
  },
  // Ruta del frontend, ej. '/admin/usuarios'. Vacía para los grupos.
  ruta: { type: String, trim: true, default: '' },
  // Nombre de un ícono de Eva Icons, ej. 'home-outline'.
  icono: { type: String, trim: true, default: '' },
  padre: { type: mongoose.Schema.Types.ObjectId, ref: 'OpcionMenu', default: null },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  // Las opciones de sistema sostienen la administración básica: no se pueden
  // eliminar ni cambiar su clave o ruta.
  sistema: { type: Boolean, default: false },
}, { timestamps: true, collection: 'opcionesmenu' });

module.exports = mongoose.model('OpcionMenu', opcionMenuSchema);

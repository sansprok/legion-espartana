const mongoose = require('mongoose');

// Un rol es un conjunto de claves de permiso. Cada clave corresponde a una
// opción del menú (OpcionMenu.clave). El valor especial '*' concede todo.
const rolSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true, unique: true },
  descripcion: { type: String, trim: true, default: '' },
  permisos: [{ type: String, trim: true }],
  // Los roles de sistema (ej. Administrador) no se pueden eliminar ni renombrar.
  sistema: { type: Boolean, default: false },
}, { timestamps: true, collection: 'roles' });

module.exports = mongoose.model('Rol', rolSchema);

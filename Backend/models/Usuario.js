const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  claveHash: { type: String, required: true, select: false },
  rol: { type: mongoose.Schema.Types.ObjectId, ref: 'Rol', required: true },
  activo: { type: Boolean, default: true },
  // Se marca al crear el usuario o al restablecer su contraseña: el sistema le
  // pide cambiarla en su próximo ingreso.
  debeCambiarClave: { type: Boolean, default: true },
  ultimoAcceso: { type: Date, default: null },
}, { timestamps: true, collection: 'usuarios' });

usuarioSchema.methods.aPublico = function aPublico() {
  const rol = this.rol && this.rol.nombre ? { _id: this.rol._id, nombre: this.rol.nombre } : this.rol;
  return {
    _id: this._id,
    nombre: this.nombre,
    email: this.email,
    rol,
    activo: this.activo,
    debeCambiarClave: this.debeCambiarClave,
    ultimoAcceso: this.ultimoAcceso,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Usuario', usuarioSchema);

// Uso: router.get('/', autenticar, requierePermiso('admin.usuarios'), handler)
// La clave debe coincidir con la clave de una opción del menú.
const { tienePermiso, permisosDe } = require('../services/permisos');

module.exports = function requierePermiso(clave) {
  return function verificarPermiso(req, res, next) {
    if (tienePermiso(permisosDe(req.usuario), clave)) return next();
    return res.status(403).json({ mensaje: 'No cuenta con permiso para realizar esta operación.' });
  };
};

// Verifica el token JWT del encabezado Authorization y carga el usuario con su
// rol. El usuario se lee de la base en cada solicitud, para que un cambio de
// rol o una desactivación surta efecto de inmediato.
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const Usuario = require('../models/Usuario');

module.exports = function autenticar(req, res, next) {
  const encabezado = req.headers.authorization || '';
  const token = encabezado.indexOf('Bearer ') === 0 ? encabezado.slice(7) : null;
  if (!token) {
    return res.status(401).json({ mensaje: 'La sesión no es válida. Inicie sesión nuevamente.' });
  }
  let datos;
  try {
    datos = jwt.verify(token, config.jwtSecret);
  } catch (e) {
    return res.status(401).json({ mensaje: 'La sesión ha expirado. Inicie sesión nuevamente.' });
  }
  return Usuario.findById(datos.sub).populate('rol').then((usuario) => {
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ mensaje: 'El usuario no se encuentra habilitado.' });
    }
    req.usuario = usuario;
    return next();
  }).catch(next);
};

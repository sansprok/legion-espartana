// Envuelve un handler async para que los errores lleguen al manejador central.
module.exports = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

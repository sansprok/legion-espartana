// Permisos y menú de un usuario a partir de su rol y de las opciones de menú.
const OpcionMenu = require('../models/OpcionMenu');

function tienePermiso(permisos, clave) {
  return permisos.indexOf('*') !== -1 || permisos.indexOf(clave) !== -1;
}

// Árbol de opciones activas ordenadas por "orden". Si se pasan permisos, deja
// solo lo que el usuario puede ver: una opción final se ve si su clave está en
// los permisos; un grupo se ve si tiene al menos un hijo visible, o si no tiene
// hijos pero su propia clave está permitida y tiene ruta.
async function construirArbol(permisos, incluirInactivas) {
  const filtro = incluirInactivas ? {} : { activo: true };
  const opciones = await OpcionMenu.find(filtro).sort({ orden: 1, titulo: 1 }).lean();
  const porPadre = new Map();
  opciones.forEach((o) => {
    const k = o.padre ? String(o.padre) : '';
    if (!porPadre.has(k)) porPadre.set(k, []);
    porPadre.get(k).push(o);
  });
  // Los hijos se filtran antes que el padre, así un grupo sin hijos visibles
  // y sin ruta propia se descarta.
  const armar = padreId => (porPadre.get(padreId) || [])
    .map(o => Object.assign({}, o, { hijos: armar(String(o._id)) }))
    .filter(o => !permisos || o.hijos.length > 0 || (Boolean(o.ruta) && tienePermiso(permisos, o.clave)));
  return armar('');
}

function permisosDe(usuario) {
  return (usuario && usuario.rol && usuario.rol.permisos) || [];
}

module.exports = { tienePermiso, construirArbol, permisosDe };

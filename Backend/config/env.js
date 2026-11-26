// Configuración del backend. Los valores se leen de variables de entorno; en
// desarrollo local se pueden definir en un archivo .env (ver .env.example),
// que nunca se sube al repositorio. En el servidor (Render u otro) se definen
// como variables de entorno del servicio.
const fs = require('fs');
const path = require('path');

function cargarArchivoEnv() {
  const ruta = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(ruta)) return;
  fs.readFileSync(ruta, 'utf8').split(/\r?\n/).forEach((linea) => {
    const texto = linea.trim();
    if (!texto || texto.charAt(0) === '#') return;
    const i = texto.indexOf('=');
    if (i < 1) return;
    const clave = texto.slice(0, i).trim();
    let valor = texto.slice(i + 1).trim();
    if (/^(['"]).*\1$/.test(valor)) valor = valor.slice(1, -1);
    // Las variables ya definidas en el entorno tienen prioridad sobre el archivo.
    if (process.env[clave] === undefined) process.env[clave] = valor;
  });
}

cargarArchivoEnv();

const produccion = process.env.NODE_ENV === 'production';

if (produccion && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET es obligatorio en producción.');
}

module.exports = {
  produccion,
  puerto: Number(process.env.PORT) || 3100,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/legion',
  // En desarrollo, si no se define, se usa un secreto fijo de desarrollo
  // para que las sesiones sobrevivan a los reinicios de nodemon.
  jwtSecret: process.env.JWT_SECRET || 'solo-desarrollo-cambiar',
  jwtDuracion: process.env.JWT_DURACION || '8h',
  // Orígenes permitidos para CORS, separados por coma. Vacío = todos.
  corsOrigenes: (process.env.CORS_ORIGENES || '').split(',').map(s => s.trim()).filter(Boolean),
};

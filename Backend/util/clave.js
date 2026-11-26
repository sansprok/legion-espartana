// Hash de contraseñas con scrypt (incluido en Node, sin dependencias).
// Formato guardado: scrypt$<sal en hex>$<hash en hex>
const crypto = require('crypto');

const LARGO = 64;

function generarHash(clave) {
  return new Promise((resolve, reject) => {
    const sal = crypto.randomBytes(16);
    crypto.scrypt(String(clave), sal, LARGO, (err, hash) => {
      if (err) return reject(err);
      resolve(`scrypt$${sal.toString('hex')}$${hash.toString('hex')}`);
    });
  });
}

function verificar(clave, guardado) {
  return new Promise((resolve) => {
    const partes = String(guardado || '').split('$');
    if (partes.length !== 3 || partes[0] !== 'scrypt') return resolve(false);
    const sal = Buffer.from(partes[1], 'hex');
    const esperado = Buffer.from(partes[2], 'hex');
    crypto.scrypt(String(clave), sal, esperado.length, (err, hash) => {
      if (err) return resolve(false);
      resolve(crypto.timingSafeEqual(hash, esperado));
    });
  });
}

// Reglas mínimas de contraseña. Devuelve un mensaje de error o null.
function validar(clave) {
  if (typeof clave !== 'string' || clave.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  if (!/[A-Za-z]/.test(clave) || !/[0-9]/.test(clave)) {
    return 'La contraseña debe contener letras y números.';
  }
  return null;
}

function generarTemporal() {
  // 12 caracteres legibles, con letras y números garantizados.
  const base = crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, 'x');
  return `${base}7a`;
}

module.exports = { generarHash, verificar, validar, generarTemporal };

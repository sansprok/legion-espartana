// Crea los datos mínimos para empezar. Se puede ejecutar varias veces: solo
// crea lo que falta y nunca cambia la contraseña de un usuario existente.
//   npm run seed
// Variables (en .env o en el entorno):
//   ADMIN_EMAIL     correo del primer administrador (obligatorio)
//   ADMIN_NOMBRE    nombre a mostrar (opcional)
//   ADMIN_CLAVE     contraseña inicial (opcional; si falta se genera una)
const config = require('../config/env');
const { conectar, mongoose } = require('../config/db');
const Rol = require('../models/Rol');
const Usuario = require('../models/Usuario');
const OpcionMenu = require('../models/OpcionMenu');
const clave = require('../util/clave');

const OPCIONES = [
  { clave: 'inicio', titulo: 'Inicio', ruta: '/inicio', icono: 'home-outline', orden: 1 },
  { clave: 'admin', titulo: 'Administración', ruta: '', icono: 'settings-2-outline', orden: 99 },
  { clave: 'admin.usuarios', titulo: 'Usuarios', ruta: '/admin/usuarios', icono: 'people-outline', orden: 1, padre: 'admin' },
  { clave: 'admin.roles', titulo: 'Roles y permisos', ruta: '/admin/roles', icono: 'shield-outline', orden: 2, padre: 'admin' },
  { clave: 'admin.menu', titulo: 'Opciones del menú', ruta: '/admin/menu', icono: 'list-outline', orden: 3, padre: 'admin' },
];

async function asegurarOpciones() {
  const ids = {};
  for (const o of OPCIONES) {
    let doc = await OpcionMenu.findOne({ clave: o.clave });
    if (!doc) {
      doc = await OpcionMenu.create(Object.assign({}, o, { padre: o.padre ? ids[o.padre] : null, sistema: true }));
      console.log(`Opción creada: ${o.titulo}`);
    }
    ids[o.clave] = doc._id;
  }
}

async function main() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (!email) throw new Error('Defina ADMIN_EMAIL en .env o en el entorno.');
  await conectar();
  console.log(`Base: ${config.mongoUri.replace(/\/\/[^@]*@/, '//***@')}`);

  await asegurarOpciones();

  let admin = await Rol.findOne({ nombre: 'Administrador' });
  if (!admin) {
    admin = await Rol.create({ nombre: 'Administrador', descripcion: 'Acceso total al sistema.', permisos: ['*'], sistema: true });
    console.log('Rol creado: Administrador');
  }
  if (!await Rol.exists({ nombre: 'Usuario' })) {
    await Rol.create({ nombre: 'Usuario', descripcion: 'Acceso básico.', permisos: ['inicio'] });
    console.log('Rol creado: Usuario');
  }

  if (await Usuario.exists({ email })) {
    console.log(`El usuario ${email} ya existe; no se modificó.`);
  } else {
    const indicada = process.env.ADMIN_CLAVE || '';
    const error = indicada ? clave.validar(indicada) : null;
    if (error) throw new Error(`ADMIN_CLAVE: ${error}`);
    const inicial = indicada || clave.generarTemporal();
    await Usuario.create({
      nombre: process.env.ADMIN_NOMBRE || 'Administrador',
      email,
      rol: admin._id,
      claveHash: await clave.generarHash(inicial),
      debeCambiarClave: true,
    });
    console.log(`Administrador creado: ${email}`);
    if (!indicada) console.log(`Contraseña temporal: ${inicial}  (se pedirá cambiarla al ingresar)`);
  }
}

main()
  .then(() => mongoose.disconnect())
  .catch((err) => { console.error(err.message); mongoose.disconnect(); process.exit(1); });

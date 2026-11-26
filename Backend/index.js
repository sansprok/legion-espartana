const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const { conectar } = require('./config/db');
const autenticar = require('./middleware/autenticar');
const requierePermiso = require('./middleware/requierePermiso');

const app = express();

app.use(cors(config.corsOrigenes.length ? { origin: config.corsOrigenes } : {}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/salud', (req, res) => res.json({ estado: 'ok' }));

// ---- Rutas públicas y de sesión ----
app.use('/api/auth', require('./routes/auth'));

// ---- Administración (cada grupo exige la clave de su opción de menú) ----
app.use('/api/usuarios', autenticar, requierePermiso('admin.usuarios'), require('./routes/usuarios'));
app.use('/api/roles', autenticar, requierePermiso('admin.roles'), require('./routes/roles'));
app.use('/api/opciones-menu', autenticar, requierePermiso('admin.menu'), require('./routes/opcionesMenu'));

// ---- Módulos nuevos: registrar aquí (ver GUIA-NUEVO-MODULO.md) ----
// app.use('/api/mi-modulo', autenticar, requierePermiso('mi-modulo'), require('./routes/miModulo'));

app.use('/api', (req, res) => res.status(404).json({ mensaje: 'Recurso no encontrado.' }));

// Manejador central de errores.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const primero = Object.keys(err.errors)[0];
    return res.status(400).json({ mensaje: err.errors[primero].message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'La solicitud no tiene un formato válido.' });
  }
  console.error(err);
  return res.status(500).json({ mensaje: 'Ocurrió un error interno. Inténtelo nuevamente.' });
});

conectar().then(() => {
  app.listen(config.puerto, () => {
    console.log(`Backend escuchando en el puerto ${config.puerto}`);
  });
}).catch((err) => {
  console.error('No se pudo conectar a MongoDB:', err.message);
  process.exit(1);
});

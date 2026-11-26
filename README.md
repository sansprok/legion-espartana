# Sistema Víctor — proyecto base

Base para desarrollar módulos nuevos. Incluye solamente:

- Inicio de sesión con usuario y contraseña propios (sin servicios externos).
- Usuarios: alta, edición, activación/desactivación y restablecimiento de contraseña.
- Roles y permisos: cada rol es una lista de opciones del menú habilitadas.
- Opciones del menú: el menú lateral se administra desde la aplicación.

```
VICTOR/
├── Backend/    Node.js + Express + MongoDB (Mongoose)
└── Frontend/   Angular 9 + Nebular 5 (misma tecnología que UBRIT)
```

## Requisitos

- Node.js 10.15 o superior (probado con 10.15.1).
- MongoDB local en el puerto 27017 (ya instalado como servicio en esta máquina),
  o una cadena de conexión de MongoDB Atlas.

## Puesta en marcha local

Instalación completa en otra computadora (programas, descargas y orden):
[INSTALACION.md](INSTALACION.md).

```powershell
# 1) Backend
cd Backend
npm install
copy .env.example .env      # completar JWT_SECRET y ADMIN_EMAIL
npm run seed                # crea menú, roles y el primer administrador
npm run dev                 # http://localhost:3000

# 2) Frontend (otra terminal)
cd Frontend
npm install
npm start                   # http://localhost:4200
```

`npm run seed` muestra una contraseña temporal para el administrador; el sistema
pide cambiarla en el primer ingreso. Se puede ejecutar varias veces: solo crea lo
que falta y nunca cambia contraseñas existentes.

## Cómo funcionan los permisos

1. Cada **opción del menú** tiene una **clave** (ej. `admin.usuarios`).
2. Cada **rol** guarda la lista de claves habilitadas. El rol *Administrador*
   tiene `*` (acceso total, incluidas opciones futuras).
3. El **menú lateral** muestra solo las opciones cuya clave tiene el rol.
4. El **backend** protege cada ruta con `requierePermiso('clave')`.
5. El **frontend** protege cada pantalla con `data: { permiso: 'clave' }`.

La misma clave une las tres piezas. Para agregar un módulo, ver
[GUIA-NUEVO-MODULO.md](GUIA-NUEVO-MODULO.md).

## Datos iniciales (seed)

| Opción | Clave | Ruta |
|---|---|---|
| Inicio | `inicio` | `/inicio` |
| Administración (grupo) | `admin` | — |
| ├ Usuarios | `admin.usuarios` | `/admin/usuarios` |
| ├ Roles y permisos | `admin.roles` | `/admin/roles` |
| └ Opciones del menú | `admin.menu` | `/admin/menu` |

Roles: **Administrador** (`*`, de sistema) y **Usuario** (`inicio`).

## Reglas de seguridad incluidas

- Contraseñas con hash `scrypt` y sal aleatoria; mínimo 8 caracteres con letras y números.
- Contraseña temporal obligatoria de cambiar en el primer ingreso o tras un restablecimiento.
- 5 intentos fallidos de ingreso por correo bloquean 15 minutos.
- Sesión JWT de 8 horas; el usuario se relee en cada solicitud (desactivar o cambiar
  el rol surte efecto de inmediato).
- No se puede desactivar ni cambiar el rol del propio usuario, y siempre debe quedar
  al menos un administrador activo.
- Las opciones de sistema y el rol Administrador no se pueden eliminar.

## Publicación (pendiente)

- **Backend (Render u otro):** variables `MONGODB_URI` (Atlas), `JWT_SECRET`
  (obligatoria en producción), `NODE_ENV=production`, `CORS_ORIGENES` (URL del frontend).
- **Frontend (Netlify u otro):** poner la URL del backend en
  `src/environments/environment.prod.ts`, ejecutar `npm run build` y publicar `dist/`
  (incluye `_redirects` para Netlify).

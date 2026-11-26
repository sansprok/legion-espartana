# Legión Espartana — contexto para Claude

App web instalable (PWA) de entrenamiento personal para "Carlos" (cliente en Chile,
marca "Un espartano jamás se rinde"). Uso 100 % móvil. Proyecto independiente:
**no mezclar con UBRIT** (otra base, otro Atlas, otro Render/Netlify).

Carpetas:
- `Landing/`: página de presentación estática (Netlify). Tiene su propio `CLAUDE.md`.
- `Backend/` y `Frontend/`: la app.

## Estado de la app (Backend/Frontend)
Copia del proyecto base "Víctor" (`PROYECTO UBRIT 2025\VICTOR`), ya renombrada a Legión.
**Instalación pausada por falta de espacio en C:** faltan `npm install` en Backend y Frontend,
crear `Backend/.env` (desde `.env.example`), `npm run seed` y compilar.
- Ya hecho: login, usuarios, roles y opciones de menú (de Víctor); PWA tomada del sistema
  vehicular de UBRIT: `Frontend/src/manifest.webmanifest`, íconos `src/assets/icons/icon-192/512.png`,
  `core/pwa-install.service.ts` y componente `<app-instalar-app>` en login y encabezado.

## Stack (no actualizar sin acordarlo con el usuario)
- Backend: Node 10.15.1, Express 4.17, Mongoose 5.7.13 (probado contra Atlas en UBRIT),
  JWT propio, contraseñas `crypto.scrypt`. Config en `.env` (cargador propio, sin dotenv).
- Frontend: Angular 9.0.4 + Nebular 5.0 (tema prebuilt default.css, dart-sass). Nebular 5 NO tiene `nb-form-field`.
- MongoDB local `mongodb://127.0.0.1:27017/legion`.

## Puertos locales (para convivir con UBRIT/Víctor en 3000/4200)
- Backend: http://localhost:3100 (`Backend`: `npm run dev`)
- Frontend: http://localhost:4300 (`Frontend`: `npm start`)

## Modelo de permisos (de Víctor)
La `clave` de cada opción de menú es el permiso; la misma clave va en backend
`requierePermiso('clave')`, ruta frontend `data: { permiso: 'clave' }` y el rol. `'*'` = todo.
Guía: `GUIA-NUEVO-MODULO.md`.

## Hoja de ruta (versión 1)
1. Registro abierto (`POST /api/auth/registro`, rol "Usuario") + aceptación de política de privacidad.
2. Google: Google Identity Services (modo redirect, por iOS instalado) → ID token → backend lo
   verifica → sesión JWT propia. Vincular por email verificado (`googleId` en Usuario).
   Requiere OAuth Client ID de Google Cloud Console (lo crea el usuario).
3. Layout móvil: barra inferior (Inicio · Rutina · Retos · Grupo · Perfil); admin con menú lateral.
   Estilo de la landing (#0d0c0b, dorado #c9a24e, rojo #9e1b1f; Oswald + Inter).
4. Rutinas y retos por nivel y edad (contenido de referencia en `Landing/index.html`).
5. Grupos (código de invitación), cumplimientos diarios, ranking y rangos (Recluta → Leyenda).
6. Mascota que acompaña e interactúa (diseñada primero en la landing, ver `Landing/CLAUDE.md`).
7. Publicación: Atlas (proyecto nuevo), Render (backend), Netlify (frontend).
- Versión 2: notificaciones push (service worker), evidencia de cumplimiento, pagos.

## Reglas del usuario
- Textos de interfaz formales y claros, en español.
- Commit/push solo cuando se pida. Borrados con confirmación y respaldo.
- Datos de usuarios son privados (datos de salud: Ley 21.719 Chile).

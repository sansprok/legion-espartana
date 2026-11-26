# Instalación del Sistema Víctor en otra computadora

Guía para dejar el proyecto funcionando en una laptop nueva con Windows 10 u 11 de 64 bits.
Siga los pasos en orden. Tiempo estimado: 45 a 60 minutos, la mayor parte en descargas.

Versiones con las que el proyecto fue probado:

| Programa | Versión probada | Obligatorio |
|---|---|---|
| Node.js (incluye npm) | 10.15.1 (npm 6.4.1) | Sí |
| MongoDB Community Server | 4.0.5 | Sí |
| Git | 2.20 o superior | Recomendado |
| Visual Studio Code | cualquiera reciente | Recomendado |
| MongoDB Compass | cualquiera reciente | Opcional |

---

## Paso 1. Instalar Node.js 10.15.1

1. Descargue el instalador:
   https://nodejs.org/dist/v10.15.1/node-v10.15.1-x64.msi
2. Ejecútelo y acepte las opciones por defecto.
   - No marque la casilla "Automatically install the necessary tools" (no es necesaria).
3. Abra una **nueva** ventana de PowerShell y verifique:
   ```powershell
   node -v     # debe mostrar v10.15.1
   npm -v      # debe mostrar 6.4.1
   ```

> Use exactamente esta versión. El frontend usa Angular 9, que no funciona con
> versiones recientes de Node.js (16 o superiores).
> Si la laptop ya tiene otra versión de Node.js para otros proyectos, instale
> **nvm-windows** (https://github.com/coreybutler/nvm-windows/releases, archivo
> `nvm-setup.exe`) y luego: `nvm install 10.15.1` y `nvm use 10.15.1`.

## Paso 2. Instalar MongoDB Community Server 4.0

1. Ingrese al archivo de versiones:
   https://www.mongodb.com/try/download/community-edition/releases/archive
2. Busque la versión **4.0.5** (o la última 4.0.x), plataforma **Windows x64**, paquete **msi**, y descárguela.
3. Durante la instalación:
   - Tipo de instalación: **Complete**.
   - Marque **Install MongoD as a Service** (ejecutar como servicio de red).
   - "Install MongoDB Compass": opcional.
4. Verifique que el servicio esté activo:
   ```powershell
   Get-Service MongoDB          # Status debe ser "Running"
   ```
   Si aparece detenido: `Start-Service MongoDB` (PowerShell como administrador).

> No instale MongoDB 6 o superior: el controlador del proyecto (Mongoose 5.7)
> no está probado con esas versiones. Si 4.0 no estuviera disponible, use 4.4.

## Paso 3. Instalar Git y Visual Studio Code

1. Git: https://git-scm.com/download/win — opciones por defecto.
2. Visual Studio Code: https://code.visualstudio.com — marque "Agregar a PATH".
3. Opcional, MongoDB Compass (para ver la base de datos): https://www.mongodb.com/try/download/compass

## Paso 4. Copiar el proyecto

Elija **una** opción.

**A. Copia directa (USB, red o nube)**

1. En la laptop original, copie la carpeta `VICTOR` **sin** estas subcarpetas, que son pesadas y se regeneran:
   - `Backend\node_modules`
   - `Frontend\node_modules`
   - `Frontend\dist`
2. Péguela en la laptop nueva, por ejemplo en `C:\Proyectos\VICTOR`.
   Evite rutas con tildes; los espacios sí están permitidos.

**B. Desde GitHub (cuando el repositorio esté publicado)**

```powershell
cd C:\Proyectos
git clone https://github.com/<usuario>/<repositorio>.git VICTOR
```

## Paso 5. Configurar e iniciar el backend

```powershell
cd C:\Proyectos\VICTOR\Backend
npm install                  # 1 a 2 minutos
copy .env.example .env
```

Genere un secreto para las sesiones y cópielo:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Abra `.env` con el Bloc de notas o VS Code y complete:

```
MONGODB_URI=mongodb://127.0.0.1:27017/victor
JWT_SECRET=<pegue aquí el secreto generado>
PORT=3000
CORS_ORIGENES=http://localhost:4200
ADMIN_EMAIL=<correo del administrador>
ADMIN_NOMBRE=Administrador
ADMIN_CLAVE=
```

> El archivo `.env` no se copia ni se sube al repositorio: se crea en cada computadora.

Cree los datos iniciales (menú, roles y primer administrador):

```powershell
npm run seed
```

Anote la **contraseña temporal** que aparece. El sistema pedirá cambiarla en el primer ingreso.
Si va a trasladar los datos de la otra laptop (Paso 8), no ejecute `npm run seed`.

Inicie el backend:

```powershell
npm run dev
```

Debe aparecer `Backend escuchando en el puerto 3000`. Deje esta ventana abierta.
Comprobación: abra http://localhost:3000/api/salud en el navegador; debe mostrar `{"estado":"ok"}`.

## Paso 6. Instalar e iniciar el frontend

En **otra** ventana de PowerShell:

```powershell
cd C:\Proyectos\VICTOR\Frontend
npm install                  # 8 a 10 minutos la primera vez; es normal ver avisos "WARN"
npm start
```

Cuando aparezca `Compiled successfully`, abra http://localhost:4200

## Paso 7. Primer ingreso

1. Ingrese con el correo de `ADMIN_EMAIL` y la contraseña temporal del Paso 5.
2. Defina su nueva contraseña (mínimo 8 caracteres, con letras y números).
3. Verifique el menú **Administración**: Usuarios, Roles y permisos, y Opciones del menú.

## Paso 8 (opcional). Trasladar los datos de la otra laptop

Solo si desea conservar los usuarios, roles y opciones ya creados.

En la laptop **original**:

```powershell
& "C:\Program Files\MongoDB\Server\4.0\bin\mongodump.exe" --db victor --out C:\respaldo-victor
```

Copie la carpeta `C:\respaldo-victor` a la laptop nueva y ejecute allí:

```powershell
& "C:\Program Files\MongoDB\Server\4.0\bin\mongorestore.exe" --db victor C:\respaldo-victor\victor
```

Los usuarios conservan sus contraseñas. Si en la laptop nueva el `JWT_SECRET` es distinto,
solo habrá que volver a iniciar sesión.

---

## Uso diario

Cada vez que se quiera trabajar con el sistema:

| Ventana | Carpeta | Comando |
|---|---|---|
| PowerShell 1 | `VICTOR\Backend` | `npm run dev` |
| PowerShell 2 | `VICTOR\Frontend` | `npm start` |

MongoDB arranca solo con Windows (servicio). Para detener backend o frontend: `Ctrl + C`.

## Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `node` no se reconoce | Node.js no está en el PATH | Cerrar y abrir PowerShell; si persiste, reinstalar Node.js |
| `No se pudo conectar a MongoDB` | Servicio detenido | `Start-Service MongoDB` como administrador |
| `EADDRINUSE :::3000` o puerto 4200 ocupado | Ya hay otra instancia abierta | Cerrar la otra ventana, o cambiar `PORT` en `.env` |
| La pantalla de ingreso dice "No se pudo conectar con el servidor" | El backend no está iniciado | Iniciar `npm run dev` en `Backend` |
| Errores de `ngcc` o de compilación tras copiar | `node_modules` copiado de otra máquina | Borrar `Frontend\node_modules` y ejecutar `npm install` |
| `JavaScript heap out of memory` | Memoria insuficiente al compilar | `node --max-old-space-size=4096 node_modules/@angular/cli/bin/ng serve` |
| `npm install` falla por red o proxy | Conexión restringida | Reintentar en otra red o configurar el proxy con `npm config set proxy` |
| Se olvidó la contraseña del administrador | — | Otro administrador la restablece desde Usuarios. Si no hay otro, ver abajo |

**Recuperar el acceso sin otro administrador:** en `.env`, cambie `ADMIN_EMAIL` por un correo nuevo
y ejecute `npm run seed`. Se creará un administrador adicional con contraseña temporal; desde él
puede restablecer la contraseña del original.

## Referencia rápida

| Elemento | Valor |
|---|---|
| Frontend | http://localhost:4200 |
| Backend (API) | http://localhost:3000/api |
| Base de datos | `mongodb://127.0.0.1:27017/victor` |
| Configuración del backend | `Backend\.env` |
| URL del backend para el frontend | `Frontend\src\environments\environment.ts` |
| Cómo agregar módulos | `GUIA-NUEVO-MODULO.md` |

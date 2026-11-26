# Guía: agregar un módulo nuevo

Ejemplo: un módulo **Clientes** con la clave `clientes`.

## 1. Backend

**Modelo** — `Backend/models/Cliente.js`

```js
const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  documento: { type: String, trim: true },
}, { timestamps: true, collection: 'clientes' });

module.exports = mongoose.model('Cliente', clienteSchema);
```

**Rutas** — `Backend/routes/clientes.js`

```js
const express = require('express');
const Cliente = require('../models/Cliente');
const a = require('../util/async');

const router = express.Router();

router.get('/', a(async (req, res) => {
  res.json(await Cliente.find().sort({ nombre: 1 }));
}));

router.post('/', a(async (req, res) => {
  res.status(201).json(await Cliente.create({ nombre: req.body.nombre, documento: req.body.documento }));
}));

module.exports = router;
```

**Registro** — en `Backend/index.js`, en el bloque "Módulos nuevos":

```js
app.use('/api/clientes', autenticar, requierePermiso('clientes'), require('./routes/clientes'));
```

`req.usuario` está disponible en todos los handlers (usuario con su rol).

Si una operación necesita un permiso distinto (ej. solo algunos pueden eliminar),
cree una opción adicional con su clave (ej. `clientes.eliminar`, sin ruta) y
agregue `requierePermiso('clientes.eliminar')` a esa ruta.

## 2. Frontend

**Módulo y pantalla** — `Frontend/src/app/pages/clientes/`

```ts
// clientes.module.ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ClientesComponent } from './clientes.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: ClientesComponent, data: { permiso: 'clientes' } },
    ]),
  ],
  declarations: [ClientesComponent],
})
export class ClientesModule {}
```

```ts
// clientes.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-clientes',
  template: `
    <div class="pagina-titulo"><div><h1>Clientes</h1></div></div>
    <nb-card><nb-card-body class="tabla-contenedor">
      <table class="tabla">
        <thead><tr><th>Nombre</th><th>Documento</th></tr></thead>
        <tbody><tr *ngFor="let c of clientes"><td>{{ c.nombre }}</td><td>{{ c.documento }}</td></tr></tbody>
      </table>
    </nb-card-body></nb-card>
  `,
})
export class ClientesComponent implements OnInit {
  clientes: any[] = [];
  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.http.get<any[]>(`${environment.apiUrl}/clientes`).subscribe(c => { this.clientes = c; });
  }
}
```

El token de sesión se agrega solo (interceptor); no hace falta enviarlo a mano.

**Ruta** — en `Frontend/src/app/app-routing.module.ts`, en "Módulos nuevos":

```ts
{ path: 'clientes', loadChildren: () => import('./pages/clientes/clientes.module').then(m => m.ClientesModule) },
```

## 3. Menú y permisos (desde la aplicación, sin código)

1. **Administración → Opciones del menú → Nueva opción**
   - Título: `Clientes` · Clave: `clientes` · Ruta: `/clientes` · Ícono: `people-outline`
2. **Administración → Roles y permisos**: marcar *Clientes* en los roles que deban verlo.
   El rol Administrador lo ve automáticamente.

Para agrupar varias pantallas, cree primero un grupo (opción sin ruta, ej. clave
`ventas`) y luego las opciones dentro de él (`ventas.clientes`, `ventas.facturas`).

## Lista de verificación

- [ ] La clave es idéntica en `requierePermiso(...)`, en `data: { permiso }` y en la opción del menú.
- [ ] La ruta de la opción del menú coincide con la ruta del frontend.
- [ ] Los textos para el usuario están en tono formal.

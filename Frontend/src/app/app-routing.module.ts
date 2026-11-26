import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/auth.guard';
import { LoginComponent } from './auth/login.component';
import { ShellComponent } from './layout/shell.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { CambiarClaveComponent } from './pages/cuenta/cambiar-clave.component';
import { SinAccesoComponent } from './pages/sin-acceso/sin-acceso.component';

// Cada ruta protegida declara en data.permiso la clave de su opción de menú
// (la misma que exige el backend). Ver GUIA-NUEVO-MODULO.md.
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'inicio', component: InicioComponent },
      { path: 'cuenta/clave', component: CambiarClaveComponent },
      { path: 'sin-acceso', component: SinAccesoComponent },
      { path: 'admin', loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule) },
      // ---- Módulos nuevos: agregar aquí ----
      // { path: 'mi-modulo', loadChildren: () => import('./pages/mi-modulo/mi-modulo.module').then(m => m.MiModuloModule) },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

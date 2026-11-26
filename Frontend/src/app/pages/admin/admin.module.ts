import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { UsuarioDialogComponent } from './usuarios/usuario-dialog.component';
import { RolesComponent } from './roles/roles.component';
import { MenuComponent } from './menu/menu.component';
import { OpcionDialogComponent } from './menu/opcion-dialog.component';

const routes: Routes = [
  { path: 'usuarios', component: UsuariosComponent, data: { permiso: 'admin.usuarios' } },
  { path: 'roles', component: RolesComponent, data: { permiso: 'admin.roles' } },
  { path: 'menu', component: MenuComponent, data: { permiso: 'admin.menu' } },
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [UsuariosComponent, UsuarioDialogComponent, RolesComponent, MenuComponent, OpcionDialogComponent],
})
export class AdminModule {}

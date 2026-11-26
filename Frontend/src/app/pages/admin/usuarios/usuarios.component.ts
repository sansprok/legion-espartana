import { Component, OnInit } from '@angular/core';
import { NbDialogService, NbToastrService } from '@nebular/theme';

import { AdminApiService } from '../../../core/admin-api.service';
import { AuthService } from '../../../core/auth.service';
import { mensajeDeError } from '../../../core/auth.interceptor';
import { Rol, Usuario } from '../../../core/modelos';
import { ConfirmarDialogComponent } from '../../../shared/confirmar-dialog.component';
import { ClaveTemporalDialogComponent } from '../../../shared/clave-temporal-dialog.component';
import { UsuarioDialogComponent } from './usuario-dialog.component';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  filtro = '';
  cargando = true;

  constructor(
    private api: AdminApiService,
    private auth: AuthService,
    private dialog: NbDialogService,
    private toastr: NbToastrService,
  ) {}

  ngOnInit(): void {
    this.cargar();
    this.api.roles().subscribe(r => { this.roles = r; });
  }

  get filtrados(): Usuario[] {
    const t = this.filtro.trim().toLowerCase();
    if (!t) return this.usuarios;
    return this.usuarios.filter(u => `${u.nombre} ${u.email} ${u.rol ? u.rol.nombre : ''}`.toLowerCase().indexOf(t) !== -1);
  }

  esPropio(u: Usuario): boolean {
    return !!this.auth.perfil && this.auth.perfil.usuario._id === u._id;
  }

  cargar(): void {
    this.cargando = true;
    this.api.usuarios().subscribe(
      (u) => { this.usuarios = u; this.cargando = false; },
      (err) => { this.cargando = false; this.toastr.danger(mensajeDeError(err), 'Usuarios'); },
    );
  }

  nuevo(): void {
    this.abrir(null);
  }

  editar(u: Usuario): void {
    this.abrir(u);
  }

  private abrir(usuario: Usuario | null): void {
    this.dialog.open(UsuarioDialogComponent, {
      context: { usuario, roles: this.roles, esPropio: usuario ? this.esPropio(usuario) : false },
    }).onClose.subscribe((r: { claveTemporal?: string | null; email?: string } | undefined) => {
      if (!r) return;
      this.cargar();
      if (r.claveTemporal) {
        this.dialog.open(ClaveTemporalDialogComponent, { context: { email: r.email, clave: r.claveTemporal } });
      } else {
        this.toastr.success('Los cambios se guardaron correctamente.', 'Usuarios');
      }
    });
  }

  alternarEstado(u: Usuario): void {
    const accion = u.activo ? 'desactivar' : 'activar';
    this.dialog.open(ConfirmarDialogComponent, {
      context: {
        titulo: `${u.activo ? 'Desactivar' : 'Activar'} usuario`,
        mensaje: u.activo
          ? `${u.nombre} no podrá ingresar al sistema hasta que se active nuevamente. ¿Desea continuar?`
          : `${u.nombre} podrá ingresar nuevamente al sistema. ¿Desea continuar?`,
        textoAceptar: accion.charAt(0).toUpperCase() + accion.slice(1),
        peligro: u.activo,
      },
    }).onClose.subscribe((ok) => {
      if (!ok) return;
      this.api.actualizarUsuario(u._id, { activo: !u.activo }).subscribe(
        () => { this.toastr.success(`Usuario ${u.activo ? 'desactivado' : 'activado'}.`, 'Usuarios'); this.cargar(); },
        err => this.toastr.danger(mensajeDeError(err), 'Usuarios'),
      );
    });
  }

  restablecer(u: Usuario): void {
    this.dialog.open(ConfirmarDialogComponent, {
      context: {
        titulo: 'Restablecer contraseña',
        mensaje: `Se generará una contraseña temporal para ${u.nombre} y la actual dejará de funcionar. ¿Desea continuar?`,
        textoAceptar: 'Restablecer',
      },
    }).onClose.subscribe((ok) => {
      if (!ok) return;
      this.api.restablecerClave(u._id).subscribe(
        (r) => {
          this.cargar();
          this.dialog.open(ClaveTemporalDialogComponent, { context: { email: u.email, clave: r.claveTemporal } });
        },
        err => this.toastr.danger(mensajeDeError(err), 'Usuarios'),
      );
    });
  }
}

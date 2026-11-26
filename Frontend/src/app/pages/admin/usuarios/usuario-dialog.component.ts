import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

import { AdminApiService } from '../../../core/admin-api.service';
import { mensajeDeError } from '../../../core/auth.interceptor';
import { Rol, Usuario } from '../../../core/modelos';

/** Alta y edición de usuario. Al crear, el backend genera una contraseña temporal. */
@Component({
  selector: 'app-usuario-dialog',
  template: `
    <nb-card class="dialogo">
      <nb-card-header>{{ usuario ? 'Editar usuario' : 'Nuevo usuario' }}</nb-card-header>
      <nb-card-body>
        <nb-alert *ngIf="error" status="danger">{{ error }}</nb-alert>
        <form class="formulario" id="form-usuario" (ngSubmit)="guardar()" #f="ngForm">
          <div>
            <label for="nombre">Nombre completo</label>
            <input nbInput fullWidth id="nombre" name="nombre" [(ngModel)]="nombre" required>
          </div>
          <div>
            <label for="email">Correo electrónico</label>
            <input nbInput fullWidth id="email" name="email" type="email" [(ngModel)]="email" required email
                   [disabled]="!!usuario">
            <div class="ayuda" *ngIf="usuario">El correo es el identificador de ingreso y no se puede cambiar.</div>
          </div>
          <div>
            <label>Rol</label>
            <nb-select fullWidth name="rol" [(ngModel)]="rol" required placeholder="Seleccione un rol" [disabled]="esPropio">
              <nb-option *ngFor="let r of roles" [value]="r._id">{{ r.nombre }}</nb-option>
            </nb-select>
            <div class="ayuda" *ngIf="esPropio">No puede cambiar su propio rol.</div>
          </div>
          <p class="texto-suave" *ngIf="!usuario">Se generará una contraseña temporal que se mostrará al guardar.</p>
        </form>
      </nb-card-body>
      <nb-card-footer class="pie">
        <button nbButton ghost (click)="ref.close()">Cancelar</button>
        <button nbButton status="primary" type="submit" form="form-usuario" [disabled]="!f.valid || guardando">Guardar</button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: ['.pie { display: flex; justify-content: flex-end; gap: 0.5rem; } nb-alert { margin-bottom: 1rem; } p { margin: 0; }'],
})
export class UsuarioDialogComponent implements OnInit {
  @Input() usuario: Usuario | null = null;
  @Input() roles: Rol[] = [];
  @Input() esPropio = false;
  nombre = '';
  email = '';
  rol = '';
  guardando = false;
  error = '';

  constructor(public ref: NbDialogRef<UsuarioDialogComponent>, private api: AdminApiService) {}

  ngOnInit(): void {
    if (this.usuario) {
      this.nombre = this.usuario.nombre;
      this.email = this.usuario.email;
      this.rol = this.usuario.rol ? this.usuario.rol._id : '';
    }
  }

  guardar(): void {
    this.guardando = true;
    this.error = '';
    const fallo = (err: any) => { this.guardando = false; this.error = mensajeDeError(err); };
    if (this.usuario) {
      const datos: { nombre: string; rol?: string } = { nombre: this.nombre };
      if (!this.esPropio) datos.rol = this.rol;
      this.api.actualizarUsuario(this.usuario._id, datos).subscribe(() => this.ref.close({}), fallo);
    } else {
      this.api.crearUsuario({ nombre: this.nombre, email: this.email, rol: this.rol }).subscribe(
        r => this.ref.close({ claveTemporal: r.claveTemporal, email: r.usuario.email }),
        fallo,
      );
    }
  }
}

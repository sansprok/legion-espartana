import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';

import { AuthService } from '../../core/auth.service';
import { mensajeDeError } from '../../core/auth.interceptor';

@Component({
  selector: 'app-cambiar-clave',
  template: `
    <div class="pagina-titulo">
      <div>
        <h1>Cambiar contraseña</h1>
        <p>Mínimo 8 caracteres, con letras y números.</p>
      </div>
    </div>
    <nb-card class="tarjeta">
      <nb-card-body>
        <nb-alert *ngIf="obligatorio" status="warning">
          Su contraseña es temporal. Debe definir una nueva para continuar.
        </nb-alert>
        <nb-alert *ngIf="error" status="danger">{{ error }}</nb-alert>
        <form class="formulario" (ngSubmit)="guardar()" #f="ngForm">
          <div>
            <label for="actual">Contraseña actual</label>
            <input nbInput fullWidth id="actual" name="actual" type="password" autocomplete="current-password"
                   [(ngModel)]="actual" required>
          </div>
          <div>
            <label for="nueva">Nueva contraseña</label>
            <input nbInput fullWidth id="nueva" name="nueva" type="password" autocomplete="new-password"
                   [(ngModel)]="nueva" required minlength="8">
          </div>
          <div>
            <label for="repetir">Confirmar nueva contraseña</label>
            <input nbInput fullWidth id="repetir" name="repetir" type="password" autocomplete="new-password"
                   [(ngModel)]="repetir" required [status]="repetir && repetir !== nueva ? 'danger' : 'basic'">
            <div class="ayuda" *ngIf="repetir && repetir !== nueva">Las contraseñas no coinciden.</div>
          </div>
          <div>
            <button nbButton status="primary" type="submit"
                    [disabled]="!f.valid || nueva !== repetir || guardando">Guardar contraseña</button>
          </div>
        </form>
      </nb-card-body>
    </nb-card>
  `,
  styles: ['.tarjeta { max-width: 28rem; } nb-alert { margin-bottom: 1rem; }'],
})
export class CambiarClaveComponent {
  actual = '';
  nueva = '';
  repetir = '';
  guardando = false;
  error = '';

  constructor(private auth: AuthService, private router: Router, private toastr: NbToastrService) {}

  get obligatorio(): boolean {
    return !!this.auth.perfil && this.auth.perfil.usuario.debeCambiarClave;
  }

  guardar(): void {
    this.guardando = true;
    this.error = '';
    this.auth.cambiarClave(this.actual, this.nueva).subscribe(
      (r) => {
        this.guardando = false;
        this.toastr.success(r.mensaje, 'Contraseña');
        this.router.navigate(['/inicio']);
      },
      (err) => {
        this.guardando = false;
        this.error = mensajeDeError(err);
      },
    );
  }
}

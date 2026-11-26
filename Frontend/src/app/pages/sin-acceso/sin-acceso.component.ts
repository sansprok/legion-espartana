import { Component } from '@angular/core';

@Component({
  selector: 'app-sin-acceso',
  template: `
    <nb-card class="tarjeta">
      <nb-card-body>
        <nb-icon icon="lock-outline" class="icono"></nb-icon>
        <h1>Acceso no autorizado</h1>
        <p>Su rol no tiene permiso para ingresar a esta opción. Si lo necesita, solicítelo al administrador.</p>
        <a nbButton status="primary" routerLink="/inicio">Volver al inicio</a>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    .tarjeta { max-width: 28rem; margin: 2rem auto; text-align: center; }
    .icono { font-size: 2.5rem; color: #8f9bb3; }
    h1 { font-size: 1.25rem; margin: 0.5rem 0; }
    p { color: #8f9bb3; }
  `],
})
export class SinAccesoComponent {}

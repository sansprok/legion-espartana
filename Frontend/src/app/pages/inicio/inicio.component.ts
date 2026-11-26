import { Component } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth.service';
import { OpcionMenu } from '../../core/modelos';

/** Pantalla de bienvenida: muestra accesos directos a las opciones del usuario. */
@Component({
  selector: 'app-inicio',
  template: `
    <ng-container *ngIf="auth.perfil$ | async as perfil">
      <div class="pagina-titulo">
        <div>
          <h1>Bienvenido, {{ perfil.usuario.nombre }}</h1>
          <p>{{ nombreSistema }} · Rol: {{ perfil.usuario.rol?.nombre }}</p>
        </div>
      </div>
      <div class="accesos">
        <a *ngFor="let o of accesos(perfil.menu)" class="acceso" [routerLink]="o.ruta">
          <nb-icon [icon]="o.icono || 'arrow-forward-outline'"></nb-icon>
          <span>{{ o.titulo }}</span>
        </a>
      </div>
      <p *ngIf="!accesos(perfil.menu).length" class="texto-suave">
        Su rol aún no tiene opciones asignadas. Comuníquese con el administrador.
      </p>
    </ng-container>
  `,
  styles: [`
    .accesos { display: grid; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); gap: 1rem; }
    .acceso { display: flex; align-items: center; gap: 0.75rem; padding: 1.125rem 1.25rem; border-radius: 0.5rem;
      background: #fff; border: 1px solid #e4e9f2; text-decoration: none; color: #222b45; font-weight: 600; }
    .acceso:hover { border-color: #3366ff; color: #3366ff; }
    .acceso nb-icon { font-size: 1.5rem; color: #3366ff; }
  `],
})
export class InicioComponent {
  readonly nombreSistema = environment.nombreSistema;

  constructor(public auth: AuthService) {}

  /** Opciones finales del menú (con ruta), excepto Inicio. */
  accesos(menu: OpcionMenu[]): OpcionMenu[] {
    const lista: OpcionMenu[] = [];
    const recorrer = (nodos: OpcionMenu[]) => nodos.forEach((n) => {
      if (n.hijos && n.hijos.length) recorrer(n.hijos);
      else if (n.ruta && n.ruta !== '/inicio') lista.push(n);
    });
    recorrer(menu);
    return lista;
  }
}

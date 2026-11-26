import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from './auth.service';

/**
 * Protege las rutas internas:
 *  - sin sesión válida -> /login
 *  - con contraseña temporal -> /cuenta/clave (obligatorio cambiarla)
 *  - si la ruta declara data: { permiso: 'clave' } y el rol no la tiene -> /sin-acceso
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(ruta: ActivatedRouteSnapshot, estado: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.verificar(ruta, estado.url);
  }

  canActivateChild(ruta: ActivatedRouteSnapshot, estado: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.verificar(ruta, estado.url);
  }

  private verificar(ruta: ActivatedRouteSnapshot, url: string): Observable<boolean | UrlTree> {
    const perfil$ = this.auth.perfil ? of(this.auth.perfil) : this.auth.cargarPerfil();
    return perfil$.pipe(map((perfil) => {
      if (!perfil) return this.router.createUrlTree(['/login']);
      if (perfil.usuario.debeCambiarClave && url !== '/cuenta/clave') {
        return this.router.createUrlTree(['/cuenta/clave']);
      }
      const permiso = ruta.data && ruta.data.permiso;
      if (permiso && !this.auth.tienePermiso(permiso)) {
        return this.router.createUrlTree(['/sin-acceso']);
      }
      return true;
    }));
  }
}

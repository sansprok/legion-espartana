import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { NbMenuItem } from '@nebular/theme';

import { environment } from '../../environments/environment';
import { OpcionMenu, Perfil } from './modelos';

const CLAVE_TOKEN = 'legion.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private perfilSujeto = new BehaviorSubject<Perfil | null>(null);
  readonly perfil$ = this.perfilSujeto.asObservable();
  readonly menu$: Observable<NbMenuItem[]> = this.perfil$.pipe(
    map(p => (p ? this.aItemsMenu(p.menu) : [])),
  );

  constructor(private http: HttpClient, private router: Router) {}

  get token(): string | null {
    try { return localStorage.getItem(CLAVE_TOKEN); } catch (e) { return null; }
  }

  get perfil(): Perfil | null {
    return this.perfilSujeto.value;
  }

  login(email: string, clave: string): Observable<Perfil> {
    return this.http.post<Perfil & { token: string }>(`${environment.apiUrl}/auth/login`, { email, clave }).pipe(
      tap((r: Perfil & { token: string }) => {
        try { localStorage.setItem(CLAVE_TOKEN, r.token); } catch (e) { /* sin almacenamiento */ }
        this.perfilSujeto.next({ usuario: r.usuario, permisos: r.permisos, menu: r.menu });
      }),
    );
  }

  /** Vuelve a leer el perfil (usuario, permisos y menú). Devuelve null si la sesión no es válida. */
  cargarPerfil(): Observable<Perfil | null> {
    if (!this.token) {
      this.perfilSujeto.next(null);
      return of(null);
    }
    return this.http.get<Perfil>(`${environment.apiUrl}/auth/perfil`).pipe(
      tap(p => this.perfilSujeto.next(p)),
      catchError(() => {
        this.limpiar();
        return of(null);
      }),
    );
  }

  cambiarClave(claveActual: string, claveNueva: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${environment.apiUrl}/auth/cambiar-clave`, { claveActual, claveNueva }).pipe(
      tap(() => {
        const p = this.perfil;
        if (p) this.perfilSujeto.next({ ...p, usuario: { ...p.usuario, debeCambiarClave: false } });
      }),
    );
  }

  tienePermiso(clave: string): boolean {
    const permisos = this.perfil ? this.perfil.permisos : [];
    return permisos.indexOf('*') !== -1 || permisos.indexOf(clave) !== -1;
  }

  cerrarSesion(): void {
    this.limpiar();
    this.router.navigate(['/login']);
  }

  private limpiar(): void {
    try { localStorage.removeItem(CLAVE_TOKEN); } catch (e) { /* sin almacenamiento */ }
    this.perfilSujeto.next(null);
  }

  private aItemsMenu(opciones: OpcionMenu[]): NbMenuItem[] {
    return opciones.map((o) => {
      const item: NbMenuItem = { title: o.titulo, icon: o.icono || undefined };
      if (o.hijos && o.hijos.length) {
        item.children = this.aItemsMenu(o.hijos);
      } else {
        item.link = o.ruta;
      }
      return item;
    });
  }
}

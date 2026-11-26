import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { OpcionMenu, Rol, Usuario } from './modelos';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  constructor(private http: HttpClient) {}

  // ---- Usuarios ----
  usuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${API}/usuarios`);
  }
  crearUsuario(datos: { nombre: string; email: string; rol: string }): Observable<{ usuario: Usuario; claveTemporal: string | null }> {
    return this.http.post<{ usuario: Usuario; claveTemporal: string | null }>(`${API}/usuarios`, datos);
  }
  actualizarUsuario(id: string, datos: Partial<{ nombre: string; rol: string; activo: boolean }>): Observable<Usuario> {
    return this.http.put<Usuario>(`${API}/usuarios/${id}`, datos);
  }
  restablecerClave(id: string): Observable<{ claveTemporal: string }> {
    return this.http.post<{ claveTemporal: string }>(`${API}/usuarios/${id}/restablecer-clave`, {});
  }

  // ---- Roles ----
  roles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${API}/roles`);
  }
  opcionesParaPermisos(): Observable<OpcionMenu[]> {
    return this.http.get<OpcionMenu[]>(`${API}/roles/opciones`);
  }
  crearRol(datos: Partial<Rol>): Observable<Rol> {
    return this.http.post<Rol>(`${API}/roles`, datos);
  }
  actualizarRol(id: string, datos: Partial<Rol>): Observable<Rol> {
    return this.http.put<Rol>(`${API}/roles/${id}`, datos);
  }
  eliminarRol(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${API}/roles/${id}`);
  }

  // ---- Opciones del menú ----
  opcionesMenu(): Observable<OpcionMenu[]> {
    return this.http.get<OpcionMenu[]>(`${API}/opciones-menu`);
  }
  crearOpcion(datos: Partial<OpcionMenu>): Observable<OpcionMenu> {
    return this.http.post<OpcionMenu>(`${API}/opciones-menu`, datos);
  }
  actualizarOpcion(id: string, datos: Partial<OpcionMenu>): Observable<OpcionMenu> {
    return this.http.put<OpcionMenu>(`${API}/opciones-menu/${id}`, datos);
  }
  eliminarOpcion(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${API}/opciones-menu/${id}`);
  }
}

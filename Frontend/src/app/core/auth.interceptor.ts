import { Injectable, Injector } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/** Agrega el token a las llamadas al backend y cierra la sesión si el backend la rechaza. */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Se obtiene aquí y no en el constructor para evitar una dependencia circular con HttpClient.
    const auth = this.injector.get(AuthService);
    const alBackend = req.url.indexOf(environment.apiUrl) === 0;
    const token = auth.token;
    const pedido = alBackend && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
    return next.handle(pedido).pipe(
      catchError((err: HttpErrorResponse) => {
        const esLogin = req.url.indexOf('/auth/login') !== -1;
        if (alBackend && err.status === 401 && !esLogin && auth.perfil) {
          auth.cerrarSesion();
        }
        return throwError(err);
      }),
    );
  }
}

/** Mensaje legible de un error del backend. */
export function mensajeDeError(err: any): string {
  if (err && err.error && err.error.mensaje) return err.error.mensaje;
  if (err && err.status === 0) return 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.';
  return 'Ocurrió un error inesperado. Inténtelo nuevamente.';
}

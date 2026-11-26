import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';
import { mensajeDeError } from '../core/auth.interceptor';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  readonly nombreSistema = environment.nombreSistema;
  email = '';
  clave = '';
  verClave = false;
  enviando = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Si ya hay una sesión válida, entra directo.
    if (this.auth.token) {
      this.auth.cargarPerfil().subscribe(p => { if (p) this.router.navigate(['/inicio']); });
    }
  }

  ingresar(): void {
    if (!this.email || !this.clave || this.enviando) return;
    this.enviando = true;
    this.error = '';
    this.auth.login(this.email, this.clave).subscribe(
      (p) => {
        this.enviando = false;
        this.router.navigate([p.usuario.debeCambiarClave ? '/cuenta/clave' : '/inicio']);
      },
      (err) => {
        this.enviando = false;
        this.error = mensajeDeError(err);
      },
    );
  }
}

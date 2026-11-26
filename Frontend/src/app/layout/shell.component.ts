import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';

/** Estructura de la aplicación: encabezado, menú lateral (según el rol) y contenido. */
@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit, OnDestroy {
  readonly nombreSistema = environment.nombreSistema;
  readonly menu$ = this.auth.menu$;
  readonly perfil$ = this.auth.perfil$;
  private destruir$ = new Subject<void>();
  private esMovil = false;

  constructor(
    private auth: AuthService,
    private sidebar: NbSidebarService,
    private menuService: NbMenuService,
    private theme: NbThemeService,
    private breakpoints: NbMediaBreakpointsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const { md } = this.breakpoints.getBreakpointsMap();
    this.theme.onMediaQueryChange().pipe(takeUntil(this.destruir$)).subscribe(([, actual]) => {
      this.esMovil = actual.width < md;
    });
    // En pantallas pequeñas, el menú se cierra al elegir una opción.
    this.menuService.onItemClick().pipe(
      filter(() => this.esMovil),
      takeUntil(this.destruir$),
    ).subscribe(() => this.sidebar.collapse('menu'));
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  alternarMenu(): void {
    this.sidebar.toggle(true, 'menu');
  }

  cambiarClave(): void {
    this.router.navigate(['/cuenta/clave']);
  }

  salir(): void {
    this.auth.cerrarSesion();
  }
}

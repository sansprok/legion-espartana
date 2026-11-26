import { Component, OnInit } from '@angular/core';
import { NbDialogService, NbToastrService } from '@nebular/theme';

import { AdminApiService } from '../../../core/admin-api.service';
import { AuthService } from '../../../core/auth.service';
import { mensajeDeError } from '../../../core/auth.interceptor';
import { OpcionMenu } from '../../../core/modelos';
import { ConfirmarDialogComponent } from '../../../shared/confirmar-dialog.component';
import { OpcionDialogComponent } from './opcion-dialog.component';

export interface FilaOpcion {
  opcion: OpcionMenu;
  nivel: number;
}

/** Administración de las opciones del menú lateral (también son los permisos de los roles). */
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styles: [`
    .titulo-opcion { display: inline-flex; align-items: center; gap: 0.5rem; }
    .titulo-opcion nb-icon { color: #8f9bb3; }
    .grupo { font-weight: 600; }
  `],
})
export class MenuComponent implements OnInit {
  arbol: OpcionMenu[] = [];
  filas: FilaOpcion[] = [];
  cargando = true;

  constructor(
    private api: AdminApiService,
    private auth: AuthService,
    private dialog: NbDialogService,
    private toastr: NbToastrService,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.api.opcionesMenu().subscribe(
      (a) => {
        this.arbol = a;
        this.filas = [];
        const aplanar = (nodos: OpcionMenu[], nivel: number) => nodos.forEach((o) => {
          this.filas.push({ opcion: o, nivel });
          aplanar(o.hijos || [], nivel + 1);
        });
        aplanar(a, 0);
        this.cargando = false;
      },
      (err) => { this.cargando = false; this.toastr.danger(mensajeDeError(err), 'Menú'); },
    );
  }

  nueva(padre: OpcionMenu | null): void {
    this.abrir(null, padre ? padre._id : null);
  }

  editar(o: OpcionMenu): void {
    this.abrir(o, o.padre);
  }

  private abrir(opcion: OpcionMenu | null, padreId: string | null): void {
    this.dialog.open(OpcionDialogComponent, {
      context: { opcion, padreInicial: padreId, filas: this.filas },
    }).onClose.subscribe((guardado) => {
      if (!guardado) return;
      this.toastr.success('La opción se guardó correctamente.', 'Menú');
      this.refrescar();
    });
  }

  eliminar(o: OpcionMenu): void {
    this.dialog.open(ConfirmarDialogComponent, {
      context: {
        titulo: 'Eliminar opción',
        mensaje: `Se eliminará "${o.titulo}" y se quitará el permiso "${o.clave}" de todos los roles. ¿Desea continuar?`,
        textoAceptar: 'Eliminar',
        peligro: true,
      },
    }).onClose.subscribe((ok) => {
      if (!ok) return;
      this.api.eliminarOpcion(o._id).subscribe(
        () => { this.toastr.success('Opción eliminada.', 'Menú'); this.refrescar(); },
        err => this.toastr.danger(mensajeDeError(err), 'Menú'),
      );
    });
  }

  /** Recarga la tabla y el menú lateral del usuario actual. */
  private refrescar(): void {
    this.cargar();
    this.auth.cargarPerfil().subscribe();
  }
}

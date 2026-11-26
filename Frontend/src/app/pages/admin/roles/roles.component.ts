import { Component, OnInit } from '@angular/core';
import { NbDialogService, NbToastrService } from '@nebular/theme';

import { AdminApiService } from '../../../core/admin-api.service';
import { AuthService } from '../../../core/auth.service';
import { mensajeDeError } from '../../../core/auth.interceptor';
import { OpcionMenu, Rol } from '../../../core/modelos';
import { ConfirmarDialogComponent } from '../../../shared/confirmar-dialog.component';

interface Edicion {
  _id: string | null;
  nombre: string;
  descripcion: string;
  permisos: Set<string>;
  sistema: boolean;
}

/** Roles y permisos: cada permiso es una opción del menú. */
@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  roles: Rol[] = [];
  opciones: OpcionMenu[] = [];
  edicion: Edicion | null = null;
  cargando = true;
  guardando = false;

  constructor(
    private api: AdminApiService,
    private auth: AuthService,
    private dialog: NbDialogService,
    private toastr: NbToastrService,
  ) {}

  ngOnInit(): void {
    this.api.opcionesParaPermisos().subscribe(o => { this.opciones = o; });
    this.cargar();
  }

  cargar(seleccionarId?: string): void {
    this.cargando = true;
    this.api.roles().subscribe(
      (r) => {
        this.roles = r;
        this.cargando = false;
        const elegido = r.find(x => x._id === (seleccionarId || (this.edicion && this.edicion._id)));
        if (elegido) this.seleccionar(elegido);
        else if (!this.edicion && r.length) this.seleccionar(r[0]);
      },
      (err) => { this.cargando = false; this.toastr.danger(mensajeDeError(err), 'Roles'); },
    );
  }

  seleccionar(r: Rol): void {
    this.edicion = { _id: r._id, nombre: r.nombre, descripcion: r.descripcion, permisos: new Set(r.permisos), sistema: r.sistema };
  }

  nuevo(): void {
    this.edicion = { _id: null, nombre: '', descripcion: '', permisos: new Set(['inicio']), sistema: false };
  }

  get accesoTotal(): boolean {
    return !!this.edicion && this.edicion.permisos.has('*');
  }

  // ---- Árbol de permisos ----
  private hojas(o: OpcionMenu): string[] {
    return o.hijos && o.hijos.length ? o.hijos.reduce((a, h) => a.concat(this.hojas(h)), [] as string[]) : [o.clave];
  }

  marcado(o: OpcionMenu): boolean {
    if (!this.edicion) return false;
    if (this.accesoTotal) return true;
    const h = this.hojas(o);
    return h.every(c => this.edicion.permisos.has(c));
  }

  parcial(o: OpcionMenu): boolean {
    if (!this.edicion || this.accesoTotal || !(o.hijos && o.hijos.length)) return false;
    const h = this.hojas(o);
    const n = h.filter(c => this.edicion.permisos.has(c)).length;
    return n > 0 && n < h.length;
  }

  alternar(o: OpcionMenu, valor: boolean): void {
    if (!this.edicion || this.accesoTotal) return;
    this.hojas(o).forEach(c => (valor ? this.edicion.permisos.add(c) : this.edicion.permisos.delete(c)));
  }

  // ---- Guardar / eliminar ----
  guardar(): void {
    const e = this.edicion;
    if (!e || !e.nombre.trim()) return;
    this.guardando = true;
    const datos: Partial<Rol> = { nombre: e.nombre, descripcion: e.descripcion, permisos: Array.from(e.permisos) };
    const pedido = e._id ? this.api.actualizarRol(e._id, datos) : this.api.crearRol(datos);
    pedido.subscribe(
      (r) => {
        this.guardando = false;
        this.toastr.success('El rol se guardó correctamente.', 'Roles');
        this.cargar(r._id);
        // Si es el rol del usuario actual, el menú cambia de inmediato.
        const propio = this.auth.perfil && this.auth.perfil.usuario.rol && this.auth.perfil.usuario.rol._id === r._id;
        if (propio) this.auth.cargarPerfil().subscribe();
      },
      (err) => { this.guardando = false; this.toastr.danger(mensajeDeError(err), 'Roles'); },
    );
  }

  eliminar(): void {
    const e = this.edicion;
    if (!e || !e._id || e.sistema) return;
    this.dialog.open(ConfirmarDialogComponent, {
      context: { titulo: 'Eliminar rol', mensaje: `Se eliminará el rol "${e.nombre}". ¿Desea continuar?`, textoAceptar: 'Eliminar', peligro: true },
    }).onClose.subscribe((ok) => {
      if (!ok) return;
      this.api.eliminarRol(e._id).subscribe(
        () => { this.toastr.success('Rol eliminado.', 'Roles'); this.edicion = null; this.cargar(); },
        err => this.toastr.danger(mensajeDeError(err), 'Roles'),
      );
    });
  }
}

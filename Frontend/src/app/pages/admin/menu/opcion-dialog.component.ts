import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

import { AdminApiService } from '../../../core/admin-api.service';
import { mensajeDeError } from '../../../core/auth.interceptor';
import { OpcionMenu } from '../../../core/modelos';
import { FilaOpcion } from './menu.component';

/** Alta y edición de una opción del menú. */
@Component({
  selector: 'app-opcion-dialog',
  templateUrl: './opcion-dialog.component.html',
  styles: [`
    .pie { display: flex; justify-content: flex-end; gap: 0.5rem; }
    nb-alert { margin-bottom: 1rem; }
    .dos { display: grid; grid-template-columns: minmax(0, 1fr) 7rem; gap: 1rem; }
    .vista-icono { display: flex; align-items: center; gap: 0.5rem; }
    .vista-icono nb-icon { font-size: 1.5rem; color: #3366ff; flex: none; }
  `],
})
export class OpcionDialogComponent implements OnInit {
  @Input() opcion: OpcionMenu | null = null;
  @Input() padreInicial: string | null = null;
  @Input() filas: FilaOpcion[] = [];

  titulo = '';
  clave = '';
  ruta = '';
  icono = '';
  padre: string = '';
  orden = 0;
  activo = true;
  guardando = false;
  error = '';
  padresPosibles: FilaOpcion[] = [];

  constructor(public ref: NbDialogRef<OpcionDialogComponent>, private api: AdminApiService) {}

  get sistema(): boolean {
    return !!this.opcion && this.opcion.sistema;
  }

  ngOnInit(): void {
    const o = this.opcion;
    if (o) {
      this.titulo = o.titulo; this.clave = o.clave; this.ruta = o.ruta; this.icono = o.icono;
      this.orden = o.orden; this.activo = o.activo;
    }
    this.padre = this.padreInicial || '';
    // No se puede elegir como padre a la propia opción ni a sus descendientes.
    const excluidos = new Set<string>();
    if (o) {
      const marcar = (n: OpcionMenu) => { excluidos.add(n._id); (n.hijos || []).forEach(marcar); };
      marcar(o);
    }
    this.padresPosibles = this.filas.filter(f => !excluidos.has(f.opcion._id));
  }

  /** Propone una clave a partir del título y del grupo, solo al crear. */
  sugerirClave(): void {
    if (this.opcion || this.claveEditada) return;
    const base = this.normalizar(this.titulo);
    const padre = this.filas.find(f => f.opcion._id === this.padre);
    this.clave = padre && base ? `${padre.opcion.clave}.${base}` : base;
    if (!this.rutaEditada) this.ruta = base ? `/${this.clave.replace(/\./g, '/')}` : '';
  }

  claveEditada = false;
  rutaEditada = false;

  private normalizar(texto: string): string {
    return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  sangria(f: FilaOpcion): string {
    return '   '.repeat(f.nivel);
  }

  guardar(): void {
    this.guardando = true;
    this.error = '';
    const datos: Partial<OpcionMenu> = {
      titulo: this.titulo, icono: this.icono, orden: Number(this.orden) || 0,
    };
    if (!this.sistema) {
      Object.assign(datos, { clave: this.clave, ruta: this.ruta, padre: this.padre || null, activo: this.activo });
    }
    const pedido = this.opcion ? this.api.actualizarOpcion(this.opcion._id, datos) : this.api.crearOpcion(datos);
    pedido.subscribe(
      () => this.ref.close(true),
      (err) => { this.guardando = false; this.error = mensajeDeError(err); },
    );
  }
}

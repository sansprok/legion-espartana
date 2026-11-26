import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

/**
 * Confirmación genérica. Uso:
 *   this.dialog.open(ConfirmarDialogComponent, { context: { titulo, mensaje, textoAceptar } })
 *     .onClose.subscribe(ok => { if (ok) { ... } });
 */
@Component({
  selector: 'app-confirmar-dialog',
  template: `
    <nb-card class="dialogo">
      <nb-card-header>{{ titulo }}</nb-card-header>
      <nb-card-body><p>{{ mensaje }}</p></nb-card-body>
      <nb-card-footer class="pie">
        <button nbButton ghost (click)="ref.close(false)">Cancelar</button>
        <button nbButton [status]="peligro ? 'danger' : 'primary'" (click)="ref.close(true)">{{ textoAceptar }}</button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: ['.pie { display: flex; justify-content: flex-end; gap: 0.5rem; } p { margin: 0; }'],
})
export class ConfirmarDialogComponent {
  @Input() titulo = 'Confirmar';
  @Input() mensaje = '¿Desea continuar?';
  @Input() textoAceptar = 'Aceptar';
  @Input() peligro = false;

  constructor(public ref: NbDialogRef<ConfirmarDialogComponent>) {}
}

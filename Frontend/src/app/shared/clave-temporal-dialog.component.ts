import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

/** Muestra una sola vez la contraseña temporal generada para un usuario. */
@Component({
  selector: 'app-clave-temporal-dialog',
  template: `
    <nb-card class="dialogo">
      <nb-card-header>Contraseña temporal</nb-card-header>
      <nb-card-body>
        <p>Entregue esta contraseña a <strong>{{ email }}</strong>. Se le pedirá cambiarla en su primer ingreso.</p>
        <div class="clave">
          <span class="mono">{{ clave }}</span>
          <button nbButton size="small" status="basic" (click)="copiar()">
            <nb-icon [icon]="copiado ? 'checkmark-outline' : 'copy-outline'"></nb-icon>{{ copiado ? 'Copiada' : 'Copiar' }}
          </button>
        </div>
        <p class="texto-suave aviso">Por seguridad, esta contraseña no se volverá a mostrar.</p>
      </nb-card-body>
      <nb-card-footer class="pie">
        <button nbButton status="primary" (click)="ref.close()">Entendido</button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [`
    .clave { display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      padding: 0.75rem 1rem; border-radius: 0.5rem; background: #f7f9fc; border: 1px solid #e4e9f2; }
    .clave span { font-size: 1.125rem; letter-spacing: 0.05em; user-select: all; word-break: break-all; }
    .aviso { font-size: 0.8125rem; margin-bottom: 0; }
    .pie { display: flex; justify-content: flex-end; }
  `],
})
export class ClaveTemporalDialogComponent {
  @Input() email = '';
  @Input() clave = '';
  copiado = false;

  constructor(public ref: NbDialogRef<ClaveTemporalDialogComponent>) {}

  copiar(): void {
    const marcar = () => { this.copiado = true; };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.clave).then(marcar, () => {});
    }
  }
}

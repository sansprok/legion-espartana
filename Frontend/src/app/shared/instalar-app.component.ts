import { Component, Input } from '@angular/core';
import { PwaInstallService } from '../core/pwa-install.service';

/**
 * Botón "Instalar app". En Android/Chrome/Edge abre el diálogo nativo; en iPhone
 * muestra la instrucción manual. Se oculta si la app ya está instalada.
 */
@Component({
  selector: 'app-instalar-app',
  template: `
    <ng-container *ngIf="!(pwa.yaInstalada$ | async)">
      <button *ngIf="pwa.puedeInstalar$ | async" nbButton [size]="tamano" status="primary"
              [fullWidth]="anchoCompleto" (click)="pwa.instalar()">
        <nb-icon icon="download-outline"></nb-icon>Instalar app
      </button>
      <button *ngIf="pwa.esIos && !(pwa.puedeInstalar$ | async)" nbButton [size]="tamano" status="primary"
              [fullWidth]="anchoCompleto" (click)="verAyudaIos = !verAyudaIos">
        <nb-icon icon="download-outline"></nb-icon>Instalar app
      </button>
      <p *ngIf="verAyudaIos" class="ayuda-ios">
        En Safari, toque <b>Compartir</b> y luego <b>Agregar a inicio</b>.
      </p>
    </ng-container>
  `,
  styles: [`
    :host { display: block; }
    .ayuda-ios { margin: 0.5rem 0 0; font-size: 0.8125rem; color: #8f9bb3; text-align: center; }
  `],
})
export class InstalarAppComponent {
  @Input() tamano: 'tiny' | 'small' | 'medium' = 'medium';
  @Input() anchoCompleto = false;
  verAyudaIos = false;

  constructor(readonly pwa: PwaInstallService) {}
}

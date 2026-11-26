import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NbAlertModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbIconModule, NbInputModule,
  NbSelectModule, NbSpinnerModule, NbToggleModule, NbTooltipModule,
} from '@nebular/theme';

import { ConfirmarDialogComponent } from './confirmar-dialog.component';
import { ClaveTemporalDialogComponent } from './clave-temporal-dialog.component';
import { InstalarAppComponent } from './instalar-app.component';

/** Módulos y componentes comunes. Importarlo en cada módulo de pantallas. */
const MODULOS = [
  CommonModule, FormsModule,
  NbAlertModule, NbButtonModule, NbCardModule, NbCheckboxModule, NbIconModule, NbInputModule,
  NbSelectModule, NbSpinnerModule, NbToggleModule, NbTooltipModule,
];

@NgModule({
  imports: MODULOS,
  declarations: [ConfirmarDialogComponent, ClaveTemporalDialogComponent, InstalarAppComponent],
  exports: [...MODULOS, ConfirmarDialogComponent, ClaveTemporalDialogComponent, InstalarAppComponent],
})
export class SharedModule {}

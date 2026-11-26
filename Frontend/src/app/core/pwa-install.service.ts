import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Misma lógica que el sistema vehicular (UBRIT).
// Chrome/Edge disparan "beforeinstallprompt" cuando la PWA cumple los requisitos
// para instalarse (manifest válido, íconos). TypeScript aún no lo tipa.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// iOS/Safari nunca dispara "beforeinstallprompt": no se puede instalar por código,
// solo mostrar la instrucción "Compartir > Agregar a inicio". Por eso se expone esIos.
@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  readonly esIos: boolean;
  readonly puedeInstalar$ = new BehaviorSubject<boolean>(false);
  readonly yaInstalada$: BehaviorSubject<boolean>;

  private eventoDiferido: BeforeInstallPromptEvent | null = null;

  constructor(private ngZone: NgZone) {
    this.esIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    this.yaInstalada$ = new BehaviorSubject<boolean>(this.estaEnModoInstalado());

    window.addEventListener('beforeinstallprompt', (event: Event) => {
      // Evita el aviso nativo de Chrome; el diálogo se abre con nuestro botón.
      event.preventDefault();
      this.eventoDiferido = event as BeforeInstallPromptEvent;
      this.ngZone.run(() => this.puedeInstalar$.next(true));
    });

    window.addEventListener('appinstalled', () => {
      this.ngZone.run(() => {
        this.yaInstalada$.next(true);
        this.puedeInstalar$.next(false);
        this.eventoDiferido = null;
      });
    });
  }

  private estaEnModoInstalado(): boolean {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: fullscreen)').matches;
    const iosStandalone = (window.navigator as any).standalone === true;
    return standalone || iosStandalone;
  }

  /** Abre el diálogo nativo de instalación (Chrome/Edge). En iOS no hace nada. */
  async instalar(): Promise<void> {
    if (!this.eventoDiferido) {
      return;
    }
    await this.eventoDiferido.prompt();
    await this.eventoDiferido.userChoice;
    this.eventoDiferido = null;
    this.puedeInstalar$.next(false);
  }
}

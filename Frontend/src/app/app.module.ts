import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import {
  NbActionsModule, NbDialogModule, NbLayoutModule, NbMenuModule, NbSidebarModule,
  NbThemeModule, NbToastrModule, NbUserModule,
} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { AuthInterceptor } from './core/auth.interceptor';
import { LoginComponent } from './auth/login.component';
import { ShellComponent } from './layout/shell.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { CambiarClaveComponent } from './pages/cuenta/cambiar-clave.component';
import { SinAccesoComponent } from './pages/sin-acceso/sin-acceso.component';

@NgModule({
  declarations: [
    AppComponent, LoginComponent, ShellComponent, InicioComponent, CambiarClaveComponent, SinAccesoComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    NbThemeModule.forRoot({ name: 'default' }),
    NbLayoutModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDialogModule.forRoot({ closeOnBackdropClick: false }),
    NbToastrModule.forRoot({ duration: 4000 }),
    NbActionsModule,
    NbUserModule,
    NbEvaIconsModule,
    SharedModule,
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent],
})
export class AppModule {}

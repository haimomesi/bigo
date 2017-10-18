import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CallbackComponent } from './components/callback/callback.component';
import { DesignsComponent } from './partials/designs/designs.component';
import { AuthService } from './services/auth/auth.service';
import { AuthGuardService } from './services/auth/auth-guard.service';
import { LoadingBarComponent } from './components/loading-bar/loading-bar/loading-bar.component';
import { SharedService } from './services/shared/shared.service';
import { RouteHeaderComponent } from './components/route-header/route-header.component';

@NgModule({
  declarations: [
    AppComponent,
    CallbackComponent,
    DesignsComponent,
    LoadingBarComponent,
    RouteHeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [AuthService, AuthGuardService, SharedService],
  bootstrap: [AppComponent]
})
export class AppModule { }

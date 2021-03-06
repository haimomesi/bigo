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
import { ModalComponent } from './components/modal/modal.component';
import { ModalService } from './services/modal/modal.service';
import { DesignFormComponent } from './components/design-form/design-form.component';
import { FormsModule } from '@angular/forms';
import { NgUploaderModule } from 'ngx-uploader';
import { PictureUploaderComponent } from './components/picture-uploader/picture-uploader.component' 
import { DesignService } from './services/design/design.service';
import { HttpModule } from '@angular/http';
import { AuthHttp, AuthConfig, AUTH_PROVIDERS, provideAuth } from 'angular2-jwt';
import { AuthModule } from './services/auth/auth.module';
import { ProfileMenuComponent } from './components/profile-menu/profile-menu.component';
import { NotificationService } from './services/notification/notification.service';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ClickStopPropagationDirective } from './directives/click-stop-propagation.directive';
import { SavingDotsComponent } from './components/saving-dots/saving-dots.component';
import { RefreshComponent } from './components/refresh/refresh.component';
import { LoginComponent } from './partials/login/login.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { ConfirmationModalService } from './services/confirmation-modal/confirmation-modal.service';

@NgModule({
  declarations: [
    AppComponent,
    CallbackComponent,
    DesignsComponent,
    LoadingBarComponent,
    RouteHeaderComponent,
    ModalComponent,
    DesignFormComponent,
    PictureUploaderComponent,
    ProfileMenuComponent,
    NotificationsComponent,
    ClickStopPropagationDirective,
    SavingDotsComponent,
    RefreshComponent,
    LoginComponent,
    ConfirmationModalComponent
  ],
  imports: [
    HttpModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgUploaderModule,
    AuthModule
  ],
  providers: [
    AuthService,
    AuthGuardService,
    SharedService, 
    ModalService, 
    DesignService,
    NotificationService,
    ConfirmationModalService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

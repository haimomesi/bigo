import { Component, ViewChild } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { Router, ActivatedRoute, NavigationStart, NavigationCancel, NavigationError, Event as RouterEvent, NavigationEnd } from '@angular/router';
import { SharedService } from './services/shared/shared.service';
import { NotificationService } from './services/notification/notification.service';
import { AppNotification } from './shared/classes/notification';
import { Renderer2Service } from './services/utils/renderer2.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [Renderer2Service]
})
export class AppComponent {
  
  mainLoading: boolean = false;
  renderer;

  @ViewChild('profileMenu') profileMenu;
  
  constructor(public notificationService: NotificationService, public authService: AuthService, public router: Router, public route: ActivatedRoute, public sharedService: SharedService, rendererService: Renderer2Service) {

    var self = this;

    router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event)
    });

    this.renderer = rendererService.getRenderer();
    this.renderer.listen('document', 'click', function(event: MouseEvent): void {
      self.handleClick(event, self);
    });
  }

  handleClick(event, self){
    self.sharedService.refresh = self.authService.loggedIn && !self.authService.authenticated;
  }
  
  toggleProfile(){
    this.profileMenu.toggleProfile();
  }
  
  openNotifications(){
    this.notificationService.open();
  }

  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.mainLoading = true
    }
    if (event instanceof NavigationEnd) {
      this.mainLoading = false
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.mainLoading = false
    }
    if (event instanceof NavigationError) {
      this.mainLoading = false
    }
  }
}

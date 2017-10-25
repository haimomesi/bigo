import { Component, ViewChild } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { Router, ActivatedRoute, NavigationStart, NavigationCancel, NavigationError, Event as RouterEvent, NavigationEnd } from '@angular/router';
import { SharedService } from './services/shared/shared.service';
import { NotificationService } from './services/notification/notification.service';
import { AppNotification } from './shared/classes/notification';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  mainLoading: boolean = false;

  @ViewChild('profileMenu') profileMenu;
  
  constructor(public notificationService: NotificationService, public authService: AuthService, public router: Router, public route: ActivatedRoute, public sharedService: SharedService) {
    router.events.subscribe((event: RouterEvent) => {
      this.navigationInterceptor(event)
    })
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

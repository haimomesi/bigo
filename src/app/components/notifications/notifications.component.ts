import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification/notification.service';
import { Renderer2Service } from '../../services/utils/renderer2.service';
import { AppNotification } from '../../shared/classes/notification';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  providers: [Renderer2Service]
})
export class NotificationsComponent implements OnInit {

  renderer;
  isOpen = false;
  notifications = [];

  constructor(private notificationsService: NotificationService, rendererService: Renderer2Service) { 
    this.renderer = rendererService.getRenderer();
  }

  ngOnInit() {
    
    this.notificationsService.register(this);

    this.notificationsService.getNotifications().subscribe((notification:AppNotification) => {
    
      let existingNotification:AppNotification = this.notifications.filter((n: AppNotification) => {
        return n.guid == notification.guid;
      })[0];

      let progress = notification.totalVariantsUploaded / notification.totalVariants * 100;
      
      if(existingNotification){
        existingNotification.status = notification.status;
        existingNotification.totalVariantsUploaded = notification.totalVariantsUploaded;
        existingNotification.totalVariants = notification.totalVariants;
        existingNotification.progress = progress;
        existingNotification.message = notification.message;

        if(status == 'success')
        {
          
        }
      }
      else{
        notification.progress = progress;
        this.notifications.push(notification);
      }
    },
    error => this.handleError);
  }

  handleError(error): void {
    this.notifications.forEach(notification => {
      notification.status = notification.status != 'success' ? 'error': notification.status;
      notification.message = notification.status == 'error' ? error : notification.message;
    });
  }

  close(): void {
    this.notificationsService.close();
  }

}

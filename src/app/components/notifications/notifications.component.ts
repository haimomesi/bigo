import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification/notification.service';
import { Renderer2Service } from '../../services/utils/renderer2.service';
import { AppNotification } from '../../shared/classes/notification';
import { SharedService } from '../../services/shared/shared.service';

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
  
  constructor(private notificationsService: NotificationService, rendererService: Renderer2Service, private sharedService: SharedService) { 
    this.renderer = rendererService.getRenderer();
  }
  
  ngOnInit() {
    
    this.notificationsService.register(this);
    
    this.notificationsService.getNotifications().subscribe((notification:AppNotification) => {
      
      let existingNotification:AppNotification = this.notifications.filter((n: AppNotification) => {
        return n.guid == notification.guid && n.action == notification.action;
      })[0];  
      
      console.log("notification: " + notification.guid);

      if(existingNotification){
        
        console.log("existingNotification: " + existingNotification.guid);
        existingNotification.status = notification.status;
        
        if(existingNotification.action == 'add'){
          existingNotification.totalVariantsUploaded = notification.totalVariantsUploaded;
          existingNotification.totalVariants = notification.totalVariants;
          existingNotification.progress = notification.totalVariantsUploaded / notification.totalVariants * 100;
        }
        
        existingNotification.message = notification.message;
        
        if(notification.status == 'success')
        {
          if(notification.action == 'add'){
            this.sharedService.designs.push({
              image: existingNotification.img,
              title: existingNotification.title,
              sku: existingNotification.guid
            });
          }
          else if(notification.action == 'delete'){
            for (var index = 0; index < this.sharedService.designs.length; index++) {
              if(this.sharedService.designs[index].sku == notification.guid)
              this.sharedService.designs.splice(index, 1);
            }
          }
        }
        else if(notification.status == 'error'){
          console.log(notification.message);
        }
      }
      else{
        if(notification.action == 'add')
        notification.progress = notification.totalVariantsUploaded / notification.totalVariants * 100;
        
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

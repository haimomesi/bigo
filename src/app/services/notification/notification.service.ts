import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { SharedService } from '../shared/shared.service';
import { TimelineMax } from 'gsap';
import { NotificationsComponent } from '../../components/notifications/notifications.component';
import { AppNotification } from '../../shared/classes/notification';

@Injectable()
export class NotificationService{
  
  public notificationsComponent: NotificationsComponent;
  private gsNotificationsAnimation: TimelineMax;
  private listenerFn;
  private socket;
  
  constructor(private sharedService: SharedService) { }
  
  // sendMessage(message){
  //   this.socket.emit('add-message', message);    
  // }
  
  register(notificationsComponent: NotificationsComponent): void {
    this.notificationsComponent = notificationsComponent;
  }
  
  getNotifications() {
    let observable = new Observable(observer => {
      
      this.sharedService.socket.on('notification', (notification: AppNotification) => {
        observer.next(notification);    
      });
      return () => {
        this.socket.disconnect();
      };  
    })     
    return observable;
  }
  
  open(delay = 0): void {
    var self = this;
    
    this.notificationsComponent.isOpen = true;

    this.gsNotificationsAnimation = new TimelineMax({ delay: delay, paused: true, onComplete:this.onOpen, onCompleteParams: [self], onReverseComplete: this.onClose, onReverseCompleteParams:[self] });
    
    this.gsNotificationsAnimation
    .fromTo(".notifications-overlay", 0.250,{autoAlpha: 0}, {autoAlpha: 1})
    .fromTo(".notifications-panel", 0.150,{left: "-350px"}, {left: "0px"}, 0.1);
    
    this.gsNotificationsAnimation.play();
    
  }

  close(): void {
      this.gsNotificationsAnimation.reverse();
  }
  
  onOpen(self){
    self.listenerFn = self.notificationsComponent.renderer.listen('document', 'keyup', function(event: KeyboardEvent): void {
      if (event.keyCode === 27) {
        self.close();
      }
    });
  }
  
  onClose(self){
    self.notificationsComponent.isOpen = false;
    if(self.listenerFn) self.listenerFn();
  }
}
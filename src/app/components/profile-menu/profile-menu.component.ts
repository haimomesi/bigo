import { Component, OnInit, ElementRef } from '@angular/core';
import { TimelineMax } from 'gsap';
import { Renderer2Service } from '../../services/utils/renderer2.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.scss'],
  providers: [Renderer2Service]
})
export class ProfileMenuComponent implements OnInit {
  
  isOpen = false;
  gsAnimation: TimelineMax;
  listenerFn;
  renderer;
  displayName;
  email;
  initials;
  
  constructor(public authService: AuthService, rendererService: Renderer2Service, private elementRef: ElementRef) { 
    this.renderer = rendererService.getRenderer();
  }
  
  ngOnInit() {
    
    var self = this;
    this.gsAnimation = new TimelineMax({ paused: true, onComplete:this.onOpen, onCompleteParams: [self], onReverseComplete: this.onClose, onReverseCompleteParams:[self] });
    this.gsAnimation
    .fromTo(".profile-menu", 0.250 ,{height: "0px", autoAlpha: 0}, {height: "200px", autoAlpha: 1});
    
    let profile = this.authService.getProfile();
    this.displayName = profile.nickname;
    this.email = profile.name;
    this.initials = this.displayName.match(/\b(\w)/g).join('');
  }
  
  toggleProfile(){
    if(this.isOpen)
    this.gsAnimation.reverse();
    else
    {
      this.isOpen = true;
      this.gsAnimation.play();
    }
  }
  
  onOpen(self){
    self.listenerFn = self.renderer.listen('document', 'click', function(event: MouseEvent): void {
      self.handleClick(event);
    });
  }
  
  onClose(self){
    self.isOpen = false;
    if(self.listenerFn) self.listenerFn();
  }
  
  handleClick(event, self){
    var clickedComponent = event.target;
    var inside = false;
    do {
      if (clickedComponent === this.elementRef.nativeElement) {
        inside = true;
      }
      clickedComponent = clickedComponent.parentNode;
    } while (clickedComponent);
    if(!inside){
      this.toggleProfile();
    }
  }
  
}

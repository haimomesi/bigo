import { Injectable } from '@angular/core';
import { ConfirmationModalComponent } from '../../components/confirmation-modal/confirmation-modal.component';
import { TimelineMax } from 'gsap';

@Injectable()
export class ConfirmationModalService {

  private modals: Array<ConfirmationModalComponent>;
  private gsModalAnimation: TimelineMax;
  private listenerFn;

  constructor() {
    this.modals = [];
  }

  registerModal(newModal: ConfirmationModalComponent): void {
    const modal = this.findModal(newModal.modalId);
    
    // Delete existing to replace the modal
    if (modal) {
      this.modals.splice(this.modals.indexOf(modal));
    }
    
    this.modals.push(newModal);
  }
  
  open(modalId: string, params): void {
    var self = this;
    const modal = this.findModal(modalId);
    
    if (modal) {
  
      modal.isOpen = true;
      modal.params = params;
      
      this.gsModalAnimation = new TimelineMax({ paused: true, onComplete:this.onOpen, onCompleteParams: [modal, self], onReverseComplete: this.onClose, onReverseCompleteParams:[modal, self] });
      
      this.gsModalAnimation
      .fromTo(".confirmation-modal-overlay", 0.001,{autoAlpha: 0}, {autoAlpha: 1})
      .fromTo(".confirmation-modal", 0.1,{autoAlpha: 0, scale: 0}, {autoAlpha: 1, scale: 1});
      // .fromTo(".confirmation-modal-overlay", 0.175,{autoAlpha: 0}, {autoAlpha: 1})
      // .fromTo(".confirmation-modal", 0.001,{autoAlpha: 0}, {autoAlpha: 1})
      // .fromTo(".confirmation-modal-close", 0.1, { autoAlpha: 0}, { autoAlpha: 1})
      // .fromTo(".confirmation-modal-icon", 0.1, { top:"50px", autoAlpha: 0}, {top:"0px", autoAlpha: 1})
      // .fromTo(".confirmation-modal-title", 0.1, { top:"50px", autoAlpha: 0}, {top:"0px", autoAlpha: 1})
      // .fromTo(".confirmation-modal-content", 0.1, { top:"50px", autoAlpha: 0}, {top:"0px", autoAlpha: 1});
      
      this.gsModalAnimation.play();
    }
  }
  
  close(modalId: string): void {
    const modal = this.findModal(modalId);
    
    if (modal) {
      this.gsModalAnimation.reverse();
    }
  }
  
  onOpen(modal, self){
    self.listenerFn = modal.renderer.listen('document', 'keyup', function(event: KeyboardEvent): void {
      if (event.keyCode === 27) {
        self.close(self.modals[0].modalId, true);
      }
    });
  }
  
  onClose(modal, self){
    modal.isOpen = false;
    if(self.listenerFn) self.listenerFn();
  }
  
  private findModal(modalId: string): ConfirmationModalComponent {
    for (const modal of this.modals) {
      if (modal.modalId === modalId) {
        return modal;
      }
    }
    return null;
  }
}

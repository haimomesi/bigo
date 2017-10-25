import { Injectable } from '@angular/core';
import { ModalComponent } from '../../components/modal/modal.component';
import { TimelineMax } from "gsap";

@Injectable()
export class ModalService {
  
  private modals: Array<ModalComponent>;
  private gsModalAnimation: TimelineMax;
  private listenerFn;
  
  constructor() {
    this.modals = [];
  }
  
  registerModal(newModal: ModalComponent): void {
    const modal = this.findModal(newModal.modalId);
    
    // Delete existing to replace the modal
    if (modal) {
      this.modals.splice(this.modals.indexOf(modal));
    }
    
    this.modals.push(newModal);
  }
  
  open(modalId: string): void {
    var self = this;
    const modal = this.findModal(modalId);
    
    if (modal) {
      
      modal.modalForm.initDesign();
      modal.isOpen = true;
      
      this.gsModalAnimation = new TimelineMax({ paused: true, onComplete:this.onOpen, onCompleteParams: [modal, self], onReverseComplete: this.onClose, onReverseCompleteParams:[modal, self] });
      
      this.gsModalAnimation
      .fromTo(".modal-overlay", 0.175,{autoAlpha: 0}, {autoAlpha: 1})
      .fromTo(".modal", 0.001,{autoAlpha: 0}, {autoAlpha: 1})
      .fromTo(".modal-close", 0.1, { autoAlpha: 0}, { autoAlpha: 1})
      .fromTo(".modal-title", 0.1, { top:"50px", autoAlpha: 0}, {top:"0px", autoAlpha: 1})
      .fromTo(".modal-body-content", 0.1, { top:"50px", autoAlpha: 0}, {top:"0px", autoAlpha: 1})
      .fromTo(".modal-form", 0.001, {autoAlpha: 0}, {autoAlpha: 1})
      .staggerFromTo(".form-group", 0.175, { top:"50px", autoAlpha: 0}, {top:"0px", autoAlpha: 1}, 0.035);
      
      this.gsModalAnimation.play();
    }
  }
  
  close(modalId: string, checkBlocking = false): void {
    const modal = this.findModal(modalId);
    
    if (modal) {
      if (checkBlocking && modal.blocking) {
        return;
      }
      
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
  
  private findModal(modalId: string): ModalComponent {
    for (const modal of this.modals) {
      if (modal.modalId === modalId) {
        return modal;
      }
    }
    return null;
  }
}
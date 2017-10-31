import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Renderer2Service } from '../../services/utils/renderer2.service';
import { ConfirmationModalService } from '../../services/confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit {

  @Input() modalId: string;
  @Input() entity: string;
  @Output() notify: EventEmitter<any> = new EventEmitter<any>();
  public renderer;
  public isOpen = false;
  public params;
  
  constructor(private confirmationModalService: ConfirmationModalService, rendererService: Renderer2Service) { 
    this.renderer = rendererService.getRenderer();
  }

  ngOnInit() {
    this.confirmationModalService.registerModal(this);
  }

  close(){
    this.confirmationModalService.close(this.modalId);
  }

  confirm(){
    this.close();
    this.notify.emit(this.params);
  }

}
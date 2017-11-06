import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalService } from '../../services/modal/modal.service';
import { Renderer2Service } from '../../services/utils/renderer2.service';
import { NotificationService } from '../../services/notification/notification.service';
import { AppNotification } from '../../shared/classes/notification';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  providers: [Renderer2Service]
})
export class ModalComponent implements OnInit  {
  
  @Input() modalId: string;
  @Input() modalTitle: string;
  @Input() blocking = false;
  @ViewChild('modalForm') modalForm;
  public renderer;
  public isOpen = false;

  constructor(private modalService: ModalService, rendererService: Renderer2Service, private notificationService: NotificationService) {
    this.renderer = rendererService.getRenderer();
  }

  ngOnInit() {
    this.modalService.registerModal(this);
  }

  close(checkBlocking = false): void {
    this.modalService.close(this.modalId, checkBlocking);
  }

  onNotify(notification: AppNotification) {
    this.close();
    this.notificationService.open(0.65, notification);
  }
}

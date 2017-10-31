import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../services/modal/modal.service';
import { ActivatedRoute } from '@angular/router';
import { Design } from '../../shared/classes/design';
import { SharedService } from '../../services/shared/shared.service';
import { DesignService } from '../../services/design/design.service';
import { NotificationService } from '../../services/notification/notification.service';
import { ConfirmationModalService } from '../../services/confirmation-modal/confirmation-modal.service';

@Component({
  selector: 'app-designs',
  templateUrl: './designs.component.html',
  styleUrls: ['./designs.component.scss'],
  host: { 'class': 'router-space' }
})
export class DesignsComponent implements OnInit {
  
  modalId: string = 'newDesignModal';
  confirmationModalId: string = 'confirmationModal';

  constructor(private modalService: ModalService, private confirmationModalService: ConfirmationModalService,private route: ActivatedRoute, public sharedService: SharedService, private designService: DesignService, private notificationService: NotificationService) {}

  ngOnInit() {
    this.sharedService.designs = this.route.snapshot.data['designs'];
  }

  addDesign(){
    this.modalService.open(this.modalId);
  }

  openConfirmationModal(designGuid){
    this.confirmationModalService.open(this.confirmationModalId, designGuid);
  }

  deleteDesign(designGuid){
    this.notificationService.open(0, {
      guid: designGuid,
      status: 'pending',
      message: 'Sending delete request',
      action: 'delete',
      totalVariants: 0,
      totalVariantsUploaded: 0,
      progress: 0,
      title: null,
      img: null
    });
    this.designService.delete(designGuid, this.sharedService.socketId)
    .then(function(response){
      //self.notify.emit();
    });
  }

}

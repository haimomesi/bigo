import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../services/modal/modal.service';
import { ActivatedRoute } from '@angular/router';
import { Design } from '../../shared/classes/design';
import { SharedService } from '../../services/shared/shared.service';

@Component({
  selector: 'app-designs',
  templateUrl: './designs.component.html',
  styleUrls: ['./designs.component.scss'],
  host: { 'class': 'router-space' }
})
export class DesignsComponent implements OnInit {
  
  modalId: string = 'newDesignModal';

  constructor(private modalService: ModalService, private route: ActivatedRoute, private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.designs = this.route.snapshot.data['designs'];
  }

  addDesign(){
    this.modalService.open(this.modalId)
  }

}

import { Component, ViewChild, Input, ViewChildren, QueryList, EventEmitter, Output } from '@angular/core';
import { Design } from '../../shared/classes/design';
import { Utils } from '../../shared/utils/utils';
import { NgUploaderOptions } from 'ngx-uploader';
import { DesignService } from '../../services/design/design.service';
import { SharedService } from '../../services/shared/shared.service';
import { PictureUploaderComponent } from '../picture-uploader/picture-uploader.component';

@Component({
  selector: 'app-design-form',
  templateUrl: './design-form.component.html',
  styleUrls: ['./design-form.component.scss']
})
export class DesignFormComponent {
  
  @ViewChild('designForm') designForm;
  //@ViewChild('picturePart') picturePart;
  @ViewChildren('picturePart') pictureParts:QueryList<PictureUploaderComponent>;
  @Output() notify: EventEmitter<any> = new EventEmitter<any>();
  //@Input() state;
  defaultFrontPicture = 'assets/images/front.png';
  defaultOutsideLabelPicture = 'assets/images/outside-label.png';
  design:Design = new Design();
  
  uploaderOptions: NgUploaderOptions = {
    url: '',
  };
  constructor(private designService: DesignService, public sharedService: SharedService) { }
  
  onSubmit() { 
    var self = this;
    if (this.designForm.valid) {
      this.design.socketId = this.sharedService.socket.id;
      this.designService.create(this.design)
      .then(function(response){
        self.notify.emit();
      });
    }
  }
  
  initDesign(){
    this.design = new Design();
    this.design.guid = Utils.guid();
    
    this.pictureParts.forEach(picturePart => {
      picturePart.removePicture();
    });
  
  }
  
  onNotify(event, cmpName) {
    this.design[cmpName] = event;
  }
}

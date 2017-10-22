import { Component, ViewChild, Input } from '@angular/core';
import { Design } from '../../shared/classes/design';
import { Utils } from '../../shared/utils/utils';
import { NgUploaderOptions } from 'ngx-uploader';
import { DesignService } from '../../services/design/design.service';

@Component({
  selector: 'app-design-form',
  templateUrl: './design-form.component.html',
  styleUrls: ['./design-form.component.scss']
})
export class DesignFormComponent {
  
  @ViewChild('designForm') designForm;
  //@Input() state;
  defaultFrontPicture = 'assets/images/front.png';
  defaultOutsideLabelPicture = 'assets/images/outside-label.png';
  design:Design = new Design();
  
  uploaderOptions: NgUploaderOptions = {
    url: '',
  };
  constructor(private designService: DesignService) { }
  
  onSubmit() { 
    if (this.designForm.valid) {
      this.designService.create(this.design)
      .then(function(response){
        console.log(response);
      });
    }
  }
  
  initDesign(){
    this.design = new Design();
    this.design.guid = Utils.guid();
  }
  
  onNotify(event, cmpName) {
    this.design[cmpName] = event;
  }
}

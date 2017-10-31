import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared/shared.service';

@Component({
  selector: 'app-refresh',
  templateUrl: './refresh.component.html',
  styleUrls: ['./refresh.component.scss']
})
export class RefreshComponent implements OnInit {
  
  constructor(public sharedService:SharedService) { }
  
  ngOnInit() {
  }
  
  refresh() {
    window.location.reload();
  }
  
  shouldRefresh(){
    return this.sharedService.refresh;
  }
}

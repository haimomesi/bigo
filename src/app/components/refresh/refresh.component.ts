import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-refresh',
  templateUrl: './refresh.component.html',
  styleUrls: ['./refresh.component.scss']
})
export class RefreshComponent implements OnInit {
  
  constructor(public authService:AuthService) { }
  
  ngOnInit() {
  }
  
  refresh() {
    window.location.reload();
  }
  
  shouldRefresh(){
      return this.authService.loggedIn && !this.authService.authenticated;
  }
}

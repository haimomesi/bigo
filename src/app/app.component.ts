import { Component } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from './services/shared/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';

  constructor(public authService: AuthService, public router: Router, public route: ActivatedRoute, public sharedService: SharedService) {
  }
}

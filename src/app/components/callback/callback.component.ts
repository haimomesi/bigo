import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  template: ``
})
export class CallbackComponent {

  constructor(private authService: AuthService) {
    this.authService.handleAuth();
  }
  
}

import { NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate } from '@angular/router';
import { AuthGuardService } from './services/auth/auth-guard.service';
import { CallbackComponent } from './components/callback/callback.component';
import { DesignsComponent } from './partials/designs/designs.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/designs',
    pathMatch: 'full'
  },
  {
    path: 'designs',
    component: DesignsComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'callback',
    component: CallbackComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

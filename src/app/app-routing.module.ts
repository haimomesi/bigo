import { NgModule } from '@angular/core';
import { Routes, RouterModule, CanActivate } from '@angular/router';
import { AuthGuardService } from './services/auth/auth-guard.service';
import { CallbackComponent } from './components/callback/callback.component';
import { DesignsComponent } from './partials/designs/designs.component';
import { DesignsResolver } from './resolves/designs/designs.resolve';
import { LoginComponent } from './partials/login/login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/designs',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'designs',
    component: DesignsComponent,
    resolve: {
      designs: DesignsResolver
    },
    canActivate: [AuthGuardService]
  },
  {
    path: 'callback',
    component: CallbackComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [DesignsResolver]
})
export class AppRoutingModule { }

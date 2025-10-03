import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IndexPage } from './index.page';
import { IndexGuard } from '../guards/index.guard';

const routes: Routes = [
  {
  path: '',
  component: IndexPage,
  children: [
    {
      path: '',
      loadChildren: () => import('../pages/welcome/welcome.module').then(m => m.WelcomePageModule),
 canActivate: [IndexGuard]
    },
    {
      path: 'login',
      loadChildren: () => import('../pages/login/login.module').then(m => m.LoginPageModule)
    },
    {
      path: 'forgot-password',
      loadChildren: () => import('../pages/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
    }
  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IndexPageRoutingModule {}

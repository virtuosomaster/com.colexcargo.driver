import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ComponentsModule } from './components/components.module';
import { IndexGuard } from './guards/index.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./index/index.module').then(m => m.IndexPageModule),
    canActivate: [IndexGuard]
  },
  {
    path: '',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'cancelled',
    loadChildren: () => import('./pages/cancelled/cancelled.module').then(m => m.CancelledPageModule)
  },
  {
    path: 'delivered',
    loadChildren: () => import('./pages/delivered/delivered.module').then(m => m.DeliveredPageModule)
  },
  {
    path: 'view',
    loadChildren: () => import('./pages/view/view.module').then(m => m.ViewPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: 'update-password',
    loadChildren: () => import('./pages/update-password/update-password.module').then(m => m.UpdatePasswordPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/signup/signup.module').then(m => m.SignupPageModule)
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    ComponentsModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

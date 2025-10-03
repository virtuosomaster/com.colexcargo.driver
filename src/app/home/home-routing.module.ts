import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { homeGuard } from '../guards/home.guard';
import { UserDataResolver } from '../resolvers/user-data.resolver';


const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
    resolve: {
      userData: UserDataResolver,
    },
    children: [
      {
        path: 'shipments/:status',
        loadChildren: () => import('../pages/shipments/shipments.module').then(m => m.ShipmentsPageModule),
        canActivate: [homeGuard]
      },
      {
        path: 'delivered',
        loadChildren: () => import('../pages/delivered/delivered.module').then(m => m.DeliveredPageModule),
        canActivate: [homeGuard]
      },
      {
        path: 'cancelled',
        loadChildren: () => import('../pages/cancelled/cancelled.module').then(m => m.CancelledPageModule),
        canActivate: [homeGuard]
      },
      {
        path: 'accounts',
        loadChildren: () => import('../pages/accounts/accounts.module').then(m => m.AccountsPageModule),
        canActivate: [homeGuard]
      },
      {
        path: 'shipment/:shipmentID',
        loadChildren: () => import('../pages/shipment/shipment.module').then(m => m.ShipmentPageModule),
        canActivate: [homeGuard]
      },
      {
        path: 'view/:shipmentID',
        loadChildren: () => import('../pages/view/view.module').then(m => m.ViewPageModule),
        canActivate: [homeGuard]
      },
      {
        path: 'scanner',
        loadChildren: () => import('../pages/scanner/scanner.module').then(m => m.ScannerPageModule),
        canActivate: [homeGuard]
      },
      {
        path: 'routes',
        loadChildren: () => import('../pages/routes/routes.module').then(m => m.RoutesPageModule)
      },
      {
        path: 'pick-up-route',
        loadChildren: () => import('../pages/pick-up-route/pick-up-route.module').then(m => m.PickUpRoutePageModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('../pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: '',
        redirectTo: '/home/dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule { }

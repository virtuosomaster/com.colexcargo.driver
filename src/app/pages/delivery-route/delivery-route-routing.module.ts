import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryRoutePage } from './delivery-route.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryRoutePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryRoutePageRoutingModule {}

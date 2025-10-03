import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickUpRoutePage } from './pick-up-route.page';

const routes: Routes = [
  {
    path: '',
    component: PickUpRoutePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PickUpRoutePageRoutingModule {}

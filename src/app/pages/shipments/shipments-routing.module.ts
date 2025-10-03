import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShipmentsPage } from './shipments.page';

const routes: Routes = [
  {
    path: '',
    component: ShipmentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShipmentsPageRoutingModule {}

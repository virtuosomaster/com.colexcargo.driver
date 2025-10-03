import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShipmentsPageRoutingModule } from './shipments-routing.module';

import { ShipmentsPage } from './shipments.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShipmentsPageRoutingModule
  ],
  declarations: [ShipmentsPage]
})
export class ShipmentsPageModule {}

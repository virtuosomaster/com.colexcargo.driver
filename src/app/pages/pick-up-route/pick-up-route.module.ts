import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickUpRoutePageRoutingModule } from './pick-up-route-routing.module';

import { PickUpRoutePage } from './pick-up-route.page';
import { PickupMapComponent } from 'src/app/components/pickupmap/map.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickUpRoutePageRoutingModule, 
    PickupMapComponent
  ],
  declarations: [PickUpRoutePage]
})
export class PickUpRoutePageModule {}

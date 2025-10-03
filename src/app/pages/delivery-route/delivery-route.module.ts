import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryRoutePageRoutingModule } from './delivery-route-routing.module';

import { DeliveryRoutePage } from './delivery-route.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MapComponent } from 'src/app/components/map/map.component';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryRoutePageRoutingModule,
    MapComponent
  ],
  declarations: [DeliveryRoutePage]
})
export class DeliveryRoutePageModule {}

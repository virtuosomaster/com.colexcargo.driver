import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LogoComponent } from './logo/logo.component';

import { SignatureComponent } from './signature/signature.component';

@NgModule({
  declarations: [
    LogoComponent, 
    SignatureComponent

  ],
  exports: [
    LogoComponent,
    SignatureComponent 

  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule
  ]
})
export class ComponentsModule { }

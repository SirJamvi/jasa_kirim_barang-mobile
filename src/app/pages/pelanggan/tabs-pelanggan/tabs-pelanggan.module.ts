import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsPelangganPageRoutingModule } from './tabs-pelanggan-routing.module';

import { TabsPelangganPage } from './tabs-pelanggan.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPelangganPageRoutingModule
  ],
  declarations: [TabsPelangganPage]
})
export class TabsPelangganPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsKurirPageRoutingModule } from './tabs-kurir-routing.module';

import { TabsKurirPage } from './tabs-kurir.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsKurirPageRoutingModule
  ],
  declarations: [TabsKurirPage]
})
export class TabsKurirPageModule {}

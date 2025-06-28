import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DaftarOrderPageRoutingModule } from './daftar-order-routing.module';
import { DaftarOrderPage } from './daftar-order.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DaftarOrderPageRoutingModule
  ],
  declarations: [DaftarOrderPage]
})
export class DaftarOrderPageModule {}
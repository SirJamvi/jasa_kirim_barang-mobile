import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Tambahkan ReactiveFormsModule untuk form nanti
import { IonicModule } from '@ionic/angular';
import { BuatKirimanPageRoutingModule } from './buat-kiriman-routing.module';
import { BuatKirimanPage } from './buat-kiriman.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BuatKirimanPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [BuatKirimanPage]
})
export class BuatKirimanPageModule {}
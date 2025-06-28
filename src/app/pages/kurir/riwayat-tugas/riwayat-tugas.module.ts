import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RiwayatTugasPageRoutingModule } from './riwayat-tugas-routing.module';
import { RiwayatTugasPage } from './riwayat-tugas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RiwayatTugasPageRoutingModule
  ],
  declarations: [RiwayatTugasPage]
})
export class RiwayatTugasPageModule {}
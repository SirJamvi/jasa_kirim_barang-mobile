import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TugasDetailPageRoutingModule } from './tugas-detail-routing.module';
import { TugasDetailPage } from './tugas-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TugasDetailPageRoutingModule
  ],
  declarations: [TugasDetailPage]
})
export class TugasDetailPageModule {}
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RiwayatTugasPage } from './riwayat-tugas.page';

const routes: Routes = [
  {
    path: '',
    component: RiwayatTugasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RiwayatTugasPageRoutingModule {}

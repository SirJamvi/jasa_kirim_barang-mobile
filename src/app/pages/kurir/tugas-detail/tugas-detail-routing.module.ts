import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TugasDetailPage } from './tugas-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TugasDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TugasDetailPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BuatKirimanPage } from './buat-kiriman.page';

const routes: Routes = [
  {
    path: '',
    component: BuatKirimanPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuatKirimanPageRoutingModule {}

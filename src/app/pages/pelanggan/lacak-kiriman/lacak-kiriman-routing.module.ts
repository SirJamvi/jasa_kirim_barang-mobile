import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LacakKirimanPage } from './lacak-kiriman.page';

const routes: Routes = [
  {
    path: '',
    component: LacakKirimanPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LacakKirimanPageRoutingModule {}

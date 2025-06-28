// src/app/pages/kurir/tabs-kurir/tabs-kurir-routing.module.ts

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TabsKurirPage } from './tabs-kurir.page';

const routes: Routes = [
  {
    path: '',
    component: TabsKurirPage,
    children: [
      {
        path: 'daftar-order', // Tab 1
        loadChildren: () => import('../daftar-order/daftar-order.module').then(m => m.DaftarOrderPageModule)
      },
      {
        path: 'riwayat-tugas', // Tab 2
        loadChildren: () => import('../riwayat-tugas/riwayat-tugas.module').then(m => m.RiwayatTugasPageModule)
      },
      {
        path: 'profil', // Tab 3 (kita bisa gunakan halaman profil yang sama)
        loadChildren: () => import('../../pelanggan/profil/profil.module').then(m => m.ProfilPageModule)
      },
      {
        path: '',
        redirectTo: 'daftar-order',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsKurirPageRoutingModule {}
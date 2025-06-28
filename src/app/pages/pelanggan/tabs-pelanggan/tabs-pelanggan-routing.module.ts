// src/app/pages/pelanggan/tabs-pelanggan/tabs-pelanggan-routing.module.ts

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPelangganPage } from './tabs-pelanggan.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPelangganPage,
    // Ini adalah rute untuk setiap tab di navigasi bawah
    children: [
      {
        path: 'buat-kiriman', // Tab 1
        loadChildren: () => import('../buat-kiriman/buat-kiriman.module').then( m => m.BuatKirimanPageModule)
      },
      {
        path: 'riwayat', // Tab 2
        loadChildren: () => import('../riwayat/riwayat.module').then( m => m.RiwayatPageModule)
      },
      {
        path: 'profil', // Tab 3
        loadChildren: () => import('../profil/profil.module').then( m => m.ProfilPageModule)
      },
      {
        // Jika membuka /tabs-pelanggan, otomatis arahkan ke tab buat-kiriman
        path: '',
        redirectTo: 'buat-kiriman',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPelangganPageRoutingModule {}
// src/app/app-routing.module.ts

import { NgModule, inject } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes, Router, UrlTree } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';

// --- INLINE GUARD UNTUK AUTENTIKASI ---
const authGuard = (): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    return router.createUrlTree(['/login']);
  }
};

// --- DAFTAR RUTE ---
const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'tabs-pelanggan',
    loadChildren: () =>
      import('./pages/pelanggan/tabs-pelanggan/tabs-pelanggan.module').then(
        m => m.TabsPelangganPageModule
      ),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./pages/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'buat-kiriman',
    loadChildren: () =>
      import('./pages/pelanggan/buat-kiriman/buat-kiriman.module').then(
        m => m.BuatKirimanPageModule
      ),
    canActivate: [authGuard]
  },
  {
    path: 'riwayat',
    loadChildren: () =>
      import('./pages/pelanggan/riwayat/riwayat.module').then(
        m => m.RiwayatPageModule
      ),
    canActivate: [authGuard]
  },
  {
    path: 'lacak-kiriman',
    loadChildren: () =>
      import('./pages/pelanggan/lacak-kiriman/lacak-kiriman.module').then(
        m => m.LacakKirimanPageModule
      ),
    canActivate: [authGuard]
  },
  {
    path: 'lacak-kiriman/:id', // <-- Rute dinamis
    loadChildren: () =>
      import('./pages/pelanggan/lacak-kiriman/lacak-kiriman.module').then(
        m => m.LacakKirimanPageModule
      ),
    canActivate: [authGuard]
  },
  {
    path: 'notifikasi',
    loadChildren: () =>
      import('./pages/pelanggan/notifikasi/notifikasi.module').then(
        m => m.NotifikasiPageModule
      ),
    canActivate: [authGuard]
  },
  {
    path: 'profil',
    loadChildren: () =>
      import('./pages/pelanggan/profil/profil.module').then(
        m => m.ProfilPageModule
      ),
    canActivate: [authGuard]
  },
  {
    path: 'daftar-order',
    loadChildren: () =>
      import('./pages/kurir/daftar-order/daftar-order.module').then(
        m => m.DaftarOrderPageModule
      ),
    canActivate: [authGuard]
  },
  {
    path: 'tugas-detail/:id', // ✅ TELAH DIPERBARUI DENGAN PARAMETER :id
    loadChildren: () =>
      import('./pages/kurir/tugas-detail/tugas-detail.module').then(
        m => m.TugasDetailPageModule
      ),
    canActivate: [authGuard]
  },
  {
    path: 'riwayat-tugas',
    loadChildren: () =>
      import('./pages/kurir/riwayat-tugas/riwayat-tugas.module').then(
        m => m.RiwayatTugasPageModule
      ),
    canActivate: [authGuard]
  },
  {
    path: 'tabs-kurir',
    loadChildren: () =>
      import('./pages/kurir/tabs-kurir/tabs-kurir.module').then(
        m => m.TabsKurirPageModule
      )
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

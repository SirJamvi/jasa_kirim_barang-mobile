// src/app/pages/pelanggan/profil/profil.page.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
  standalone: false
})
export class ProfilPage implements OnInit {
  userData: any;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.userData = this.authService.getUser();
  }

  // Fungsi untuk menampilkan konfirmasi logout
  async confirmLogout() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Apakah Anda yakin ingin keluar?',
      buttons: [
        {
          text: 'Logout',
          role: 'destructive',
          handler: () => {
            this.logout();
          },
        },
        {
          text: 'Batal',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  // Fungsi untuk proses logout
  async logout() {
    const loading = await this.loadingController.create({ message: 'Logging out...' });
    await loading.present();

    this.apiService.logout().subscribe(
      async () => {
        this.authService.logout(); // Hapus data dari local storage
        await loading.dismiss();
        this.router.navigate(['/login'], { replaceUrl: true }); // Arahkan ke halaman login
      },
      async (err) => {
        // Jika token sudah tidak valid, tetap lakukan logout di sisi client
        console.error('Logout API failed, proceeding with client-side logout', err);
        this.authService.logout();
        await loading.dismiss();
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    );
  }
}
// src/app/pages/pelanggan/riwayat/riwayat.page.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-riwayat',
  templateUrl: './riwayat.page.html',
  styleUrls: ['./riwayat.page.scss'],
  standalone: false
})
export class RiwayatPage implements OnInit {
  riwayatPengiriman: any[] = [];
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadRiwayat();
  }

  async loadRiwayat(event?: any) {
    this.isLoading = true;
    
    // --- PERBAIKAN DI SINI ---
    // Beri tipe eksplisit pada variabel `loading`.
    let loading: HTMLIonLoadingElement | undefined;

    if (!event) {
      loading = await this.loadingController.create({
        message: 'Memuat riwayat...',
      });
      await loading.present();
    }

    this.apiService.getHistory().subscribe(
      (res) => {
        this.riwayatPengiriman = res.data;
        this.isLoading = false;
        if (loading) {
          loading.dismiss();
        }
        if (event) {
          event.target.complete();
        }
      },
      (err) => {
        console.error(err);
        this.isLoading = false;
        if (loading) {
          loading.dismiss();
        }
        if (event) {
          event.target.complete();
        }
      }
    );
  }

  handleRefresh(event: any) {
    this.loadRiwayat(event);
  }

  goToDetail(pengirimanId: number) {
    this.router.navigate(['/lacak-kiriman', pengirimanId]);
  }
}
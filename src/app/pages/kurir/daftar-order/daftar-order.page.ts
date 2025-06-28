// src/app/pages/kurir/daftar-order/daftar-order.page.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-daftar-order',
  templateUrl: './daftar-order.page.html',
  styleUrls: ['./daftar-order.page.scss'],
  standalone: false
})
export class DaftarOrderPage implements OnInit {
  availableOrders: any[] = [];
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.loadOrders();
  }

  async loadOrders(event?: any) {
    this.isLoading = true;
    this.apiService.getAvailableOrders().subscribe(
      (res) => {
        this.availableOrders = res.data;
        this.isLoading = false;
        if (event) event.target.complete();
      },
      (err) => {
        this.isLoading = false;
        if (event) event.target.complete();
        this.showAlert('Error', 'Gagal memuat daftar order.');
      }
    );
  }

  handleRefresh(event: any) {
    this.loadOrders(event);
  }

  async confirmTakeOrder(orderId: number) {
    const alert = await this.alertController.create({
      header: 'Konfirmasi',
      message: 'Apakah Anda yakin ingin mengambil tugas pengiriman ini?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
        },
        {
          text: 'Ambil',
          handler: () => {
            this.prosesTakeOrder(orderId);
          },
        },
      ],
    });
    await alert.present();
  }

  async prosesTakeOrder(orderId: number) {
    const loading = await this.loadingController.create({ message: 'Mengambil tugas...' });
    await loading.present();

    this.apiService.takeOrder(orderId).subscribe(
      (res) => {
        loading.dismiss();
        this.showAlert('Sukses', 'Tugas berhasil diambil.');
        this.loadOrders(); // Muat ulang daftar order
      },
      (err) => {
        loading.dismiss();
        this.showAlert('Gagal', err.error.message || 'Tidak dapat mengambil tugas.');
      }
    );
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }
}
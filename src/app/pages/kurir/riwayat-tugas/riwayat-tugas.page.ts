// src/app/pages/kurir/riwayat-tugas/riwayat-tugas.page.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-riwayat-tugas',
  templateUrl: './riwayat-tugas.page.html',
  styleUrls: ['./riwayat-tugas.page.scss'],
  standalone: false
})
export class RiwayatTugasPage implements OnInit {
  myTasks: any[] = [];
  isLoading = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadMyTasks();
  }

  async loadMyTasks(event?: any) {
    this.isLoading = true;
    let loading: HTMLIonLoadingElement | undefined;
    if (!event) {
      loading = await this.loadingController.create({ message: 'Memuat tugas...' });
      await loading.present();
    }

    this.apiService.getMyTasks().subscribe(
      (res) => {
        this.myTasks = res.data;
        this.isLoading = false;
        if (loading) loading.dismiss();
        if (event) event.target.complete();
      },
      (err) => {
        this.isLoading = false;
        if (loading) loading.dismiss();
        if (event) event.target.complete();
        console.error('Gagal memuat tugas:', err);
      }
    );
  }

  handleRefresh(event: any) {
    this.loadMyTasks(event);
  }

  goToTaskDetail(taskId: number) {
    // Navigasi ke halaman detail tugas yang akan kita buat selanjutnya
    this.router.navigate(['/tugas-detail', taskId]);
  }
}
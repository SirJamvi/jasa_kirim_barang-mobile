// src/app/pages/pelanggan/lacak-kiriman/lacak-kiriman.page.ts

import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, AlertController, ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { Subscription, interval } from 'rxjs';

declare var L: any;

interface LeafletWindow extends Window {
  L: any;
}

@Component({
  selector: 'app-lacak-kiriman',
  templateUrl: './lacak-kiriman.page.html',
  styleUrls: ['./lacak-kiriman.page.scss'],
  standalone: false
})
export class LacakKirimanPage implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;

  pengirimanDetail: any;
  map: any;
  kurirMarker: any;
  locationSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    if (this.locationSub) {
      this.locationSub.unsubscribe();
    }
    // Bersihkan map jika ada
    if (this.map) {
      this.map.remove();
    }
  }

  async loadData() {
    const loading = await this.loadingController.create({ message: 'Memuat detail...' });
    await loading.present();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.apiService.getPengirimanDetail(Number(id)).subscribe(
        res => {
          this.pengirimanDetail = res.data;
          console.log('Pengiriman Detail:', this.pengirimanDetail); // Debug log
          loading.dismiss();
          
          // Perbaikan: Pastikan ada delay yang cukup untuk DOM siap
          setTimeout(() => {
            this.initMap();
          }, 500);
        },
        err => {
          loading.dismiss();
          console.error('Error loading data:', err);
          this.showAlert('Error', 'Gagal memuat detail pengiriman.');
        }
      );
    } else {
      loading.dismiss();
      this.showAlert('Error', 'ID pengiriman tidak valid.');
    }
  }

  initMap() {
    // Validasi data lokasi sebelum membuat peta
    if (!this.pengirimanDetail) {
      console.error('Pengiriman detail tidak tersedia');
      return;
    }

    // Cek apakah Leaflet sudah ter-load
    if (typeof L === 'undefined' || !L) {
      console.log('Leaflet belum ter-load, mencoba load...');
      this.loadLeaflet().then(() => {
        this.processMapInit();
      }).catch(err => {
        console.error('Gagal memuat Leaflet:', err);
        this.showAlert('Error', 'Gagal memuat komponen peta.');
      });
      return;
    }

    this.processMapInit();
  }

  processMapInit() {
    // Perbaikan: Validasi koordinat dengan lebih ketat
    const lat = this.pengirimanDetail.latitude;
    const lng = this.pengirimanDetail.longitude;
    
    console.log('Koordinat:', { lat, lng }); // Debug log

    // Cek apakah koordinat valid
    if (lat === null || lat === undefined || lng === null || lng === undefined || 
        isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      console.warn('Koordinat tidak valid, menggunakan koordinat default Jakarta');
      
      // Gunakan koordinat default (Jakarta) jika koordinat tidak valid
      this.initMapWithCoordinates(-6.3204, 107.3236, ' Menampilkan Jakarta');
      return;
    }

    // Koordinat valid, buat peta dengan koordinat sebenarnya
    this.initMapWithCoordinates(lat, lng, 'Posisi Kurir');
  }

  loadLeaflet(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Jika sudah ada, langsung resolve
      if (typeof L !== 'undefined' && L) {
        resolve();
        return;
      }

      // Load CSS terlebih dahulu
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);

      // Load JavaScript
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        // Tunggu sebentar untuk memastikan L tersedia
        setTimeout(() => {
          if (typeof L !== 'undefined' && L) {
            console.log('Leaflet berhasil dimuat');
            resolve();
          } else {
            reject('Leaflet gagal dimuat');
          }
        }, 100);
      };
      script.onerror = () => reject('Gagal memuat script Leaflet');
      document.head.appendChild(script);
    });
  }

  initMapWithCoordinates(lat: number, lng: number, popupText: string) {
    try {
      // Pastikan L tersedia
      if (typeof L === 'undefined' || !L) {
        console.error('Leaflet tidak tersedia');
        this.showAlert('Error', 'Komponen peta tidak tersedia.');
        return;
      }

      // Hapus peta yang ada jika sudah ada
      if (this.map) {
        this.map.remove();
      }

      // Pastikan element map tersedia
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Element map tidak ditemukan');
        return;
      }

      // Buat peta baru
      this.map = L.map('map').setView([lat, lng], 15);

      // Tambahkan tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Tambahkan marker
      this.kurirMarker = L.marker([lat, lng])
        .addTo(this.map)
        .bindPopup(popupText)
        .openPopup();

      console.log('Peta berhasil diinisialisasi');

      // Mulai tracking jika koordinat bukan default
      if (popupText === 'Posisi Kurir') {
        this.startTracking();
      }

    } catch (error) {
      console.error('Error membuat peta:', error);
      this.showAlert('Error', 'Gagal memuat peta. Pastikan koneksi internet stabil.');
    }
  }

  startTracking() {
    // Hentikan tracking yang sudah ada
    if (this.locationSub) {
      this.locationSub.unsubscribe();
    }

    // Mulai tracking baru
    this.locationSub = interval(5000).subscribe(() => {
      this.updateMarkerLocation();
    });
  }

  updateMarkerLocation() {
    if (!this.pengirimanDetail?.id) {
      return;
    }

    this.apiService.getPengirimanDetail(this.pengirimanDetail.id).subscribe(
      res => {
        const newLat = res.data.latitude;
        const newLng = res.data.longitude;
        
        // Validasi koordinat baru
        if (newLat !== null && newLat !== undefined && 
            newLng !== null && newLng !== undefined && 
            !isNaN(newLat) && !isNaN(newLng) &&
            newLat !== 0 && newLng !== 0) {
          
          if (this.kurirMarker) {
            this.kurirMarker.setLatLng([newLat, newLng]);
            console.log('Posisi marker diperbarui:', { newLat, newLng });
          }
        }

        // ✅ BARU: Update data pengiriman untuk bukti kirim terbaru
        this.pengirimanDetail = res.data;
      },
      err => {
        console.error('Gagal memperbarui lokasi kurir:', err);
      }
    );
  }

  // ✅ BARU: Fungsi untuk cek apakah ada bukti kirim
  hasBuktiKirim(): boolean {
    // Cukup cek properti bukti_kirim yang sudah berisi URL lengkap
    return this.pengirimanDetail && !!this.pengirimanDetail.bukti_kirim;
  }

  // ✅ SOLUSI: Sederhanakan fungsi ini
  getBuktiKirimUrl(): string {
    // Langsung kembalikan URL dari backend. Tidak perlu fallback lagi.
    return this.pengirimanDetail?.bukti_kirim || '';
  }

  // ✅ BARU: Fungsi untuk melihat bukti kirim dalam modal
  async viewBuktiKirim() {
    const alert = await this.alertController.create({
      header: 'Bukti Pengiriman',
      message: `
        <div style="text-align: center;">
          <img src="${this.getBuktiKirimUrl()}" 
               style="max-width: 100%; max-height: 400px; border-radius: 8px;" 
               alt="Bukti Pengiriman" />
          <p style="margin-top: 10px; font-size: 12px; color: #666;">
            Paket telah diterima oleh penerima
          </p>
        </div>
      `,
      buttons: ['Tutup'],
      cssClass: 'bukti-kirim-modal'
    });
    await alert.present();
  }

  // ✅ BARU: Handler untuk gambar bukti kirim error
  onBuktiImageError(event: any) {
    console.error('Error loading bukti kirim image:', event);
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJ1a3RpIFRpZGFrIERpdGVtdWthbjwvdGV4dD48L3N2Zz4=';
    event.target.alt = 'Bukti pengiriman tidak dapat dimuat';
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
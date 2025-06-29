// src/app/pages/pelanggan/buat-kiriman/buat-kiriman.page.ts

import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

// Declare Leaflet types
declare var L: any;

@Component({
  selector: 'app-buat-kiriman',
  templateUrl: './buat-kiriman.page.html',
  styleUrls: ['./buat-kiriman.page.scss'],
  standalone: false
})
export class BuatKirimanPage implements OnInit, OnDestroy {
  kirimanForm: FormGroup;
  jarak: number = 0;
  estimasiTotal: number = 0;
  tarifs: any[] = [];
  
  // Map variables
  private map: any;
  private startMarker: any;
  private endMarker: any;
  private routeControl: any;
  public leafletLoaded: boolean = false;
  
  // Default coordinates (Jakarta area)
  private defaultLat = -6.2088;
  private defaultLng = 106.8456;

  // Tambahkan properties untuk upload file
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.kirimanForm = this.fb.group({
      nama_penerima: ['', [Validators.required, Validators.minLength(2)]],
      telepon_penerima: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{8,15}$/)]],
      alamat_tujuan: ['', [Validators.required, Validators.minLength(10)]],
      jenis_barang: ['', [Validators.required, Validators.minLength(2)]],
      estimasi_berat: ['', [Validators.required, Validators.min(0.1), Validators.max(1000)]],
      tarif_id: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.loadTarif();
    this.loadLeafletAndInitializeMap();
    this.setupFormValueChanges();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private setupFormValueChanges() {
    this.kirimanForm.valueChanges.subscribe(() => {
      this.calculateEstimation();
    });
  }

  private calculateEstimation() {
    const { tarif_id, estimasi_berat } = this.kirimanForm.value;
    
    if (tarif_id && estimasi_berat && this.jarak > 0) {
      const selectedTarif = this.tarifs.find(t => t.id === tarif_id);
      if (selectedTarif) {
        this.estimasiTotal = selectedTarif.tarif_per_km * this.jarak * estimasi_berat;
      }
    } else {
      this.estimasiTotal = 0;
    }
  }

  private loadLeafletLibrary(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof L !== 'undefined') {
        this.leafletLoaded = true;
        resolve();
        return;
      }
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        this.leafletLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Leaflet library'));
      document.head.appendChild(script);
    });
  }

  private async loadLeafletAndInitializeMap() {
    try {
      await this.loadLeafletLibrary();
      await new Promise(res => setTimeout(res, 500));
      await this.initializeMap();
    } catch (error) {
      console.error('Error loading Leaflet or initializing map:', error);
      this.showAlert('Error', 'Gagal memuat peta. Pastikan koneksi internet stabil.');
    }
  }

  private async initializeMap() {
    if (!this.leafletLoaded || typeof L === 'undefined') throw new Error('Leaflet library not loaded');
    const container = document.getElementById('map-buat-kiriman');
    if (!container) throw new Error('Map container not found');

    this.map = L.map('map-buat-kiriman').setView([this.defaultLat, this.defaultLng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.startMarker = L.marker([-6.3204, 107.3236])
      .addTo(this.map)
      .bindPopup('Lokasi Awal').openPopup();

    this.map.on('click', (e: any) => this.setDestination(e.latlng.lat, e.latlng.lng));
    this.getCurrentLocation();
  }

  private getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude: lat, longitude: lng } = pos.coords;
          this.startMarker.setLatLng([lat, lng]);
          this.map.setView([lat, lng], 15);
          this.startMarker.bindPopup('Lokasi Anda').openPopup();
        },
        err => console.log('Geolocation error:', err),
        { timeout: 10000, enableHighAccuracy: true, maximumAge: 300000 }
      );
    }
  }

  private setDestination(lat: number, lng: number) {
    if (!this.map) return;
    if (this.endMarker) this.map.removeLayer(this.endMarker);
    if (this.routeControl) this.map.removeLayer(this.routeControl);

    this.endMarker = L.marker([lat, lng]).addTo(this.map).bindPopup('Tujuan').openPopup();
    this.calculateDistance();
  }

  private calculateDistance() {
    if (!this.startMarker || !this.endMarker) return;
    const s = this.startMarker.getLatLng();
    const e = this.endMarker.getLatLng();
    this.jarak = this.getDistanceFromLatLonInKm(s.lat, s.lng, e.lat, e.lng);
    this.calculateEstimation();
    this.addRoute(s, e);
  }

  private getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private addRoute(start: any, end: any) {
    if (this.routeControl) this.map.removeLayer(this.routeControl);
    this.routeControl = L.polyline([[start.lat, start.lng], [end.lat, end.lng]], { weight: 4, opacity: 0.7 }).addTo(this.map);
    this.map.fitBounds(this.routeControl.getBounds(), { padding: [20, 20] });
  }

  loadTarif() {
    this.apiService.getTarif().subscribe(
      res => this.tarifs = res.data || [],
      err => {
        console.error('Error loading tarif:', err);
        this.showAlert('Error', 'Gagal memuat daftar tarif.');
      }
    );
  }

  // Method untuk pilih file
  pilihFile() {
    this.fileInput.nativeElement.click();
  }

  // Method handle file selection
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.showAlert('Error', 'Hanya file gambar yang diperbolehkan.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.showAlert('Error', 'Ukuran file maksimal 5MB.');
      return;
    }
    this.selectedFile = file;
  }

  // Update method buatKiriman
  async buatKiriman() {
    if (this.kirimanForm.invalid || this.jarak === 0) {
      return;
    }

    const loading = await this.loadingController.create({ message: 'Membuat order...' });
    await loading.present();

    const formData = { ...this.kirimanForm.value, jarak_km: this.jarak };

    this.apiService.createPengiriman(formData).subscribe(
      async res => {
        const pengirimanId = res.data.id;
        if (this.selectedFile) {
          await this.uploadBuktiPembayaran(pengirimanId);
        }
        await loading.dismiss();
        await this.showAlert('Sukses', `Order berhasil dibuat dengan nomor resi: ${res.data.nomor_resi}`);
        this.resetForm();
        this.router.navigate(['/tabs-pelanggan/riwayat']);
      },
      async err => {
        await loading.dismiss();
        this.showAlert('Gagal', err.error?.message || 'Gagal membuat order.');
      }
    );
  }

  // Method upload bukti pembayaran
  private async uploadBuktiPembayaran(pengirimanId: number) {
    if (!this.selectedFile) return;
    const data = new FormData();
    data.append('pengiriman_id', pengirimanId.toString());
    data.append('metode_pembayaran', 'transfer');
    data.append('bukti_file', this.selectedFile);
    return this.apiService.uploadBuktiPembayaran(data).toPromise();
  }

  private resetForm() {
    this.kirimanForm.reset();
    this.jarak = 0;
    this.estimasiTotal = 0;
    this.selectedFile = null;
    if (this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }

    // Reset map markers
    if (this.map) {
      if (this.endMarker) { this.map.removeLayer(this.endMarker); this.endMarker = null; }
      if (this.routeControl) { this.map.removeLayer(this.routeControl); this.routeControl = null; }
      this.map.setView([this.defaultLat, this.defaultLng], 13);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID').format(amount);
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });
    await alert.present();
  }
}
  
// src/app/pages/pelanggan/buat-kiriman/buat-kiriman.page.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
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
    // Hitung ulang estimasi total ketika form berubah
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

  private async loadLeafletAndInitializeMap() {
    try {
      // Load Leaflet library if not already loaded
      await this.loadLeafletLibrary();
      
      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await this.initializeMap();
    } catch (error) {
      console.error('Error loading Leaflet or initializing map:', error);
      this.showAlert('Error', 'Gagal memuat peta. Pastikan koneksi internet stabil.');
    }
  }

  private loadLeafletLibrary(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if Leaflet is already loaded
      if (typeof L !== 'undefined') {
        this.leafletLoaded = true;
        resolve();
        return;
      }

      // Load Leaflet CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);

      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        this.leafletLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load Leaflet library'));
      };
      document.head.appendChild(script);
    });
  }

  private async initializeMap() {
    try {
      if (!this.leafletLoaded || typeof L === 'undefined') {
        throw new Error('Leaflet library not loaded');
      }

      // Check if map container exists
      const mapContainer = document.getElementById('map-buat-kiriman');
      if (!mapContainer) {
        throw new Error('Map container not found');
      }

      // Initialize map
      this.map = L.map('map-buat-kiriman').setView([this.defaultLat, this.defaultLng], 13);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Add start marker (default location - could be user's current location)
      this.startMarker = L.marker([this.defaultLat, this.defaultLng])
        .addTo(this.map)
        .bindPopup('Lokasi Awal')
        .openPopup();

      // Add click event to set destination
      this.map.on('click', (e: any) => {
        this.setDestination(e.latlng.lat, e.latlng.lng);
      });

      // Try to get user's current location
      this.getCurrentLocation();

      console.log('Map initialized successfully');

    } catch (error) {
      console.error('Error initializing map:', error);
      throw error;
    }
  }

  private getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Update start marker with current location
          if (this.startMarker && this.map) {
            this.startMarker.setLatLng([lat, lng]);
            this.map.setView([lat, lng], 15);
            this.startMarker.bindPopup('Lokasi Anda').openPopup();
          }
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Keep using default location
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 300000
        }
      );
    }
  }

  private setDestination(lat: number, lng: number) {
    if (!this.map) return;

    // Remove existing end marker
    if (this.endMarker) {
      this.map.removeLayer(this.endMarker);
    }

    // Remove existing route
    if (this.routeControl) {
      this.map.removeLayer(this.routeControl);
    }

    // Add new end marker
    this.endMarker = L.marker([lat, lng])
      .addTo(this.map)
      .bindPopup('Tujuan')
      .openPopup();

    // Calculate distance
    this.calculateDistance();
  }

  private calculateDistance() {
    if (this.startMarker && this.endMarker) {
      const startLatLng = this.startMarker.getLatLng();
      const endLatLng = this.endMarker.getLatLng();
      
      // Calculate straight line distance (Haversine formula)
      const distance = this.getDistanceFromLatLonInKm(
        startLatLng.lat, startLatLng.lng,
        endLatLng.lat, endLatLng.lng
      );
      
      this.jarak = distance;
      this.calculateEstimation();

      // Add route visualization
      this.addRoute(startLatLng, endLatLng);
    }
  }

  private getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private addRoute(start: any, end: any) {
    if (!this.map) return;

    // Remove existing route
    if (this.routeControl) {
      this.map.removeLayer(this.routeControl);
    }

    // Simple polyline connection (for basic routing)
    this.routeControl = L.polyline([
      [start.lat, start.lng],
      [end.lat, end.lng]
    ], {
      color: 'blue',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 5'
    }).addTo(this.map);

    // Fit map to show entire route
    this.map.fitBounds(this.routeControl.getBounds(), { padding: [20, 20] });
  }

  loadTarif() {
    this.apiService.getTarif().subscribe(
      (res) => {
        this.tarifs = res.data || [];
      },
      (err) => {
        console.error('Error loading tarif:', err);
        this.showAlert('Error', 'Gagal memuat daftar tarif.');
      }
    );
  }

  async buatKiriman() {
    if (this.kirimanForm.invalid) {
      this.showFormErrors();
      return;
    }

    if (this.jarak === 0) {
      this.showAlert('Error', 'Silakan pilih lokasi tujuan di peta terlebih dahulu.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Membuat order...',
      spinner: 'crescent'
    });
    await loading.present();

    // Tambahkan jarak_km ke form data
    const formData = {
      ...this.kirimanForm.value,
      jarak_km: this.jarak
    };

    this.apiService.createPengiriman(formData).subscribe(
      async (res) => {
        await loading.dismiss();
        const nomorResi = res?.data?.nomor_resi || '-';
        await this.showAlert('Sukses', `Order berhasil dibuat dengan nomor resi: ${nomorResi}`);
        this.resetForm();
        this.router.navigate(['/tabs-pelanggan/riwayat']);
      },
      async (err) => {
        await loading.dismiss();
        console.error('Error creating order:', err);
        const message = err.error?.message || 'Gagal membuat order. Silakan coba lagi.';
        await this.showAlert('Gagal', message);
      }
    );
  }

  private showFormErrors() {
    const errors = [];
    const controls = this.kirimanForm.controls;

    if (controls['nama_penerima'].errors) {
      errors.push('• Nama penerima tidak valid (minimal 2 karakter)');
    }
    if (controls['telepon_penerima'].errors) {
      errors.push('• Nomor telepon tidak valid (8-15 digit)');
    }
    if (controls['alamat_tujuan'].errors) {
      errors.push('• Alamat tujuan tidak valid (minimal 10 karakter)');
    }
    if (controls['jenis_barang'].errors) {
      errors.push('• Jenis barang tidak valid (minimal 2 karakter)');
    }
    if (controls['estimasi_berat'].errors) {
      errors.push('• Estimasi berat tidak valid (0.1 - 1000 kg)');
    }
    if (controls['tarif_id'].errors) {
      errors.push('• Silakan pilih jenis layanan');
    }

    this.showAlert('Form Tidak Valid', errors.join('\n'));
  }

  private resetForm() {
    this.kirimanForm.reset();
    this.jarak = 0;
    this.estimasiTotal = 0;
    
    // Reset map markers
    if (this.map) {
      if (this.endMarker) {
        this.map.removeLayer(this.endMarker);
        this.endMarker = null;
      }
      if (this.routeControl) {
        this.map.removeLayer(this.routeControl);
        this.routeControl = null;
      }
      
      // Reset map view to default location
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
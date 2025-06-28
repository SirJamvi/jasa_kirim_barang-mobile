// src/app/services/api.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private authService = inject(AuthService);

  constructor(private http: HttpClient) {}

  // Fungsi untuk mendapatkan semua jenis tarif
  getTarif(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tarifs`);
  }

  // Fungsi untuk membuat pengiriman baru
  createPengiriman(data: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.post(`${this.apiUrl}/pengiriman`, data, { headers });
  }

  // Fungsi untuk mendapatkan riwayat pengiriman pelanggan
  getHistory(): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.get(`${this.apiUrl}/pengiriman/history`, { headers });
  }

  // Fungsi untuk logout
  logout(): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.post(`${this.apiUrl}/logout`, {}, { headers });
  }

  // Fungsi untuk mendapatkan detail pengiriman
  getPengirimanDetail(id: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.get(`${this.apiUrl}/pengiriman/${id}`, { headers });
  }

  // Fungsi untuk mendapatkan lokasi terakhir kurir
  getLatestLocation(pengirimanId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.get(`${this.apiUrl}/tracking/latest/${pengirimanId}`, { headers });
  }

  // Fungsi untuk upload bukti pembayaran
  uploadBuktiPembayaran(data: FormData): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.post(`${this.apiUrl}/pembayaran/upload`, data, { headers });
  }

  // --- FUNGSI UNTUK KURIR ---

  // Fungsi untuk melihat order yang tersedia
  getAvailableOrders(): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.get(`${this.apiUrl}/kurir/orders`, { headers });
  }

  // Fungsi untuk mengambil order
  takeOrder(pengirimanId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.post(`${this.apiUrl}/kurir/orders/${pengirimanId}/take`, {}, { headers });
  }

  // Fungsi untuk melihat semua tugas kurir
  getMyTasks(): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.get(`${this.apiUrl}/kurir/tasks`, { headers });
  }

  // Fungsi untuk mendapatkan detail tugas
  getTaskDetail(taskId: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.apiUrl}/kurir/tasks/${taskId}`, { headers });
  }

  // Fungsi untuk mendapatkan daftar status
  getStatuses(): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.get(`${this.apiUrl}/statuses`, { headers });
  }

  // Fungsi untuk update status pengiriman
  updateStatus(taskId: number, data: { status_id: number, catatan: string }): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.post(`${this.apiUrl}/kurir/orders/${taskId}/update-status`, data, { headers });
  }

  // ✅ Fungsi untuk upload bukti kirim
  uploadBuktiKirim(taskId: number, formData: FormData): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Jangan set Content-Type secara manual saat menggunakan FormData
    });

    return this.http.post(`${this.apiUrl}/kurir/tasks/${taskId}/upload-bukti`, formData, { headers });
  }
}

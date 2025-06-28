// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Fungsi untuk registrasi pelanggan
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Fungsi untuk login
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        // Simpan token dan data user setelah login berhasil
        if (response.access_token && response.user) {
          localStorage.setItem('auth_token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  // Fungsi untuk logout
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // Cek apakah ada token
  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // Ambil token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // --- TAMBAHKAN FUNGSI INI ---
  // Fungsi untuk mengambil data user dari local storage
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

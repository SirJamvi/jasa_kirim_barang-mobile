// src/app/pages/login/login.page.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {}

  async login() {
    if (this.loginForm.invalid) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Mohon tunggu...',
    });
    await loading.present();

    this.authService.login(this.loginForm.value).subscribe(
      async (res) => {
        await loading.dismiss();

        // ✅ Cek peran user setelah login
        const userRole = res.user.role;

        if (userRole === 'pelanggan') {
          this.router.navigateByUrl('/tabs-pelanggan', { replaceUrl: true });
        } else if (userRole === 'kurir') {
          this.router.navigateByUrl('/tabs-kurir/daftar-order', { replaceUrl: true });
        } else {
          // ✅ Role tidak valid
          this.showAlert('Login Gagal', 'Peran pengguna tidak valid untuk aplikasi ini.');
          this.authService.logout();
        }
      },
      async (err) => {
        await loading.dismiss();
        this.showAlert('Login Gagal', err.error.message || 'Terjadi kesalahan pada server.');
      }
    );
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}

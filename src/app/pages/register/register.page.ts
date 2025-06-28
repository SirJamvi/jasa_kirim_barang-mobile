import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', Validators.required],
      address: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],
    });
  }

  ngOnInit() {}

  async register() {
    if (this.registerForm.invalid) {
      return;
    }
    
    if (this.registerForm.value.password !== this.registerForm.value.password_confirmation) {
        this.showAlert('Error', 'Password dan Konfirmasi Password tidak cocok.');
        return;
    }

    const loading = await this.loadingController.create({ message: 'Mendaftarkan akun...' });
    await loading.present();

    this.authService.register(this.registerForm.value).subscribe(
      async (res) => {
        await loading.dismiss();
        this.showAlert('Sukses', 'Registrasi berhasil! Silakan login dengan akun Anda.');
        this.router.navigateByUrl('/login');
      },
      async (err) => {
        await loading.dismiss();
        
        const errors = err.error.errors;
        let message = 'Terjadi kesalahan pada server.';
        if (errors) {
            // Mengubah objek error dari Laravel menjadi string yang mudah dibaca
            message = Object.values(errors).flat().join('<br>');
        }
        this.showAlert('Registrasi Gagal', message);
      }
    );
  }
  
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
      // Agar bisa menampilkan tag <br>
      mode: 'ios' 
    });
    await alert.present();
  }
}
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-tugas-detail',
  templateUrl: './tugas-detail.page.html',
  styleUrls: ['./tugas-detail.page.scss'],
  standalone: false
})
export class TugasDetailPage implements OnInit {
  taskDetail: any;
  statuses: any[] = [];
  taskId: number = 0;
  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.taskId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTaskDetail();
    this.loadStatuses();
  }

  async loadTaskDetail() {
    const loading = await this.loadingController.create({ 
      message: 'Memuat detail tugas...',
      cssClass: 'custom-loading'
    });
    await loading.present();

    this.apiService.getTaskDetail(this.taskId).subscribe({
      next: (res) => {
        console.log('Task detail response:', res);
        this.taskDetail = res.data;
        loading.dismiss();
      },
      error: (err) => {
        console.error('Error loading task detail:', err);
        loading.dismiss();
        this.showAlert('Error', 'Gagal memuat detail tugas: ' + (err.message || 'Unknown error'));
      }
    });
  }

  loadStatuses() {
    this.apiService.getStatuses().subscribe({
      next: (res) => {
        console.log('Statuses response:', res);
        this.statuses = res;
      },
      error: (err) => {
        console.error('Error loading statuses:', err);
        this.showAlert('Error', 'Gagal memuat opsi status: ' + (err.message || 'Unknown error'));
      }
    });
  }

  async presentUpdateStatusAlert() {
    if (this.statuses.length === 0) {
      this.showAlert('Info', 'Opsi status belum termuat, silakan coba lagi.');
      return;
    }

    const alertInputs = this.statuses.map(status => ({
      name: 'status_id',
      type: 'radio' as const,
      label: status.nama_status,
      value: status.id,
      checked: this.taskDetail.status_pengiriman === status.nama_status
    }));

    const alert = await this.alertController.create({
      header: 'Perbarui Status Pengiriman',
      inputs: alertInputs,
      buttons: [
        { 
          text: 'Batal', 
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Simpan',
          cssClass: 'alert-button-confirm',
          handler: (selectedStatusId) => {
            if (selectedStatusId === undefined) return false;
            this.prosesUpdateStatus(selectedStatusId);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async prosesUpdateStatus(statusId: number) {
    const loading = await this.loadingController.create({ 
      message: 'Memperbarui status...',
      cssClass: 'custom-loading'
    });
    await loading.present();

    const data = {
      status_id: statusId,
      catatan: 'Status diperbarui via aplikasi kurir'
    };

    this.apiService.updateStatus(this.taskId, data).subscribe({
      next: (res) => {
        console.log('Update status response:', res);
        loading.dismiss();
        this.showAlert('Sukses', 'Status berhasil diperbarui.');
        this.loadTaskDetail();
      },
      error: (err) => {
        console.error('Error updating status:', err);
        loading.dismiss();
        this.showAlert('Gagal', 'Gagal memperbarui status: ' + (err.message || 'Unknown error'));
      }
    });
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    } else {
      console.error('File input tidak ditemukan!');
      this.showAlert('Error', 'File input tidak ditemukan!');
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.showAlert('Error', 'Hanya file gambar (JPG, PNG, GIF) yang diperbolehkan.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.showAlert('Error', 'Ukuran file terlalu besar. Maksimal 5MB.');
        return;
      }

      this.selectedFile = file;
      this.showUploadConfirmation();
    }
  }

  async showUploadConfirmation() {
    if (!this.selectedFile) return;

    const alert = await this.alertController.create({
      header: 'Konfirmasi Upload',
      message: `Apakah Anda yakin ingin mengupload file "${this.selectedFile.name}"?`,
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
          handler: () => {
            this.selectedFile = null;
            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          }
        },
        {
          text: 'Upload',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.uploadBuktiKirim();
          }
        }
      ]
    });
    await alert.present();
  }

  async uploadBuktiKirim() {
    if (!this.selectedFile) {
      this.showAlert('Error', 'Tidak ada file untuk diupload.');
      return;
    }

    const loading = await this.loadingController.create({ 
      message: 'Mengupload bukti pengiriman...',
      cssClass: 'custom-loading'
    });
    await loading.present();

    const formData = new FormData();
    formData.append('bukti_kirim', this.selectedFile);

    console.log('Uploading file to task ID:', this.taskId);
    console.log('FormData contents:', formData.get('bukti_kirim'));

    this.apiService.uploadBuktiKirim(this.taskId, formData).subscribe({
      next: (res) => {
        console.log('Upload success response:', res);
        loading.dismiss();
        this.selectedFile = null;

        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        this.showAlert('Sukses', 'Bukti pengiriman berhasil diupload.');
        this.loadTaskDetail();
      },
      error: (err) => {
        console.error('Upload error details:', err);
        loading.dismiss();

        let errorMessage = 'Gagal mengupload bukti pengiriman.';
        if (err.status === 404) {
          errorMessage += ' Endpoint tidak ditemukan. Pastikan API server berjalan.';
        } else if (err.status === 422) {
          errorMessage += ' Format file tidak valid.';
        } else if (err.error && err.error.message) {
          errorMessage += ' ' + err.error.message;
        }

        this.showAlert('Gagal', errorMessage);
      }
    });
  }

  canUploadBukti(): boolean {
    if (!this.taskDetail) return false;
    return this.taskDetail.status_pengiriman !== 'Sampai Tujuan';
  }

  hasBuktiKirim(): boolean {
    return this.taskDetail && !!this.taskDetail.bukti_kirim_path;
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

  // ✅ Tambahkan method ini untuk fallback gambar
  onImageError(event: any) {
    console.error('Error loading image:', event);
    event.target.src = 'assets/images/no-image-placeholder.png';
  }
}

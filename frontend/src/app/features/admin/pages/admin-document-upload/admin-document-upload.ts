import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Sidebar],
  templateUrl: './admin-document-upload.html',
  styleUrl: './admin-document-upload.css'
})
export class AdminDocumentUpload {
  private router = inject(Router);
  private http = inject(HttpClient);

  private notification = inject(NotificationService);

  isLoading = signal(false);

  formData = {
    title: '',
    type: 'course_material',
    assign_to: 'entire', // 'entire', 'class'
    class_name: '',
    file_url: '' // Simulating a file upload for now
  };

  onSubmit() {
    if (!this.formData.title || !this.formData.file_url) {
      this.notification.warning('Vui lòng nhập tên tài liệu và URL tệp (Mô phỏng upload)', 'Cảnh báo');
      return;
    }
    
    if (this.formData.assign_to === 'class' && !this.formData.class_name) {
      this.notification.warning('Vui lòng nhập mã lớp học', 'Cảnh báo');
      return;
    }

    this.isLoading.set(true);

    const payload = {
      title: this.formData.title,
      type: this.formData.type,
      class_name: this.formData.assign_to === 'class' ? this.formData.class_name : null,
      file_url: this.formData.file_url
    };

    this.http.post('http://localhost:5000/api/admin/documents/upload', payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.notification.success('Tải lên tài liệu thành công!', 'Thành công');
        setTimeout(() => this.router.navigate(['/admin/documents']), 1000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notification.error(err.error?.message || 'Có lỗi xảy ra khi tải lên', 'Lỗi');
      }
    });
  }
}

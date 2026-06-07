import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-class-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Sidebar],
  templateUrl: './admin-class-create.html',
  styleUrl: './admin-class-create.css'
})
export class AdminClassCreate {
  private router = inject(Router);
  private http = inject(HttpClient);

  private notification = inject(NotificationService);

  isLoading = signal(false);

  formData = {
    class_code: '',
    class_name: '',
    faculty_id: 1,
    lecturer: ''
  };

  onSubmit() {
    if (!this.formData.class_code || !this.formData.class_name) {
      this.notification.warning('Vui lòng điền mã lớp và tên lớp', 'Cảnh báo');
      return;
    }

    this.isLoading.set(true);

    this.http.post('http://localhost:5000/api/admin/classes', this.formData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.notification.success('Thêm lớp học thành công!', 'Thành công');
        setTimeout(() => this.router.navigate(['/admin/classes']), 1000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notification.error(err.error?.message || 'Có lỗi xảy ra khi tạo lớp học', 'Lỗi');
      }
    });
  }
}

import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-student-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Sidebar],
  templateUrl: './admin-student-create.html',
  styleUrl: './admin-student-create.css'
})
export class AdminStudentCreate implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  private notification = inject(NotificationService);

  isLoading = signal(false);

  formData = {
    email: '',
    password: '',
    student_code: '',
    full_name: '',
    dob: '',
    gender: 'Nam',
    address: '',
    faculty_id: 1, // Assume faculty 1 exists
    major: '',
    class_name: '',
    phone: ''
  };

  ngOnInit() {
    this.http.get<any>('http://localhost:5000/api/admin/students/next-mssv').subscribe({
      next: (res) => {
        if (res.success) {
          this.formData.student_code = res.data;
        }
      }
    });
  }

  onSubmit() {
    if (!this.formData.email || !this.formData.password || !this.formData.full_name || !this.formData.student_code) {
      this.notification.warning('Vui lòng điền các trường bắt buộc (Email, Mật khẩu, MSSV, Họ tên)', 'Cảnh báo');
      return;
    }

    this.isLoading.set(true);

    this.http.post('http://localhost:5000/api/admin/students', this.formData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.notification.success('Thêm sinh viên thành công!', 'Thành công');
        setTimeout(() => {
          this.router.navigate(['/students/list']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notification.error(err.error?.message || 'Có lỗi xảy ra khi tạo sinh viên', 'Lỗi');
      }
    });
  }
}

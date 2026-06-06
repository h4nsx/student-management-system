import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';

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

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

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
      this.errorMessage.set('Vui lòng điền các trường bắt buộc (Email, Mật khẩu, MSSV, Họ tên)');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.http.post('http://localhost:5000/api/admin/students', this.formData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Thêm sinh viên thành công!');
        setTimeout(() => {
          this.router.navigate(['/students/list']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Có lỗi xảy ra khi tạo sinh viên');
      }
    });
  }
}

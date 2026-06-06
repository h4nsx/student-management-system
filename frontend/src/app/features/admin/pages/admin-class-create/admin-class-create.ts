import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';

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

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  formData = {
    class_code: '',
    class_name: '',
    faculty_id: 1,
    lecturer: ''
  };

  onSubmit() {
    if (!this.formData.class_code || !this.formData.class_name) {
      this.errorMessage.set('Vui lòng điền mã lớp và tên lớp');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.http.post('http://localhost:5000/api/admin/classes', this.formData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Thêm lớp học thành công!');
        setTimeout(() => this.router.navigate(['/admin/classes']), 1000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Có lỗi xảy ra khi tạo lớp học');
      }
    });
  }
}

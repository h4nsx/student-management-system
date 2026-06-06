import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-admin-announcement-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Sidebar],
  templateUrl: './admin-announcement-create.html',
  styleUrl: './admin-announcement-create.css'
})
export class AdminAnnouncementCreate implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  faculties = signal<any[]>([]);
  classes = signal<any[]>([]);

  formData = {
    title: '',
    content: '',
    audience: 'all', // 'all', 'faculty', 'class'
    target_id: ''
  };

  ngOnInit() {
    this.http.get<any>('http://localhost:5000/api/admin/faculties').subscribe({
      next: (res) => { if (res.success) this.faculties.set(res.data); }
    });
    this.http.get<any>('http://localhost:5000/api/admin/classes').subscribe({
      next: (res) => { if (res.success) this.classes.set(res.data); }
    });
  }

  onSubmit() {
    if (!this.formData.title || !this.formData.content) {
      this.errorMessage.set('Vui lòng điền đầy đủ tiêu đề và nội dung.');
      return;
    }
    
    if (this.formData.audience !== 'all' && !this.formData.target_id) {
      this.errorMessage.set('Vui lòng nhập mã lớp học hoặc mã khoa.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const payload = {
      title: this.formData.title,
      content: this.formData.content,
      audience: this.formData.audience,
      target_id: this.formData.audience === 'all' ? null : this.formData.target_id,
      status: 'published'
    };

    this.http.post('http://localhost:5000/api/admin/announcements', payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Đã đăng thông báo thành công!');
        setTimeout(() => this.router.navigate(['/admin/announcements']), 1000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Có lỗi xảy ra khi tạo thông báo');
      }
    });
  }
}

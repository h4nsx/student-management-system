import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { NotificationService } from '../../../../core/services/notification.service';

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

  private notification = inject(NotificationService);

  isLoading = signal(false);

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
      this.notification.warning('Vui lòng điền đầy đủ tiêu đề và nội dung.', 'Cảnh báo');
      return;
    }
    
    if (this.formData.audience !== 'all' && !this.formData.target_id) {
      this.notification.warning('Vui lòng nhập mã lớp học hoặc mã khoa.', 'Cảnh báo');
      return;
    }

    this.isLoading.set(true);

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
        this.notification.success('Đã đăng thông báo thành công!', 'Thành công');
        setTimeout(() => this.router.navigate(['/admin/announcements']), 1000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notification.error(err.error?.message || 'Có lỗi xảy ra khi tạo thông báo', 'Lỗi');
      }
    });
  }
}

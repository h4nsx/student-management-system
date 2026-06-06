import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-admin-announcement-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Sidebar],
  templateUrl: './admin-announcement-edit.html',
  styleUrl: './admin-announcement-edit.css'
})
export class AdminAnnouncementEdit implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  announcementId = signal<number | null>(null);
  isLoading = signal(false);
  isFetching = signal(true);
  errorMessage = signal('');
  successMessage = signal('');

  faculties = signal<any[]>([]);
  classes = signal<any[]>([]);

  formData = {
    title: '',
    content: '',
    audience: 'all',
    target_id: '',
    status: 'published'
  };

  ngOnInit() {
    this.http.get<any>('http://localhost:5000/api/admin/faculties').subscribe({
      next: (res) => { if (res.success) this.faculties.set(res.data); }
    });
    this.http.get<any>('http://localhost:5000/api/admin/classes').subscribe({
      next: (res) => { if (res.success) this.classes.set(res.data); }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.announcementId.set(parseInt(id, 10));
        this.fetchAnnouncement();
      }
    });
  }

  fetchAnnouncement() {
    this.http.get<any>(`http://localhost:5000/api/admin/announcements/${this.announcementId()}`).subscribe({
      next: (res) => {
        if (res.success) {
          const data = res.data;
          this.formData = {
            title: data.title,
            content: data.content,
            audience: data.audience,
            target_id: data.target_id || '',
            status: data.status
          };
        }
        this.isFetching.set(false);
      },
      error: () => {
        this.errorMessage.set('Không thể tải thông báo');
        this.isFetching.set(false);
      }
    });
  }

  onSubmit() {
    if (!this.formData.title || !this.formData.content) {
      this.errorMessage.set('Vui lòng điền đầy đủ tiêu đề và nội dung.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const payload = {
      title: this.formData.title,
      content: this.formData.content,
      audience: this.formData.audience,
      target_id: this.formData.audience === 'all' ? null : this.formData.target_id,
      status: this.formData.status
    };

    this.http.put(`http://localhost:5000/api/admin/announcements/${this.announcementId()}`, payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Đã lưu thay đổi!');
        setTimeout(() => this.router.navigate(['/admin/announcements']), 1000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Có lỗi xảy ra khi cập nhật thông báo');
      }
    });
  }
}

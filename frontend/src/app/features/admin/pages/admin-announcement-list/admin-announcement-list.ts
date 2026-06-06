import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-admin-announcement-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Navbar, Sidebar],
  templateUrl: './admin-announcement-list.html',
  styleUrl: './admin-announcement-list.css'
})
export class AdminAnnouncementList implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  announcements = signal<any[]>([]);
  isLoading = signal(true);
  searchText = signal('');

  ngOnInit() {
    this.fetchAnnouncements();
  }

  fetchAnnouncements() {
    this.isLoading.set(true);
    let url = 'http://localhost:5000/api/admin/announcements';
    if (this.searchText()) url += `?search=${encodeURIComponent(this.searchText())}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (res.success) this.announcements.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch() {
    this.fetchAnnouncements();
  }

  archiveAnnouncement(id: number) {
    if (confirm('Bạn có chắc chắn muốn lưu trữ thông báo này?')) {
      this.http.put(`http://localhost:5000/api/admin/announcements/${id}/archive`, {}).subscribe({
        next: () => this.fetchAnnouncements()
      });
    }
  }

  getAudienceLabel(announcement: any): string {
    if (announcement.audience === 'all') return 'Toàn trường';
    if (announcement.audience === 'faculty') return `Khoa: ${announcement.target_id || 'N/A'}`;
    if (announcement.audience === 'class') return `Lớp: ${announcement.target_id || 'N/A'}`;
    return announcement.audience;
  }
}

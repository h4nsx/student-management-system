import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { AuthService } from '../../../../core/services/auth.service';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, Navbar, Sidebar, LoadingSpinner],
  templateUrl: './notification-list.html',
  styleUrl: './notification-list.css',
})
export class NotificationList implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  notifications = signal<Notification[]>([]);
  isLoading = signal(true);
  filter = signal<string>('all'); // all, unread, verification, university, class, system

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (res: any) => {
        this.fetchNotifications();
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  fetchNotifications() {
    this.http.get<any>('http://localhost:5000/api/notifications').subscribe({
      next: (res) => {
        if (res.success) {
          this.notifications.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  markAsRead(id: number | 'all') {
    // Optimistic UI update
    if (id === 'all') {
      this.notifications.update(nots => nots.map(n => ({ ...n, is_read: true })));
    } else {
      this.notifications.update(nots => nots.map(n => n.id === id ? { ...n, is_read: true } : n));
    }

    this.http.put(`http://localhost:5000/api/notifications/${id}/read`, {}).subscribe({
      error: (err) => {
        console.error('Failed to mark as read', err);
      }
    });
  }

  deleteNotification(id: number) {
    // Optimistic update
    this.notifications.update(nots => nots.filter(n => n.id !== id));

    this.http.delete(`http://localhost:5000/api/notifications/${id}`).subscribe({
      error: (err) => {
        console.error('Failed to delete', err);
      }
    });
  }

  get filteredNotifications() {
    const f = this.filter();
    const all = this.notifications();
    if (f === 'all') return all;
    if (f === 'unread') return all.filter(n => !n.is_read);
    return all.filter(n => n.type === f);
  }
}

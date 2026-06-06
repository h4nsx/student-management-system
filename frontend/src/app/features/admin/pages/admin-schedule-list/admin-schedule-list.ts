import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-admin-schedule-list',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Sidebar],
  templateUrl: './admin-schedule-list.html',
  styleUrl: './admin-schedule-list.css'
})
export class AdminScheduleList implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  schedules = signal<any[]>([]);
  isLoading = signal(true);
  successMessage = signal('');

  days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  activeTab = signal('weekly');

  ngOnInit() {
    this.fetchSchedules();
  }

  fetchSchedules() {
    this.isLoading.set(true);
    this.http.get<any>('http://localhost:5000/api/admin/schedules').subscribe({
      next: (res) => {
        if (res.success) {
          const dayMap: any = {
            'Monday': 'Thứ 2',
            'Tuesday': 'Thứ 3',
            'Wednesday': 'Thứ 4',
            'Thursday': 'Thứ 5',
            'Friday': 'Thứ 6',
            'Saturday': 'Thứ 7',
            'Sunday': 'Chủ nhật'
          };
          const data = res.data.map((s: any) => ({ 
            ...s, 
            day_of_week: dayMap[s.day_of_week] || s.day_of_week 
          }));
          this.schedules.set(data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getSchedulesForDay(day: string) {
    return this.schedules().filter(s => s.day_of_week === day);
  }

  editSchedule(sched: any) {
    this.router.navigate(['/admin/schedules/edit', sched.id]);
  }

  deleteSchedule(sched: any) {
    if (confirm(`Bạn có chắc chắn muốn xoá lịch học: ${sched.subject}?`)) {
      this.http.delete(`http://localhost:5000/api/admin/schedules/${sched.id}`).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.successMessage.set('Đã xoá lịch học thành công!');
            setTimeout(() => this.successMessage.set(''), 3000);
            this.fetchSchedules();
          }
        }
      });
    }
  }
}

import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Sidebar],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css'
})
export class DashboardHome implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  studentName = signal('Loading...');
  studentId = signal('Loading...');
  faculty = signal('Loading...');
  major = signal('Loading...');
  verificationStatus = signal('pending'); 
  profileCompletion = signal(0);
  
  notifications = signal<any[]>([]);
  todayClasses = signal<any[]>([]);
  upcomingClasses = signal<any[]>([]);
  isLoading = signal(true);

  currentDate = signal(new Date());
  dateFormatted = computed(() => {
    return this.currentDate().toLocaleDateString('vi-VN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  });

  private statusInterval: any;

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (res: any) => {
        this.loadRealData();
      },
      error: () => {
        // Fallback or handle error
        this.isLoading.set(false);
      }
    });

    // Cập nhật trạng thái lớp học mỗi phút
    this.statusInterval = setInterval(() => {
      this.updateClassStatuses();
    }, 60000);
  }

  ngOnDestroy() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
  }

  updateClassStatuses() {
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const updated = this.todayClasses().map(cls => {
      let status = 'upcoming';
      if (currentTimeStr >= cls.endTime) {
        status = 'completed';
      } else if (currentTimeStr >= cls.startTime && currentTimeStr < cls.endTime) {
        status = 'ongoing';
      }
      return { ...cls, status };
    });
    
    this.todayClasses.set(updated);
  }

  loadRealData() {
    this.http.get<any>('http://localhost:5000/api/students/profile').subscribe({
      next: (res) => {
        const p = res.data;
        if (p) {
          this.studentName.set(p.full_name || 'Chưa cập nhật');
          this.studentId.set(p.student_code || 'Chưa cập nhật');
          this.faculty.set(p.faculty_name || 'Chưa cập nhật');
          this.major.set(p.major || 'Chưa cập nhật');
          
          let filled = 0, total = 6;
          if (p.full_name) filled++;
          if (p.student_code) filled++;
          if (p.dob) filled++;
          if (p.phone) filled++;
          if (p.permanent_address) filled++;
          if (p.faculty_id) filled++;
          this.profileCompletion.set(Math.round((filled / total) * 100));
          
          this.verificationStatus.set(p.student_status === 'verified' ? 'verified' : 'pending');
        }
      },
      error: (err) => console.error('Error fetching profile:', err)
    });

    this.http.get<any>('http://localhost:5000/api/notifications').subscribe({
      next: (res) => {
        if (res.data) {
          this.notifications.set(res.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: new Date(n.created_at).toLocaleDateString('vi-VN'),
            type: n.type || 'info',
            is_read: n.is_read
          })));
        }
      },
      error: (err) => console.error('Error fetching notifications:', err)
    });

    // TODO: Connect these to a real class API endpoint later
    this.todayClasses.set([
      { id: 1, subject: 'Kỹ thuật Phần mềm', startTime: '07:00', endTime: '09:15', room: 'F1-201', period: '1-3' },
      { id: 2, subject: 'Thiết kế Giao diện', startTime: '09:30', endTime: '11:45', room: 'Lab 3', period: '4-6' },
      { id: 3, subject: 'Đồ án cơ sở', startTime: '13:00', endTime: '15:15', room: 'F2-302', period: '7-9' }
    ]);
    this.updateClassStatuses();

    this.upcomingClasses.set([
      { id: 4, subject: 'Mạng máy tính', dateDay: '06', dateMonth: 'Th6', time: '07:00 - 09:15', room: 'A1-105' },
      { id: 5, subject: 'Kiến trúc máy tính', dateDay: '08', dateMonth: 'Th6', time: '13:00 - 15:15', room: 'C1-301' }
    ]);

    this.isLoading.set(false);
  }
}
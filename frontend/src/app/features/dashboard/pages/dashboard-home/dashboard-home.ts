import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Sidebar, LoadingSpinner],
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

    // Fetch real schedule data
    this.http.get<any>('http://localhost:5000/api/students/classes').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const dayMap: any = {
            'Monday': 'Thứ 2', 'Tuesday': 'Thứ 3', 'Wednesday': 'Thứ 4',
            'Thursday': 'Thứ 5', 'Friday': 'Thứ 6', 'Saturday': 'Thứ 7', 'Sunday': 'Chủ nhật'
          };
          const dayIndex: any = {
            'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
            'Friday': 5, 'Saturday': 6, 'Sunday': 0
          };
          const todayIdx = new Date().getDay(); // 0=Sun, 1=Mon...
          const todayList: any[] = [];
          const upcomingList: any[] = [];

          for (const c of res.data) {
            if (c.schedules) {
              for (const s of c.schedules) {
                const sIdx = dayIndex[s.day_of_week];
                const entry = {
                  id: s.id,
                  subject: s.subject || c.class_name,
                  startTime: s.start_time?.substring(0, 5) || '',
                  endTime: s.end_time?.substring(0, 5) || '',
                  room: s.room,
                  period: '',
                  status: 'upcoming',
                  dayLabel: dayMap[s.day_of_week] || s.day_of_week
                };
                if (sIdx === todayIdx) {
                  todayList.push(entry);
                } else {
                  // Find next occurrence
                  let diff = sIdx - todayIdx;
                  if (diff <= 0) diff += 7;
                  const nextDate = new Date();
                  nextDate.setDate(nextDate.getDate() + diff);
                  upcomingList.push({
                    ...entry,
                    dateDay: nextDate.getDate().toString().padStart(2, '0'),
                    dateMonth: 'Th' + (nextDate.getMonth() + 1),
                    time: `${entry.startTime} - ${entry.endTime}`
                  });
                }
              }
            }
          }

          // Sort today's classes by start time
          todayList.sort((a, b) => a.startTime.localeCompare(b.startTime));
          this.todayClasses.set(todayList);
          this.updateClassStatuses();

          // Sort upcoming by date
          upcomingList.sort((a, b) => a.dateDay.localeCompare(b.dateDay));
          this.upcomingClasses.set(upcomingList.slice(0, 5));
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
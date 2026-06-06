import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-admin-schedule-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Sidebar],
  templateUrl: './admin-schedule-edit.html',
  styleUrl: '../admin-schedule-create/admin-schedule-create.css'
})
export class AdminScheduleEdit implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  classes = signal<any[]>([]);
  scheduleId = signal<string | null>(null);

  formData = {
    course_id: '',
    subject: '',
    room: '',
    day_of_week: 'Monday',
    start_time: '07:30',
    end_time: '09:30'
  };

  days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  dayMapRev: any = {
    'Thứ 2': 'Monday',
    'Thứ 3': 'Tuesday',
    'Thứ 4': 'Wednesday',
    'Thứ 5': 'Thursday',
    'Thứ 6': 'Friday',
    'Thứ 7': 'Saturday',
    'Chủ nhật': 'Sunday'
  };

  ngOnInit() {
    this.http.get<any>('http://localhost:5000/api/admin/classes').subscribe(res => {
      if (res.success) this.classes.set(res.data);
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.scheduleId.set(id);
        this.loadScheduleData(id);
      }
    });
  }

  loadScheduleData(id: string) {
    this.http.get<any>('http://localhost:5000/api/admin/schedules').subscribe(res => {
      if (res.success) {
        const sched = res.data.find((s: any) => s.id == id);
        if (sched) {
          const dayMap: any = {
            'Monday': 'Thứ 2',
            'Tuesday': 'Thứ 3',
            'Wednesday': 'Thứ 4',
            'Thursday': 'Thứ 5',
            'Friday': 'Thứ 6',
            'Saturday': 'Thứ 7',
            'Sunday': 'Chủ nhật'
          };
          this.formData = {
            course_id: sched.course_id,
            subject: sched.subject,
            room: sched.room,
            day_of_week: dayMap[sched.day_of_week] || sched.day_of_week,
            start_time: sched.start_time.substring(0,5),
            end_time: sched.end_time.substring(0,5)
          };
        }
      }
    });
  }

  onSubmit() {
    if (!this.formData.course_id || !this.formData.subject || !this.formData.room) {
      this.errorMessage.set('Vui lòng điền đầy đủ môn học, lớp và phòng học');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const payload = {
      ...this.formData,
      day_of_week: this.dayMapRev[this.formData.day_of_week] || this.formData.day_of_week
    };

    this.http.put(`http://localhost:5000/api/admin/schedules/${this.scheduleId()}`, payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Cập nhật lịch học thành công!');
        setTimeout(() => this.router.navigate(['/admin/schedules']), 1000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Có lỗi xảy ra khi cập nhật lịch học');
      }
    });
  }
}

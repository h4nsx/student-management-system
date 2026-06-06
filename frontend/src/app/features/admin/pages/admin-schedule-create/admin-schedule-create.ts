import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-admin-schedule-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Sidebar],
  templateUrl: './admin-schedule-create.html',
  styleUrl: './admin-schedule-create.css'
})
export class AdminScheduleCreate implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  classes = signal<any[]>([]);

  formData = {
    course_id: '',
    subject: '',
    room: '',
    day_of_week: 'Monday',
    start_time: '07:30',
    end_time: '09:30'
  };

  days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  ngOnInit() {
    this.http.get<any>('http://localhost:5000/api/admin/classes').subscribe(res => {
      if (res.success) this.classes.set(res.data);
    });
  }

  onSubmit() {
    if (!this.formData.course_id || !this.formData.subject || !this.formData.room) {
      this.errorMessage.set('Vui lòng điền đầy đủ môn học, lớp và phòng học');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.http.post('http://localhost:5000/api/admin/schedules', this.formData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Thêm lịch học thành công!');
        setTimeout(() => this.router.navigate(['/admin/schedules']), 1000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Có lỗi xảy ra khi tạo lịch học');
      }
    });
  }
}

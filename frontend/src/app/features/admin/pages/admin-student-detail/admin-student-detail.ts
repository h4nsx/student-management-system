import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { NotificationService } from '../../../../core/services/notification.service';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb';

@Component({
  selector: 'app-admin-student-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Navbar, Sidebar, BreadcrumbComponent],
  templateUrl: './admin-student-detail.html',
  styleUrl: './admin-student-detail.css'
})
export class AdminStudentDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private notification = inject(NotificationService);

  studentId = signal<string | null>(null);
  activeTab = signal('profile');
  student = signal<any>(null);
  isLoading = signal(true);
  isEditing = signal(false);
  editData = signal<any>({});

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.studentId.set(params.get('id'));
      this.fetchStudentData();
    });
    this.route.queryParamMap.subscribe(params => {
      if (params.get('edit') === 'true') {
        this.activeTab.set('edit');
      }
    });
  }

  fetchStudentData() {
    this.isLoading.set(true);
    this.http.get<any>(`http://localhost:5000/api/admin/students/${this.studentId()}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.student.set(res.data);
          this.editData.set({ ...res.data });
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  saveChanges() {
    this.isLoading.set(true);
    this.http.put(`http://localhost:5000/api/admin/students/${this.studentId()}`, this.editData()).subscribe({
      next: () => {
        this.notification.success('Cập nhật hồ sơ sinh viên thành công!', 'Thành công');
        this.fetchStudentData();
        this.activeTab.set('profile');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notification.error(err.error?.message || 'Có lỗi xảy ra khi cập nhật', 'Lỗi');
      }
    });
  }
}

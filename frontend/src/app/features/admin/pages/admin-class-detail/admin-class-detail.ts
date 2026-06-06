import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-admin-class-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, Navbar, Sidebar],
  templateUrl: './admin-class-detail.html',
  styleUrl: './admin-class-detail.css'
})
export class AdminClassDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  classId = signal<string | null>(null);
  activeTab = signal('students');
  classData = signal<any>(null);
  isLoading = signal(true);

  // Edit form
  editData = signal<any>({});
  isSaving = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.classId.set(params.get('id'));
      this.fetchClassData();
    });
  }

  fetchClassData() {
    this.isLoading.set(true);
    this.http.get<any>(`http://localhost:5000/api/admin/classes/${this.classId()}`).subscribe({
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
          if (res.data.schedules) {
            res.data.schedules = res.data.schedules.map((s: any) => ({
              ...s,
              day_of_week: dayMap[s.day_of_week] || s.day_of_week
            }));
          }
          this.classData.set(res.data);
          this.editData.set({
            class_name: res.data.class_name,
            lecturer: res.data.lecturer,
            faculty_id: res.data.faculty_id
          });
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  saveChanges() {
    this.isSaving.set(true);
    this.http.put(`http://localhost:5000/api/admin/classes/${this.classId()}`, this.editData()).subscribe({
      next: () => {
        this.fetchClassData();
        this.activeTab.set('students');
        this.isSaving.set(false);
      },
      error: () => this.isSaving.set(false)
    });
  }
}

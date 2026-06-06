import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { StudentCard } from '../../components/student-card/student-card';

type ViewMode = 'table' | 'grid';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Sidebar, DataTable, ConfirmDialog, StudentCard],
  templateUrl: './student-list.html',
  styleUrl: './student-list.css'
})
export class StudentList implements OnInit {
  private router = inject(Router);

  viewMode = signal<ViewMode>('table');
  isLoading = signal(false);
  showDeleteConfirm = signal(false);
  selectedStudent = signal<any | null>(null);

  filterStatus = signal('all');
  filterMajor = signal('all');
  searchText = signal('');

  students = signal<any[]>([]);
  majors = signal<string[]>([]);
  stats = signal({ total: 0, active: 0, paused: 0, avgGpa: '0.00' });

  tableColumns: TableColumn[] = [
    { key: 'student_code', label: 'Mã SV', sortable: true },
    { key: 'full_name', label: 'Họ và tên', sortable: true },
    { key: 'gender', label: 'Giới tính' },
    { key: 'major', label: 'Ngành', sortable: true },
    { key: 'class_name', label: 'Lớp' },
    { key: 'student_status', label: 'Trạng thái' },
  ];

  filteredStudents = computed(() => {
    let list = this.students();
    if (this.filterStatus() !== 'all') {
      list = list.filter(s => s._rawStatus === this.filterStatus());
    }
    if (this.filterMajor() !== 'all') {
      list = list.filter(s => s.major === this.filterMajor());
    }
    const q = this.searchText().toLowerCase();
    if (q) {
      list = list.filter(s =>
        s.full_name?.toLowerCase().includes(q) ||
        s.student_code?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
      );
    }
    return list;
  });

  private http = inject(HttpClient);

  ngOnInit() {
    this.fetchStudents();
  }

  fetchStudents() {
    this.isLoading.set(true);
    this.http.get<any>('http://localhost:5000/api/admin/students?limit=100').subscribe({
      next: (res) => {
        if (res.success) {
          const formattedData = res.data.map((s: any) => ({
            ...s,
            _rawStatus: s.student_status, // preserve raw status for filtering
            gender: s.gender === 'male' ? 'Nam' : (s.gender === 'female' ? 'Nữ' : s.gender),
            student_status: s.student_status === 'verified' ? 'Đã xác thực' : 
                            (s.student_status === 'unverified' ? 'Chưa xác thực' : 
                            (s.student_status === 'banned' ? 'Đình chỉ' : 
                            (s.student_status === 'studying' ? 'Đang học' : 
                            (s.student_status === 'graduated' ? 'Đã tốt nghiệp' : s.student_status))))
          }));
          this.students.set(formattedData);
          const uniqueMajors = [...new Set(res.data.map((s: any) => s.major))].filter(Boolean) as string[];
          this.majors.set(uniqueMajors);
          this.stats.set({
            total: res.data.length,
            active: res.data.filter((s: any) => s.student_status === 'verified').length,
            paused: res.data.filter((s: any) => s.student_status === 'unverified').length,
            avgGpa: '3.20' // Stub since GPA isn't in db
          });
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onRowClick(row: any) {
    this.router.navigate(['/admin/students', row.id]);
  }

  onCreateStudent() {
    this.router.navigate(['/admin/students/create']);
  }

  onEditStudent(row: any) {
    this.router.navigate(['/admin/students', row.id], { queryParams: { edit: true } });
  }

  onDeleteStudent(row: any) {
    this.selectedStudent.set(row);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    if (this.selectedStudent()) {
      this.http.delete(`http://localhost:5000/api/admin/students/${this.selectedStudent()!.id}`).subscribe({
        next: () => {
          this.fetchStudents();
          this.showDeleteConfirm.set(false);
          this.selectedStudent.set(null);
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.selectedStudent.set(null);
  }
}
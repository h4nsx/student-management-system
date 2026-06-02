import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { DataTable, TableColumn } from '../../../../shared/components/data-table/data-table';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { StudentCard } from '../../components/student-card/student-card';

export interface Student {
  id: number;
  studentId: string;
  fullName: string;
  dob: string;
  gender: string;
  major: string;
  classId: string;
  gpa: number;
  status: string;
  email: string;
  phone: string;
}

type ViewMode = 'table' | 'grid';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Sidebar, DataTable, ConfirmDialog, StudentCard],
  templateUrl: './student-list.html',
  styleUrl: './student-list.css'
})
export class StudentList {
  private router = inject(Router);

  viewMode = signal<ViewMode>('table');
  isLoading = signal(false);
  showDeleteConfirm = signal(false);
  selectedStudent = signal<Student | null>(null);

  filterStatus = signal('all');
  filterMajor = signal('all');
  searchText = signal('');

  students = signal<Student[]>([
    { id: 1, studentId: 'SV2021001', fullName: 'Nguyễn Văn An', dob: '15/03/2003', gender: 'Nam', major: 'Kỹ thuật Phần mềm', classId: 'SE21A', gpa: 3.45, status: 'Đang học', email: 'an@uni.edu.vn', phone: '0901111111' },
    { id: 2, studentId: 'SV2021002', fullName: 'Trần Thị Bình', dob: '22/07/2003', gender: 'Nữ', major: 'Công nghệ thông tin', classId: 'IT21B', gpa: 3.72, status: 'Đang học', email: 'binh@uni.edu.vn', phone: '0902222222' },
    { id: 3, studentId: 'SV2021003', fullName: 'Lê Hoàng Cường', dob: '08/01/2003', gender: 'Nam', major: 'Hệ thống thông tin', classId: 'IS21A', gpa: 2.95, status: 'Đang học', email: 'cuong@uni.edu.vn', phone: '0903333333' },
    { id: 4, studentId: 'SV2020015', fullName: 'Phạm Ngọc Dung', dob: '30/11/2002', gender: 'Nữ', major: 'Kỹ thuật Phần mềm', classId: 'SE20B', gpa: 3.88, status: 'Đang học', email: 'dung@uni.edu.vn', phone: '0904444444' },
    { id: 5, studentId: 'SV2021005', fullName: 'Hoàng Văn Em', dob: '14/05/2003', gender: 'Nam', major: 'Công nghệ thông tin', classId: 'IT21A', gpa: 2.30, status: 'Bảo lưu', email: 'em@uni.edu.vn', phone: '0905555555' },
    { id: 6, studentId: 'SV2022001', fullName: 'Vũ Thị Phương', dob: '20/09/2004', gender: 'Nữ', major: 'Kỹ thuật Phần mềm', classId: 'SE22A', gpa: 3.55, status: 'Đang học', email: 'phuong@uni.edu.vn', phone: '0906666666' },
    { id: 7, studentId: 'SV2020010', fullName: 'Đỗ Minh Giang', dob: '03/12/2002', gender: 'Nam', major: 'Hệ thống thông tin', classId: 'IS20A', gpa: 3.20, status: 'Đang học', email: 'giang@uni.edu.vn', phone: '0907777777' },
    { id: 8, studentId: 'SV2021008', fullName: 'Bùi Thị Hoa', dob: '17/06/2003', gender: 'Nữ', major: 'Công nghệ thông tin', classId: 'IT21B', gpa: 3.60, status: 'Đang học', email: 'hoa@uni.edu.vn', phone: '0908888888' },
  ]);

  tableColumns: TableColumn[] = [
    { key: 'studentId', label: 'Mã SV', sortable: true },
    { key: 'fullName', label: 'Họ và tên', sortable: true },
    { key: 'gender', label: 'Giới tính' },
    { key: 'major', label: 'Ngành', sortable: true },
    { key: 'classId', label: 'Lớp' },
    { key: 'gpa', label: 'GPA', sortable: true },
    { key: 'status', label: 'Trạng thái' },
  ];

  filteredStudents = computed(() => {
    let list = this.students();
    if (this.filterStatus() !== 'all') {
      list = list.filter(s => s.status === this.filterStatus());
    }
    if (this.filterMajor() !== 'all') {
      list = list.filter(s => s.major === this.filterMajor());
    }
    const q = this.searchText().toLowerCase();
    if (q) {
      list = list.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    }
    return list;
  });

  majors = computed(() => [...new Set(this.students().map(s => s.major))]);

  stats = computed(() => ({
    total: this.students().length,
    active: this.students().filter(s => s.status === 'Đang học').length,
    paused: this.students().filter(s => s.status === 'Bảo lưu').length,
    avgGpa: (this.students().reduce((a, b) => a + b.gpa, 0) / this.students().length).toFixed(2),
  }));

  onRowClick(row: any) {
    this.router.navigate(['/students/detail'], { queryParams: { id: row.studentId } });
  }

  onEditStudent(row: any) {
    this.selectedStudent.set(row);
    this.router.navigate(['/students/detail'], { queryParams: { id: row.studentId, edit: true } });
  }

  onDeleteStudent(row: any) {
    this.selectedStudent.set(row);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete() {
    if (this.selectedStudent()) {
      this.students.update(list => list.filter(s => s.id !== this.selectedStudent()!.id));
    }
    this.showDeleteConfirm.set(false);
    this.selectedStudent.set(null);
  }

  cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.selectedStudent.set(null);
  }
}
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';

type Tab = 'personal' | 'academic' | 'documents';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar, Sidebar, ConfirmDialog, LoadingSpinner],
  templateUrl: './student-detail.html',
  styleUrl: './student-detail.css'
})
export class StudentDetail {
  activeTab = signal<Tab>('personal');
  isEditing = signal(false);
  isSaving = signal(false);
  showConfirmSave = signal(false);

  student = signal({
    // Personal
    fullName: 'Nguyễn Văn An',
    studentId: 'SV2021001',
    dob: '2003-03-15',
    gender: 'Nam',
    ethnicity: 'Kinh',
    religion: 'Không',
    nationality: 'Việt Nam',
    idCard: '079203012345',
    idDate: '2020-06-01',
    idPlace: 'Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư',
    phone: '0901234567',
    email: 'nguyenvanan@university.edu.vn',
    address: '123 Nguyễn Văn Linh, Phường 7, Quận 8, TP.HCM',
    hometown: 'TP. Hồ Chí Minh',
    // Academic
    faculty: 'Khoa Công nghệ Thông tin',
    major: 'Kỹ thuật Phần mềm',
    course: 'K2021',
    classId: 'SE21A',
    advisor: 'TS. Trần Văn Bình',
    status: 'Đang học',
    enrollDate: '2021-09-01',
    expectedGrad: '2025-06-30',
    gpa: 3.45,
    credits: 87,
    totalCredits: 120,
    conduct: 82,
    scholarship: 'Học bổng khuyến khích học tập (học kỳ 1)',
  });

  documents = signal([
    { name: 'Giấy CMND/CCCD', status: 'verified', date: '10/01/2024', size: '2.4 MB' },
    { name: 'Ảnh thẻ sinh viên', status: 'verified', date: '10/01/2024', size: '1.1 MB' },
    { name: 'Bằng tốt nghiệp THPT', status: 'verified', date: '12/01/2024', size: '3.8 MB' },
    { name: 'Giấy khai sinh', status: 'pending', date: '20/01/2024', size: '2.0 MB' },
    { name: 'Hộ khẩu gia đình', status: 'pending', date: '20/01/2024', size: '4.2 MB' },
  ]);

  toggleEdit() {
    if (this.isEditing()) {
      this.showConfirmSave.set(true);
    } else {
      this.isEditing.set(true);
    }
  }

  async confirmSave() {
    this.showConfirmSave.set(false);
    this.isSaving.set(true);
    await new Promise(r => setTimeout(r, 1200));
    this.isSaving.set(false);
    this.isEditing.set(false);
  }

  cancelSave() {
    this.showConfirmSave.set(false);
    this.isEditing.set(false);
  }

  tabs: { key: Tab; label: string }[] = [
    { key: 'personal', label: 'Thông tin cá nhân' },
    { key: 'academic', label: 'Thông tin học tập' },
    { key: 'documents', label: 'Hồ sơ tài liệu' },
  ];

  creditPercent() {
    return Math.round((this.student().credits / this.student().totalCredits) * 100);
  }
}
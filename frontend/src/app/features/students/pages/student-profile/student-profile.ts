import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Sidebar],
  templateUrl: './student-profile.html',
  styleUrl: './student-profile.css'
})
export class StudentProfile {
  student = signal({
    fullName: 'Nguyễn Văn An',
    studentId: 'SV2021001',
    email: 'nguyenvanan@university.edu.vn',
    phone: '0901234567',
    dob: '15/03/2003',
    gender: 'Nam',
    hometown: 'TP. Hồ Chí Minh',
    avatar: null as string | null,
    faculty: 'Khoa Công nghệ Thông tin',
    major: 'Kỹ thuật Phần mềm',
    course: 'K2021',
    classId: 'SE21A',
    advisor: 'TS. Trần Văn Bình',
    status: 'Đang học',
    gpa: 3.45,
    credits: 87,
    conduct: 82,
  });

  activeTab = signal<'personal' | 'academic'>('personal');

  initials = computed(() => {
    return this.student().fullName.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase();
  });

  gpaClass = computed(() => {
    const g = this.student().gpa;
    if (g >= 3.6) return 'excellent';
    if (g >= 3.2) return 'good';
    if (g >= 2.5) return 'average';
    return 'weak';
  });

  gpaLabel = computed(() => {
    const g = this.student().gpa;
    if (g >= 3.6) return 'Xuất sắc';
    if (g >= 3.2) return 'Giỏi';
    if (g >= 2.5) return 'Khá';
    return 'Trung bình';
  });
}
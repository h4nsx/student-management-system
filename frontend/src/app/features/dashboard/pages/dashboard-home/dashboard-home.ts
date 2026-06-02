import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';

interface StatCard {
  label: string;
  value: string;
  sub: string;
  icon: string;
  trend: number;
  color: string;
}

interface Activity {
  title: string;
  desc: string;
  time: string;
  type: 'info' | 'success' | 'warning';
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, Sidebar],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css'
})
export class DashboardHome {
  stats: StatCard[] = [
    { label: 'GPA Hiện tại', value: '3.45', sub: 'Hệ 4.0', icon: 'star', trend: 2.1, color: 'indigo' },
    { label: 'Tín chỉ tích lũy', value: '87', sub: 'Còn 33 tín chỉ', icon: 'book', trend: 0, color: 'violet' },
    { label: 'Điểm rèn luyện', value: '82', sub: 'Xếp loại: Tốt', icon: 'award', trend: 5, color: 'emerald' },
    { label: 'Thông báo mới', value: '3', sub: 'Hôm nay', icon: 'bell', trend: 0, color: 'amber' },
  ];

  recentActivities: Activity[] = [
    { title: 'Cập nhật hồ sơ thành công', desc: 'Thông tin cá nhân đã được cập nhật', time: '2 giờ trước', type: 'success' },
    { title: 'Thông báo học phí HK2', desc: 'Hạn nộp học phí: 15/03/2024', time: '5 giờ trước', type: 'warning' },
    { title: 'Tài liệu xác thực đã được duyệt', desc: 'Giấy tờ tùy thân đã xác minh', time: '1 ngày trước', type: 'success' },
    { title: 'Nhắc nhở: Gia hạn thẻ sinh viên', desc: 'Thẻ sinh viên sẽ hết hạn sau 30 ngày', time: '2 ngày trước', type: 'info' },
  ];

  schedule = [
    { subject: 'Lập trình Web', room: 'P.301', time: '07:30 - 09:10', type: 'LT' },
    { subject: 'CSDL Nâng cao', room: 'P.405', time: '09:30 - 11:10', type: 'LT' },
    { subject: 'Thực hành Web', room: 'Lab.02', time: '13:30 - 17:00', type: 'TH' },
  ];

  currentDate = signal(new Date());

  dateFormatted = computed(() => {
    return this.currentDate().toLocaleDateString('vi-VN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  });
}
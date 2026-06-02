import { Component, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { inject } from '@angular/core';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  private router = inject(Router);

  isCollapsed = signal(false);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'home', route: '/dashboard' },
    { label: 'Danh sách SV', icon: 'users', route: '/students/list' },
    { label: 'Hồ sơ cá nhân', icon: 'user', route: '/students/profile' },
    { label: 'Thông tin chi tiết', icon: 'file-text', route: '/students/detail' },
    { label: 'Tài liệu', icon: 'folder', route: '/documents' },
    { label: 'Thông báo', icon: 'bell', route: '/notifications', badge: 3 },
    { label: 'Mã QR', icon: 'grid', route: '/qr-card' },
  ];

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  toggleCollapse() {
    this.isCollapsed.update(v => !v);
  }
}